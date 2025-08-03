import { LlmAgent } from '../../src';
import { VertexAiRagRetrieval } from '../../src/tools';

// Configure RAG agent
export const ragAgent = new LlmAgent({
  model: 'gemini-2.0-flash-001',
  name: 'rag-agent',
  description: 'An AI assistant that provides accurate answers using Retrieval-Augmented Generation',
  tools: [
    new VertexAiRagRetrieval({
      name: 'vertex_ai_rag',
      description: 'Retrieve information from Vertex AI RAG corpus',
      ragCorpora: [process.env.VERTEX_AI_RAG_CORPUS_ID || 'your-corpus-id'],
      similarityTopK: 5,
      vectorDistanceThreshold: 0.7
    })
  ],
  instruction: `You are a helpful assistant that provides accurate and concise answers based on retrieved documentation.

When answering questions:
1. Use the RAG retrieval tool to find relevant information from the knowledge base
2. Base your answers primarily on the retrieved documents
3. If the retrieved information doesn't fully answer the question, clearly state what information is missing
4. Provide specific references to the source documents when possible
5. If no relevant information is found, clearly state that the answer is not available in the knowledge base

Always be honest about the limitations of the available information and provide the most accurate response possible based on the retrieved context.`
});

// Helper function to create a RAG corpus (for setup)
export async function createRagCorpus(corpusName: string, description: string) {
  console.log('Creating RAG corpus...');
  console.log('Note: This is a simplified example. Use the Vertex AI console or API for full corpus management.');
  
  // This would typically involve calling the Vertex AI RAG API
  // For now, we'll just provide instructions
  console.log(`\nTo create a RAG corpus named "${corpusName}":`);
  console.log('1. Go to the Vertex AI console');
  console.log('2. Navigate to "Agent Builder" > "Data Stores"');
  console.log('3. Create a new data store');
  console.log('4. Upload your documents');
  console.log('5. Note the corpus ID for use in this example');
}

// Helper function to upload documents (for setup)
export async function uploadDocuments(corpusId: string, documentPaths: string[]) {
  console.log(`Uploading documents to corpus ${corpusId}...`);
  console.log('Note: Use the Vertex AI console or API for document upload.');
  
  documentPaths.forEach((path, index) => {
    console.log(`${index + 1}. ${path}`);
  });
  
  console.log('\nDocuments should be uploaded through:');
  console.log('1. Vertex AI console');
  console.log('2. Vertex AI RAG API');
  console.log('3. Google Cloud Storage (for batch uploads)');
}