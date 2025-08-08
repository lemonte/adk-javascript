"use strict";
/**
 * Stream utilities for handling streams and data processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = exports.first = exports.isEmpty = exports.count = exports.tee = exports.pipeline = exports.createDuplex = exports.retry = exports.split = exports.merge = exports.debounce = exports.throttle = exports.batch = exports.chunk = exports.skip = exports.take = exports.reduce = exports.map = exports.filter = exports.transform = exports.toAsyncIterable = exports.toArray = exports.fromFunction = exports.fromAsyncIterable = exports.fromArray = exports.StreamUtils = void 0;
/**
 * Stream utilities class
 */
class StreamUtils {
    /**
     * Create a readable stream from array
     */
    static fromArray(array, options = {}) {
        let index = 0;
        return new ReadableStream({
            start(controller) {
                // Stream is ready
            },
            pull(controller) {
                if (index < array.length) {
                    controller.enqueue(array[index++]);
                }
                else {
                    controller.close();
                }
            },
            cancel() {
                // Cleanup if needed
            },
        }, {
            highWaterMark: options.highWaterMark,
        });
    }
    /**
     * Create a readable stream from async iterator
     */
    static fromAsyncIterable(iterable, options = {}) {
        const iterator = iterable[Symbol.asyncIterator]();
        return new ReadableStream({
            async pull(controller) {
                try {
                    const { value, done } = await iterator.next();
                    if (done) {
                        controller.close();
                    }
                    else {
                        controller.enqueue(value);
                    }
                }
                catch (error) {
                    controller.error(error);
                }
            },
            async cancel() {
                if (iterator.return) {
                    await iterator.return();
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        });
    }
    /**
     * Create a readable stream from function
     */
    static fromFunction(fn, options = {}) {
        return new ReadableStream({
            async pull(controller) {
                try {
                    const value = await fn();
                    if (value === null || value === undefined) {
                        controller.close();
                    }
                    else {
                        controller.enqueue(value);
                    }
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        });
    }
    /**
     * Convert stream to array
     */
    static async toArray(stream) {
        const reader = stream.getReader();
        const chunks = [];
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                chunks.push(value);
            }
        }
        finally {
            reader.releaseLock();
        }
        return chunks;
    }
    /**
     * Convert stream to async iterator
     */
    static async *toAsyncIterable(stream) {
        const reader = stream.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                yield value;
            }
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Transform stream
     */
    static transform(stream, transformer, options = {}) {
        return stream.pipeThrough(new TransformStream({
            async transform(chunk, controller) {
                try {
                    const result = await transformer(chunk);
                    controller.enqueue(result);
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Filter stream
     */
    static filter(stream, predicate, options = {}) {
        return stream.pipeThrough(new TransformStream({
            async transform(chunk, controller) {
                try {
                    const shouldInclude = await predicate(chunk);
                    if (shouldInclude) {
                        controller.enqueue(chunk);
                    }
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Map stream
     */
    static map(stream, mapper, options = {}) {
        let index = 0;
        return stream.pipeThrough(new TransformStream({
            async transform(chunk, controller) {
                try {
                    const result = await mapper(chunk, index++);
                    controller.enqueue(result);
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Reduce stream to single value
     */
    static async reduce(stream, reducer, initialValue) {
        const reader = stream.getReader();
        let accumulator = initialValue;
        let index = 0;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                accumulator = await reducer(accumulator, value, index++);
            }
        }
        finally {
            reader.releaseLock();
        }
        return accumulator;
    }
    /**
     * Take first n items from stream
     */
    static take(stream, count, options = {}) {
        let taken = 0;
        return stream.pipeThrough(new TransformStream({
            transform(chunk, controller) {
                if (taken < count) {
                    controller.enqueue(chunk);
                    taken++;
                    if (taken >= count) {
                        controller.terminate();
                    }
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Skip first n items from stream
     */
    static skip(stream, count, options = {}) {
        let skipped = 0;
        return stream.pipeThrough(new TransformStream({
            transform(chunk, controller) {
                if (skipped < count) {
                    skipped++;
                }
                else {
                    controller.enqueue(chunk);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Chunk stream into arrays
     */
    static chunk(stream, options, streamOptions = {}) {
        const { size = 10, overlap = 0 } = options;
        let buffer = [];
        return stream.pipeThrough(new TransformStream({
            transform(chunk, controller) {
                buffer.push(chunk);
                if (buffer.length >= size) {
                    controller.enqueue([...buffer]);
                    if (overlap > 0) {
                        buffer = buffer.slice(-overlap);
                    }
                    else {
                        buffer = [];
                    }
                }
            },
            flush(controller) {
                if (buffer.length > 0) {
                    controller.enqueue(buffer);
                }
            },
        }, {
            highWaterMark: streamOptions.highWaterMark,
        }));
    }
    /**
     * Batch stream with timeout
     */
    static batch(stream, options, streamOptions = {}) {
        const { size, timeout, flushOnEnd = true } = options;
        let buffer = [];
        let timeoutId = null;
        const flushBuffer = (controller) => {
            if (buffer.length > 0) {
                controller.enqueue([...buffer]);
                buffer = [];
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };
        return stream.pipeThrough(new TransformStream({
            transform(chunk, controller) {
                buffer.push(chunk);
                if (buffer.length >= size) {
                    flushBuffer(controller);
                }
                else if (timeout && !timeoutId) {
                    timeoutId = setTimeout(() => {
                        flushBuffer(controller);
                    }, timeout);
                }
            },
            flush(controller) {
                if (flushOnEnd) {
                    flushBuffer(controller);
                }
            },
        }, {
            highWaterMark: streamOptions.highWaterMark,
        }));
    }
    /**
     * Throttle stream
     */
    static throttle(stream, options, streamOptions = {}) {
        const { rate, burst = rate } = options;
        const interval = 1000 / rate; // ms per item
        let tokens = burst;
        let lastRefill = Date.now();
        return stream.pipeThrough(new TransformStream({
            async transform(chunk, controller) {
                const now = Date.now();
                const elapsed = now - lastRefill;
                // Refill tokens
                tokens = Math.min(burst, tokens + (elapsed * rate) / 1000);
                lastRefill = now;
                if (tokens >= 1) {
                    tokens -= 1;
                    controller.enqueue(chunk);
                }
                else {
                    // Wait for next token
                    const waitTime = (1 - tokens) * interval;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    tokens = 0;
                    controller.enqueue(chunk);
                }
            },
        }, {
            highWaterMark: streamOptions.highWaterMark,
        }));
    }
    /**
     * Debounce stream
     */
    static debounce(stream, delay, options = {}) {
        let timeoutId = null;
        let latestChunk;
        return stream.pipeThrough(new TransformStream({
            transform(chunk, controller) {
                latestChunk = chunk;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    controller.enqueue(latestChunk);
                    timeoutId = null;
                }, delay);
            },
            flush(controller) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    controller.enqueue(latestChunk);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        }));
    }
    /**
     * Merge multiple streams
     */
    static merge(streams, options = {}) {
        return new ReadableStream({
            async start(controller) {
                const readers = streams.map(stream => stream.getReader());
                const promises = readers.map(async (reader, index) => {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) {
                                break;
                            }
                            controller.enqueue(value);
                        }
                    }
                    catch (error) {
                        controller.error(error);
                    }
                    finally {
                        reader.releaseLock();
                    }
                });
                try {
                    await Promise.all(promises);
                    controller.close();
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        });
    }
    /**
     * Split stream into multiple streams
     */
    static split(stream, predicate, outputCount, options = {}) {
        const writers = [];
        const outputs = [];
        for (let i = 0; i < outputCount; i++) {
            const transformStream = new TransformStream({}, {
                highWaterMark: options.highWaterMark,
            });
            outputs.push(transformStream.readable);
            writers.push(transformStream.writable.getWriter());
        }
        // Process input stream
        (async () => {
            const reader = stream.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const outputIndex = predicate(value);
                    if (outputIndex >= 0 && outputIndex < outputCount) {
                        const writer = writers[outputIndex];
                        if (writer) {
                            await writer.write(value);
                        }
                    }
                }
            }
            catch (error) {
                writers.forEach(writer => {
                    if (writer) {
                        writer.abort(error);
                    }
                });
            }
            finally {
                reader.releaseLock();
                writers.forEach(writer => {
                    if (writer) {
                        writer.close();
                    }
                });
            }
        })();
        return outputs;
    }
    /**
     * Add retry logic to stream
     */
    static retry(streamFactory, options = {}, streamOptions = {}) {
        const { maxRetries = 3, retryDelay = 1000, shouldRetry = () => true, } = options;
        return new ReadableStream({
            async start(controller) {
                let attempt = 0;
                while (attempt <= maxRetries) {
                    try {
                        const stream = streamFactory();
                        const reader = stream.getReader();
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                controller.enqueue(value);
                            }
                        }
                        finally {
                            reader.releaseLock();
                        }
                    }
                    catch (error) {
                        attempt++;
                        if (attempt > maxRetries || !shouldRetry(error)) {
                            controller.error(error);
                            return;
                        }
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                }
            },
        }, {
            highWaterMark: streamOptions.highWaterMark,
        });
    }
    /**
     * Create a duplex stream (readable and writable)
     */
    static createDuplex(transform, options = {}) {
        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                try {
                    const result = await transform(chunk);
                    controller.enqueue(result);
                }
                catch (error) {
                    controller.error(error);
                }
            },
        }, {
            highWaterMark: options.highWaterMark,
        });
        return {
            readable: transformStream.readable,
            writable: transformStream.writable,
        };
    }
    /**
     * Pipe stream through multiple transforms
     */
    static pipeline(source, ...transforms) {
        return transforms.reduce((stream, transform) => stream.pipeThrough(transform), source);
    }
    /**
     * Create a tee (split stream into two identical streams)
     */
    static tee(stream) {
        return stream.tee();
    }
    /**
     * Count items in stream
     */
    static async count(stream) {
        const reader = stream.getReader();
        let count = 0;
        try {
            while (true) {
                const { done } = await reader.read();
                if (done) {
                    break;
                }
                count++;
            }
        }
        finally {
            reader.releaseLock();
        }
        return count;
    }
    /**
     * Check if stream is empty
     */
    static async isEmpty(stream) {
        const reader = stream.getReader();
        try {
            const { done } = await reader.read();
            return done;
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Get first item from stream
     */
    static async first(stream) {
        const reader = stream.getReader();
        try {
            const { done, value } = await reader.read();
            return done ? undefined : value;
        }
        finally {
            reader.releaseLock();
        }
    }
    /**
     * Get last item from stream
     */
    static async last(stream) {
        const reader = stream.getReader();
        let lastValue;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }
                lastValue = value;
            }
        }
        finally {
            reader.releaseLock();
        }
        return lastValue;
    }
}
exports.StreamUtils = StreamUtils;
// Export commonly used functions
exports.fromArray = StreamUtils.fromArray, exports.fromAsyncIterable = StreamUtils.fromAsyncIterable, exports.fromFunction = StreamUtils.fromFunction, exports.toArray = StreamUtils.toArray, exports.toAsyncIterable = StreamUtils.toAsyncIterable, exports.transform = StreamUtils.transform, exports.filter = StreamUtils.filter, exports.map = StreamUtils.map, exports.reduce = StreamUtils.reduce, exports.take = StreamUtils.take, exports.skip = StreamUtils.skip, exports.chunk = StreamUtils.chunk, exports.batch = StreamUtils.batch, exports.throttle = StreamUtils.throttle, exports.debounce = StreamUtils.debounce, exports.merge = StreamUtils.merge, exports.split = StreamUtils.split, exports.retry = StreamUtils.retry, exports.createDuplex = StreamUtils.createDuplex, exports.pipeline = StreamUtils.pipeline, exports.tee = StreamUtils.tee, exports.count = StreamUtils.count, exports.isEmpty = StreamUtils.isEmpty, exports.first = StreamUtils.first, exports.last = StreamUtils.last;
//# sourceMappingURL=stream-utils.js.map