import { jest } from '@jest/globals';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.ADK_LOG_LEVEL = 'error'; // Reduce log noise in tests
  
  // Mock console methods to reduce noise
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  
  // Keep console.error for debugging
  // jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

afterAll(() => {
  // Global cleanup
  jest.restoreAllMocks();
});

// Global test utilities
global.testUtils = {
  // Mock API responses
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  }),
  
  // Create mock agent
  createMockAgent: () => ({
    name: 'test-agent',
    description: 'Test agent',
    instruction: 'You are a test agent',
    run: jest.fn(),
  }),
  
  // Create mock model
  createMockModel: () => ({
    generateContent: jest.fn(),
    generateStreamingContent: jest.fn(),
    countTokens: jest.fn(),
  }),
  
  // Create mock tool
  createMockTool: () => ({
    name: 'test-tool',
    description: 'Test tool',
    execute: jest.fn(),
    getDefinition: jest.fn(),
  }),
  
  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create test session state
  createTestSessionState: () => ({
    messages: [],
    metadata: {},
  }),
  
  // Create test invocation context
  createTestContext: () => ({
    sessionId: 'test-session',
    userId: 'test-user',
    timestamp: new Date(),
  }),
};

// Extend Jest matchers
expect.extend({
  toBeValidContent(received) {
    const pass = received && 
                 typeof received === 'object' && 
                 'role' in received && 
                 'parts' in received &&
                 Array.isArray(received.parts);
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid content`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid content`,
        pass: false,
      };
    }
  },
  
  toBeValidToolDefinition(received) {
    const pass = received && 
                 typeof received === 'object' && 
                 'name' in received && 
                 'description' in received &&
                 'parameters' in received;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid tool definition`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid tool definition`,
        pass: false,
      };
    }
  },
});

// Type declarations for global utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidContent(): R;
      toBeValidToolDefinition(): R;
    }
  }
  
  var testUtils: {
    mockApiResponse: (data: any, status?: number) => any;
    createMockAgent: () => any;
    createMockModel: () => any;
    createMockTool: () => any;
    waitFor: (ms: number) => Promise<void>;
    createTestSessionState: () => any;
    createTestContext: () => any;
  };
}