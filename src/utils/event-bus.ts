/**
 * Event bus for handling application events
 */

export interface EventBusConfig {
  maxListeners?: number;
  enableLogging?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

export type EventListener<T = any> = (data: T) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

/**
 * Simple event bus implementation
 */
export class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private config: Required<EventBusConfig>;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      maxListeners: config.maxListeners ?? 100,
      enableLogging: config.enableLogging ?? false,
      logLevel: config.logLevel ?? 'info',
    };
  }

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    
    if (eventListeners.size >= this.config.maxListeners) {
      throw new Error(`Maximum number of listeners (${this.config.maxListeners}) exceeded for event: ${event}`);
    }

    eventListeners.add(listener);

    if (this.config.enableLogging) {
      this.log('debug', `Listener added for event: ${event}`);
    }

    return {
      unsubscribe: () => this.off(event, listener),
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T = any>(event: string, listener: EventListener<T>): EventSubscription {
    const onceListener: EventListener<T> = async (data: T) => {
      this.off(event, onceListener);
      await listener(data);
    };

    return this.on(event, onceListener);
  }

  /**
   * Unsubscribe from an event
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }

      if (this.config.enableLogging) {
        this.log('debug', `Listener removed for event: ${event}`);
      }
    }
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: string, data?: T): Promise<void> {
    const eventListeners = this.listeners.get(event);
    
    if (!eventListeners || eventListeners.size === 0) {
      if (this.config.enableLogging) {
        this.log('debug', `No listeners for event: ${event}`);
      }
      return;
    }

    if (this.config.enableLogging) {
      this.log('debug', `Emitting event: ${event} to ${eventListeners.size} listeners`);
    }

    const promises: Promise<void>[] = [];
    
    for (const listener of eventListeners) {
      try {
        const result = listener(data);
        if (result instanceof Promise) {
          promises.push(result);
        }
      } catch (error) {
        if (this.config.enableLogging) {
          this.log('error', `Error in event listener for ${event}:`, error);
        }
        // Continue with other listeners even if one fails
      }
    }

    // Wait for all async listeners to complete
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
      } catch (error) {
        if (this.config.enableLogging) {
          this.log('error', `Error in async event listeners for ${event}:`, error);
        }
      }
    }
  }

  /**
   * Emit an event synchronously (doesn't wait for async listeners)
   */
  emitSync<T = any>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event);
    
    if (!eventListeners || eventListeners.size === 0) {
      if (this.config.enableLogging) {
        this.log('debug', `No listeners for event: ${event}`);
      }
      return;
    }

    if (this.config.enableLogging) {
      this.log('debug', `Emitting event synchronously: ${event} to ${eventListeners.size} listeners`);
    }
    
    for (const listener of eventListeners) {
      try {
        listener(data);
      } catch (error) {
        if (this.config.enableLogging) {
          this.log('error', `Error in event listener for ${event}:`, error);
        }
        // Continue with other listeners even if one fails
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      if (this.config.enableLogging) {
        this.log('debug', `All listeners removed for event: ${event}`);
      }
    } else {
      this.listeners.clear();
      if (this.config.enableLogging) {
        this.log('debug', 'All listeners removed for all events');
      }
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: string): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Get total number of listeners across all events
   */
  getTotalListenerCount(): number {
    let total = 0;
    for (const listeners of this.listeners.values()) {
      total += listeners.size;
    }
    return total;
  }

  /**
   * Wait for an event to be emitted
   */
  waitFor<T = any>(event: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout | undefined;
      
      const subscription = this.once(event, (data: T) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(data);
      });

      if (timeout) {
        timeoutId = setTimeout(() => {
          subscription.unsubscribe();
          reject(new Error(`Timeout waiting for event: ${event}`));
        }, timeout);
      }
    });
  }

  /**
   * Create a filtered event listener
   */
  filter<T = any>(
    event: string,
    predicate: (data: T) => boolean,
    listener: EventListener<T>
  ): EventSubscription {
    const filteredListener: EventListener<T> = (data: T) => {
      if (predicate(data)) {
        listener(data);
      }
    };

    return this.on(event, filteredListener);
  }

  /**
   * Create a mapped event listener
   */
  map<T = any, U = any>(
    event: string,
    mapper: (data: T) => U,
    listener: EventListener<U>
  ): EventSubscription {
    const mappedListener: EventListener<T> = (data: T) => {
      try {
        const mappedData = mapper(data);
        listener(mappedData);
      } catch (error) {
        if (this.config.enableLogging) {
          this.log('error', `Error in event mapper for ${event}:`, error);
        }
      }
    };

    return this.on(event, mappedListener);
  }

  /**
   * Log messages based on configuration
   */
  private log(level: string, message: string, ...args: any[]): void {
    if (!this.config.enableLogging) return;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex >= currentLevelIndex) {
      const logMethod = (console as any)[level] || console.log;
      logMethod(`[EventBus] ${message}`, ...args);
    }
  }
}

// Default global event bus instance
export const globalEventBus = new EventBus();