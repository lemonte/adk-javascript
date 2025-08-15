"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApiServer = startApiServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ws_1 = require("ws");
const http_1 = require("http");
const agent_manager_js_1 = require("./agent-manager.js");
const session_manager_js_1 = require("./session-manager.js");
async function startApiServer(config) {
    const app = (0, express_1.default)();
    const server = (0, http_1.createServer)(app);
    const wss = new ws_1.WebSocketServer({ server });
    // Initialize managers
    const agentManager = new agent_manager_js_1.AgentManager(config.agentsDir);
    const sessionManager = new session_manager_js_1.SessionManager();
    // CORS configuration
    const corsOptions = {
        origin: config.allowOrigins.includes('*') ? true : config.allowOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
    app.use((0, cors_1.default)(corsOptions));
    // Body parsing middleware
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // Request logging middleware
    app.use((req, res, next) => {
        if (config.logLevel === 'debug') {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        }
        next();
    });
    // API Routes
    // Health check
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.1',
            service: 'adk-javascript-api'
        });
    });
    // Get server info
    app.get('/api/info', (req, res) => {
        res.json({
            name: 'ADK JavaScript API Server',
            version: '1.0.1',
            agentsDirectory: config.agentsDir,
            features: {
                agents: true,
                sessions: true,
                websockets: true,
                realtime: true
            }
        });
    });
    // Get all agents
    app.get('/api/agents', async (req, res) => {
        try {
            const agents = await agentManager.getAllAgents();
            res.json({
                success: true,
                data: agents,
                count: agents.length
            });
        }
        catch (error) {
            console.error('Error loading agents:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load agents',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get specific agent
    app.get('/api/agents/:id', async (req, res) => {
        try {
            const agent = await agentManager.getAgent(req.params.id);
            if (!agent) {
                return res.status(404).json({
                    success: false,
                    error: 'Agent not found',
                    agentId: req.params.id
                });
            }
            return res.json({
                success: true,
                data: agent
            });
        }
        catch (error) {
            console.error('Error loading agent:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to load agent',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Create new session
    app.post('/api/sessions', async (req, res) => {
        try {
            const { agentId, config: sessionConfig } = req.body;
            if (!agentId) {
                return res.status(400).json({
                    success: false,
                    error: 'agentId is required'
                });
            }
            const session = await sessionManager.createSession(agentId, sessionConfig);
            return res.status(201).json({
                success: true,
                data: session
            });
        }
        catch (error) {
            console.error('Error creating session:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create session',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get session
    app.get('/api/sessions/:id', async (req, res) => {
        try {
            const session = await sessionManager.getSession(req.params.id);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found',
                    sessionId: req.params.id
                });
            }
            return res.json({
                success: true,
                data: session
            });
        }
        catch (error) {
            console.error('Error loading session:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to load session',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Send message to agent
    app.post('/api/sessions/:id/messages', async (req, res) => {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'message is required'
                });
            }
            const response = await sessionManager.sendMessage(req.params.id, message);
            return res.json({
                success: true,
                data: response
            });
        }
        catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send message',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Get session messages
    app.get('/api/sessions/:id/messages', async (req, res) => {
        try {
            const messages = await sessionManager.getMessages(req.params.id);
            return res.json({
                success: true,
                data: messages,
                count: messages.length
            });
        }
        catch (error) {
            console.error('Error loading messages:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to load messages',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // Delete session
    app.delete('/api/sessions/:id', async (req, res) => {
        try {
            const success = await sessionManager.deleteSession(req.params.id);
            if (!success) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found',
                    sessionId: req.params.id
                });
            }
            return res.json({
                success: true,
                message: 'Session deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting session:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete session',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    // WebSocket for real-time communication
    wss.on('connection', (ws) => {
        console.log('🔌 WebSocket client connected');
        ws.on('message', async (data) => {
            try {
                const message = JSON.parse(data.toString());
                switch (message.type) {
                    case 'join_session':
                        if (!message.sessionId) {
                            ws.send(JSON.stringify({ type: 'error', message: 'sessionId is required' }));
                            return;
                        }
                        sessionManager.addWebSocketToSession(message.sessionId, ws);
                        ws.send(JSON.stringify({
                            type: 'joined',
                            sessionId: message.sessionId,
                            timestamp: new Date().toISOString()
                        }));
                        break;
                    case 'send_message':
                        if (!message.sessionId || !message.content) {
                            ws.send(JSON.stringify({ type: 'error', message: 'sessionId and content are required' }));
                            return;
                        }
                        const response = await sessionManager.sendMessage(message.sessionId, message.content);
                        ws.send(JSON.stringify({
                            type: 'message_response',
                            data: response,
                            timestamp: new Date().toISOString()
                        }));
                        break;
                    case 'ping':
                        ws.send(JSON.stringify({
                            type: 'pong',
                            timestamp: new Date().toISOString()
                        }));
                        break;
                    default:
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: `Unknown message type: ${message.type}`
                        }));
                }
            }
            catch (error) {
                console.error('WebSocket message error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format or processing error'
                }));
            }
        });
        ws.on('close', () => {
            console.log('🔌 WebSocket client disconnected');
            sessionManager.removeWebSocket(ws);
        });
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    // Error handling middleware
    app.use((error, req, res, next) => {
        console.error('Unhandled error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: config.logLevel === 'debug' ? error.message : 'An unexpected error occurred'
        });
    });
    // 404 handler
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            path: req.originalUrl,
            method: req.method
        });
    });
    // Start server
    server.listen(config.port, config.host, () => {
        console.log(`✅ ADK API Server running on http://${config.host}:${config.port}`);
        console.log(`📊 API endpoints available at http://${config.host}:${config.port}/api`);
        console.log(`🔌 WebSocket available at ws://${config.host}:${config.port}`);
        console.log(`📁 Serving agents from: ${config.agentsDir}`);
        console.log(`🌐 CORS origins: ${config.allowOrigins.join(', ')}`);
        console.log('\n🎯 Ready to serve agents!');
    });
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down ADK API Server...');
        server.close(() => {
            console.log('✅ Server closed gracefully');
            process.exit(0);
        });
    });
}
//# sourceMappingURL=api-server.js.map