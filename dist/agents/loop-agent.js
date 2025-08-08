"use strict";
/**
 * Loop Agent implementation for the ADK JavaScript SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoopAgent = void 0;
const base_agent_1 = require("./base-agent");
const events_1 = require("../events");
/**
 * Loop agent that runs an agent multiple times based on conditions
 */
class LoopAgent extends base_agent_1.BaseAgent {
    constructor(config) {
        super(config);
        this.agent = config.agent;
        this.maxIterations = config.maxIterations ?? 10;
        this.condition = config.condition;
        this.updateMessage = config.updateMessage;
    }
    /**
     * Run agent in a loop
     */
    async run(message, context, sessionState) {
        return this.runGenerator(message, context, sessionState);
    }
    async *runGenerator(message, context, sessionState) {
        const startTime = new Date();
        let iteration = 0;
        let lastResponse;
        let currentMessage = message;
        // Emit start event
        yield {
            type: events_1.EventType.AGENT_START,
            agentName: this.name,
            message,
            context,
            timestamp: startTime
        };
        try {
            while (iteration < this.maxIterations) {
                // Check condition if provided
                if (this.condition) {
                    const shouldContinue = await this.condition(iteration, lastResponse, context);
                    if (!shouldContinue) {
                        break;
                    }
                }
                // Emit iteration start
                yield {
                    type: events_1.EventType.ITERATION_START,
                    iteration,
                    context,
                    timestamp: new Date(),
                    data: { message: currentMessage }
                };
                // Update message if function provided
                if (this.updateMessage) {
                    currentMessage = this.updateMessage(iteration, lastResponse, message);
                }
                // Run the agent
                const agentGenerator = await this.agent.run(currentMessage, context, sessionState);
                for await (const event of agentGenerator) {
                    yield event;
                    if (event.type === events_1.EventType.AGENT_END) {
                        lastResponse = event.response;
                    }
                }
                // Emit iteration end
                yield {
                    type: events_1.EventType.ITERATION_END,
                    iteration,
                    context,
                    timestamp: new Date(),
                    data: { response: lastResponse }
                };
                iteration++;
            }
            // Use last response or create default
            const finalResponse = lastResponse || {
                role: 'assistant',
                parts: [{ type: 'text', text: 'No response generated' }]
            };
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
     * Set the loop condition
     */
    setCondition(condition) {
        this.condition = condition;
    }
    /**
     * Set the message update function
     */
    setMessageUpdater(updater) {
        this.updateMessage = updater;
    }
    /**
     * Set maximum iterations
     */
    setMaxIterations(max) {
        this.maxIterations = max;
    }
    /**
     * Get the wrapped agent
     */
    getAgent() {
        return this.agent;
    }
}
exports.LoopAgent = LoopAgent;
//# sourceMappingURL=loop-agent.js.map