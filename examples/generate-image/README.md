# Image Generation Agent Example

This example demonstrates how to use the ADK to generate images using Google's Imagen AI model.

## Features

- AI-powered image generation from text descriptions
- Customizable image parameters (format, aspect ratio, safety filters)
- Automatic image saving as artifacts
- Interactive mode for multiple image generations
- Support for various aspect ratios and safety settings

## Setup

### Prerequisites

1. Google Cloud Project with Vertex AI API enabled, OR Google AI Studio API key
2. Node.js and npm installed
3. Appropriate authentication credentials

### Authentication

#### Option 1: Google AI Studio (Recommended for development)

```bash
export GOOGLE_AI_STUDIO_API_KEY="your-api-key"
```

#### Option 2: Google Cloud Vertex AI

```bash
# Install Google Cloud CLI and authenticate
gcloud auth application-default login

# Set required environment variables
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"
export GOOGLE_CLOUD_LOCATION="us-central1"
```

## Running the Example

```bash
# Install dependencies
npm install

# Run the example
npm run start
```

## Usage

The example will:

1. Generate a sample landscape image
2. Enter interactive mode where you can describe images to generate
3. Save all generated images to the `generated-images/` directory

### Example Prompts

- "A futuristic cityscape at night with neon lights"
- "A cute cartoon cat wearing a wizard hat"
- "An abstract painting with vibrant colors and geometric shapes"
- "A professional headshot of a business person"
- "A fantasy dragon flying over a medieval castle"

## Configuration Options

You can customize the image generation by modifying the `ImageGenerationTool` configuration:

```typescript
new ImageGenerationTool({
  outputFormat: 'PNG', // 'PNG' or 'JPEG'
  aspectRatio: '1:1',  // '1:1', '9:16', '16:9', '4:3', '3:4'
  safetyFilterLevel: 'block_some', // 'block_most', 'block_some', 'block_few'
  personGeneration: 'allow_adult'  // 'dont_allow', 'allow_adult', 'allow_all'
})
```

### Aspect Ratios

- `1:1` - Square (1024x1024)
- `9:16` - Portrait (768x1344)
- `16:9` - Landscape (1344x768)
- `4:3` - Standard (1152x896)
- `3:4` - Portrait (896x1152)

### Safety Filter Levels

- `block_most` - Strictest filtering
- `block_some` - Moderate filtering (default)
- `block_few` - Minimal filtering

### Person Generation

- `dont_allow` - No people in images
- `allow_adult` - Allow adult people (default)
- `allow_all` - Allow people of all ages

## Output

Generated images are saved in the `generated-images/` directory with timestamps in the filename. The agent will also provide descriptions of the generated images.

## Error Handling

Common issues and solutions:

1. **Authentication Error**: Verify your API key or Google Cloud credentials
2. **API Not Enabled**: Enable the Vertex AI API in Google Cloud Console
3. **Content Policy Violation**: Adjust your prompt to comply with content policies
4. **Quota Exceeded**: Check your API usage limits

## Content Policies

Please ensure your image generation requests comply with Google's AI content policies:

- No harmful, illegal, or inappropriate content
- Respect copyright and intellectual property
- Follow safety and ethical guidelines

## Tips for Better Results

1. **Be Descriptive**: Include details about style, lighting, composition
2. **Specify Style**: Mention artistic styles ("photorealistic", "cartoon", "oil painting")
3. **Include Context**: Describe the setting, mood, and atmosphere
4. **Use Adjectives**: Colors, textures, and emotional descriptors help
5. **Iterate**: Try variations of prompts to get the desired result