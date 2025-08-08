"use strict";
/**
 * In-memory implementation of the memory service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryService = void 0;
const base_memory_service_1 = require("./base-memory-service");
/**
 * In-memory memory service implementation
 */
class InMemoryService extends base_memory_service_1.BaseMemoryService {
    constructor(config = {}) {
        super(config);
        this.entries = new Map();
        this.indexByTags = new Map();
        this.indexByContent = new Map();
    }
    /**
     * Store a memory entry
     */
    async store(entry) {
        // Check if we've reached the maximum number of entries
        if (this.config.maxEntries && this.entries.size >= this.config.maxEntries) {
            await this.evictOldestEntry();
        }
        this.entries.set(entry.id, entry);
        this.updateIndexes(entry);
    }
    /**
     * Retrieve a memory entry by ID
     */
    async retrieve(id) {
        const entry = this.entries.get(id);
        if (!entry) {
            return null;
        }
        // Check if entry has expired
        if (entry.isExpired()) {
            await this.delete(id);
            return null;
        }
        return entry;
    }
    /**
     * Search for memory entries
     */
    async search(query) {
        let candidates = Array.from(this.entries.values());
        // Filter based on query criteria
        candidates = this.filterEntries(candidates, query);
        const results = [];
        for (const entry of candidates) {
            let score = 0;
            let similarity = 0;
            // Calculate content similarity
            if (query.content) {
                similarity = this.calculateTextSimilarity(entry.content, query.content);
                score += similarity * 0.4;
            }
            // Calculate embedding similarity
            if (query.embedding && entry.embedding) {
                const embeddingSimilarity = this.calculateEmbeddingSimilarity(query.embedding, entry.embedding);
                similarity = Math.max(similarity, embeddingSimilarity);
                score += embeddingSimilarity * 0.6;
            }
            // Add importance to score
            score += entry.getImportance() * 0.2;
            // Add recency to score (newer entries get higher score)
            const ageScore = Math.max(0, 1 - (entry.getAge() / (7 * 24 * 60 * 60 * 1000))); // 7 days max
            score += ageScore * 0.1;
            // Check minimum similarity threshold
            if (query.minSimilarity && similarity < query.minSimilarity) {
                continue;
            }
            results.push({
                entry,
                similarity,
                score
            });
        }
        // Sort by score (descending)
        results.sort((a, b) => (b.score || 0) - (a.score || 0));
        // Apply limit and offset
        const offset = query.offset || 0;
        const limit = query.limit || 10;
        return results.slice(offset, offset + limit);
    }
    /**
     * Update a memory entry
     */
    async update(id, updates) {
        const entry = this.entries.get(id);
        if (!entry) {
            return false;
        }
        // Remove from indexes before updating
        this.removeFromIndexes(entry);
        // Apply updates
        Object.assign(entry, updates);
        entry.updatedAt = new Date();
        // Update indexes
        this.updateIndexes(entry);
        return true;
    }
    /**
     * Delete a memory entry
     */
    async delete(id) {
        const entry = this.entries.get(id);
        if (!entry) {
            return false;
        }
        this.removeFromIndexes(entry);
        this.entries.delete(id);
        return true;
    }
    /**
     * List all memory entries
     */
    async list(limit, offset) {
        const entries = Array.from(this.entries.values())
            .filter(entry => !entry.isExpired())
            .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        if (offset || limit) {
            const start = offset || 0;
            const end = limit ? start + limit : undefined;
            return entries.slice(start, end);
        }
        return entries;
    }
    /**
     * Clear all memory entries
     */
    async clear() {
        this.entries.clear();
        this.indexByTags.clear();
        this.indexByContent.clear();
    }
    /**
     * Get memory service statistics
     */
    async getStats() {
        const entries = Array.from(this.entries.values());
        const expiredEntries = entries.filter(entry => entry.isExpired());
        let oldestEntry;
        let newestEntry;
        if (entries.length > 0) {
            const sortedByCreation = entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            oldestEntry = sortedByCreation[0].createdAt;
            newestEntry = sortedByCreation[sortedByCreation.length - 1].createdAt;
        }
        // Estimate memory usage
        const memoryUsage = this.estimateMemoryUsage();
        return {
            totalEntries: entries.length,
            expiredEntries: expiredEntries.length,
            memoryUsage,
            oldestEntry,
            newestEntry
        };
    }
    /**
     * Clean up expired entries
     */
    async cleanup() {
        const expiredIds = [];
        for (const [id, entry] of this.entries) {
            if (entry.isExpired()) {
                expiredIds.push(id);
            }
        }
        for (const id of expiredIds) {
            await this.delete(id);
        }
        return expiredIds.length;
    }
    /**
     * Update indexes for an entry
     */
    updateIndexes(entry) {
        // Index by tags
        if (entry.metadata.tags) {
            for (const tag of entry.metadata.tags) {
                if (!this.indexByTags.has(tag)) {
                    this.indexByTags.set(tag, new Set());
                }
                this.indexByTags.get(tag).add(entry.id);
            }
        }
        // Index by content words
        const words = entry.content.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (word.length > 2) { // Only index words longer than 2 characters
                if (!this.indexByContent.has(word)) {
                    this.indexByContent.set(word, new Set());
                }
                this.indexByContent.get(word).add(entry.id);
            }
        }
    }
    /**
     * Remove entry from indexes
     */
    removeFromIndexes(entry) {
        // Remove from tag index
        if (entry.metadata.tags) {
            for (const tag of entry.metadata.tags) {
                const tagSet = this.indexByTags.get(tag);
                if (tagSet) {
                    tagSet.delete(entry.id);
                    if (tagSet.size === 0) {
                        this.indexByTags.delete(tag);
                    }
                }
            }
        }
        // Remove from content index
        const words = entry.content.toLowerCase().split(/\s+/);
        for (const word of words) {
            if (word.length > 2) {
                const wordSet = this.indexByContent.get(word);
                if (wordSet) {
                    wordSet.delete(entry.id);
                    if (wordSet.size === 0) {
                        this.indexByContent.delete(word);
                    }
                }
            }
        }
    }
    /**
     * Calculate embedding similarity using cosine similarity
     */
    calculateEmbeddingSimilarity(embedding1, embedding2) {
        if (embedding1.length !== embedding2.length) {
            return 0;
        }
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }
        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    /**
     * Evict the oldest entry when max capacity is reached
     */
    async evictOldestEntry() {
        let oldestEntry = null;
        let oldestId = null;
        for (const [id, entry] of this.entries) {
            if (!oldestEntry || entry.createdAt < oldestEntry.createdAt) {
                oldestEntry = entry;
                oldestId = id;
            }
        }
        if (oldestId) {
            await this.delete(oldestId);
        }
    }
    /**
     * Estimate memory usage in bytes
     */
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.entries.values()) {
            // Estimate size of entry
            totalSize += entry.content.length * 2; // UTF-16 characters
            totalSize += JSON.stringify(entry.metadata).length * 2;
            if (entry.embedding) {
                totalSize += entry.embedding.length * 8; // 8 bytes per number
            }
            totalSize += 200; // Overhead for object structure
        }
        return totalSize;
    }
    /**
     * Get entries by tag (optimized using index)
     */
    async getByTag(tag) {
        const entryIds = this.indexByTags.get(tag);
        if (!entryIds) {
            return [];
        }
        const entries = [];
        for (const id of entryIds) {
            const entry = await this.retrieve(id);
            if (entry) {
                entries.push(entry);
            }
        }
        return entries;
    }
    /**
     * Get all available tags
     */
    getAllTags() {
        return Array.from(this.indexByTags.keys());
    }
    /**
     * Get tag usage statistics
     */
    getTagStats() {
        const stats = new Map();
        for (const [tag, entryIds] of this.indexByTags) {
            stats.set(tag, entryIds.size);
        }
        return stats;
    }
}
exports.InMemoryService = InMemoryService;
//# sourceMappingURL=in-memory-service.js.map