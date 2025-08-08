/**
 * File system utilities for handling files and directories
 */
export interface FileInfo {
    path: string;
    name: string;
    extension: string;
    size: number;
    isDirectory: boolean;
    isFile: boolean;
    createdAt: Date;
    modifiedAt: Date;
    accessedAt: Date;
    permissions: string;
}
export interface CopyOptions {
    overwrite?: boolean;
    preserveTimestamps?: boolean;
    filter?: (src: string, dest: string) => boolean;
}
export interface WatchOptions {
    recursive?: boolean;
    persistent?: boolean;
    encoding?: BufferEncoding;
}
export interface ReadOptions {
    encoding?: BufferEncoding;
    flag?: string;
}
export interface WriteOptions {
    encoding?: BufferEncoding;
    mode?: number;
    flag?: string;
}
/**
 * File system utilities class
 */
export declare class FileUtils {
    /**
     * Check if path exists
     */
    static exists(path: string): Promise<boolean>;
    /**
     * Check if path is readable
     */
    static isReadable(path: string): Promise<boolean>;
    /**
     * Check if path is writable
     */
    static isWritable(path: string): Promise<boolean>;
    /**
     * Check if path is executable
     */
    static isExecutable(path: string): Promise<boolean>;
    /**
     * Get file information
     */
    static getInfo(path: string): Promise<FileInfo>;
    /**
     * Read file content
     */
    static readFile(path: string, options?: ReadOptions): Promise<string | Buffer>;
    /**
     * Read file as text
     */
    static readText(path: string, encoding?: BufferEncoding): Promise<string>;
    /**
     * Read file as JSON
     */
    static readJson<T = any>(path: string): Promise<T>;
    /**
     * Read file lines
     */
    static readLines(path: string, encoding?: BufferEncoding): Promise<string[]>;
    /**
     * Write file content
     */
    static writeFile(path: string, data: string | Buffer, options?: WriteOptions): Promise<void>;
    /**
     * Write text to file
     */
    static writeText(path: string, content: string, encoding?: BufferEncoding): Promise<void>;
    /**
     * Write JSON to file
     */
    static writeJson(path: string, data: any, indent?: number): Promise<void>;
    /**
     * Append to file
     */
    static appendFile(path: string, data: string | Buffer, encoding?: BufferEncoding): Promise<void>;
    /**
     * Copy file or directory
     */
    static copy(src: string, dest: string, options?: CopyOptions): Promise<void>;
    /**
     * Copy file
     */
    private static copyFile;
    /**
     * Copy directory recursively
     */
    private static copyDir;
    /**
     * Move file or directory
     */
    static move(src: string, dest: string): Promise<void>;
    /**
     * Remove file or directory
     */
    static remove(path: string): Promise<void>;
    /**
     * Ensure directory exists
     */
    static ensureDir(path: string): Promise<void>;
    /**
     * Empty directory
     */
    static emptyDir(path: string): Promise<void>;
    /**
     * List directory contents
     */
    static listDir(path: string, recursive?: boolean): Promise<string[]>;
    /**
     * Find files matching pattern
     */
    static findFiles(dir: string, pattern: RegExp | string, recursive?: boolean): Promise<string[]>;
    /**
     * Get file size
     */
    static getSize(path: string): Promise<number>;
    /**
     * Get directory size
     */
    static getDirSize(path: string): Promise<number>;
    /**
     * Calculate file hash
     */
    static getFileHash(path: string, algorithm?: string): Promise<string>;
    /**
     * Compare files
     */
    static compareFiles(path1: string, path2: string): Promise<boolean>;
    /**
     * Create temporary file
     */
    static createTempFile(prefix?: string, suffix?: string): Promise<string>;
    /**
     * Create temporary directory
     */
    static createTempDir(prefix?: string): Promise<string>;
    /**
     * Stream copy with progress
     */
    static streamCopy(src: string, dest: string, onProgress?: (bytesRead: number, totalBytes: number) => void): Promise<void>;
    /**
     * Watch file or directory for changes
     */
    static watchPath(path: string, callback: (eventType: string, filename: string | null) => void, options?: WatchOptions): () => void;
    /**
     * Get relative path
     */
    static getRelativePath(from: string, to: string): string;
    /**
     * Resolve path
     */
    static resolvePath(...paths: string[]): string;
    /**
     * Join paths
     */
    static joinPath(...paths: string[]): string;
    /**
     * Get directory name
     */
    static getDirName(path: string): string;
    /**
     * Get base name
     */
    static getBaseName(path: string, ext?: string): string;
    /**
     * Get file extension
     */
    static getExtension(path: string): string;
    /**
     * Parse path
     */
    static parsePath(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes: number, decimals?: number): string;
    /**
     * Check if path is absolute
     */
    static isAbsolute(path: string): boolean;
    /**
     * Normalize path
     */
    static normalizePath(path: string): string;
}
export declare const exists: typeof FileUtils.exists, isReadable: typeof FileUtils.isReadable, isWritable: typeof FileUtils.isWritable, isExecutable: typeof FileUtils.isExecutable, getInfo: typeof FileUtils.getInfo, readFile: typeof FileUtils.readFile, readText: typeof FileUtils.readText, readJson: typeof FileUtils.readJson, readLines: typeof FileUtils.readLines, writeFile: typeof FileUtils.writeFile, writeText: typeof FileUtils.writeText, writeJson: typeof FileUtils.writeJson, appendFile: typeof FileUtils.appendFile, copy: typeof FileUtils.copy, move: typeof FileUtils.move, remove: typeof FileUtils.remove, ensureDir: typeof FileUtils.ensureDir, emptyDir: typeof FileUtils.emptyDir, listDir: typeof FileUtils.listDir, findFiles: typeof FileUtils.findFiles, getSize: typeof FileUtils.getSize, getDirSize: typeof FileUtils.getDirSize, getFileHash: typeof FileUtils.getFileHash, compareFiles: typeof FileUtils.compareFiles, createTempFile: typeof FileUtils.createTempFile, createTempDir: typeof FileUtils.createTempDir, streamCopy: typeof FileUtils.streamCopy, watchPath: typeof FileUtils.watchPath, getRelativePath: typeof FileUtils.getRelativePath, resolvePath: typeof FileUtils.resolvePath, joinPath: typeof FileUtils.joinPath, getDirName: typeof FileUtils.getDirName, getBaseName: typeof FileUtils.getBaseName, getExtension: typeof FileUtils.getExtension, parsePath: typeof FileUtils.parsePath, formatBytes: typeof FileUtils.formatBytes, isAbsolute: typeof FileUtils.isAbsolute, normalizePath: typeof FileUtils.normalizePath;
//# sourceMappingURL=file-utils.d.ts.map