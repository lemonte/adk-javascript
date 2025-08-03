# RAG Agent Example

This example demonstrates how to use Retrieval-Augmented Generation (RAG) with the ADK and Vertex AI to create an AI agent that can answer questions based on your own knowledge base.

## What is RAG?

Retrieval-Augmented Generation (RAG) combines the power of large language models with your own documents and data. Instead of relying solely on the model's training data, RAG:

1. **Retrieves** relevant information from your knowledge base
2. **Augments** the AI's response with this retrieved context
3. **Generates** accurate answers based on your specific documents

## Features

- Query your own document corpus using natural language
- Retrieve relevant documents with similarity scoring
- Generate answers based on retrieved context
- Interactive chat mode for testing
- Configurable retrieval parameters

## Files

- `agent.ts` - Defines the RAG agent with Vertex AI RAG retrieval tool
- `index.ts` - Main example runner with demo queries and interactive mode
- `package.json` - Project configuration
- `.env.example` - Environment variables template

## Prerequisites

1. Google Cloud Project with Vertex AI API enabled
2. A RAG corpus created in Vertex AI
3. Documents uploaded to your corpus
4. Google Cloud authentication set up

## Setup

### Step 1: Create a RAG Corpus

1. Go to the [Vertex AI console](https://console.cloud.google.com/vertex-ai)
2. Navigate to "Agent Builder" > "Data Stores"
3. Click "Create Data Store"
4. Choose your data source (Cloud Storage, websites, etc.)
5. Upload your documents
6. Note the corpus ID for configuration

### Step 2: Authentication

```bash
# Install Google Cloud CLI and authenticate
gcloud auth application-default login
```

### Step 3: Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your configuration:
   ```
   GOOGLE_API_KEY=your_google_api_key
   VERTEX_AI_RAG_CORPUS_ID=your-corpus-id
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   ```

### Step 4: Run the Example

```bash
npm start
```

## What it does

The example:

1. **Demo Mode**: Runs two predefined test queries to demonstrate RAG functionality
2. **Interactive Mode**: Allows you to ask questions and get answers from your knowledge base

The agent uses the `VertexAiRagRetrieval` tool to:
- Search through your document corpus
- Retrieve the most relevant documents (top 5 by default)
- Use retrieved context to generate accurate answers

## Configuration

You can customize the RAG retrieval in `agent.ts`:

```typescript
new VertexAiRagRetrieval({
  name: 'vertex_ai_rag',
  description: 'Retrieve information from Vertex AI RAG corpus',
  ragCorpora: [process.env.VERTEX_AI_RAG_CORPUS_ID],
  similarityTopK: 5,              // Number of documents to retrieve
  vectorDistanceThreshold: 0.7    // Minimum similarity score (0-1)
})
```

### Parameters

- **ragCorpora**: Array of corpus IDs to search
- **similarityTopK**: Number of most relevant documents to retrieve (1-100)
- **vectorDistanceThreshold**: Minimum similarity score for relevance (0.0-1.0)

## Example Queries

- "What information do you have available?"
- "Search for documentation about getting started"
- "Tell me about the main features and capabilities"
- "How do I configure authentication?"
- "What are the system requirements?"

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Google Cloud credentials: `gcloud auth list`
   - Check project permissions
   - Ensure Vertex AI API is enabled

2. **Corpus Not Found**
   - Verify the corpus ID in your `.env` file
   - Check the project and location
   - Ensure the corpus exists and is accessible

3. **No Results Found**
   - Check if documents are properly indexed
   - Lower the `vectorDistanceThreshold`
   - Try different query phrasing
   - Verify documents were uploaded successfully

4. **Poor Quality Results**
   - Improve document quality and structure
   - Add more relevant documents
   - Adjust retrieval parameters

## Document Types Supported

- **Text files**: .txt, .md
- **Documents**: .pdf, .docx
- **Web content**: .html, .htm
- **Structured data**: .json, .csv
- **Code files**: .py, .js, .java, etc.

## Best Practices

### Document Preparation

1. **Clean Text**: Remove unnecessary formatting and noise
2. **Chunk Size**: Break large documents into logical sections
3. **Metadata**: Add relevant metadata for filtering
4. **Consistent Format**: Use consistent formatting across documents

### Query Optimization

1. **Be Specific**: More specific queries yield better results
2. **Use Keywords**: Include important keywords from your domain
3. **Context**: Provide context when asking follow-up questions
4. **Iterate**: Refine queries based on initial results