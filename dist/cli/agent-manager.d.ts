import { LlmAgent } from '../agents/index.js';
export interface AgentInfo {
    id: string;
    name: string;
    description: string;
    filePath: string;
    lastModified: Date;
    config?: any;
}
export declare class AgentManager {
    private agentsDir;
    private agentCache;
    private lastScan;
    constructor(agentsDir: string);
    private ensureAgentsDirectory;
    private createSampleAgent;
    getAllAgents(): Promise<AgentInfo[]>;
    getAgent(id: string): Promise<AgentInfo | null>;
    loadAgentInstance(id: string): Promise<LlmAgent | null>;
    private scanAgents;
    private isAgentFile;
    private processAgentFile;
    private extractAgentInfo;
    reloadAgents(): Promise<void>;
    getAgentsDirectory(): string;
    watchAgents(callback: (agents: AgentInfo[]) => void): Promise<void>;
}
//# sourceMappingURL=agent-manager.d.ts.map