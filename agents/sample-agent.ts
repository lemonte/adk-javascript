import { Agent } from '../src/index';

// Sample Agent Configuration
export const sampleAgent = new Agent({
  name: 'Sample Agent',
  description: 'A simple example agent that demonstrates basic functionality',
  instruction: 'You are a helpful assistant. Always be polite and professional. Provide clear and concise answers.',
  model: 'gemini-1.5-flash',
  tools: [
    // Add tools here as needed
  ]
});

export default sampleAgent;
