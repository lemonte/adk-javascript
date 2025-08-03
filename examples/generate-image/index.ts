// Load environment variables from .env file
import * as dotenv from 'dotenv';
dotenv.config({ override: true });

import {
  Agent,
  InMemoryRunner,
  createTool,
  logger,
  LogLevel
} from '../../src';

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Configure logging
logger.setLevel(LogLevel.INFO);

// Create a mock image generation tool for demonstration
const imageGenerationTool = createTool(
  async function generateImage(prompt: string, aspectRatio?: string): Promise<string> {
    logger.info(`Generating image with prompt: "${prompt}"`);
    
    // Simulate image generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create output directory if it doesn't exist
    const outputDir = './generated-images';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate a simple SVG image as demonstration
    const timestamp = Date.now();
    const filename = `generated-image-${timestamp}.svg`;
    const filepath = path.join(outputDir, filename);
    
    // Create a simple SVG with the prompt text
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <rect x="50" y="50" width="412" height="412" fill="#e0e0e0" stroke="#ccc" stroke-width="2"/>
  <text x="256" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#333">
    Generated Image
  </text>
  <text x="256" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
    Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}
  </text>
  <text x="256" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
    Aspect Ratio: ${aspectRatio || '1:1'}
  </text>
  <text x="256" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#555">
    🎨 Mock Image Generation
  </text>
  <text x="256" y="350" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">
    This is a demonstration. In a real implementation,
  </text>
  <text x="256" y="370" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#888">
    this would be an actual generated image.
  </text>
</svg>`;
    
    fs.writeFileSync(filepath, svgContent);
    
    return `Image generated successfully!\n\nDetails:\n- Prompt: "${prompt}"\n- Aspect Ratio: ${aspectRatio || '1:1'}\n- Format: SVG\n- File: ${filename}\n- Path: ${filepath}\n\nThe image has been saved to the generated-images directory.`;
  },
  {
    name: 'generate_image',
    description: 'Generate an image based on a text prompt',
    parameters: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Text description of the image to generate'
        },
        aspectRatio: {
          type: 'string',
          description: 'Aspect ratio for the image (1:1, 16:9, 9:16, 4:3, 3:4)',
          enum: ['1:1', '16:9', '9:16', '4:3', '3:4'],
          default: '1:1'
        }
      },
      required: ['prompt']
    }
  }
);

// Configure image generation agent
const imageAgent = new Agent({
  model: 'gemini-2.0-flash-exp',
  name: 'image_generation_agent',
  description: 'An AI agent that can generate images based on text descriptions.',
  tools: [imageGenerationTool],
  instruction: `You are an AI assistant specialized in generating images based on user descriptions.

When a user requests an image:
1. Understand their requirements clearly
2. Create a detailed, descriptive prompt for image generation
3. Use the image generation tool to create the image
4. Save the generated image as an artifact
5. Provide a brief description of what was generated

Be creative and helpful in interpreting user requests, but always follow content policies and safety guidelines.`
});

async function saveImageArtifact(imageData: string, filename: string): Promise<string> {
  const outputDir = path.join(__dirname, 'generated-images');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  
  // Convert base64 to buffer and save
  const buffer = Buffer.from(imageData, 'base64');
  fs.writeFileSync(filepath, buffer);
  
  return filepath;
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function runInteractiveMode() {
  console.log('🚀 ADK Image Generation Example');
  console.log('=================================');
  console.log('');
  console.log('This example demonstrates AI-powered image generation.');
  console.log('Describe what you want to see, and the AI will generate an image for you.');
  console.log('');
  console.log('Example prompts:');
  console.log('  • "A serene mountain landscape at sunset"');
  console.log('  • "A cute robot playing with a cat"');
  console.log('  • "Abstract art with vibrant colors and geometric shapes"');
  console.log('  • "A futuristic city with flying cars"');
  console.log('');
  console.log('Type "exit" to quit.');
  console.log('');
  
  // Create a runner
  const runner = new InMemoryRunner(imageAgent, {
    maxIterations: 5,
    enableLogging: true
  });
  
  // Set up event listeners
  runner.on('run_start', (event) => {
    logger.info('Run started', event.data);
  });
  
  runner.on('tool_call', (event) => {
    logger.info('Tool called', event.data);
  });
  
  runner.on('run_complete', (event) => {
    logger.info('Run completed', event.data);
  });
  
  while (true) {
    let userInput: string;
    
    try {
      userInput = await new Promise<string>((resolve, reject) => {
        rl.question('You: ', resolve);
        rl.on('close', () => reject(new Error('readline closed')));
      });
    } catch (error) {
      // Handle readline being closed (e.g., when using pipes)
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      break;
    }
    
    if (userInput.trim() === '') {
      continue;
    }
    
    try {
      console.log('\n🎨 Agent: Creating your image...');
      
      // Create session state
      const sessionState = {
        messages: [],
        metadata: {
          createdAt: new Date().toISOString(),
          example: 'generate-image'
        }
      };

      // Create invocation context
      const context = {
        sessionId: 'image-session',
        userId: 'example-user',
        appName: 'image-app',
        agentName: 'image-agent',
        requestId: `image-request-${Date.now()}`,
        timestamp: new Date(),
        metadata: {
          source: 'image-generation-example'
        },
        agent: imageAgent,
        session: {
          id: 'image-session',
          appName: 'image-app',
          userId: 'example-user',
          state: sessionState,
          events: [],
          lastUpdateTime: Date.now()
        },
        invocationId: `image-invocation-${Date.now()}`
      };

      // Create message
      const message = {
        role: 'user' as const,
        parts: [{
          type: 'text' as const,
          text: userInput
        }]
      };
      
      const result = await runner.run(message, sessionState, context);
      
      // Extract the response text
      const responseText = result.response.parts
        .filter(part => part.type === 'text')
        .map(part => (part as any).text)
        .join('');
      
      console.log('\n🎨 Agent:', responseText);
      
    } catch (error) {
      console.error('\n❌ Error:', (error as Error).message);
    }
    
    console.log('');
  }
  
  rl.close();
}

async function main() {
  try {
    await runInteractiveMode();
  } catch (error) {
    console.error('Error running image generation agent:', error);
    console.log('\nMake sure you have:');
    console.log('1. Set up Google Cloud credentials or Google AI Studio API key');
    console.log('2. Enabled the Vertex AI API (for Google Cloud)');
    console.log('3. Set the appropriate environment variables');
  }
}

if (require.main === module) {
  main();
}

export { imageAgent };