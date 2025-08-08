"use strict";
/**
 * Memory utilities for the ADK JavaScript library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryUtils = void 0;
const memory_entry_1 = require("./memory-entry");
/**
 * Utility class for memory operations
 */
class MemoryUtils {
    /**
     * Export memory entries to a backup format
     */
    static async exportMemory(memoryService, options = {}) {
        const entries = await memoryService.list();
        let filteredEntries = entries;
        if (!options.includeExpired) {
            filteredEntries = entries.filter(entry => !entry.isExpired());
        }
        return {
            version: '1.0.0',
            timestamp: new Date(),
            entries: filteredEntries,
            metadata: {
                totalEntries: filteredEntries.length,
                exportOptions: options
            }
        };
    }
    /**
     * Import memory entries from a backup
     */
    static async importMemory(memoryService, backup, options = {}) {
        const results = {
            imported: 0,
            skipped: 0,
            errors: []
        };
        for (const entryData of backup.entries) {
            try {
                // Skip expired entries if requested
                if (options.skipExpired && entryData.isExpired()) {
                    results.skipped++;
                    continue;
                }
                // Check if entry already exists
                const existingEntry = await memoryService.retrieve(entryData.id);
                if (existingEntry && !options.overwrite) {
                    results.skipped++;
                    continue;
                }
                // Validate ID format if requested
                if (options.validateIds && !this.isValidId(entryData.id)) {
                    results.errors.push(`Invalid ID format: ${entryData.id}`);
                    continue;
                }
                await memoryService.store(entryData);
                results.imported++;
            }
            catch (error) {
                results.errors.push(`Failed to import entry ${entryData.id}: ${error}`);
            }
        }
        return results;
    }
    /**
     * Merge multiple memory services
     */
    static async mergeMemoryServices(targetService, sourceServices, conflictResolution = 'skip') {
        const results = {
            merged: 0,
            conflicts: 0,
            errors: []
        };
        for (const sourceService of sourceServices) {
            try {
                const sourceEntries = await sourceService.list();
                for (const entry of sourceEntries) {
                    const existingEntry = await targetService.retrieve(entry.id);
                    if (existingEntry) {
                        results.conflicts++;
                        switch (conflictResolution) {
                            case 'skip':
                                continue;
                            case 'overwrite':
                                await targetService.store(entry);
                                results.merged++;
                                break;
                            case 'merge':
                                const mergedEntry = this.mergeEntries(existingEntry, entry);
                                await targetService.store(mergedEntry);
                                results.merged++;
                                break;
                        }
                    }
                    else {
                        await targetService.store(entry);
                        results.merged++;
                    }
                }
            }
            catch (error) {
                results.errors.push(`Failed to merge from source service: ${error}`);
            }
        }
        return results;
    }
    /**
     * Deduplicate memory entries based on content similarity
     */
    static async deduplicateMemory(memoryService, similarityThreshold = 0.9) {
        const entries = await memoryService.list();
        const duplicates = [];
        const toRemove = new Set();
        for (let i = 0; i < entries.length; i++) {
            if (toRemove.has(entries[i].id))
                continue;
            const duplicateGroup = [entries[i].id];
            for (let j = i + 1; j < entries.length; j++) {
                if (toRemove.has(entries[j].id))
                    continue;
                const similarity = this.calculateContentSimilarity(entries[i], entries[j]);
                if (similarity >= similarityThreshold) {
                    duplicateGroup.push(entries[j].id);
                    toRemove.add(entries[j].id);
                }
            }
            if (duplicateGroup.length > 1) {
                duplicates.push(duplicateGroup);
            }
        }
        // Remove duplicates
        for (const id of toRemove) {
            await memoryService.delete(id);
        }
        return {
            removed: toRemove.size,
            duplicates
        };
    }
    /**
     * Analyze memory usage patterns
     */
    static async analyzeMemoryUsage(memoryService) {
        const entries = await memoryService.list();
        const tagCounts = new Map();
        let totalAge = 0;
        let totalContentLength = 0;
        let minContentLength = Infinity;
        let maxContentLength = 0;
        const importanceDistribution = { low: 0, medium: 0, high: 0 };
        for (const entry of entries) {
            // Age analysis
            totalAge += entry.getAge();
            // Content length analysis
            const contentLength = entry.content.length;
            totalContentLength += contentLength;
            minContentLength = Math.min(minContentLength, contentLength);
            maxContentLength = Math.max(maxContentLength, contentLength);
            // Tag analysis
            if (entry.metadata.tags) {
                for (const tag of entry.metadata.tags) {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                }
            }
            // Importance analysis
            const importance = entry.getImportance();
            if (importance < 0.33) {
                importanceDistribution.low++;
            }
            else if (importance < 0.67) {
                importanceDistribution.medium++;
            }
            else {
                importanceDistribution.high++;
            }
        }
        return {
            totalEntries: entries.length,
            averageAge: entries.length > 0 ? totalAge / entries.length : 0,
            tagDistribution: tagCounts,
            contentLengthStats: {
                min: minContentLength === Infinity ? 0 : minContentLength,
                max: maxContentLength,
                average: entries.length > 0 ? totalContentLength / entries.length : 0
            },
            importanceDistribution
        };
    }
    /**
     * Create a memory entry from text with automatic metadata extraction
     */
    static createEntryFromText(id, text, extractMetadata = true) {
        const metadata = {};
        if (extractMetadata) {
            // Extract hashtags as tags
            const hashtags = text.match(/#\w+/g);
            if (hashtags) {
                metadata.tags = hashtags.map(tag => tag.substring(1));
            }
            // Determine content type
            if (text.includes('http://') || text.includes('https://')) {
                metadata.type = 'url';
            }
            else if (text.includes('@')) {
                metadata.type = 'mention';
            }
            else if (text.length > 500) {
                metadata.type = 'long-form';
            }
            else {
                metadata.type = 'short-form';
            }
            // Calculate importance based on content characteristics
            let importance = 0;
            if (text.includes('!'))
                importance += 0.2;
            if (text.includes('?'))
                importance += 0.1;
            if (text.length > 100)
                importance += 0.2;
            if (hashtags && hashtags.length > 0)
                importance += 0.3;
            metadata.importance = Math.min(1, importance);
        }
        return memory_entry_1.MemoryEntry.create(id, text, metadata);
    }
    /**
     * Search for similar entries
     */
    static async findSimilarEntries(memoryService, targetEntry, threshold = 0.7, limit = 10) {
        const query = {
            content: targetEntry.content,
            embedding: targetEntry.embedding,
            minSimilarity: threshold,
            limit
        };
        const results = await memoryService.search(query);
        return results
            .filter(result => result.entry.id !== targetEntry.id)
            .map(result => result.entry);
    }
    /**
     * Validate memory entry data
     */
    static validateEntry(entry) {
        const errors = [];
        if (!entry.id || entry.id.trim() === '') {
            errors.push('Entry ID is required');
        }
        if (!entry.content || entry.content.trim() === '') {
            errors.push('Entry content is required');
        }
        if (entry.content && entry.content.length > 100000) {
            errors.push('Entry content is too long (max 100,000 characters)');
        }
        if (entry.embedding && entry.embedding.some(val => typeof val !== 'number')) {
            errors.push('Embedding must contain only numbers');
        }
        if (entry.expiresAt && entry.expiresAt <= new Date()) {
            errors.push('Expiration date must be in the future');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    /**
     * Calculate content similarity between two entries
     */
    static calculateContentSimilarity(entry1, entry2) {
        // If both have embeddings, use embedding similarity
        if (entry1.embedding && entry2.embedding) {
            return entry1.calculateSimilarity(entry2);
        }
        // Otherwise, use text similarity
        return this.calculateTextSimilarity(entry1.content, entry2.content);
    }
    /**
     * Calculate text similarity using Jaccard similarity
     */
    static calculateTextSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    /**
     * Merge two memory entries
     */
    static mergeEntries(entry1, entry2) {
        // Use the newer entry as base
        const newerEntry = entry1.updatedAt > entry2.updatedAt ? entry1 : entry2;
        const olderEntry = entry1.updatedAt > entry2.updatedAt ? entry2 : entry1;
        // Merge metadata
        const mergedMetadata = { ...olderEntry.metadata, ...newerEntry.metadata };
        // Merge tags
        const allTags = [...(olderEntry.metadata.tags || []), ...(newerEntry.metadata.tags || [])];
        mergedMetadata.tags = [...new Set(allTags)];
        // Use higher importance
        mergedMetadata.importance = Math.max(olderEntry.getImportance(), newerEntry.getImportance());
        const merged = newerEntry.clone();
        merged.updateMetadata(mergedMetadata);
        return merged;
    }
    /**
     * Validate ID format
     */
    static isValidId(id) {
        return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 255;
    }
}
exports.MemoryUtils = MemoryUtils;
//# sourceMappingURL=memory-utils.js.map