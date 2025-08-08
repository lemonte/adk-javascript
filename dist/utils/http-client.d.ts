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
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor = (response: HttpResponse) => HttpResponse | Promise<HttpResponse>;
export type ErrorInterceptor = (error: HttpError) => HttpError | Promise<HttpError>;
/**
 * HTTP Client class
 */
export declare class HttpClient extends EventEmitter {
    private config;
    private requestInterceptors;
    private responseInterceptors;
    private errorInterceptors;
    constructor(config?: HttpClientConfig);
    /**
     * Add request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): () => void;
    /**
     * Add response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): () => void;
    /**
     * Add error interceptor
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): () => void;
    /**
     * Make HTTP request
     */
    request<T = any>(config: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * Execute HTTP request with retries
     */
    private executeRequest;
    /**
     * Perform actual HTTP request
     */
    private performRequest;
    /**
     * GET request
     */
    get<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * POST request
     */
    post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * PUT request
     */
    put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * DELETE request
     */
    delete<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * PATCH request
     */
    patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * HEAD request
     */
    head<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * OPTIONS request
     */
    options<T = any>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    /**
     * Download file
     */
    download(url: string, onProgress?: (loaded: number, total: number) => void): Promise<Blob>;
    /**
     * Upload file
     */
    upload(url: string, file: File | Blob, fieldName?: string, additionalFields?: Record<string, string>, onProgress?: (loaded: number, total: number) => void): Promise<HttpResponse>;
    /**
     * Create HTTP error
     */
    private createHttpError;
    /**
     * Merge configurations
     */
    private mergeConfig;
    /**
     * Build URL with parameters
     */
    private buildUrl;
    /**
     * Check if request should be retried
     */
    private shouldRetry;
    /**
     * Sleep utility
     */
    private sleep;
    /**
     * Log message
     */
    private log;
    /**
     * Set default header
     */
    setHeader(name: string, value: string): void;
    /**
     * Remove default header
     */
    removeHeader(name: string): void;
    /**
     * Get default headers
     */
    getHeaders(): Record<string, string>;
    /**
     * Update configuration
     */
    updateConfig(config: Partial<HttpClientConfig>): void;
}
/**
 * Create HTTP client instance
 */
export declare function createHttpClient(config?: HttpClientConfig): HttpClient;
/**
 * Default HTTP client instance
 */
export declare const httpClient: HttpClient;
/**
 * Common HTTP client configurations
 */
export declare const HttpClientPresets: {
    readonly fast: {
        readonly timeout: 5000;
        readonly retries: 1;
        readonly retryDelay: 500;
    };
    readonly standard: {
        readonly timeout: 30000;
        readonly retries: 3;
        readonly retryDelay: 1000;
    };
    readonly patient: {
        readonly timeout: 120000;
        readonly retries: 5;
        readonly retryDelay: 2000;
    };
    readonly jsonApi: {
        readonly headers: {
            readonly 'Content-Type': "application/json";
            readonly Accept: "application/json";
        };
        readonly validateStatus: (status: number) => boolean;
    };
};
/**
 * HTTP status codes
 */
export declare const HttpStatus: {
    readonly CONTINUE: 100;
    readonly SWITCHING_PROTOCOLS: 101;
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly MOVED_PERMANENTLY: 301;
    readonly FOUND: 302;
    readonly NOT_MODIFIED: 304;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
//# sourceMappingURL=http-client.d.ts.map