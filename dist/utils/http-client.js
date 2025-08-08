"use strict";
/**
 * HTTP client utilities for making API requests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpStatus = exports.HttpClientPresets = exports.httpClient = exports.HttpClient = void 0;
exports.createHttpClient = createHttpClient;
const events_1 = require("events");
/**
 * HTTP Client class
 */
class HttpClient extends events_1.EventEmitter {
    constructor(config = {}) {
        super();
        this.requestInterceptors = [];
        this.responseInterceptors = [];
        this.errorInterceptors = [];
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
    addRequestInterceptor(interceptor) {
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
    addResponseInterceptor(interceptor) {
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
    addErrorInterceptor(interceptor) {
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
    async request(config) {
        let requestConfig = this.mergeConfig(config);
        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            requestConfig = await interceptor(requestConfig);
        }
        this.log('Request:', requestConfig.method, requestConfig.url);
        this.emit('request', requestConfig);
        try {
            const response = await this.executeRequest(requestConfig);
            // Apply response interceptors
            let processedResponse = response;
            for (const interceptor of this.responseInterceptors) {
                processedResponse = await interceptor(processedResponse);
            }
            this.log('Response:', response.status, response.statusText);
            this.emit('response', processedResponse);
            return processedResponse;
        }
        catch (error) {
            let processedError = error;
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
    async executeRequest(config, attempt = 1) {
        try {
            return await this.performRequest(config);
        }
        catch (error) {
            const httpError = error;
            if (attempt < (config.retries ?? this.config.retries) && this.shouldRetry(httpError)) {
                const delay = (config.retryDelay ?? this.config.retryDelay) * attempt;
                this.log(`Retrying request in ${delay}ms (attempt ${attempt + 1})`);
                await this.sleep(delay);
                return this.executeRequest(config, attempt + 1);
            }
            throw error;
        }
    }
    /**
     * Perform actual HTTP request
     */
    async performRequest(config) {
        const url = this.buildUrl(config.url || '', config.params);
        const timeout = config.timeout ?? this.config.timeout;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
            const fetchConfig = {
                method: config.method || 'GET',
                headers: config.headers,
                signal: config.signal || controller.signal,
            };
            if (config.data && ['POST', 'PUT', 'PATCH'].includes(fetchConfig.method)) {
                if (typeof config.data === 'string') {
                    fetchConfig.body = config.data;
                }
                else {
                    fetchConfig.body = JSON.stringify(config.data);
                }
            }
            const response = await fetch(url, fetchConfig);
            clearTimeout(timeoutId);
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
            let data;
            const responseType = config.responseType || 'json';
            switch (responseType) {
                case 'json':
                    data = await response.json();
                    break;
                case 'text':
                    data = await response.text();
                    break;
                case 'blob':
                    data = await response.blob();
                    break;
                case 'stream':
                    data = response.body;
                    break;
                default:
                    data = await response.json();
            }
            const httpResponse = {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders,
                config,
            };
            const validateStatus = config.validateStatus ?? this.config.validateStatus;
            if (!validateStatus(response.status)) {
                throw this.createHttpError(`Request failed with status ${response.status}`, config, httpResponse);
            }
            return httpResponse;
        }
        catch (error) {
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
    async get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    /**
     * POST request
     */
    async post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    /**
     * PUT request
     */
    async put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    /**
     * DELETE request
     */
    async delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
    /**
     * PATCH request
     */
    async patch(url, data, config) {
        return this.request({ ...config, method: 'PATCH', url, data });
    }
    /**
     * HEAD request
     */
    async head(url, config) {
        return this.request({ ...config, method: 'HEAD', url });
    }
    /**
     * OPTIONS request
     */
    async options(url, config) {
        return this.request({ ...config, method: 'OPTIONS', url });
    }
    /**
     * Download file
     */
    async download(url, onProgress) {
        const response = await this.request({
            url,
            responseType: 'stream'
        });
        if (!response.data) {
            throw new Error('No response stream');
        }
        const contentLength = parseInt(response.headers['content-length'] || '0', 10);
        const chunks = [];
        let loaded = 0;
        const reader = response.data.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                chunks.push(value);
                loaded += value.length;
                if (onProgress && contentLength > 0) {
                    onProgress(loaded, contentLength);
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        return new Blob(chunks);
    }
    /**
     * Upload file
     */
    async upload(url, file, fieldName = 'file', additionalFields, onProgress) {
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
    createHttpError(message, config, response, code) {
        const error = new Error(message);
        error.isHttpError = true;
        error.config = config;
        error.response = response;
        error.code = code;
        return error;
    }
    /**
     * Merge configurations
     */
    mergeConfig(config) {
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
    buildUrl(url, params) {
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
    shouldRetry(error) {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Log message
     */
    log(message, ...args) {
        if (this.config.enableLogging) {
            console.log(`[HttpClient] ${message}`, ...args);
        }
    }
    /**
     * Set default header
     */
    setHeader(name, value) {
        this.config.headers[name] = value;
    }
    /**
     * Remove default header
     */
    removeHeader(name) {
        delete this.config.headers[name];
    }
    /**
     * Get default headers
     */
    getHeaders() {
        return { ...this.config.headers };
    }
    /**
     * Update configuration
     */
    updateConfig(config) {
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
exports.HttpClient = HttpClient;
/**
 * Create HTTP client instance
 */
function createHttpClient(config) {
    return new HttpClient(config);
}
/**
 * Default HTTP client instance
 */
exports.httpClient = new HttpClient();
/**
 * Common HTTP client configurations
 */
exports.HttpClientPresets = {
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
        validateStatus: (status) => status >= 200 && status < 300,
    },
};
/**
 * HTTP status codes
 */
exports.HttpStatus = {
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
};
//# sourceMappingURL=http-client.js.map