import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { AgentManager } from './agent-manager';
import { SessionManager } from './session-manager';

export interface ApiServerConfig {
  port: number;
  host: string;
  agentsDir: string;
  allowOrigins: string[];
  logLevel: string;
}

export async function startApiServer(config: ApiServerConfig): Promise<void> {
  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server });
  
  // Initialize managers
  const agentManager = new AgentManager(config.agentsDir);
  const sessionManager = new SessionManager(agentManager);
  
  // CORS configuration
  const corsOptions = {
    origin: config.allowOrigins.includes('*') ? true : config.allowOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  };
  
  app.use(cors(corsOptions));
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
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
    } catch (error) {
      console.error('Error loading agents:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to load agents',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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
      console.error('Error loading agents for list-apps:', error);
      res.status(500).json({ error: 'Failed to load agents' });
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error('Error deleting session:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to delete session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // SSE endpoint for agent communication (compatible with adk-web)
  app.post('/run_sse', async (req, res) => {
    try {
      let { appName, userId, sessionId, newMessage, functionCallEventId, streaming, stateDelta } = req.body;
      
      if (!appName || !userId || !newMessage) {
        return res.status(400).json({
          error: 'appName, userId, and newMessage are required'
        });
      }
      
      // Auto-create session if sessionId is empty, undefined, or "undefined"
      if (!sessionId || sessionId === '' || sessionId === 'undefined') {
        const newSession = await sessionManager.createSession(appName);
        sessionId = newSession.id;
      }
      
      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });
      
      try {
        // Check if session exists, create if not
        let session = await sessionManager.getSession(sessionId);
        if (!session) {
          // Create session with the provided sessionId and appName as agentId
          session = await sessionManager.createSessionWithId(sessionId, appName, { userId, appName });
        }
        
        // Extract message content from newMessage.parts
        let messageContent = '';
        if (newMessage.parts && Array.isArray(newMessage.parts)) {
          for (const part of newMessage.parts) {
            if (part.text) {
              messageContent += part.text;
            }
          }
        }
        
        if (messageContent.trim()) {
          // Send message to agent
          const response = await sessionManager.sendMessage(sessionId, messageContent);
          
          // Send SSE response
          const sseData = {
            content: {
              parts: [{
                type: 'text',
                text: response.content
              }]
            },
            metadata: response.metadata || {},
            timestamp: response.timestamp
          };
          
          res.write(`data: ${JSON.stringify(sseData)}\n\n`);
        }
        
        // End the SSE stream
        res.write(`data: {"type": "end"}\n\n`);
        res.end();
        return;
        
      } catch (error) {
        console.error('Error in SSE endpoint:', error);
        const errorData = {
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString()
        };
        res.write(`data: ${JSON.stringify(errorData)}\n\n`);
        res.end();
        return;
      }
      
    } catch (error) {
      console.error('Error setting up SSE:', error);
      return res.status(500).json({
        error: 'Failed to setup SSE stream',
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
      } catch (error) {
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
  
  // ADK Web compatibility endpoints
  
  // Create session for specific app and user
  app.post('/apps/:appName/users/:userId/sessions', async (req, res) => {
    try {
      const { appName, userId } = req.params;
      const { sessionId, config: sessionConfig } = req.body;
      
      // Use provided sessionId or generate one
      const finalSessionId = sessionId || `${appName}-${userId}-${Date.now()}`;
      
      const session = await sessionManager.createSessionWithId(finalSessionId, appName, {
        userId,
        appName,
        ...sessionConfig
      });
      
      return res.status(201).json({
         success: true,
         data: {
           sessionId: finalSessionId,
           appName,
           userId,
           ...session,
           createdAt: new Date().toISOString()
         }
       });
    } catch (error) {
      console.error('Error creating session for app/user:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get sessions for a specific user in an app
  app.get('/apps/:appName/users/:userId/sessions', async (req, res) => {
    try {
      const { appName, userId } = req.params;
      
      // Get all sessions from SessionManager
      const allSessions = sessionManager.getAllSessions();
      
      // Filter sessions by appName and userId (if they have this metadata)
      const userSessions = allSessions.filter(session => {
        // For now, we'll return all sessions since we don't have app/user metadata stored
        // This can be enhanced later when session metadata is properly implemented
        return true;
      }).map(session => ({
        sessionId: session.id,
        appName,
        userId,
        createdAt: new Date().toISOString(),
        status: 'active'
      }));
      
      return res.json({
        success: true,
        data: userSessions,
        count: userSessions.length,
        appName,
        userId
      });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to get user sessions',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get a specific session by ID
  app.get('/apps/:appName/users/:userId/sessions/:sessionId', async (req, res) => {
    try {
      const { appName, userId, sessionId } = req.params;
      
      // Handle "undefined" sessionId by creating a new session
        if (sessionId === 'undefined') {
          const newSession = await sessionManager.createSession(appName);
        
        return res.json({
          success: true,
          data: {
            sessionId: newSession.id,
            appName,
            userId,
            agentId: newSession.agentId,
            agentName: newSession.agentName,
            createdAt: newSession.createdAt.toISOString(),
            lastActivity: newSession.lastActivity.toISOString(),
            messageCount: newSession.messageCount,
            status: 'active',
            config: newSession.config,
            isNewSession: true
          }
        });
      }
      
      // Get session from SessionManager
      const session = await sessionManager.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
          message: `Session ${sessionId} not found`
        });
      }
      
      // Return session data
      return res.json({
        success: true,
        data: {
          sessionId: session.id,
          appName,
          userId,
          agentId: session.agentId,
          agentName: session.agentName,
          createdAt: session.createdAt.toISOString(),
          lastActivity: session.lastActivity.toISOString(),
          messageCount: session.messageCount,
          status: 'active',
          config: session.config
        }
      });
    } catch (error) {
      console.error('Error getting session:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Debug endpoint to trace session information (alternative route)
  app.get('/debug/trace/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Handle undefined sessionId by creating a new session
      let actualSessionId = sessionId;
      if (sessionId === 'undefined') {
        // Create a new session for debugging - use sample-agent as default
        const newSession = await sessionManager.createSession('sample-agent');
        actualSessionId = newSession.id;
        console.log(`📝 Created new session ${actualSessionId} for debug trace`);
      }
      
      // Get session from SessionManager
      const session = await sessionManager.getSession(actualSessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
          message: `Session ${actualSessionId} not found for debugging`,
          sessionId: actualSessionId
        });
      }
      
      // Get messages for this session
      const messages = await sessionManager.getMessages(actualSessionId);
      
      // Return debug information
      return res.json({
        success: true,
        data: {
          session: {
            id: session.id,
            agentId: session.agentId,
            agentName: session.agentName,
            createdAt: session.createdAt.toISOString(),
            lastActivity: session.lastActivity.toISOString(),
            messageCount: session.messageCount,
            config: session.config
          },
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            metadata: msg.metadata
          })),
          stats: {
            totalMessages: messages.length,
            userMessages: messages.filter(m => m.role === 'user').length,
            agentMessages: messages.filter(m => m.role === 'agent').length,
            systemMessages: messages.filter(m => m.role === 'system').length
          }
        }
      });
    } catch (error) {
      console.error('Error in debug trace endpoint:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to trace session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Debug endpoint to trace session information (full route)
  app.get('/debug/trace/session/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      // Handle undefined sessionId by creating a new session
      let actualSessionId = sessionId;
      if (sessionId === 'undefined') {
        // Create a new session for debugging - use sample-agent as default
        const newSession = await sessionManager.createSession('sample-agent');
        actualSessionId = newSession.id;
        console.log(`📝 Created new session ${actualSessionId} for debug trace`);
      }
      
      // Get session from SessionManager
      const session = await sessionManager.getSession(actualSessionId);
      
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found',
          message: `Session ${actualSessionId} not found for debugging`,
          sessionId: actualSessionId
        });
      }
      
      // Get messages for this session
      const messages = await sessionManager.getMessages(actualSessionId);
      
      // Return debug information
      return res.json({
        success: true,
        data: {
          session: {
            id: session.id,
            agentId: session.agentId,
            agentName: session.agentName,
            createdAt: session.createdAt.toISOString(),
            lastActivity: session.lastActivity.toISOString(),
            messageCount: session.messageCount,
            config: session.config
          },
          messages: messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            metadata: msg.metadata
          })),
          stats: {
            totalMessages: messages.length,
            userMessages: messages.filter(m => m.role === 'user').length,
            agentMessages: messages.filter(m => m.role === 'agent').length,
            systemMessages: messages.filter(m => m.role === 'system').length
          }
        }
      });
    } catch (error) {
      console.error('Error in debug trace endpoint:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to trace session',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get evaluation sets for an app
  app.get('/apps/:appName/eval_sets', async (req, res) => {
    try {
      const { appName } = req.params;
      
      // For now, return empty array as evaluation sets are not implemented
      // This can be extended later when evaluation functionality is added
      return res.json({
        success: true,
        data: [],
        count: 0,
        appName
      });
    } catch (error) {
      console.error('Error loading evaluation sets:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to load evaluation sets',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get evaluation results for an app
  app.get('/apps/:appName/eval_results', async (req, res) => {
    try {
      const { appName } = req.params;
      
      // For now, return empty array as evaluation results are not implemented
      // This can be extended later when evaluation functionality is added
      return res.json({
        success: true,
        data: [],
        count: 0,
        appName
      });
    } catch (error) {
      console.error('Error loading evaluation results:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to load evaluation results',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Error handling middleware
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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