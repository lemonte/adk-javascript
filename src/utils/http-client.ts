/**
 * HTTP client utilities for making API requests
 */

import { EventEmitter } from 'events';

export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  validateStatus?: (status: number) => boolean;
  enableLogging?: boolean;
}

export interface RequestConfig extends HttpClientConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url?: string;
  params?: Record<string, any>;
  data?: any;
  responseType?: 'json' | 'text' | 'blob' | 'stream';
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
  request?: any;
}

export interface HttpError extends Error {
  config?: RequestConfig;
  request?: any;
  response?: HttpResponse;
  code?: string;
  isHttpError: true;
}

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = (
  response: HttpResponse
) => HttpResponse | Promise<HttpResponse>;

export type ErrorInterceptor = (
  error: HttpError
) => HttpError | Promise<HttpError>;

/**
 * HTTP Client class
 */
export class HttpClient extends EventEmitter {
  private config: Required<HttpClientConfig>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    super();
    
    this.config = {
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ADK-HttpClient/1.0',
        ...config.headers || {},
      },
      retries: 3,
      retryDelay: 1000,
      validateStatus: (status) => status >= 200 && status < 300,
      enableLogging: false,
      ...config,
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) {
        this.errorInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    let requestConfig = this.mergeConfig(config);
    
    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    this.log('Request:', requestConfig.method, requestConfig.url);
    this.emit('request', requestConfig);

    try {
      const response = await this.executeRequest<T>(requestConfig);
      
      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        processedResponse = await interceptor(processedResponse);
      }

      this.log('Response:', response.status, response.statusText);
      this.emit('response', processedResponse);
      
      return processedResponse;
    } catch (error) {
      let processedError = error as HttpError;
      
      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        processedError = await interceptor(processedError);
      }

      this.log('Error:', processedError.message);
      this.emit('error', processedError);
      
      throw processedError;
    }
  }

  /**
   * Execute HTTP request with retries
   */
  private async executeRequest<T>(
    config: RequestConfig,
    attempt = 1
  ): Promise<HttpResponse<T>> {
    try {
      return await this.performRequest<T>(config);
    } catch (error) {
      const httpError = error as HttpError;
      
      if (attempt < (config.retries ?? this.config.retries) && this.shouldRetry(httpError)) {
        const delay = (config.retryDelay ?? this.config.retryDelay) * attempt;
        this.log(`Retrying request in ${delay}ms (attempt ${attempt + 1})`);
        
        await this.sleep(delay);
        return this.executeRequest<T>(config, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Perform actual HTTP request
   */
  private async performRequest<T>(config: RequestConfig): Promise<HttpResponse<T>> {
    const url = this.buildUrl(config.url || '', config.params);
    const timeout = config.timeout ?? this.config.timeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const fetchConfig: RequestInit = {
        method: config.method || 'GET',
        headers: config.headers,
        signal: config.signal || controller.signal,
      };

      if (config.data && ['POST', 'PUT', 'PATCH'].includes(fetchConfig.method!)) {
        if (typeof config.data === 'string') {
          fetchConfig.body = config.data;
        } else {
          fetchConfig.body = JSON.stringify(config.data);
        }
      }

      const response = await fetch(url, fetchConfig);
      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let data: T;
      const responseType = config.responseType || 'json';
      
      switch (responseType) {
        case 'json':
          data = await response.json() as T;
          break;
        case 'text':
          data = await response.text() as any;
          break;
        case 'blob':
          data = await response.blob() as any;
          break;
        case 'stream':
          data = response.body as any;
          break;
        default:
          data = await response.json() as T;
      }

      const httpResponse: HttpResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config,
      };

      const validateStatus = config.validateStatus ?? this.config.validateStatus;
      if (!validateStatus(response.status)) {
        throw this.createHttpError(
          `Request failed with status ${response.status}`,
          config,
          httpResponse
        );
      }

      return httpResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw this.createHttpError('Request timeout', config, undefined, 'TIMEOUT');
        }
        
        if (error.message.includes('fetch')) {
          throw this.createHttpError('Network error', config, undefined, 'NETWORK_ERROR');
        }
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  /**
   * HEAD request
   */
  async head<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'HEAD', url });
  }

  /**
   * OPTIONS request
   */
  async options<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'OPTIONS', url });
  }

  /**
   * Download file
   */
  async download(
    url: string,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<Blob> {
    const response = await this.request<ReadableStream>({ 
      url, 
      responseType: 'stream' 
    });
    
    if (!response.data) {
      throw new Error('No response stream');
    }

    const contentLength = parseInt(response.headers['content-length'] || '0', 10);
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    const reader = response.data.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (onProgress && contentLength > 0) {
          onProgress(loaded, contentLength);
        }
      }
    } finally {
      reader.releaseLock();
    }

    return new Blob(chunks);
  }

  /**
   * Upload file
   */
  async upload(
    url: string,
    file: File | Blob,
    fieldName = 'file',
    additionalFields?: Record<string, string>,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<HttpResponse> {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Note: Progress tracking for uploads requires XMLHttpRequest in browsers
    // This is a simplified version using fetch
    return this.request({
      method: 'POST',
      url,
      data: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  /**
   * Create HTTP error
   */
  private createHttpError(
    message: string,
    config?: RequestConfig,
    response?: HttpResponse,
    code?: string
  ): HttpError {
    const error = new Error(message) as HttpError;
    error.isHttpError = true;
    error.config = config;
    error.response = response;
    error.code = code;
    return error;
  }

  /**
   * Merge configurations
   */
  private mergeConfig(config: RequestConfig): RequestConfig {
    return {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
    };
  }

  /**
   * Build URL with parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    const baseURL = this.config.baseURL;
    const fullUrl = baseURL ? new URL(url, baseURL).toString() : url;
    
    if (!params || Object.keys(params).length === 0) {
      return fullUrl;
    }

    const urlObj = new URL(fullUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
    
    return urlObj.toString();
  }

  /**
   * Check if request should be retried
   */
  private shouldRetry(error: HttpError): boolean {
    // Retry on network errors
    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return true;
    }
    
    // Retry on 5xx server errors
    if (error.response && error.response.status >= 500) {
      return true;
    }
    
    // Retry on specific 4xx errors
    if (error.response && [408, 429].includes(error.response.status)) {
      return true;
    }
    
    return false;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Log message
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[HttpClient] ${message}`, ...args);
    }
  }

  /**
   * Set default header
   */
  setHeader(name: string, value: string): void {
    this.config.headers[name] = value;
  }

  /**
   * Remove default header
   */
  removeHeader(name: string): void {
    delete this.config.headers[name];
  }

  /**
   * Get default headers
   */
  getHeaders(): Record<string, string> {
    return { ...this.config.headers };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HttpClientConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      headers: {
        ...this.config.headers,
        ...config.headers,
      },
    };
  }
}

/**
 * Create HTTP client instance
 */
export function createHttpClient(config?: HttpClientConfig): HttpClient {
  return new HttpClient(config);
}

/**
 * Default HTTP client instance
 */
export const httpClient = new HttpClient();

/**
 * Common HTTP client configurations
 */
export const HttpClientPresets = {
  // Fast client for quick requests
  fast: {
    timeout: 5000,
    retries: 1,
    retryDelay: 500,
  },
  
  // Standard client for API requests
  standard: {
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
  },
  
  // Patient client for slow operations
  patient: {
    timeout: 120000,
    retries: 5,
    retryDelay: 2000,
  },
  
  // JSON API client
  jsonApi: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    validateStatus: (status: number) => status >= 200 && status < 300,
  },
} as const;

/**
 * HTTP status codes
 */
export const HttpStatus = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;