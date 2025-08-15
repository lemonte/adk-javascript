import fs from 'fs/promises';
import path from 'path';
import { LlmAgent } from '../agents/index';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  filePath: string;
  lastModified: Date;
  config?: any;
}

export class AgentManager {
  private agentsDir: string;
  private agentCache: Map<string, AgentInfo> = new Map();
  private lastScan: Date = new Date(0);
  
  constructor(agentsDir: string) {
    this.agentsDir = path.resolve(agentsDir);
    this.ensureAgentsDirectory();
  }
  
  private async ensureAgentsDirectory(): Promise<void> {
    try {
      await fs.access(this.agentsDir);
    } catch (error) {
      console.log(`📁 Creating agents directory: ${this.agentsDir}`);
      await fs.mkdir(this.agentsDir, { recursive: true });
      
      // Create a sample agent file
      await this.createSampleAgent();
    }
  }
  
  private async createSampleAgent(): Promise<void> {
    const sampleAgentPath = path.join(this.agentsDir, 'sample-agent.ts');
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
      await fs.writeFile(sampleAgentPath, sampleAgentContent, 'utf8');
      console.log(`✅ Created sample agent: ${sampleAgentPath}`);
    } catch (error) {
      console.error('Failed to create sample agent:', error);
    }
  }
  
  async getAllAgents(): Promise<AgentInfo[]> {
    await this.scanAgents();
    return Array.from(this.agentCache.values());
  }
  
  async getAgent(id: string): Promise<AgentInfo | null> {
    await this.scanAgents();
    return this.agentCache.get(id) || null;
  }
  
  async loadAgentInstance(id: string): Promise<LlmAgent | null> {
    const agentInfo = await this.getAgent(id);
    if (!agentInfo) {
      return null;
    }
    
    try {
      // Dynamic import of the agent file
      const agentModule = await import(agentInfo.filePath);
      
      // Try to get the agent from default export or named export
      let agent = agentModule.default;
      if (!agent && agentModule[id]) {
        agent = agentModule[id];
      }
      
      // If still no agent, try to find any LlmAgent instance in the module
      if (!agent) {
        for (const exportName of Object.keys(agentModule)) {
          const exported = agentModule[exportName];
          if (exported instanceof LlmAgent) {
            agent = exported;
            break;
          }
        }
      }
      
      if (!agent || !(agent instanceof LlmAgent)) {
        throw new Error(`No valid Agent instance found in ${agentInfo.filePath}`);
      }
      
      return agent;
    } catch (error) {
      console.error(`Failed to load agent ${id}:`, error);
      return null;
    }
  }
  
  private async scanAgents(): Promise<void> {
    try {
      const stats = await fs.stat(this.agentsDir);
      
      // Only rescan if directory was modified since last scan
      if (stats.mtime <= this.lastScan) {
        return;
      }
      
      this.lastScan = new Date();
      this.agentCache.clear();
      
      const files = await fs.readdir(this.agentsDir);
      
      for (const file of files) {
        if (this.isAgentFile(file)) {
          await this.processAgentFile(file);
        }
      }
      
      console.log(`🔍 Scanned ${this.agentCache.size} agents from ${this.agentsDir}`);
    } catch (error) {
      console.error('Failed to scan agents directory:', error);
    }
  }
  
  private isAgentFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ext === '.ts' || ext === '.js';
  }
  
  private async processAgentFile(filename: string): Promise<void> {
    const filePath = path.join(this.agentsDir, filename);
    
    try {
      const stats = await fs.stat(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract basic info from the file
      const agentInfo = this.extractAgentInfo(filename, filePath, content, stats.mtime);
      
      if (agentInfo) {
        this.agentCache.set(agentInfo.id, agentInfo);
      }
    } catch (error) {
      console.error(`Failed to process agent file ${filename}:`, error);
    }
  }
  
  private extractAgentInfo(filename: string, filePath: string, content: string, lastModified: Date): AgentInfo | null {
    try {
      // Generate ID from filename
      const id = path.basename(filename, path.extname(filename));
      
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
    } catch (error) {
      console.error(`Failed to extract agent info from ${filename}:`, error);
      return null;
    }
  }
  
  async reloadAgents(): Promise<void> {
    this.lastScan = new Date(0); // Force rescan
    await this.scanAgents();
  }
  
  getAgentsDirectory(): string {
    return this.agentsDir;
  }
  
  async watchAgents(callback: (agents: AgentInfo[]) => void): Promise<void> {
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