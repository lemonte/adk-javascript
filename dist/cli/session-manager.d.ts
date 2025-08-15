import { WebSocket } from 'ws';
import { AgentManager } from './agent-manager.js';
export interface SessionInfo {
    id: string;
    agentId: string;
    agentName: string;
    createdAt: Date;
    lastActivity: Date;
    messageCount: number;
    config?: any;
}
export interface MessageInfo {
    id: string;
    sessionId: string;
    content: string;
    role: 'user' | 'agent' | 'system';
    timestamp: Date;
    metadata?: any;
}
export declare class SessionManager {
    private sessions;
    private messages;
    private webSockets;
    private sessionService;
    private agentManager;
    constructor(agentManager?: AgentManager);
    createSession(agentId: string, config?: any): Promise<SessionInfo>;
    getSession(sessionId: string): Promise<SessionInfo | null>;
    deleteSession(sessionId: string): Promise<boolean>;
    sendMessage(sessionId: string, content: string): Promise<MessageInfo>;
    getMessages(sessionId: string): Promise<MessageInfo[]>;
    addWebSocketToSession(sessionId: string, ws: WebSocket): void;
    removeWebSocket(ws: WebSocket): void;
    private broadcastToSession;
    getAllSessions(): SessionInfo[];
    getSessionCount(): number;
    getActiveWebSocketCount(): number;
    cleanupOldSessions(maxAgeHours?: number): number;
}
//# sourceMappingURL=session-manager.d.ts.map