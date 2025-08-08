/**
 * Stream utilities for handling streams and data processing
 */
export interface StreamOptions {
    highWaterMark?: number;
    objectMode?: boolean;
    encoding?: BufferEncoding;
}
export interface TransformOptions extends StreamOptions {
    transform?: (chunk: any, encoding?: BufferEncoding) => any;
    flush?: () => any;
}
export interface PipelineOptions {
    signal?: AbortSignal;
    end?: boolean;
}
export interface ChunkOptions {
    size?: number;
    overlap?: number;
}
export interface BatchOptions {
    size: number;
    timeout?: number;
    flushOnEnd?: boolean;
}
export interface ThrottleOptions {
    rate: number;
    burst?: number;
}
export interface RetryStreamOptions {
    maxRetries?: number;
    retryDelay?: number;
    shouldRetry?: (error: Error) => boolean;
}
/**
 * Stream utilities class
 */
export declare class StreamUtils {
    /**
     * Create a readable stream from array
     */
    static fromArray<T>(array: T[], options?: StreamOptions): ReadableStream<T>;
    /**
     * Create a readable stream from async iterator
     */
    static fromAsyncIterable<T>(iterable: AsyncIterable<T>, options?: StreamOptions): ReadableStream<T>;
    /**
     * Create a readable stream from function
     */
    static fromFunction<T>(fn: () => Promise<T | null> | T | null, options?: StreamOptions): ReadableStream<T>;
    /**
     * Convert stream to array
     */
    static toArray<T>(stream: ReadableStream<T>): Promise<T[]>;
    /**
     * Convert stream to async iterator
     */
    static toAsyncIterable<T>(stream: ReadableStream<T>): AsyncIterable<T>;
    /**
     * Transform stream
     */
    static transform<T, R>(stream: ReadableStream<T>, transformer: (chunk: T) => R | Promise<R>, options?: TransformOptions): ReadableStream<R>;
    /**
     * Filter stream
     */
    static filter<T>(stream: ReadableStream<T>, predicate: (chunk: T) => boolean | Promise<boolean>, options?: StreamOptions): ReadableStream<T>;
    /**
     * Map stream
     */
    static map<T, R>(stream: ReadableStream<T>, mapper: (chunk: T, index: number) => R | Promise<R>, options?: StreamOptions): ReadableStream<R>;
    /**
     * Reduce stream to single value
     */
    static reduce<T, R>(stream: ReadableStream<T>, reducer: (accumulator: R, chunk: T, index: number) => R | Promise<R>, initialValue: R): Promise<R>;
    /**
     * Take first n items from stream
     */
    static take<T>(stream: ReadableStream<T>, count: number, options?: StreamOptions): ReadableStream<T>;
    /**
     * Skip first n items from stream
     */
    static skip<T>(stream: ReadableStream<T>, count: number, options?: StreamOptions): ReadableStream<T>;
    /**
     * Chunk stream into arrays
     */
    static chunk<T>(stream: ReadableStream<T>, options: ChunkOptions, streamOptions?: StreamOptions): ReadableStream<T[]>;
    /**
     * Batch stream with timeout
     */
    static batch<T>(stream: ReadableStream<T>, options: BatchOptions, streamOptions?: StreamOptions): ReadableStream<T[]>;
    /**
     * Throttle stream
     */
    static throttle<T>(stream: ReadableStream<T>, options: ThrottleOptions, streamOptions?: StreamOptions): ReadableStream<T>;
    /**
     * Debounce stream
     */
    static debounce<T>(stream: ReadableStream<T>, delay: number, options?: StreamOptions): ReadableStream<T>;
    /**
     * Merge multiple streams
     */
    static merge<T>(streams: ReadableStream<T>[], options?: StreamOptions): ReadableStream<T>;
    /**
     * Split stream into multiple streams
     */
    static split<T>(stream: ReadableStream<T>, predicate: (chunk: T) => number, outputCount: number, options?: StreamOptions): ReadableStream<T>[];
    /**
     * Add retry logic to stream
     */
    static retry<T>(streamFactory: () => ReadableStream<T>, options?: RetryStreamOptions, streamOptions?: StreamOptions): ReadableStream<T>;
    /**
     * Create a duplex stream (readable and writable)
     */
    static createDuplex<T, R>(transform: (chunk: T) => R | Promise<R>, options?: StreamOptions): {
        readable: ReadableStream<R>;
        writable: WritableStream<T>;
    };
    /**
     * Pipe stream through multiple transforms
     */
    static pipeline<T>(source: ReadableStream<T>, ...transforms: TransformStream<any, any>[]): ReadableStream<any>;
    /**
     * Create a tee (split stream into two identical streams)
     */
    static tee<T>(stream: ReadableStream<T>): [ReadableStream<T>, ReadableStream<T>];
    /**
     * Count items in stream
     */
    static count<T>(stream: ReadableStream<T>): Promise<number>;
    /**
     * Check if stream is empty
     */
    static isEmpty<T>(stream: ReadableStream<T>): Promise<boolean>;
    /**
     * Get first item from stream
     */
    static first<T>(stream: ReadableStream<T>): Promise<T | undefined>;
    /**
     * Get last item from stream
     */
    static last<T>(stream: ReadableStream<T>): Promise<T | undefined>;
}
export declare const fromArray: typeof StreamUtils.fromArray, fromAsyncIterable: typeof StreamUtils.fromAsyncIterable, fromFunction: typeof StreamUtils.fromFunction, toArray: typeof StreamUtils.toArray, toAsyncIterable: typeof StreamUtils.toAsyncIterable, transform: typeof StreamUtils.transform, filter: typeof StreamUtils.filter, map: typeof StreamUtils.map, reduce: typeof StreamUtils.reduce, take: typeof StreamUtils.take, skip: typeof StreamUtils.skip, chunk: typeof StreamUtils.chunk, batch: typeof StreamUtils.batch, throttle: typeof StreamUtils.throttle, debounce: typeof StreamUtils.debounce, merge: typeof StreamUtils.merge, split: typeof StreamUtils.split, retry: typeof StreamUtils.retry, createDuplex: typeof StreamUtils.createDuplex, pipeline: typeof StreamUtils.pipeline, tee: typeof StreamUtils.tee, count: typeof StreamUtils.count, isEmpty: typeof StreamUtils.isEmpty, first: typeof StreamUtils.first, last: typeof StreamUtils.last;
//# sourceMappingURL=stream-utils.d.ts.map