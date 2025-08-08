"use strict";
/**
 * Parallel Agent implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParallelAgent = void 0;
const base_agent_1 = require("./base-agent");
const events_1 = require("../events");
/**
 * Parallel agent that runs multiple agents concurrently
 */
class ParallelAgent extends base_agent_1.BaseAgent {
    constructor(config) {
        super(config);
        this.agents = config.agents;
        this.combineResults = config.combineResults ?? true;
        this.waitForAll = config.waitForAll ?? true;
    }
    /**
     * Run agents in parallel
     */
    async run(message, context, sessionState) {
        return this.runGenerator(message, context, sessionState);
    }
    async *runGenerator(message, context, sessionState) {
        const startTime = new Date();
        const responses = [];
        // Emit start event
        yield {
            type: events_1.EventType.AGENT_START,
            agentName: this.name,
            message,
            context,
            timestamp: startTime
        };
        try {
            // Create promises for all agents
            const agentPromises = this.agents.map(async (agent) => {
                const events = [];
                let response;
                const agentGenerator = await agent.run(message, context, sessionState);
                for await (const event of agentGenerator) {
                    events.push(event);
                    if (event.type === events_1.EventType.AGENT_END) {
                        response = event.response;
                    }
                }
                return { agent, events, response };
            });
            if (this.waitForAll) {
                // Wait for all agents to complete
                const results = await Promise.all(agentPromises);
                // Emit all events in order
                for (const result of results) {
                    for (const event of result.events) {
                        yield event;
                    }
                    if (result.response) {
                        responses.push(result.response);
                    }
                }
            }
            else {
                // Emit events as they come
                const results = await Promise.allSettled(agentPromises);
                for (const result of results) {
                    if (result.status === 'fulfilled') {
                        for (const event of result.value.events) {
                            yield event;
                        }
                        if (result.value.response) {
                            responses.push(result.value.response);
                        }
                    }
                    else {
                        yield {
                            type: events_1.EventType.ERROR,
                            error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
                            context,
                            timestamp: new Date(),
                            source: this.name
                        };
                    }
                }
            }
            // Combine results if enabled
            let finalResponse;
            if (this.combineResults && responses.length > 0) {
                finalResponse = {
                    role: 'assistant',
                    parts: responses.flatMap(response => response.parts)
                };
            }
            else {
                finalResponse = responses[0] || {
                    role: 'assistant',
                    parts: [{ type: 'text', text: 'No responses received' }]
                };
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
     * Add an agent to run in parallel
     */
    addAgent(agent) {
        this.agents.push(agent);
    }
    /**
     * Remove an agent from parallel execution
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
     * Get all agents
     */
    getAgents() {
        return [...this.agents];
    }
}
exports.ParallelAgent = ParallelAgent;
//# sourceMappingURL=parallel-agent.js.map