"use strict";
/**
 * File system utilities for handling files and directories
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = exports.isAbsolute = exports.formatBytes = exports.parsePath = exports.getExtension = exports.getBaseName = exports.getDirName = exports.joinPath = exports.resolvePath = exports.getRelativePath = exports.watchPath = exports.streamCopy = exports.createTempDir = exports.createTempFile = exports.compareFiles = exports.getFileHash = exports.getDirSize = exports.getSize = exports.findFiles = exports.listDir = exports.emptyDir = exports.ensureDir = exports.remove = exports.move = exports.copy = exports.appendFile = exports.writeJson = exports.writeText = exports.writeFile = exports.readLines = exports.readJson = exports.readText = exports.readFile = exports.getInfo = exports.isExecutable = exports.isWritable = exports.isReadable = exports.exists = exports.FileUtils = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const promises_1 = require("stream/promises");
const crypto_1 = require("crypto");
/**
 * File system utilities class
 */
class FileUtils {
    /**
     * Check if path exists
     */
    static async exists(path) {
        try {
            await fs_1.promises.access(path, fs_1.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if path is readable
     */
    static async isReadable(path) {
        try {
            await fs_1.promises.access(path, fs_1.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if path is writable
     */
    static async isWritable(path) {
        try {
            await fs_1.promises.access(path, fs_1.constants.W_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Check if path is executable
     */
    static async isExecutable(path) {
        try {
            await fs_1.promises.access(path, fs_1.constants.X_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get file information
     */
    static async getInfo(path) {
        const stats = await fs_1.promises.stat(path);
        const parsed = (0, path_1.parse)(path);
        return {
            path: (0, path_1.resolve)(path),
            name: parsed.name,
            extension: parsed.ext,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            accessedAt: stats.atime,
            permissions: stats.mode.toString(8),
        };
    }
    /**
     * Read file content
     */
    static async readFile(path, options = {}) {
        const { encoding = 'utf8', flag } = options;
        return await fs_1.promises.readFile(path, { encoding, flag });
    }
    /**
     * Read file as text
     */
    static async readText(path, encoding = 'utf8') {
        return await fs_1.promises.readFile(path, { encoding });
    }
    /**
     * Read file as JSON
     */
    static async readJson(path) {
        const content = await this.readText(path);
        return JSON.parse(content);
    }
    /**
     * Read file lines
     */
    static async readLines(path, encoding = 'utf8') {
        const content = await this.readText(path, encoding);
        return content.split(/\r?\n/);
    }
    /**
     * Write file content
     */
    static async writeFile(path, data, options = {}) {
        const { encoding = 'utf8', mode, flag } = options;
        // Ensure directory exists
        await this.ensureDir((0, path_1.dirname)(path));
        await fs_1.promises.writeFile(path, data, { encoding, mode, flag });
    }
    /**
     * Write text to file
     */
    static async writeText(path, content, encoding = 'utf8') {
        await this.writeFile(path, content, { encoding });
    }
    /**
     * Write JSON to file
     */
    static async writeJson(path, data, indent = 2) {
        const content = JSON.stringify(data, null, indent);
        await this.writeText(path, content);
    }
    /**
     * Append to file
     */
    static async appendFile(path, data, encoding = 'utf8') {
        await fs_1.promises.appendFile(path, data, { encoding });
    }
    /**
     * Copy file or directory
     */
    static async copy(src, dest, options = {}) {
        const { overwrite = false, preserveTimestamps = false, filter } = options;
        if (filter && !filter(src, dest)) {
            return;
        }
        const srcStats = await fs_1.promises.stat(src);
        if (srcStats.isDirectory()) {
            await this.copyDir(src, dest, options);
        }
        else {
            await this.copyFile(src, dest, overwrite, preserveTimestamps);
        }
    }
    /**
     * Copy file
     */
    static async copyFile(src, dest, overwrite, preserveTimestamps) {
        if (!overwrite && await this.exists(dest)) {
            throw new Error(`Destination file already exists: ${dest}`);
        }
        await this.ensureDir((0, path_1.dirname)(dest));
        await fs_1.promises.copyFile(src, dest);
        if (preserveTimestamps) {
            const stats = await fs_1.promises.stat(src);
            await fs_1.promises.utimes(dest, stats.atime, stats.mtime);
        }
    }
    /**
     * Copy directory recursively
     */
    static async copyDir(src, dest, options) {
        await this.ensureDir(dest);
        const entries = await fs_1.promises.readdir(src, { withFileTypes: true });
        for (const entry of entries) {
            const srcPath = (0, path_1.join)(src, entry.name);
            const destPath = (0, path_1.join)(dest, entry.name);
            if (options.filter && !options.filter(srcPath, destPath)) {
                continue;
            }
            if (entry.isDirectory()) {
                await this.copyDir(srcPath, destPath, options);
            }
            else {
                await this.copyFile(srcPath, destPath, options.overwrite ?? false, options.preserveTimestamps ?? false);
            }
        }
    }
    /**
     * Move file or directory
     */
    static async move(src, dest) {
        await this.ensureDir((0, path_1.dirname)(dest));
        await fs_1.promises.rename(src, dest);
    }
    /**
     * Remove file or directory
     */
    static async remove(path) {
        try {
            const stats = await fs_1.promises.stat(path);
            if (stats.isDirectory()) {
                await fs_1.promises.rmdir(path, { recursive: true });
            }
            else {
                await fs_1.promises.unlink(path);
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    /**
     * Ensure directory exists
     */
    static async ensureDir(path) {
        try {
            await fs_1.promises.mkdir(path, { recursive: true });
        }
        catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }
    /**
     * Empty directory
     */
    static async emptyDir(path) {
        try {
            const entries = await fs_1.promises.readdir(path);
            await Promise.all(entries.map(entry => this.remove((0, path_1.join)(path, entry))));
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    /**
     * List directory contents
     */
    static async listDir(path, recursive = false) {
        const result = [];
        const entries = await fs_1.promises.readdir(path, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(path, entry.name);
            result.push(fullPath);
            if (recursive && entry.isDirectory()) {
                const subEntries = await this.listDir(fullPath, true);
                result.push(...subEntries);
            }
        }
        return result;
    }
    /**
     * Find files matching pattern
     */
    static async findFiles(dir, pattern, recursive = true) {
        const result = [];
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        const entries = await fs_1.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(dir, entry.name);
            if (entry.isFile() && regex.test(entry.name)) {
                result.push(fullPath);
            }
            else if (recursive && entry.isDirectory()) {
                const subFiles = await this.findFiles(fullPath, pattern, true);
                result.push(...subFiles);
            }
        }
        return result;
    }
    /**
     * Get file size
     */
    static async getSize(path) {
        const stats = await fs_1.promises.stat(path);
        return stats.size;
    }
    /**
     * Get directory size
     */
    static async getDirSize(path) {
        let totalSize = 0;
        const entries = await fs_1.promises.readdir(path, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = (0, path_1.join)(path, entry.name);
            if (entry.isFile()) {
                const stats = await fs_1.promises.stat(fullPath);
                totalSize += stats.size;
            }
            else if (entry.isDirectory()) {
                totalSize += await this.getDirSize(fullPath);
            }
        }
        return totalSize;
    }
    /**
     * Calculate file hash
     */
    static async getFileHash(path, algorithm = 'sha256') {
        const hash = (0, crypto_1.createHash)(algorithm);
        const stream = (0, fs_1.createReadStream)(path);
        for await (const chunk of stream) {
            hash.update(chunk);
        }
        return hash.digest('hex');
    }
    /**
     * Compare files
     */
    static async compareFiles(path1, path2) {
        try {
            const [stats1, stats2] = await Promise.all([
                fs_1.promises.stat(path1),
                fs_1.promises.stat(path2),
            ]);
            // Quick size check
            if (stats1.size !== stats2.size) {
                return false;
            }
            // Hash comparison for larger files
            if (stats1.size > 1024 * 1024) { // 1MB
                const [hash1, hash2] = await Promise.all([
                    this.getFileHash(path1),
                    this.getFileHash(path2),
                ]);
                return hash1 === hash2;
            }
            // Content comparison for smaller files
            const [content1, content2] = await Promise.all([
                fs_1.promises.readFile(path1),
                fs_1.promises.readFile(path2),
            ]);
            return content1.equals(content2);
        }
        catch {
            return false;
        }
    }
    /**
     * Create temporary file
     */
    static async createTempFile(prefix = 'tmp', suffix = '.tmp') {
        const tmpDir = require('os').tmpdir();
        const randomName = Math.random().toString(36).substring(2);
        const tempPath = (0, path_1.join)(tmpDir, `${prefix}_${randomName}${suffix}`);
        // Create empty file
        await fs_1.promises.writeFile(tempPath, '');
        return tempPath;
    }
    /**
     * Create temporary directory
     */
    static async createTempDir(prefix = 'tmp') {
        const tmpDir = require('os').tmpdir();
        const randomName = Math.random().toString(36).substring(2);
        const tempPath = (0, path_1.join)(tmpDir, `${prefix}_${randomName}`);
        await fs_1.promises.mkdir(tempPath, { recursive: true });
        return tempPath;
    }
    /**
     * Stream copy with progress
     */
    static async streamCopy(src, dest, onProgress) {
        const stats = await fs_1.promises.stat(src);
        const totalBytes = stats.size;
        let bytesRead = 0;
        const readStream = (0, fs_1.createReadStream)(src);
        const writeStream = (0, fs_1.createWriteStream)(dest);
        if (onProgress) {
            readStream.on('data', (chunk) => {
                bytesRead += chunk.length;
                onProgress(bytesRead, totalBytes);
            });
        }
        await (0, promises_1.pipeline)(readStream, writeStream);
    }
    /**
     * Watch file or directory for changes
     */
    static watchPath(path, callback, options = {}) {
        const watcher = require('fs').watch(path, options, callback);
        return () => watcher.close();
    }
    /**
     * Get relative path
     */
    static getRelativePath(from, to) {
        return (0, path_1.relative)(from, to);
    }
    /**
     * Resolve path
     */
    static resolvePath(...paths) {
        return (0, path_1.resolve)(...paths);
    }
    /**
     * Join paths
     */
    static joinPath(...paths) {
        return (0, path_1.join)(...paths);
    }
    /**
     * Get directory name
     */
    static getDirName(path) {
        return (0, path_1.dirname)(path);
    }
    /**
     * Get base name
     */
    static getBaseName(path, ext) {
        return (0, path_1.basename)(path, ext);
    }
    /**
     * Get file extension
     */
    static getExtension(path) {
        return (0, path_1.extname)(path);
    }
    /**
     * Parse path
     */
    static parsePath(path) {
        return (0, path_1.parse)(path);
    }
    /**
     * Format bytes to human readable string
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    /**
     * Check if path is absolute
     */
    static isAbsolute(path) {
        return require('path').isAbsolute(path);
    }
    /**
     * Normalize path
     */
    static normalizePath(path) {
        return require('path').normalize(path);
    }
}
exports.FileUtils = FileUtils;
// Export commonly used functions
exports.exists = FileUtils.exists, exports.isReadable = FileUtils.isReadable, exports.isWritable = FileUtils.isWritable, exports.isExecutable = FileUtils.isExecutable, exports.getInfo = FileUtils.getInfo, exports.readFile = FileUtils.readFile, exports.readText = FileUtils.readText, exports.readJson = FileUtils.readJson, exports.readLines = FileUtils.readLines, exports.writeFile = FileUtils.writeFile, exports.writeText = FileUtils.writeText, exports.writeJson = FileUtils.writeJson, exports.appendFile = FileUtils.appendFile, exports.copy = FileUtils.copy, exports.move = FileUtils.move, exports.remove = FileUtils.remove, exports.ensureDir = FileUtils.ensureDir, exports.emptyDir = FileUtils.emptyDir, exports.listDir = FileUtils.listDir, exports.findFiles = FileUtils.findFiles, exports.getSize = FileUtils.getSize, exports.getDirSize = FileUtils.getDirSize, exports.getFileHash = FileUtils.getFileHash, exports.compareFiles = FileUtils.compareFiles, exports.createTempFile = FileUtils.createTempFile, exports.createTempDir = FileUtils.createTempDir, exports.streamCopy = FileUtils.streamCopy, exports.watchPath = FileUtils.watchPath, exports.getRelativePath = FileUtils.getRelativePath, exports.resolvePath = FileUtils.resolvePath, exports.joinPath = FileUtils.joinPath, exports.getDirName = FileUtils.getDirName, exports.getBaseName = FileUtils.getBaseName, exports.getExtension = FileUtils.getExtension, exports.parsePath = FileUtils.parsePath, exports.formatBytes = FileUtils.formatBytes, exports.isAbsolute = FileUtils.isAbsolute, exports.normalizePath = FileUtils.normalizePath;
//# sourceMappingURL=file-utils.js.map