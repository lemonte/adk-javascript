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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const index_js_1 = require("../agents/index.js");
class AgentManager {
    constructor(agentsDir) {
        this.agentCache = new Map();
        this.lastScan = new Date(0);
        this.agentsDir = path_1.default.resolve(agentsDir);
        this.ensureAgentsDirectory();
    }
    async ensureAgentsDirectory() {
        try {
            await promises_1.default.access(this.agentsDir);
        }
        catch (error) {
            console.log(`📁 Creating agents directory: ${this.agentsDir}`);
            await promises_1.default.mkdir(this.agentsDir, { recursive: true });
            // Create a sample agent file
            await this.createSampleAgent();
        }
    }
    async createSampleAgent() {
        const sampleAgentPath = path_1.default.join(this.agentsDir, 'sample-agent.ts');
        const sampleAgentContent = `import { Agent } from 'adk-javascript';

// Sample Agent Configuration
export const sampleAgent = new Agent({
  name: 'Sample Agent',
  description: 'A simple example agent that demonstrates basic functionality',
  instructions: [
    'You are a helpful assistant.',
    'Always be polite and professional.',
    'Provide clear and concise answers.'
  ],
  model: {
    provider: 'gemini',
    name: 'gemini-1.5-flash',
    config: {
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  tools: [
    // Add tools here as needed
  ]
});

export default sampleAgent;
`;
        try {
            await promises_1.default.writeFile(sampleAgentPath, sampleAgentContent, 'utf8');
            console.log(`✅ Created sample agent: ${sampleAgentPath}`);
        }
        catch (error) {
            console.error('Failed to create sample agent:', error);
        }
    }
    async getAllAgents() {
        await this.scanAgents();
        return Array.from(this.agentCache.values());
    }
    async getAgent(id) {
        await this.scanAgents();
        return this.agentCache.get(id) || null;
    }
    async loadAgentInstance(id) {
        const agentInfo = await this.getAgent(id);
        if (!agentInfo) {
            return null;
        }
        try {
            // Dynamic import of the agent file
            const agentModule = await Promise.resolve(`${agentInfo.filePath}`).then(s => __importStar(require(s)));
            // Try to get the agent from default export or named export
            let agent = agentModule.default;
            if (!agent && agentModule[id]) {
                agent = agentModule[id];
            }
            // If still no agent, try to find any LlmAgent instance in the module
            if (!agent) {
                for (const exportName of Object.keys(agentModule)) {
                    const exported = agentModule[exportName];
                    if (exported instanceof index_js_1.LlmAgent) {
                        agent = exported;
                        break;
                    }
                }
            }
            if (!agent || !(agent instanceof index_js_1.LlmAgent)) {
                throw new Error(`No valid Agent instance found in ${agentInfo.filePath}`);
            }
            return agent;
        }
        catch (error) {
            console.error(`Failed to load agent ${id}:`, error);
            return null;
        }
    }
    async scanAgents() {
        try {
            const stats = await promises_1.default.stat(this.agentsDir);
            // Only rescan if directory was modified since last scan
            if (stats.mtime <= this.lastScan) {
                return;
            }
            this.lastScan = new Date();
            this.agentCache.clear();
            const files = await promises_1.default.readdir(this.agentsDir);
            for (const file of files) {
                if (this.isAgentFile(file)) {
                    await this.processAgentFile(file);
                }
            }
            console.log(`🔍 Scanned ${this.agentCache.size} agents from ${this.agentsDir}`);
        }
        catch (error) {
            console.error('Failed to scan agents directory:', error);
        }
    }
    isAgentFile(filename) {
        const ext = path_1.default.extname(filename).toLowerCase();
        return ext === '.ts' || ext === '.js';
    }
    async processAgentFile(filename) {
        const filePath = path_1.default.join(this.agentsDir, filename);
        try {
            const stats = await promises_1.default.stat(filePath);
            const content = await promises_1.default.readFile(filePath, 'utf8');
            // Extract basic info from the file
            const agentInfo = this.extractAgentInfo(filename, filePath, content, stats.mtime);
            if (agentInfo) {
                this.agentCache.set(agentInfo.id, agentInfo);
            }
        }
        catch (error) {
            console.error(`Failed to process agent file ${filename}:`, error);
        }
    }
    extractAgentInfo(filename, filePath, content, lastModified) {
        try {
            // Generate ID from filename
            const id = path_1.default.basename(filename, path_1.default.extname(filename));
            // Try to extract name and description from comments or code
            let name = id;
            let description = 'Agent loaded from file';
            // Look for name in comments or variable names
            const nameMatch = content.match(/\/\*\*[\s\S]*?@name\s+([^\n\r]+)/i) ||
                content.match(/\/\/\s*name:\s*([^\n\r]+)/i) ||
                content.match(/name:\s*['"`]([^'"`]+)['"`]/i);
            if (nameMatch) {
                name = nameMatch[1].trim();
            }
            // Look for description in comments or code
            const descMatch = content.match(/\/\*\*[\s\S]*?@description\s+([^\n\r]+)/i) ||
                content.match(/\/\/\s*description:\s*([^\n\r]+)/i) ||
                content.match(/description:\s*['"`]([^'"`]+)['"`]/i);
            if (descMatch) {
                description = descMatch[1].trim();
            }
            return {
                id,
                name,
                description,
                filePath,
                lastModified
            };
        }
        catch (error) {
            console.error(`Failed to extract agent info from ${filename}:`, error);
            return null;
        }
    }
    async reloadAgents() {
        this.lastScan = new Date(0); // Force rescan
        await this.scanAgents();
    }
    getAgentsDirectory() {
        return this.agentsDir;
    }
    async watchAgents(callback) {
        // Simple polling-based watching (could be enhanced with fs.watch)
        setInterval(async () => {
            const oldCount = this.agentCache.size;
            await this.scanAgents();
            const newCount = this.agentCache.size;
            if (newCount !== oldCount) {
                callback(Array.from(this.agentCache.values()));
            }
        }, 5000); // Check every 5 seconds
    }
}
exports.AgentManager = AgentManager;
//# sourceMappingURL=agent-manager.js.map