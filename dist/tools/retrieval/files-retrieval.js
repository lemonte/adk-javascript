"use strict";
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesRetrieval = void 0;
const base_retrieval_tool_1 = require("./base-retrieval-tool");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * A retrieval tool that searches for relevant content in local files.
 *
 * This tool performs text-based search across files in a specified directory,
 * useful for retrieving relevant documentation, code, or other text content.
 */
class FilesRetrieval extends base_retrieval_tool_1.BaseRetrievalTool {
    constructor(config) {
        super({
            name: 'files_retrieval',
            description: 'Search for relevant content in local files based on a query',
        });
        this.config = {
            allowedExtensions: ['.txt', '.md', '.js', '.ts', '.py', '.json'],
            maxResults: 10,
            recursive: true,
            excludePatterns: ['node_modules', '.git', 'dist', 'build'],
            ...config,
        };
    }
    async execute(params, context) {
        try {
            const files = await this.findRelevantFiles(params.query);
            const documents = await this.extractContent(files, params.query);
            return {
                documents: documents.slice(0, this.config.maxResults),
                totalCount: documents.length,
                metadata: {
                    searchDirectory: this.config.baseDirectory,
                    query: params.query,
                },
            };
        }
        catch (error) {
            throw new Error(`Files retrieval failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findRelevantFiles(query) {
        const files = [];
        const searchDirectory = async (dir) => {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    // Skip excluded patterns
                    if (this.config.excludePatterns?.some(pattern => fullPath.includes(pattern))) {
                        continue;
                    }
                    if (entry.isDirectory() && this.config.recursive) {
                        await searchDirectory(fullPath);
                    }
                    else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (this.config.allowedExtensions?.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            }
            catch (error) {
                // Skip directories that can't be read
                console.warn(`Could not read directory ${dir}:`, error);
            }
        };
        await searchDirectory(this.config.baseDirectory);
        return files;
    }
    async extractContent(files, query) {
        const documents = [];
        const queryLower = query.toLowerCase();
        for (const filePath of files) {
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                const contentLower = content.toLowerCase();
                // Simple relevance scoring based on query term frequency
                const score = this.calculateRelevanceScore(contentLower, queryLower);
                if (score > 0) {
                    documents.push({
                        content: this.extractRelevantSnippet(content, query),
                        metadata: {
                            filePath,
                            fileName: path.basename(filePath),
                            fileSize: content.length,
                            lastModified: (await fs.stat(filePath)).mtime,
                        },
                        score,
                    });
                }
            }
            catch (error) {
                // Skip files that can't be read
                console.warn(`Could not read file ${filePath}:`, error);
            }
        }
        // Sort by relevance score
        return documents.sort((a, b) => b.score - a.score);
    }
    calculateRelevanceScore(content, query) {
        const queryTerms = query.split(/\s+/).filter(term => term.length > 2);
        let score = 0;
        for (const term of queryTerms) {
            const matches = (content.match(new RegExp(term, 'gi')) || []).length;
            score += matches;
        }
        return score;
    }
    extractRelevantSnippet(content, query, maxLength = 500) {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const lines = content.split('\n');
        // Find lines containing query terms
        const relevantLines = lines.filter(line => queryTerms.some(term => line.toLowerCase().includes(term)));
        if (relevantLines.length === 0) {
            return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
        }
        // Return first few relevant lines
        const snippet = relevantLines.slice(0, 5).join('\n');
        return snippet.length > maxLength
            ? snippet.substring(0, maxLength) + '...'
            : snippet;
    }
}
exports.FilesRetrieval = FilesRetrieval;
//# sourceMappingURL=files-retrieval.js.map