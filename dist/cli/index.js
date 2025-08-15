#!/usr/bin/env node
"use strict";
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
const commander_1 = require("commander");
const web_server_js_1 = require("./web-server.js");
const api_server_js_1 = require("./api-server.js");
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
const program = new commander_1.Command();
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
        await (0, web_server_js_1.startWebServer)({
            port: parseInt(options.port),
            host: options.host,
            agentsDir: options.agentsDir,
            allowOrigins: options.allowOrigins.split(','),
            logLevel: options.logLevel
        });
    }
    catch (error) {
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
        await (0, api_server_js_1.startApiServer)({
            port: parseInt(options.port),
            host: options.host,
            agentsDir: options.agentsDir,
            allowOrigins: options.allowOrigins.split(','),
            logLevel: options.logLevel
        });
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map