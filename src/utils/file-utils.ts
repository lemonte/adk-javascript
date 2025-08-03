/**
 * File system utilities for handling files and directories
 */

import { promises as fs, constants, createReadStream, createWriteStream } from 'fs';
import { join, dirname, basename, extname, resolve, relative, parse } from 'path';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';

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
export class FileUtils {
  /**
   * Check if path exists
   */
  static async exists(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if path is readable
   */
  static async isReadable(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if path is writable
   */
  static async isWritable(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if path is executable
   */
  static async isExecutable(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.X_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file information
   */
  static async getInfo(path: string): Promise<FileInfo> {
    const stats = await fs.stat(path);
    const parsed = parse(path);

    return {
      path: resolve(path),
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
  static async readFile(
    path: string,
    options: ReadOptions = {}
  ): Promise<string | Buffer> {
    const { encoding = 'utf8', flag } = options;
    return await fs.readFile(path, { encoding, flag });
  }

  /**
   * Read file as text
   */
  static async readText(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> {
    return await fs.readFile(path, { encoding });
  }

  /**
   * Read file as JSON
   */
  static async readJson<T = any>(path: string): Promise<T> {
    const content = await this.readText(path);
    return JSON.parse(content);
  }

  /**
   * Read file lines
   */
  static async readLines(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string[]> {
    const content = await this.readText(path, encoding);
    return content.split(/\r?\n/);
  }

  /**
   * Write file content
   */
  static async writeFile(
    path: string,
    data: string | Buffer,
    options: WriteOptions = {}
  ): Promise<void> {
    const { encoding = 'utf8', mode, flag } = options;
    
    // Ensure directory exists
    await this.ensureDir(dirname(path));
    
    await fs.writeFile(path, data, { encoding, mode, flag });
  }

  /**
   * Write text to file
   */
  static async writeText(
    path: string,
    content: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await this.writeFile(path, content, { encoding });
  }

  /**
   * Write JSON to file
   */
  static async writeJson(
    path: string,
    data: any,
    indent = 2
  ): Promise<void> {
    const content = JSON.stringify(data, null, indent);
    await this.writeText(path, content);
  }

  /**
   * Append to file
   */
  static async appendFile(
    path: string,
    data: string | Buffer,
    encoding: BufferEncoding = 'utf8'
  ): Promise<void> {
    await fs.appendFile(path, data, { encoding });
  }

  /**
   * Copy file or directory
   */
  static async copy(
    src: string,
    dest: string,
    options: CopyOptions = {}
  ): Promise<void> {
    const { overwrite = false, preserveTimestamps = false, filter } = options;
    
    if (filter && !filter(src, dest)) {
      return;
    }

    const srcStats = await fs.stat(src);
    
    if (srcStats.isDirectory()) {
      await this.copyDir(src, dest, options);
    } else {
      await this.copyFile(src, dest, overwrite, preserveTimestamps);
    }
  }

  /**
   * Copy file
   */
  private static async copyFile(
    src: string,
    dest: string,
    overwrite: boolean,
    preserveTimestamps: boolean
  ): Promise<void> {
    if (!overwrite && await this.exists(dest)) {
      throw new Error(`Destination file already exists: ${dest}`);
    }

    await this.ensureDir(dirname(dest));
    await fs.copyFile(src, dest);

    if (preserveTimestamps) {
      const stats = await fs.stat(src);
      await fs.utimes(dest, stats.atime, stats.mtime);
    }
  }

  /**
   * Copy directory recursively
   */
  private static async copyDir(
    src: string,
    dest: string,
    options: CopyOptions
  ): Promise<void> {
    await this.ensureDir(dest);
    
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);
      
      if (options.filter && !options.filter(srcPath, destPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath, options);
      } else {
        await this.copyFile(
          srcPath,
          destPath,
          options.overwrite ?? false,
          options.preserveTimestamps ?? false
        );
      }
    }
  }

  /**
   * Move file or directory
   */
  static async move(src: string, dest: string): Promise<void> {
    await this.ensureDir(dirname(dest));
    await fs.rename(src, dest);
  }

  /**
   * Remove file or directory
   */
  static async remove(path: string): Promise<void> {
    try {
      const stats = await fs.stat(path);
      
      if (stats.isDirectory()) {
        await fs.rmdir(path, { recursive: true });
      } else {
        await fs.unlink(path);
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Ensure directory exists
   */
  static async ensureDir(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Empty directory
   */
  static async emptyDir(path: string): Promise<void> {
    try {
      const entries = await fs.readdir(path);
      
      await Promise.all(
        entries.map(entry => this.remove(join(path, entry)))
      );
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * List directory contents
   */
  static async listDir(
    path: string,
    recursive = false
  ): Promise<string[]> {
    const result: string[] = [];
    
    const entries = await fs.readdir(path, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(path, entry.name);
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
  static async findFiles(
    dir: string,
    pattern: RegExp | string,
    recursive = true
  ): Promise<string[]> {
    const result: string[] = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isFile() && regex.test(entry.name)) {
        result.push(fullPath);
      } else if (recursive && entry.isDirectory()) {
        const subFiles = await this.findFiles(fullPath, pattern, true);
        result.push(...subFiles);
      }
    }
    
    return result;
  }

  /**
   * Get file size
   */
  static async getSize(path: string): Promise<number> {
    const stats = await fs.stat(path);
    return stats.size;
  }

  /**
   * Get directory size
   */
  static async getDirSize(path: string): Promise<number> {
    let totalSize = 0;
    
    const entries = await fs.readdir(path, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(path, entry.name);
      
      if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
      } else if (entry.isDirectory()) {
        totalSize += await this.getDirSize(fullPath);
      }
    }
    
    return totalSize;
  }

  /**
   * Calculate file hash
   */
  static async getFileHash(
    path: string,
    algorithm = 'sha256'
  ): Promise<string> {
    const hash = createHash(algorithm);
    const stream = createReadStream(path);
    
    for await (const chunk of stream) {
      hash.update(chunk);
    }
    
    return hash.digest('hex');
  }

  /**
   * Compare files
   */
  static async compareFiles(path1: string, path2: string): Promise<boolean> {
    try {
      const [stats1, stats2] = await Promise.all([
        fs.stat(path1),
        fs.stat(path2),
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
        fs.readFile(path1),
        fs.readFile(path2),
      ]);
      
      return content1.equals(content2);
    } catch {
      return false;
    }
  }

  /**
   * Create temporary file
   */
  static async createTempFile(
    prefix = 'tmp',
    suffix = '.tmp'
  ): Promise<string> {
    const tmpDir = require('os').tmpdir();
    const randomName = Math.random().toString(36).substring(2);
    const tempPath = join(tmpDir, `${prefix}_${randomName}${suffix}`);
    
    // Create empty file
    await fs.writeFile(tempPath, '');
    
    return tempPath;
  }

  /**
   * Create temporary directory
   */
  static async createTempDir(prefix = 'tmp'): Promise<string> {
    const tmpDir = require('os').tmpdir();
    const randomName = Math.random().toString(36).substring(2);
    const tempPath = join(tmpDir, `${prefix}_${randomName}`);
    
    await fs.mkdir(tempPath, { recursive: true });
    
    return tempPath;
  }

  /**
   * Stream copy with progress
   */
  static async streamCopy(
    src: string,
    dest: string,
    onProgress?: (bytesRead: number, totalBytes: number) => void
  ): Promise<void> {
    const stats = await fs.stat(src);
    const totalBytes = stats.size;
    let bytesRead = 0;
    
    const readStream = createReadStream(src);
    const writeStream = createWriteStream(dest);
    
    if (onProgress) {
      readStream.on('data', (chunk) => {
        bytesRead += chunk.length;
        onProgress(bytesRead, totalBytes);
      });
    }
    
    await pipeline(readStream, writeStream);
  }

  /**
   * Watch file or directory for changes
   */
  static watchPath(
    path: string,
    callback: (eventType: string, filename: string | null) => void,
    options: WatchOptions = {}
  ): () => void {
    const watcher = require('fs').watch(path, options, callback);
    return () => watcher.close();
  }

  /**
   * Get relative path
   */
  static getRelativePath(from: string, to: string): string {
    return relative(from, to);
  }

  /**
   * Resolve path
   */
  static resolvePath(...paths: string[]): string {
    return resolve(...paths);
  }

  /**
   * Join paths
   */
  static joinPath(...paths: string[]): string {
    return join(...paths);
  }

  /**
   * Get directory name
   */
  static getDirName(path: string): string {
    return dirname(path);
  }

  /**
   * Get base name
   */
  static getBaseName(path: string, ext?: string): string {
    return basename(path, ext);
  }

  /**
   * Get file extension
   */
  static getExtension(path: string): string {
    return extname(path);
  }

  /**
   * Parse path
   */
  static parsePath(path: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  } {
    return parse(path);
  }

  /**
   * Format bytes to human readable string
   */
  static formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Check if path is absolute
   */
  static isAbsolute(path: string): boolean {
    return require('path').isAbsolute(path);
  }

  /**
   * Normalize path
   */
  static normalizePath(path: string): string {
    return require('path').normalize(path);
  }
}

// Export commonly used functions
export const {
  exists,
  isReadable,
  isWritable,
  isExecutable,
  getInfo,
  readFile,
  readText,
  readJson,
  readLines,
  writeFile,
  writeText,
  writeJson,
  appendFile,
  copy,
  move,
  remove,
  ensureDir,
  emptyDir,
  listDir,
  findFiles,
  getSize,
  getDirSize,
  getFileHash,
  compareFiles,
  createTempFile,
  createTempDir,
  streamCopy,
  watchPath,
  getRelativePath,
  resolvePath,
  joinPath,
  getDirName,
  getBaseName,
  getExtension,
  parsePath,
  formatBytes,
  isAbsolute,
  normalizePath,
} = FileUtils;