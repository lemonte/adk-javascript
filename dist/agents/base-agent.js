"use strict";
/**
 * Base agent implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const index_1 = require("../events/index");
const index_2 = require("../utils/index");
/**
 * Abstract base class for all agents in the ADK
 */
class BaseAgent extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.name = config.name;
        this.description = config.description;
        this.instruction = config.instruction;
        this.tools = config.tools || [];
        this.plugins = config.plugins || [];
        this.metadata = config.metadata || {};
        this.subAgents = config.subAgents || [];
        this.logger = new index_2.Logger(`Agent:${this.name}`);
        this.validateConfig();
    }
    /**
     * Gets the root agent of this agent
     */
    get rootAgent() {
        let rootAgent = this;
        while (rootAgent.parentAgent) {
            rootAgent = rootAgent.parentAgent;
        }
        return rootAgent;
    }
    /**
     * Get tool by name
     */
    getTool(name) {
        return this.tools.find(tool => tool.name === name);
    }
    /**
     * Execute a tool call
     */
    async executeTool(toolCall, context, sessionState) {
        const tool = this.getTool(toolCall.name);
        if (!tool) {
            throw new types_1.AdkError(`Tool '${toolCall.name}' not found`);
        }
        try {
            // Emit tool call event
            this.emit('toolCall', {
                type: index_1.EventType.TOOL_CALL,
                toolCall,
                context,
                timestamp: new Date()
            });
            // Execute plugin callbacks
            await this.executePluginCallbacks('beforeToolCall', context, toolCall);
            // Execute the tool
            const result = await tool.execute(toolCall.arguments, {
                context,
                sessionState: sessionState || {}
            });
            const response = {
                name: toolCall.name,
                content: typeof result === 'string' ? result : JSON.stringify(result),
                id: toolCall.id
            };
            // Execute plugin callbacks
            await this.executePluginCallbacks('afterToolCall', context, toolCall, result);
            // Emit tool response event
            this.emit('toolResponse', {
                type: index_1.EventType.TOOL_RESPONSE,
                toolCall,
                response,
                context,
                timestamp: new Date()
            });
            return response;
        }
        catch (error) {
            const errorResponse = {
                name: toolCall.name,
                content: '',
                id: toolCall.id,
                error: error instanceof Error ? error.message : String(error)
            };
            // Execute plugin error callbacks
            await this.executePluginCallbacks('onError', context, error);
            this.emit('toolError', {
                type: index_1.EventType.TOOL_RESPONSE,
                toolCall,
                response: errorResponse,
                error,
                context,
                timestamp: new Date()
            });
            return errorResponse;
        }
    }
    /**
     * Execute plugin callbacks
     */
    async executePluginCallbacks(callbackName, context, ...args) {
        for (const plugin of this.plugins) {
            const callback = plugin[callbackName];
            if (callback) {
                try {
                    await callback.call(plugin, context, ...args);
                }
                catch (error) {
                    this.logger.error(`Plugin ${plugin.name} callback ${callbackName} failed:`, error);
                }
            }
        }
    }
    /**
     * Initialize the agent and its plugins
     */
    async initialize() {
        this.logger.info(`Initializing agent: ${this.name}`);
        // Initialize plugins
        for (const plugin of this.plugins) {
            if (plugin.initialize) {
                try {
                    await plugin.initialize();
                    this.logger.debug(`Plugin ${plugin.name} initialized`);
                }
                catch (error) {
                    this.logger.error(`Failed to initialize plugin ${plugin.name}:`, error);
                }
            }
        }
        // Initialize tools
        for (const tool of this.tools) {
            if (tool.initialize) {
                try {
                    await tool.initialize();
                    this.logger.debug(`Tool ${tool.name} initialized`);
                }
                catch (error) {
                    this.logger.error(`Failed to initialize tool ${tool.name}:`, error);
                }
            }
        }
    }
    /**
     * Get agent information
     */
    getInfo() {
        return {
            name: this.name,
            description: this.description,
            instruction: this.instruction,
            tools: this.tools.map(tool => tool.name),
            plugins: this.plugins.map(plugin => plugin.name),
            metadata: this.metadata
        };
    }
    /**
     * Validate agent configuration
     */
    validateConfig() {
        if (!this.name || this.name.trim() === '') {
            throw new types_1.AdkError('Agent name is required');
        }
        // Validate tool names are unique
        const toolNames = this.tools.map(tool => tool.name);
        const uniqueToolNames = new Set(toolNames);
        if (toolNames.length !== uniqueToolNames.size) {
            throw new types_1.AdkError('Tool names must be unique');
        }
    }
}
exports.BaseAgent = BaseAgent;
//# sourceMappingURL=base-agent.js.map