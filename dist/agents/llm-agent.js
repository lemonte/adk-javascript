"use strict";
/**
 * LLM Agent implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = exports.LlmAgent = void 0;
const base_agent_1 = require("./base-agent");
const index_1 = require("../events/index");
/**
 * LLM Agent that uses language models to process messages and execute tools
 */
class LlmAgent extends base_agent_1.BaseAgent {
    constructor(config) {
        super(config);
        // Handle model configuration
        if (typeof config.model === 'string') {
            // Import and create model instance based on string
            this.model = this.createModelFromString(config.model);
        }
        else {
            this.model = config.model;
        }
        this.systemInstruction = config.systemInstruction || config.instruction;
        this.globalInstruction = config.globalInstruction;
        this.generationConfig = config.generationConfig;
        this.safetySettings = config.safetySettings;
        this.maxIterations = config.maxIterations || 10;
        this.subAgents = config.subAgents || [];
        this.validateConfig();
    }
    /**
     * Create model instance from string identifier
     */
    createModelFromString(modelName) {
        // This would be implemented to create appropriate model instances
        // For now, we'll import the GeminiModel as default
        const { GeminiModel } = require('../models');
        return new GeminiModel({ model: modelName });
    }
    /**
     * Run the agent with a message
     */
    async run(message, context, sessionState) {
        return this.runGenerator(message, context, sessionState);
    }
    async *runGenerator(message, context, sessionState) {
        const startTime = new Date();
        // Emit agent start event
        const startEvent = {
            type: index_1.EventType.AGENT_START,
            agentName: this.name,
            message,
            context,
            timestamp: startTime
        };
        yield startEvent;
        this.emit('agentStart', startEvent);
        try {
            // Execute plugin callbacks
            await this.executePluginCallbacks('beforeAgentRun', context);
            // Build conversation history
            const messages = await this.buildMessages(message, context, sessionState);
            // Execute the reasoning loop
            let iteration = 0;
            let currentMessages = [...messages];
            let finalResponse;
            while (iteration < this.maxIterations) {
                iteration++;
                this.logger.debug(`Agent iteration ${iteration}`);
                // Prepare model request
                const modelRequest = {
                    model: this.model.modelName,
                    messages: currentMessages,
                    tools: this.getToolDefinitions(),
                    toolChoice: 'auto',
                    generationConfig: this.generationConfig,
                    safetySettings: this.safetySettings,
                    systemInstruction: this.systemInstruction
                };
                // Call the model
                const modelResponse = await this.model.generateContent(modelRequest.messages, {
                    tools: modelRequest.tools,
                    toolChoice: modelRequest.toolChoice,
                    generationConfig: modelRequest.generationConfig,
                    safetySettings: modelRequest.safetySettings,
                    systemInstruction: modelRequest.systemInstruction
                });
                // Emit model events
                yield {
                    type: index_1.EventType.MODEL_REQUEST,
                    request: modelRequest,
                    context,
                    timestamp: new Date()
                };
                yield {
                    type: index_1.EventType.MODEL_RESPONSE,
                    response: modelResponse,
                    context,
                    timestamp: new Date()
                };
                // Add assistant response to conversation
                if (modelResponse.content) {
                    currentMessages.push(modelResponse.content);
                    finalResponse = modelResponse.content;
                }
                // Handle tool calls
                if (modelResponse.toolCalls && modelResponse.toolCalls.length > 0) {
                    const toolResponses = await this.executeToolCalls(modelResponse.toolCalls, context, sessionState);
                    // Add tool responses to conversation
                    for (const toolResponse of toolResponses) {
                        yield {
                            type: index_1.EventType.TOOL_CALL,
                            toolCall: { name: toolResponse.name, arguments: {}, id: toolResponse.id },
                            context,
                            timestamp: new Date()
                        };
                        yield {
                            type: index_1.EventType.TOOL_RESPONSE,
                            toolCall: { name: toolResponse.name, arguments: {}, id: toolResponse.id },
                            response: toolResponse,
                            context,
                            timestamp: new Date()
                        };
                        currentMessages.push({
                            role: 'tool',
                            parts: [{ type: 'text', text: toolResponse.content }],
                            metadata: { toolName: toolResponse.name, toolId: toolResponse.id }
                        });
                    }
                }
                else {
                    // No tool calls, we're done
                    break;
                }
            }
            // Execute plugin callbacks
            await this.executePluginCallbacks('afterAgentRun', context, finalResponse);
            // Emit agent end event
            const endEvent = {
                type: index_1.EventType.AGENT_END,
                agentName: this.name,
                response: finalResponse ?? { role: 'assistant', parts: [] },
                context,
                timestamp: new Date(),
                duration: Date.now() - startTime.getTime()
            };
            yield endEvent;
            this.emit('agentEnd', endEvent);
        }
        catch (error) {
            // Execute plugin error callbacks
            await this.executePluginCallbacks('onError', context, error);
            // Emit error event
            yield {
                type: index_1.EventType.AGENT_END,
                agentName: this.name,
                response: { role: 'assistant', parts: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }] },
                context,
                timestamp: new Date(),
                duration: Date.now() - startTime.getTime()
            };
            throw error;
        }
    }
    /**
     * Build messages for the model request
     */
    async buildMessages(message, context, sessionState) {
        const messages = [];
        // Add system instruction if provided
        if (this.systemInstruction) {
            messages.push({
                role: 'system',
                parts: [{ type: 'text', text: this.systemInstruction }]
            });
        }
        // Add the user message
        messages.push(message);
        return messages;
    }
    /**
     * Get tool definitions for the model
     */
    getToolDefinitions() {
        return this.tools.map(tool => tool.getDefinition());
    }
    /**
     * Execute multiple tool calls
     */
    async executeToolCalls(toolCalls, context, sessionState) {
        const results = [];
        for (const toolCall of toolCalls) {
            const result = await this.executeTool(toolCall, context, sessionState);
            results.push(result);
        }
        return results;
    }
    /**
     * Transfer to a sub-agent
     */
    async transferToAgent(agentName, message, context, sessionState) {
        const subAgent = this.subAgents.find(agent => agent.name === agentName);
        if (!subAgent) {
            throw new Error(`Sub-agent '${agentName}' not found`);
        }
        return subAgent.run(message, context, sessionState);
    }
    /**
     * Add a sub-agent
     */
    addSubAgent(agent) {
        this.subAgents.push(agent);
    }
    /**
     * Remove a sub-agent
     */
    removeSubAgent(agentName) {
        const index = this.subAgents.findIndex(agent => agent.name === agentName);
        if (index !== -1) {
            this.subAgents.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get sub-agent names
     */
    getSubAgentNames() {
        return this.subAgents.map(agent => agent.name);
    }
    /**
     * Get canonical global instruction
     */
    async canonicalGlobalInstruction(context) {
        return {
            instruction: this.globalInstruction || '',
            bypassStateInjection: false
        };
    }
    /**
     * Get canonical instruction
     */
    async canonicalInstruction(context) {
        return {
            instruction: this.instruction || '',
            bypassStateInjection: false
        };
    }
}
exports.LlmAgent = LlmAgent;
/**
 * Convenience alias for LlmAgent
 */
exports.Agent = LlmAgent;
//# sourceMappingURL=llm-agent.js.map