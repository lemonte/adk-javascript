"use strict";
/**
 * Code execution tool implementation for the ADK JavaScript SDK
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
exports.CodeExecutionTool = void 0;
const base_tool_1 = require("./base-tool");
const types_1 = require("../types");
const child_process_1 = require("child_process");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const uuid_1 = require("uuid");
/**
 * Tool for executing code in various programming languages
 */
class CodeExecutionTool extends base_tool_1.BaseTool {
    constructor(config = {}) {
        super({
            name: config.name || 'execute_code',
            description: config.description || 'Execute code in various programming languages',
            parameters: {
                type: 'object',
                properties: {
                    code: {
                        type: 'string',
                        description: 'The code to execute'
                    },
                    language: {
                        type: 'string',
                        description: 'Programming language (python, javascript, typescript, bash, shell)',
                        enum: ['python', 'javascript', 'typescript', 'bash', 'shell']
                    },
                    filename: {
                        type: 'string',
                        description: 'Optional filename for the code file'
                    }
                },
                required: ['code', 'language']
            },
            metadata: config.metadata
        });
        this.languageConfigs = {
            python: {
                extension: '.py',
                command: ['python3'],
                args: []
            },
            javascript: {
                extension: '.js',
                command: ['node'],
                args: []
            },
            typescript: {
                extension: '.ts',
                command: ['npx', 'ts-node'],
                args: []
            },
            bash: {
                extension: '.sh',
                command: ['bash'],
                args: []
            },
            shell: {
                extension: '.sh',
                command: ['sh'],
                args: []
            }
        };
        this.allowedLanguages = new Set(config.allowedLanguages || ['python', 'javascript', 'typescript', 'bash', 'shell']);
        this.timeout = config.timeout || 30000; // 30 seconds
        this.maxOutputLength = config.maxOutputLength || 10000; // 10KB
        this.workingDirectory = config.workingDirectory || os.tmpdir();
        this.enableFileSystem = config.enableFileSystem ?? true;
        this.environmentVariables = config.environmentVariables || {};
    }
    /**
     * Execute code
     */
    async execute(args, context) {
        return this.safeExecute(async () => {
            this.validateArguments(args);
            const { code, language, filename } = args;
            // Validate language
            if (!this.allowedLanguages.has(language)) {
                throw new types_1.ToolError(`Language '${language}' is not allowed. Allowed languages: ${Array.from(this.allowedLanguages).join(', ')}`, { language, allowedLanguages: Array.from(this.allowedLanguages) });
            }
            const languageConfig = this.languageConfigs[language];
            if (!languageConfig) {
                throw new types_1.ToolError(`Language '${language}' is not supported`, { language });
            }
            this.logger.info(`Executing ${language} code`);
            const startTime = Date.now();
            let tempFilePath = null;
            try {
                // Create temporary file
                const fileId = (0, uuid_1.v4)();
                const fileName = filename || `code_${fileId}${languageConfig.extension}`;
                tempFilePath = path.join(this.workingDirectory, fileName);
                if (this.enableFileSystem) {
                    await fs.writeFile(tempFilePath, code, 'utf8');
                }
                // Execute code
                const result = await this.executeCommand(languageConfig.command, [...languageConfig.args, tempFilePath], code);
                const executionTime = Date.now() - startTime;
                const executionResult = {
                    ...result,
                    executionTime,
                    language
                };
                this.logExecution(args, `Executed in ${executionTime}ms, exit code: ${result.exitCode}`);
                return executionResult;
            }
            finally {
                // Cleanup temporary file
                if (tempFilePath && this.enableFileSystem) {
                    try {
                        await fs.unlink(tempFilePath);
                    }
                    catch (error) {
                        this.logger.warn(`Failed to cleanup temporary file: ${tempFilePath}`, error);
                    }
                }
            }
        });
    }
    /**
     * Execute command with timeout
     */
    async executeCommand(command, args, input) {
        return new Promise((resolve, reject) => {
            const [cmd, ...cmdArgs] = command;
            const allArgs = [...cmdArgs, ...args];
            const childProcess = (0, child_process_1.spawn)(cmd, allArgs, {
                cwd: this.workingDirectory,
                env: { ...process.env, ...this.environmentVariables },
                stdio: input ? 'pipe' : 'inherit'
            });
            let stdout = '';
            let stderr = '';
            let truncated = false;
            // Set timeout
            const timeoutId = setTimeout(() => {
                childProcess.kill('SIGTERM');
                setTimeout(() => {
                    if (!childProcess.killed) {
                        childProcess.kill('SIGKILL');
                    }
                }, 5000);
            }, this.timeout);
            // Collect output
            if (childProcess.stdout) {
                childProcess.stdout.on('data', (data) => {
                    const chunk = data.toString();
                    if (stdout.length + chunk.length > this.maxOutputLength) {
                        stdout += chunk.substring(0, this.maxOutputLength - stdout.length);
                        truncated = true;
                    }
                    else {
                        stdout += chunk;
                    }
                });
            }
            if (childProcess.stderr) {
                childProcess.stderr.on('data', (data) => {
                    const chunk = data.toString();
                    if (stderr.length + chunk.length > this.maxOutputLength) {
                        stderr += chunk.substring(0, this.maxOutputLength - stderr.length);
                        truncated = true;
                    }
                    else {
                        stderr += chunk;
                    }
                });
            }
            // Handle process completion
            childProcess.on('close', (code) => {
                clearTimeout(timeoutId);
                resolve({
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: code || 0,
                    truncated
                });
            });
            childProcess.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(new types_1.ToolError(`Failed to execute command: ${error.message}`, { command: cmd, args: allArgs, error: error.message }));
            });
            // Send input if provided
            if (input && childProcess.stdin) {
                childProcess.stdin.write(input);
                childProcess.stdin.end();
            }
        });
    }
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return Array.from(this.allowedLanguages);
    }
    /**
     * Check if a language is supported
     */
    isLanguageSupported(language) {
        return this.allowedLanguages.has(language);
    }
    /**
     * Get tool configuration
     */
    getConfiguration() {
        return {
            allowedLanguages: Array.from(this.allowedLanguages),
            timeout: this.timeout,
            maxOutputLength: this.maxOutputLength,
            workingDirectory: this.workingDirectory,
            enableFileSystem: this.enableFileSystem
        };
    }
}
exports.CodeExecutionTool = CodeExecutionTool;
//# sourceMappingURL=code-execution-tool.js.map