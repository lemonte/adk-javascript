/**
 * In-memory implementation of the memory service
 */
import { BaseMemoryService, MemoryQuery, MemorySearchResult, MemoryServiceConfig, MemoryStats } from './base-memory-service';
import { MemoryEntry } from './memory-entry';
/**
 * In-memory memory service implementation
 */
export declare class InMemoryService extends BaseMemoryService {
    private entries;
    private indexByTags;
    private indexByContent;
    constructor(config?: MemoryServiceConfig);
    /**
     * Store a memory entry
     */
    store(entry: MemoryEntry): Promise<void>;
    /**
     * Retrieve a memory entry by ID
     */
    retrieve(id: string): Promise<MemoryEntry | null>;
    /**
     * Search for memory entries
     */
    search(query: MemoryQuery): Promise<MemorySearchResult[]>;
    /**
     * Update a memory entry
     */
    update(id: string, updates: Partial<MemoryEntry>): Promise<boolean>;
    /**
     * Delete a memory entry
     */
    delete(id: string): Promise<boolean>;
    /**
     * List all memory entries
     */
    list(limit?: number, offset?: number): Promise<MemoryEntry[]>;
    /**
     * Clear all memory entries
     */
    clear(): Promise<void>;
    /**
     * Get memory service statistics
     */
    getStats(): Promise<MemoryStats>;
    /**
     * Clean up expired entries
     */
    cleanup(): Promise<number>;
    /**
     * Update indexes for an entry
     */
    private updateIndexes;
    /**
     * Remove entry from indexes
     */
    private removeFromIndexes;
    /**
     * Calculate embedding similarity using cosine similarity
     */
    private calculateEmbeddingSimilarity;
    /**
     * Evict the oldest entry when max capacity is reached
     */
    private evictOldestEntry;
    /**
     * Estimate memory usage in bytes
     */
    private estimateMemoryUsage;
    /**
     * Get entries by tag (optimized using index)
     */
    getByTag(tag: string): Promise<MemoryEntry[]>;
    /**
     * Get all available tags
     */
    getAllTags(): string[];
    /**
     * Get tag usage statistics
     */
    getTagStats(): Map<string, number>;
}
//# sourceMappingURL=in-memory-service.d.ts.map