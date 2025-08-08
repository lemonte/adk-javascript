/**
 * Code execution tool implementation for the ADK JavaScript SDK
 */
import { BaseTool, BaseToolConfig, ToolContext } from './base-tool';
/**
 * Code execution tool configuration
 */
export interface CodeExecutionToolConfig extends Partial<BaseToolConfig> {
    allowedLanguages?: string[];
    timeout?: number;
    maxOutputLength?: number;
    workingDirectory?: string;
    enableFileSystem?: boolean;
    environmentVariables?: Record<string, string>;
}
/**
 * Code execution result
 */
export interface CodeExecutionResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    executionTime: number;
    language: string;
    truncated?: boolean;
}
/**
 * Tool for executing code in various programming languages
 */
export declare class CodeExecutionTool extends BaseTool {
    private readonly allowedLanguages;
    private readonly timeout;
    private readonly maxOutputLength;
    private readonly workingDirectory;
    private readonly enableFileSystem;
    private readonly environmentVariables;
    private readonly languageConfigs;
    constructor(config?: CodeExecutionToolConfig);
    /**
     * Execute code
     */
    execute(args: {
        code: string;
        language: string;
        filename?: string;
    }, context: ToolContext): Promise<CodeExecutionResult>;
    /**
     * Execute command with timeout
     */
    private executeCommand;
    /**
     * Get supported languages
     */
    getSupportedLanguages(): string[];
    /**
     * Check if a language is supported
     */
    isLanguageSupported(language: string): boolean;
    /**
     * Get tool configuration
     */
    getConfiguration(): {
        allowedLanguages: string[];
        timeout: number;
        maxOutputLength: number;
        workingDirectory: string;
        enableFileSystem: boolean;
    };
}
//# sourceMappingURL=code-execution-tool.d.ts.map