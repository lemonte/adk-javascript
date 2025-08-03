/**
 * Code execution tool implementation for the ADK JavaScript SDK
 */

import { BaseTool, BaseToolConfig, ToolContext } from './base-tool';
import { ToolError } from '../types';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

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
 * Language configuration
 */
interface LanguageConfig {
  extension: string;
  command: string[];
  args: string[];
}

/**
 * Tool for executing code in various programming languages
 */
export class CodeExecutionTool extends BaseTool {
  private readonly allowedLanguages: Set<string>;
  private readonly timeout: number;
  private readonly maxOutputLength: number;
  private readonly workingDirectory: string;
  private readonly enableFileSystem: boolean;
  private readonly environmentVariables: Record<string, string>;
  
  private readonly languageConfigs: Record<string, LanguageConfig> = {
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

  constructor(config: CodeExecutionToolConfig = {}) {
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
  async execute(
    args: { code: string; language: string; filename?: string },
    context: ToolContext
  ): Promise<CodeExecutionResult> {
    return this.safeExecute(async () => {
      this.validateArguments(args);

      const { code, language, filename } = args;

      // Validate language
      if (!this.allowedLanguages.has(language)) {
        throw new ToolError(
          `Language '${language}' is not allowed. Allowed languages: ${Array.from(this.allowedLanguages).join(', ')}`,
          { language, allowedLanguages: Array.from(this.allowedLanguages) }
        );
      }

      const languageConfig = this.languageConfigs[language];
      if (!languageConfig) {
        throw new ToolError(
          `Language '${language}' is not supported`,
          { language }
        );
      }

      this.logger.info(`Executing ${language} code`);

      const startTime = Date.now();
      let tempFilePath: string | null = null;

      try {
        // Create temporary file
        const fileId = uuidv4();
        const fileName = filename || `code_${fileId}${languageConfig.extension}`;
        tempFilePath = path.join(this.workingDirectory, fileName);

        if (this.enableFileSystem) {
          await fs.writeFile(tempFilePath, code, 'utf8');
        }

        // Execute code
        const result = await this.executeCommand(
          languageConfig.command,
          [...languageConfig.args, tempFilePath],
          code
        );

        const executionTime = Date.now() - startTime;

        const executionResult: CodeExecutionResult = {
          ...result,
          executionTime,
          language
        };

        this.logExecution(args, `Executed in ${executionTime}ms, exit code: ${result.exitCode}`);

        return executionResult;
      } finally {
        // Cleanup temporary file
        if (tempFilePath && this.enableFileSystem) {
          try {
            await fs.unlink(tempFilePath);
          } catch (error) {
            this.logger.warn(`Failed to cleanup temporary file: ${tempFilePath}`, error);
          }
        }
      }
    });
  }

  /**
   * Execute command with timeout
   */
  private async executeCommand(
    command: string[],
    args: string[],
    input?: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number; truncated?: boolean }> {
    return new Promise((resolve, reject) => {
      const [cmd, ...cmdArgs] = command;
      const allArgs = [...cmdArgs, ...args];

      const childProcess = spawn(cmd, allArgs, {
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
        childProcess.stdout.on('data', (data: Buffer) => {
          const chunk = data.toString();
          if (stdout.length + chunk.length > this.maxOutputLength) {
            stdout += chunk.substring(0, this.maxOutputLength - stdout.length);
            truncated = true;
          } else {
            stdout += chunk;
          }
        });
      }

      if (childProcess.stderr) {
        childProcess.stderr.on('data', (data: Buffer) => {
          const chunk = data.toString();
          if (stderr.length + chunk.length > this.maxOutputLength) {
            stderr += chunk.substring(0, this.maxOutputLength - stderr.length);
            truncated = true;
          } else {
            stderr += chunk;
          }
        });
      }

      // Handle process completion
      childProcess.on('close', (code: number | null) => {
        clearTimeout(timeoutId);
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: code || 0,
          truncated
        });
      });

      childProcess.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        reject(new ToolError(
          `Failed to execute command: ${error.message}`,
          { command: cmd, args: allArgs, error: error.message }
        ));
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
  getSupportedLanguages(): string[] {
    return Array.from(this.allowedLanguages);
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.allowedLanguages.has(language);
  }

  /**
   * Get tool configuration
   */
  getConfiguration(): {
    allowedLanguages: string[];
    timeout: number;
    maxOutputLength: number;
    workingDirectory: string;
    enableFileSystem: boolean;
  } {
    return {
      allowedLanguages: Array.from(this.allowedLanguages),
      timeout: this.timeout,
      maxOutputLength: this.maxOutputLength,
      workingDirectory: this.workingDirectory,
      enableFileSystem: this.enableFileSystem
    };
  }
}