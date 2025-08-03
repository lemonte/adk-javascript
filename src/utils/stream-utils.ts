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
  rate: number; // items per second
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
export class StreamUtils {
  /**
   * Create a readable stream from array
   */
  static fromArray<T>(array: T[], options: StreamOptions = {}): ReadableStream<T> {
    let index = 0;
    
    return new ReadableStream<T>({
      start(controller) {
        // Stream is ready
      },
      
      pull(controller) {
        if (index < array.length) {
          controller.enqueue(array[index++]);
        } else {
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
  static fromAsyncIterable<T>(
    iterable: AsyncIterable<T>,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    const iterator = iterable[Symbol.asyncIterator]();
    
    return new ReadableStream<T>({
      async pull(controller) {
        try {
          const { value, done } = await iterator.next();
          
          if (done) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
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
  static fromFunction<T>(
    fn: () => Promise<T | null> | T | null,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    return new ReadableStream<T>({
      async pull(controller) {
        try {
          const value = await fn();
          
          if (value === null || value === undefined) {
            controller.close();
          } else {
            controller.enqueue(value);
          }
        } catch (error) {
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
  static async toArray<T>(stream: ReadableStream<T>): Promise<T[]> {
    const reader = stream.getReader();
    const chunks: T[] = [];
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    return chunks;
  }

  /**
   * Convert stream to async iterator
   */
  static async* toAsyncIterable<T>(stream: ReadableStream<T>): AsyncIterable<T> {
    const reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Transform stream
   */
  static transform<T, R>(
    stream: ReadableStream<T>,
    transformer: (chunk: T) => R | Promise<R>,
    options: TransformOptions = {}
  ): ReadableStream<R> {
    return stream.pipeThrough(
      new TransformStream<T, R>({
        async transform(chunk, controller) {
          try {
            const result = await transformer(chunk);
            controller.enqueue(result);
          } catch (error) {
            controller.error(error);
          }
        },
      }, {
        highWaterMark: options.highWaterMark,
      })
    );
  }

  /**
   * Filter stream
   */
  static filter<T>(
    stream: ReadableStream<T>,
    predicate: (chunk: T) => boolean | Promise<boolean>,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    return stream.pipeThrough(
      new TransformStream<T, T>({
        async transform(chunk, controller) {
          try {
            const shouldInclude = await predicate(chunk);
            
            if (shouldInclude) {
              controller.enqueue(chunk);
            }
          } catch (error) {
            controller.error(error);
          }
        },
      }, {
        highWaterMark: options.highWaterMark,
      })
    );
  }

  /**
   * Map stream
   */
  static map<T, R>(
    stream: ReadableStream<T>,
    mapper: (chunk: T, index: number) => R | Promise<R>,
    options: StreamOptions = {}
  ): ReadableStream<R> {
    let index = 0;
    
    return stream.pipeThrough(
      new TransformStream<T, R>({
        async transform(chunk, controller) {
          try {
            const result = await mapper(chunk, index++);
            controller.enqueue(result);
          } catch (error) {
            controller.error(error);
          }
        },
      }, {
        highWaterMark: options.highWaterMark,
      })
    );
  }

  /**
   * Reduce stream to single value
   */
  static async reduce<T, R>(
    stream: ReadableStream<T>,
    reducer: (accumulator: R, chunk: T, index: number) => R | Promise<R>,
    initialValue: R
  ): Promise<R> {
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
    } finally {
      reader.releaseLock();
    }
    
    return accumulator;
  }

  /**
   * Take first n items from stream
   */
  static take<T>(
    stream: ReadableStream<T>,
    count: number,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    let taken = 0;
    
    return stream.pipeThrough(
      new TransformStream<T, T>({
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
      })
    );
  }

  /**
   * Skip first n items from stream
   */
  static skip<T>(
    stream: ReadableStream<T>,
    count: number,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    let skipped = 0;
    
    return stream.pipeThrough(
      new TransformStream<T, T>({
        transform(chunk, controller) {
          if (skipped < count) {
            skipped++;
          } else {
            controller.enqueue(chunk);
          }
        },
      }, {
        highWaterMark: options.highWaterMark,
      })
    );
  }

  /**
   * Chunk stream into arrays
   */
  static chunk<T>(
    stream: ReadableStream<T>,
    options: ChunkOptions,
    streamOptions: StreamOptions = {}
  ): ReadableStream<T[]> {
    const { size = 10, overlap = 0 } = options;
    let buffer: T[] = [];
    
    return stream.pipeThrough(
      new TransformStream<T, T[]>({
        transform(chunk, controller) {
          buffer.push(chunk);
          
          if (buffer.length >= size) {
            controller.enqueue([...buffer]);
            
            if (overlap > 0) {
              buffer = buffer.slice(-overlap);
            } else {
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
      })
    );
  }

  /**
   * Batch stream with timeout
   */
  static batch<T>(
    stream: ReadableStream<T>,
    options: BatchOptions,
    streamOptions: StreamOptions = {}
  ): ReadableStream<T[]> {
    const { size, timeout, flushOnEnd = true } = options;
    let buffer: T[] = [];
    let timeoutId: NodeJS.Timeout | null = null;
    
    const flushBuffer = (controller: TransformStreamDefaultController<T[]>) => {
      if (buffer.length > 0) {
        controller.enqueue([...buffer]);
        buffer = [];
      }
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
    
    return stream.pipeThrough(
      new TransformStream<T, T[]>({
        transform(chunk, controller) {
          buffer.push(chunk);
          
          if (buffer.length >= size) {
            flushBuffer(controller);
          } else if (timeout && !timeoutId) {
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
      })
    );
  }

  /**
   * Throttle stream
   */
  static throttle<T>(
    stream: ReadableStream<T>,
    options: ThrottleOptions,
    streamOptions: StreamOptions = {}
  ): ReadableStream<T> {
    const { rate, burst = rate } = options;
    const interval = 1000 / rate; // ms per item
    let tokens = burst;
    let lastRefill = Date.now();
    
    return stream.pipeThrough(
      new TransformStream<T, T>({
        async transform(chunk, controller) {
          const now = Date.now();
          const elapsed = now - lastRefill;
          
          // Refill tokens
          tokens = Math.min(burst, tokens + (elapsed * rate) / 1000);
          lastRefill = now;
          
          if (tokens >= 1) {
            tokens -= 1;
            controller.enqueue(chunk);
          } else {
            // Wait for next token
            const waitTime = (1 - tokens) * interval;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            tokens = 0;
            controller.enqueue(chunk);
          }
        },
      }, {
        highWaterMark: streamOptions.highWaterMark,
      })
    );
  }

  /**
   * Debounce stream
   */
  static debounce<T>(
    stream: ReadableStream<T>,
    delay: number,
    options: StreamOptions = {}
  ): ReadableStream<T> {
    let timeoutId: NodeJS.Timeout | null = null;
    let latestChunk: T;
    
    return stream.pipeThrough(
      new TransformStream<T, T>({
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
      })
    );
  }

  /**
   * Merge multiple streams
   */
  static merge<T>(
    streams: ReadableStream<T>[],
    options: StreamOptions = {}
  ): ReadableStream<T> {
    return new ReadableStream<T>({
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
          } catch (error) {
            controller.error(error);
          } finally {
            reader.releaseLock();
          }
        });
        
        try {
          await Promise.all(promises);
          controller.close();
        } catch (error) {
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
  static split<T>(
    stream: ReadableStream<T>,
    predicate: (chunk: T) => number,
    outputCount: number,
    options: StreamOptions = {}
  ): ReadableStream<T>[] {
    const writers: WritableStreamDefaultWriter<T>[] = [];
    const outputs: ReadableStream<T>[] = [];
    
    for (let i = 0; i < outputCount; i++) {
      const transformStream = new TransformStream<T, T>({}, {
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
      } catch (error) {
        writers.forEach(writer => {
          if (writer) {
            writer.abort(error);
          }
        });
      } finally {
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
  static retry<T>(
    streamFactory: () => ReadableStream<T>,
    options: RetryStreamOptions = {},
    streamOptions: StreamOptions = {}
  ): ReadableStream<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      shouldRetry = () => true,
    } = options;
    
    return new ReadableStream<T>({
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
            } finally {
              reader.releaseLock();
            }
          } catch (error) {
            attempt++;
            
            if (attempt > maxRetries || !shouldRetry(error as Error)) {
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
  static createDuplex<T, R>(
    transform: (chunk: T) => R | Promise<R>,
    options: StreamOptions = {}
  ): { readable: ReadableStream<R>; writable: WritableStream<T> } {
    const transformStream = new TransformStream<T, R>({
      async transform(chunk, controller) {
        try {
          const result = await transform(chunk);
          controller.enqueue(result);
        } catch (error) {
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
  static pipeline<T>(
    source: ReadableStream<T>,
    ...transforms: TransformStream<any, any>[]
  ): ReadableStream<any> {
    return transforms.reduce(
      (stream, transform) => stream.pipeThrough(transform),
      source
    );
  }

  /**
   * Create a tee (split stream into two identical streams)
   */
  static tee<T>(stream: ReadableStream<T>): [ReadableStream<T>, ReadableStream<T>] {
    return stream.tee();
  }

  /**
   * Count items in stream
   */
  static async count<T>(stream: ReadableStream<T>): Promise<number> {
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
    } finally {
      reader.releaseLock();
    }
    
    return count;
  }

  /**
   * Check if stream is empty
   */
  static async isEmpty<T>(stream: ReadableStream<T>): Promise<boolean> {
    const reader = stream.getReader();
    
    try {
      const { done } = await reader.read();
      return done;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get first item from stream
   */
  static async first<T>(stream: ReadableStream<T>): Promise<T | undefined> {
    const reader = stream.getReader();
    
    try {
      const { done, value } = await reader.read();
      return done ? undefined : value;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get last item from stream
   */
  static async last<T>(stream: ReadableStream<T>): Promise<T | undefined> {
    const reader = stream.getReader();
    let lastValue: T | undefined;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        lastValue = value;
      }
    } finally {
      reader.releaseLock();
    }
    
    return lastValue;
  }
}

// Export commonly used functions
export const {
  fromArray,
  fromAsyncIterable,
  fromFunction,
  toArray,
  toAsyncIterable,
  transform,
  filter,
  map,
  reduce,
  take,
  skip,
  chunk,
  batch,
  throttle,
  debounce,
  merge,
  split,
  retry,
  createDuplex,
  pipeline,
  tee,
  count,
  isEmpty,
  first,
  last,
} = StreamUtils;