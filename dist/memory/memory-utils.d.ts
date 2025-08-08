/**
 * Memory utilities for the ADK JavaScript library
 */
import { MemoryEntry } from './memory-entry';
import { BaseMemoryService } from './base-memory-service';
export interface MemoryImportOptions {
    overwrite?: boolean;
    validateIds?: boolean;
    skipExpired?: boolean;
}
export interface MemoryExportOptions {
    includeExpired?: boolean;
    format?: 'json' | 'csv';
    fields?: string[];
}
export interface MemoryBackup {
    version: string;
    timestamp: Date;
    entries: MemoryEntry[];
    metadata: {
        totalEntries: number;
        exportOptions: MemoryExportOptions;
    };
}
/**
 * Utility class for memory operations
 */
export declare class MemoryUtils {
    /**
     * Export memory entries to a backup format
     */
    static exportMemory(memoryService: BaseMemoryService, options?: MemoryExportOptions): Promise<MemoryBackup>;
    /**
     * Import memory entries from a backup
     */
    static importMemory(memoryService: BaseMemoryService, backup: MemoryBackup, options?: MemoryImportOptions): Promise<{
        imported: number;
        skipped: number;
        errors: string[];
    }>;
    /**
     * Merge multiple memory services
     */
    static mergeMemoryServices(targetService: BaseMemoryService, sourceServices: BaseMemoryService[], conflictResolution?: 'skip' | 'overwrite' | 'merge'): Promise<{
        merged: number;
        conflicts: number;
        errors: string[];
    }>;
    /**
     * Deduplicate memory entries based on content similarity
     */
    static deduplicateMemory(memoryService: BaseMemoryService, similarityThreshold?: number): Promise<{
        removed: number;
        duplicates: string[][];
    }>;
    /**
     * Analyze memory usage patterns
     */
    static analyzeMemoryUsage(memoryService: BaseMemoryService): Promise<{
        totalEntries: number;
        averageAge: number;
        tagDistribution: Map<string, number>;
        contentLengthStats: {
            min: number;
            max: number;
            average: number;
        };
        importanceDistribution: {
            low: number;
            medium: number;
            high: number;
        };
    }>;
    /**
     * Create a memory entry from text with automatic metadata extraction
     */
    static createEntryFromText(id: string, text: string, extractMetadata?: boolean): MemoryEntry;
    /**
     * Search for similar entries
     */
    static findSimilarEntries(memoryService: BaseMemoryService, targetEntry: MemoryEntry, threshold?: number, limit?: number): Promise<MemoryEntry[]>;
    /**
     * Validate memory entry data
     */
    static validateEntry(entry: MemoryEntry): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Calculate content similarity between two entries
     */
    private static calculateContentSimilarity;
    /**
     * Calculate text similarity using Jaccard similarity
     */
    private static calculateTextSimilarity;
    /**
     * Merge two memory entries
     */
    private static mergeEntries;
    /**
     * Validate ID format
     */
    private static isValidId;
}
//# sourceMappingURL=memory-utils.d.ts.map