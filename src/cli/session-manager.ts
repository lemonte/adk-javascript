import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { Agent } from '../agents/index';
import { AgentManager } from './agent-manager';
import { Session } from '../sessions/index';
import { InMemorySessionService } from '../sessions/in-memory-session-service';

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

export class SessionManager {
  private sessions: Map<string, SessionInfo> = new Map();
  private messages: Map<string, MessageInfo[]> = new Map();
  private webSockets: Map<string, Set<WebSocket>> = new Map();
  private sessionService: InMemorySessionService;
  private agentManager: AgentManager;

  constructor(agentManager?: AgentManager) {
    this.sessionService = new InMemorySessionService();
    this.agentManager = agentManager || new AgentManager('./agents');
  }

  async createSession(agentId: string, config?: any): Promise<SessionInfo> {
    const sessionId = uuidv4();
    const agentInfo = await this.agentManager.getAgent(agentId);
    if (!agentInfo) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const sessionInfo: SessionInfo = {
      id: sessionId,
      agentId,
      agentName: agentInfo.name,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      config
    };

    this.sessions.set(sessionId, sessionInfo);
    this.messages.set(sessionId, []);

    await this.sessionService.createSession({
      appName: 'adk-web',
      userId: 'default',
      sessionId
    });

    console.log(`📝 Created session ${sessionId} for agent ${agentInfo.name}`);

    return sessionInfo;
  }

  async createSessionWithId(sessionId: string, agentId: string, config?: any): Promise<SessionInfo> {
    const agentInfo = await this.agentManager.getAgent(agentId);
    if (!agentInfo) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const sessionInfo: SessionInfo = {
      id: sessionId,
      agentId,
      agentName: agentInfo.name,
      createdAt: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      config
    };

    this.sessions.set(sessionId, sessionInfo);
    this.messages.set(sessionId, []);

    await this.sessionService.createSession({
      appName: 'adk-web',
      userId: 'default',
      sessionId
    });

    console.log(`📝 Created session ${sessionId} for agent ${agentInfo.name}`);

    return sessionInfo;
  }

  async getSession(sessionId: string): Promise<SessionInfo | null> {
    return this.sessions.get(sessionId) || null;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const sessionInfo = this.sessions.get(sessionId);
    if (!sessionInfo) {
      return false;
    }

    // Close all WebSocket connections for this session
    const sockets = this.webSockets.get(sessionId);
    if (sockets) {
      sockets.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    }

    // Remove from internal storage
    this.sessions.delete(sessionId);
    this.messages.delete(sessionId);
    this.webSockets.delete(sessionId);

    // Remove from session service
    try {
      await this.sessionService.deleteSession({
        appName: 'adk-web',
        userId: 'default',
        sessionId
      });
    } catch (error) {
      console.warn(`Failed to delete session from service: ${error}`);
    }

    console.log(`🗑️ Deleted session ${sessionId}`);
    return true;
  }

  async sendMessage(sessionId: string, content: string): Promise<MessageInfo> {
    const sessionInfo = this.sessions.get(sessionId);
    if (!sessionInfo) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Create user message
    const userMessage: MessageInfo = {
      id: uuidv4(),
      sessionId,
      content,
      role: 'user',
      timestamp: new Date()
    };

    // Add to messages
    const sessionMessages = this.messages.get(sessionId) || [];
    sessionMessages.push(userMessage);

    // Update session activity
    sessionInfo.lastActivity = new Date();
    sessionInfo.messageCount++;

    // Broadcast to WebSocket clients
    this.broadcastToSession(sessionId, {
      type: 'new_message',
      data: userMessage
    });

    try {
      // Load and execute agent
      const agent = await this.agentManager.loadAgentInstance(sessionInfo.agentId);
      if (!agent) {
        throw new Error(`Failed to load agent: ${sessionInfo.agentId}`);
      }

      // Get session from service
      const session = await this.sessionService.getSession({
        appName: 'adk-web',
        userId: 'default',
        sessionId
      });
      if (!session) {
        throw new Error(`Session not found in service: ${sessionId}`);
      }

      // Create Content object for agent
      const messageContent = {
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: content }]
      };

