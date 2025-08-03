import { BaseAgent } from '../base-agent';
import { BaseTool } from '../../tools/base-tool';
import { Plugin } from '../../types';

// Mock implementation of BaseAgent for testing
class TestAgent extends BaseAgent {
  async run(message: any, sessionState: any, context: any): Promise<any> {
    return {
      response: {
        role: 'assistant',
        parts: [{ type: 'text', text: 'Test response' }],
      },
      sessionState,
      metadata: { iterations: 1 },
    };
  }
}

// Mock tool for testing
class MockTool extends BaseTool {
  constructor() {
    super({
      name: 'mock_tool',
      description: 'A mock tool for testing',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string' },
        },
        required: ['input'],
      },
    });
  }

  async execute(args: { input: string }): Promise<string> {
    return `Mock result: ${args.input}`;
  }

  async initialize(): Promise<void> {
    // Mock initialization
  }
}

// Mock plugin for testing
const mockPlugin: Plugin = {
  name: 'mock_plugin',
  version: '1.0.0',
  beforeAgentRun: jest.fn(),
  afterAgentRun: jest.fn(),
  beforeToolCall: jest.fn(),
  afterToolCall: jest.fn(),
  onError: jest.fn(),
};

describe('BaseAgent', () => {
  let agent: TestAgent;
  let mockTool: MockTool;

  beforeEach(() => {
    mockTool = new MockTool();
    agent = new TestAgent({
      name: 'test-agent',
      description: 'A test agent',
      instruction: 'You are a test agent',
      tools: [mockTool],
      plugins: [mockPlugin],
      metadata: { version: '1.0.0' },
    });
  });

  describe('constructor', () => {
    it('should create an agent with basic configuration', () => {
      expect(agent.name).toBe('test-agent');
      expect(agent.description).toBe('A test agent');
      expect(agent.instruction).toBe('You are a test agent');
      expect(agent.tools).toHaveLength(1);
      expect(agent.plugins).toHaveLength(1);
      expect(agent.metadata).toEqual({ version: '1.0.0' });
    });

    it('should create an agent with minimal configuration', () => {
      const minimalAgent = new TestAgent({
        name: 'minimal-agent',
        instruction: 'Minimal instruction',
      });

      expect(minimalAgent.name).toBe('minimal-agent');
      expect(minimalAgent.description).toBeUndefined();
      expect(minimalAgent.instruction).toBe('Minimal instruction');
      expect(minimalAgent.tools).toHaveLength(0);
      expect(minimalAgent.plugins).toHaveLength(0);
      expect(minimalAgent.metadata).toEqual({});
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration during construction', () => {
      expect(() => {
        new TestAgent({
          name: 'valid-agent',
          instruction: 'Valid instruction',
        });
      }).not.toThrow();
    });

    it('should throw error for missing name', () => {
      expect(() => {
        new TestAgent({
          instruction: 'Valid instruction',
        } as any);
      }).toThrow();
    });

    it('should throw error for empty name', () => {
      expect(() => {
        new TestAgent({
          name: '',
          instruction: 'Valid instruction',
        });
      }).toThrow();
    });
  });

  describe('getTool', () => {
    it('should get a tool by name', () => {
      const tool = (agent as any).getTool('mock_tool');
      expect(tool).toBeInstanceOf(MockTool);
    });

    it('should return undefined for non-existent tool', () => {
      const tool = (agent as any).getTool('non_existent');
      expect(tool).toBeUndefined();
    });
  });

  describe('plugin integration', () => {
    it('should have plugins configured', () => {
      expect(agent.plugins).toHaveLength(1);
      expect(agent.plugins[0]).toBe(mockPlugin);
    });

    it('should call executePluginCallbacks for beforeAgentRun', async () => {
      const spy = jest.spyOn(agent as any, 'executePluginCallbacks');
      await (agent as any).executePluginCallbacks('beforeAgentRun', {}, {});
      expect(spy).toHaveBeenCalledWith('beforeAgentRun', {}, {});
    });

    it('should handle missing plugin callbacks gracefully', async () => {
      const incompletePlugin: Plugin = {
        name: 'incomplete_plugin',
        version: '1.0.0',
      };

      const agentWithIncompletePlugin = new TestAgent({
        name: 'test-agent',
        instruction: 'Test instruction',
        plugins: [incompletePlugin],
      });

      // Should not throw when plugin doesn't have the callback
      await expect(
        (agentWithIncompletePlugin as any).executePluginCallbacks('beforeAgentRun', {})
      ).resolves.toBeUndefined();
    });
  });

  describe('initialize', () => {
    it('should initialize agent and tools', async () => {
      const initializeSpy = jest.spyOn(mockTool, 'initialize');
      
      await agent.initialize();
      
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should handle tool initialization errors gracefully', async () => {
      const toolWithFailingInit = new MockTool();
      jest.spyOn(toolWithFailingInit, 'initialize').mockRejectedValue(new Error('Init error'));
      
      const agentWithFailingTool = new TestAgent({
        name: 'test-agent',
        instruction: 'Test instruction',
        tools: [toolWithFailingInit],
      });
      
      // Should not throw, but handle gracefully
      await expect(agentWithFailingTool.initialize()).resolves.toBeUndefined();
    });
  });

  describe('initialize', () => {
    it('should initialize the agent', async () => {
      const initializeSpy = jest.spyOn(agent, 'initialize');
      await agent.initialize();
      expect(initializeSpy).toHaveBeenCalled();
    });

    it('should initialize plugins and tools', async () => {
      const pluginInitSpy = jest.fn();
      const toolInitSpy = jest.fn();
      
      const pluginWithInit: Plugin = {
        name: 'test_plugin',
        version: '1.0.0',
        initialize: pluginInitSpy,
      };
      
      const toolWithInit = new MockTool();
      toolWithInit.initialize = toolInitSpy;
      
      const agentWithInits = new TestAgent({
        name: 'test-agent',
        instruction: 'Test instruction',
        plugins: [pluginWithInit],
        tools: [toolWithInit],
      });
      
      await agentWithInits.initialize();
      expect(pluginInitSpy).toHaveBeenCalled();
      expect(toolInitSpy).toHaveBeenCalled();
    });
  });

  describe('getInfo', () => {
    it('should return agent information', () => {
      const info = agent.getInfo();
      
      expect(info).toEqual({
        name: 'test-agent',
        description: 'A test agent',
        instruction: 'You are a test agent',
        metadata: { version: '1.0.0' },
        tools: ['mock_tool'],
        plugins: ['mock_plugin'],
      });
    });
  });

  describe('run', () => {
    it('should run the agent successfully', async () => {
      const message = {
        role: 'user',
        parts: [{ type: 'text', text: 'Hello' }],
      };
      const sessionState = { messages: [], metadata: {} };
      const context = { sessionId: 'test', userId: 'user' };

      const result = await agent.run(message, sessionState, context);

      expect(result).toEqual({
        response: {
          role: 'assistant',
          parts: [{ type: 'text', text: 'Test response' }],
        },
        sessionState,
        metadata: { iterations: 1 },
      });
    });
  });
});