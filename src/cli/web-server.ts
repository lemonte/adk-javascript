import express from 'express';
import cors from 'cors';
import path from 'path';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AgentManager } from './agent-manager';
import { SessionManager } from './session-manager';

export interface WebServerConfig {
  port: number;
  host: string;
  agentsDir: string;
  allowOrigins: string[];
  logLevel: string;
}

export async function startWebServer(config: WebServerConfig): Promise<void> {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  
  // Initialize managers
  const agentManager = new AgentManager(config.agentsDir);
  const sessionManager = new SessionManager(agentManager);
  
  // CORS configuration
  app.use(cors({
    origin: config.allowOrigins,
    credentials: true
  }));
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Static files - serve the adk-web frontend if available
  const webUIPath = path.join(__dirname, '../../../adk-web/dist/agent_framework_web/browser');
  try {
    app.use(express.static(webUIPath));
    console.log(`📱 Serving web UI from: ${webUIPath}`);
  } catch (error) {
    console.log('ℹ️  Web UI not found. API-only mode.');
  }
  
  // API Routes
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // List apps (agents) - compatibility with adk-web frontend
  app.get('/list-apps', async (req, res) => {
    try {
      console.log('📋 /list-apps endpoint called with query:', req.query);
      const agents = await agentManager.getAllAgents();
      console.log('📋 Found agents:', agents);
      const agentNames = agents.map(agent => agent.id);
      console.log('📋 Returning agent names:', agentNames);
      res.json(agentNames);
    } catch (error) {
      console.error('Error listing apps:', error);
      res.status(500).json({ error: 'Failed to load agents' });
    }
  });
  
  // Get all agents
  app.get('/api/agents', async (req, res) => {
    try {
      const agents = await agentManager.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load agents' });
    }
  });
  
  // Get specific agent
  app.get('/api/agents/:id', async (req, res) => {
    try {
      const agent = await agentManager.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      return res.json(agent);
    } catch (error) {
      console.error('Error getting agent:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Create new session
  app.post('/api/sessions', async (req, res) => {
    try {
      const { agentId, config } = req.body;
      const session = await sessionManager.createSession(agentId, config);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create session' });
    }
  });
  
  // Get session
  app.get('/api/sessions/:id', async (req, res) => {
    try {
      const session = await sessionManager.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      return res.json(session);
    } catch (error) {
      console.error('Error getting session:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // Send message to agent
  app.post('/api/sessions/:id/messages', async (req, res) => {
    try {
      const { message } = req.body;
      const response = await sessionManager.sendMessage(req.params.id, message);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
  
  // Get session messages
  app.get('/api/sessions/:id/messages', async (req, res) => {
    try {
      const messages = await sessionManager.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load messages' });
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
            // Join a session for real-time updates
            sessionManager.addWebSocketToSession(message.sessionId, ws);
            ws.send(JSON.stringify({ type: 'joined', sessionId: message.sessionId }));
            break;
            
          case 'send_message':
            // Send message through WebSocket
            const response = await sessionManager.sendMessage(message.sessionId, message.content);
            ws.send(JSON.stringify({ type: 'message_response', data: response }));
            break;
            
          default:
            ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      sessionManager.removeWebSocket(ws);
    });
  });
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      try {
        res.sendFile(path.join(webUIPath, 'index.html'));
      } catch (error) {
        res.status(404).json({ error: 'Web UI not available' });
      }
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
  
  // Start server
  server.listen(config.port, config.host, () => {
    console.log(`✅ ADK Web Server running on http://${config.host}:${config.port}`);
    console.log(`📊 API available at http://${config.host}:${config.port}/api`);
    console.log(`🔌 WebSocket available at ws://${config.host}:${config.port}`);
    console.log('\n🎯 Ready to serve agents!');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down ADK Web Server...');
    server.close(() => {
      console.log('✅ Server closed gracefully');
      process.exit(0);
    });
  });
}