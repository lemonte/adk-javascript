#!/usr/bin/env node

import { Command } from 'commander';
import { startWebServer } from './web-server';
import { startApiServer } from './api-server';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('adk')
  .description('Agent Development Kit (ADK) for JavaScript/Node.js')
  .version('1.0.1');

// Web command - starts web server with UI
program
  .command('web')
  .description('Start ADK web server with user interface')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-h, --host <host>', 'Host to bind the server to', 'localhost')
  .option('--agents-dir <dir>', 'Directory containing agent files', './agents')
  .option('--allow-origins <origins>', 'Allowed CORS origins (comma-separated)', 'http://localhost:4200')
  .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info')
  .action(async (options) => {
    console.log('🚀 Starting ADK Web Server...');
    console.log(`📁 Agents directory: ${options.agentsDir}`);
    console.log(`🌐 Server will be available at: http://${options.host}:${options.port}`);
    
    try {
      await startWebServer({
        port: parseInt(options.port),
        host: options.host,
        agentsDir: options.agentsDir,
        allowOrigins: options.allowOrigins.split(','),
        logLevel: options.logLevel
      });
    } catch (error) {
      console.error('❌ Failed to start web server:', error);
      process.exit(1);
    }
  });

// API Server command - starts API server without UI
program
  .command('api-server')
  .description('Start ADK API server (backend only)')
  .option('-p, --port <port>', 'Port to run the server on', '8000')
  .option('-h, --host <host>', 'Host to bind the server to', '0.0.0.0')
  .option('--agents-dir <dir>', 'Directory containing agent files', './agents')
  .option('--allow-origins <origins>', 'Allowed CORS origins (comma-separated)', '*')
  .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info')
  .action(async (options) => {
    console.log('🚀 Starting ADK API Server...');
    console.log(`📁 Agents directory: ${options.agentsDir}`);
    console.log(`🌐 API server will be available at: http://${options.host}:${options.port}`);
    
    try {
      await startApiServer({
        port: parseInt(options.port),
        host: options.host,
        agentsDir: options.agentsDir,
        allowOrigins: options.allowOrigins.split(','),
        logLevel: options.logLevel
      });
    } catch (error) {
      console.error('❌ Failed to start API server:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// If no command is provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}