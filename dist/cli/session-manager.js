"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionManager = void 0;
const uuid_1 = require("uuid");
const ws_1 = require("ws");
const agent_manager_js_1 = require("./agent-manager.js");
const in_memory_session_service_js_1 = require("../sessions/in-memory-session-service.js");
class SessionManager {
    constructor(agentManager) {
        this.sessions = new Map();
        this.messages = new Map();
        this.webSockets = new Map();
        this.sessionService = new in_memory_session_service_js_1.InMemorySessionService();
        this.agentManager = agentManager || new agent_manager_js_1.AgentManager('./agents');
    }
    async createSession(agentId, config) {
        const sessionId = (0, uuid_1.v4)();
        // Verify agent exists
        const agentInfo = await this.agentManager.getAgent(agentId);
        if (!agentInfo) {
            throw new Error(`Agent not found: ${agentId}`);
        }
        // Create session info
        const sessionInfo = {
            id: sessionId,
            agentId,
            agentName: agentInfo.name,
            createdAt: new Date(),
            lastActivity: new Date(),
            messageCount: 0,
            config
        };
        // Store session
        this.sessions.set(sessionId, sessionInfo);
        this.messages.set(sessionId, []);
        this.webSockets.set(sessionId, new Set());
        // Create internal session for agent execution
        const sessionData = {
            id: sessionId,
            agentId,
            metadata: config,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        await this.sessionService.createSession({
            appName: 'adk-web',
            userId: 'default',
            sessionId
        });
        console.log(`📝 Created session ${sessionId} for agent ${agentInfo.name}`);
        return sessionInfo;
    }
    async getSession(sessionId) {
        return this.sessions.get(sessionId) || null;
    }
    async deleteSession(sessionId) {
        const sessionInfo = this.sessions.get(sessionId);
        if (!sessionInfo) {
            return false;
        }
        // Close all WebSocket connections for this session
        const sockets = this.webSockets.get(sessionId);
        if (sockets) {
            sockets.forEach(ws => {
                if (ws.readyState === ws_1.WebSocket.OPEN) {
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
        }
        catch (error) {
            console.warn(`Failed to delete session from service: ${error}`);
        }
        console.log(`🗑️ Deleted session ${sessionId}`);
        return true;
    }
    async sendMessage(sessionId, content) {
        const sessionInfo = this.sessions.get(sessionId);
        if (!sessionInfo) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        // Create user message
        const userMessage = {
            id: (0, uuid_1.v4)(),
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
                role: 'user',
                parts: [{ type: 'text', text: content }]
            };
            // Create InvocationContext
            const invocationContext = {
                sessionId,
                userId: 'default',
                appName: 'adk-web',
                agentName: sessionInfo.agentId,
                requestId: (0, uuid_1.v4)(),
                timestamp: new Date(),
                agent,
                session,
                invocationId: (0, uuid_1.v4)()
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
            const agentMessage = {
                id: (0, uuid_1.v4)(),
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
        }
        catch (error) {
            console.error(`Error processing message for session ${sessionId}:`, error);
            // Create error message
            const errorMessage = {
                id: (0, uuid_1.v4)(),
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
    async getMessages(sessionId) {
        return this.messages.get(sessionId) || [];
    }
    addWebSocketToSession(sessionId, ws) {
        let sockets = this.webSockets.get(sessionId);
        if (!sockets) {
            sockets = new Set();
            this.webSockets.set(sessionId, sockets);
        }
        sockets.add(ws);
        console.log(`🔌 WebSocket added to session ${sessionId}`);
    }
    removeWebSocket(ws) {
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
    broadcastToSession(sessionId, message) {
        const sockets = this.webSockets.get(sessionId);
        if (!sockets) {
            return;
        }
        const messageStr = JSON.stringify(message);
        sockets.forEach(ws => {
            if (ws.readyState === ws_1.WebSocket.OPEN) {
                try {
                    ws.send(messageStr);
                }
                catch (error) {
                    console.error('Failed to send WebSocket message:', error);
                    sockets.delete(ws);
                }
            }
            else {
                // Remove closed connections
                sockets.delete(ws);
            }
        });
    }
    getAllSessions() {
        return Array.from(this.sessions.values());
    }
    getSessionCount() {
        return this.sessions.size;
    }
    getActiveWebSocketCount() {
        let count = 0;
        for (const sockets of this.webSockets.values()) {
            count += sockets.size;
        }
        return count;
    }
    // Cleanup old sessions (can be called periodically)
    cleanupOldSessions(maxAgeHours = 24) {
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
exports.SessionManager = SessionManager;
//# sourceMappingURL=session-manager.js.map