      // Create InvocationContext
      const invocationContext = {
        sessionId,
        userId: 'default',
        appName: 'adk-web',
        agentName: sessionInfo.agentId,
        requestId: uuidv4(),
        timestamp: new Date(),
        agent,
        session,
        invocationId: uuidv4()
      };

      // Execute agent with the message
      const responseGenerator = await agent.run(messageContent, invocationContext);

      // Process the response generator
      let responseContent = 'No response';
      let metadata = {};

      for await (const event of responseGenerator) {
        if (event.type === 'agent_end') {
          const firstPart = event.response?.parts?.[0];
          responseContent = (firstPart?.type === 'text' ? firstPart.text : 'No response') || 'No response';
          metadata = {
            duration: event.duration,
            agentName: event.agentName
          };
          break;
        }
      }

      // Create agent response message
      const agentMessage: MessageInfo = {
        id: uuidv4(),
        sessionId,
        content: responseContent,
        role: 'agent',
        timestamp: new Date(),
        metadata
      };

      // Add agent response to messages
      sessionMessages.push(agentMessage);

      // Update session
      sessionInfo.messageCount++;
      this.messages.set(sessionId, sessionMessages);

      // Broadcast agent response
      this.broadcastToSession(sessionId, {
        type: 'new_message',
        data: agentMessage
      });

      console.log(`💬 Message processed for session ${sessionId}`);

      return agentMessage;

    } catch (error) {
      console.error(`Error processing message for session ${sessionId}:`, error);

      // Create error message
      const errorMessage: MessageInfo = {
        id: uuidv4(),
        sessionId,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        role: 'system',
        timestamp: new Date(),
        metadata: { error: true }
      };

      sessionMessages.push(errorMessage);
      this.messages.set(sessionId, sessionMessages);

      // Broadcast error
      this.broadcastToSession(sessionId, {
        type: 'error',
        data: errorMessage
      });

      return errorMessage;
    }
  }

  async getMessages(sessionId: string): Promise<MessageInfo[]> {
    return this.messages.get(sessionId) || [];
  }

  addWebSocketToSession(sessionId: string, ws: WebSocket): void {
    let sockets = this.webSockets.get(sessionId);
    if (!sockets) {
      sockets = new Set();
      this.webSockets.set(sessionId, sockets);
    }
    sockets.add(ws);

    console.log(`🔌 WebSocket added to session ${sessionId}`);
  }

  removeWebSocket(ws: WebSocket): void {
    for (const [sessionId, sockets] of this.webSockets.entries()) {
      if (sockets.has(ws)) {
        sockets.delete(ws);
        console.log(`🔌 WebSocket removed from session ${sessionId}`);

        // Clean up empty socket sets
        if (sockets.size === 0) {
          this.webSockets.delete(sessionId);
        }
        break;
      }
    }
  }

  private broadcastToSession(sessionId: string, message: any): void {
    const sockets = this.webSockets.get(sessionId);
    if (!sockets) {
      return;
    }

    const messageStr = JSON.stringify(message);

    sockets.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(messageStr);
        } catch (error) {
          console.error('Error sending WebSocket message:', error);
        }
      }
    });
  }

  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  getSessionCount(): number {
    return this.sessions.size;
  }

  getActiveWebSocketCount(): number {
    let count = 0;
    for (const sockets of this.webSockets.values()) {
      count += sockets.size;
    }
    return count;
  }

  cleanupOldSessions(maxAgeHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [sessionId, sessionInfo] of this.sessions.entries()) {
      if (sessionInfo.lastActivity < cutoffTime) {
        this.deleteSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old sessions`);
    }

    return cleanedCount;
  }
}