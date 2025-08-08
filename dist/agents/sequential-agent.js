"use strict";
/**
 * Sequential Agent implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentialAgent = void 0;
const base_agent_1 = require("./base-agent");
const events_1 = require("../events");
/**
 * Sequential agent that runs multiple agents in sequence
 */
class SequentialAgent extends base_agent_1.BaseAgent {
    constructor(config) {
        super(config);
        this.agents = config.agents;
        this.passResults = config.passResults ?? true;
    }
    /**
     * Run agents sequentially
     */
    async run(message, context, sessionState) {
        return this.runGenerator(message, context, sessionState);
    }
    async *runGenerator(message, context, sessionState) {
        const startTime = new Date();
        let currentMessage = message;
        let finalResponse = {
            role: 'assistant',
            parts: []
        };
        // Emit start event
        yield {
            type: events_1.EventType.AGENT_START,
            agentName: this.name,
            message,
            context,
            timestamp: startTime
        };
        try {
            for (let i = 0; i < this.agents.length; i++) {
                const agent = this.agents[i];
                // Run the agent
                const agentGenerator = await agent.run(currentMessage, context, sessionState);
                let agentResponse;
                for await (const event of agentGenerator) {
                    yield event;
                    if (event.type === events_1.EventType.AGENT_END) {
                        agentResponse = event.response;
                    }
                }
                if (agentResponse) {
                    // Combine responses
                    finalResponse.parts.push(...agentResponse.parts);
                    // Pass result to next agent if enabled
                    if (this.passResults && i < this.agents.length - 1) {
                        currentMessage = agentResponse;
                    }
                }
            }
            // Emit end event
            yield {
                type: events_1.EventType.AGENT_END,
                agentName: this.name,
                response: finalResponse,
                context,
                timestamp: new Date(),
                duration: Date.now() - startTime.getTime()
            };
        }
        catch (error) {
            yield {
                type: events_1.EventType.ERROR,
                error: error instanceof Error ? error : new Error(String(error)),
                context,
                timestamp: new Date(),
                source: this.name
            };
            throw error;
        }
    }
    /**
     * Add an agent to the sequence
     */
    addAgent(agent) {
        this.agents.push(agent);
    }
    /**
     * Remove an agent from the sequence
     */
    removeAgent(agentName) {
        const index = this.agents.findIndex(agent => agent.name === agentName);
        if (index !== -1) {
            this.agents.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get all agents in the sequence
     */
    getAgents() {
        return [...this.agents];
    }
}
exports.SequentialAgent = SequentialAgent;
//# sourceMappingURL=sequential-agent.js.map