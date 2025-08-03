# Sequential Workflow Agent Example

This example demonstrates how to create and orchestrate a sequential workflow of multiple agents in the ADK JavaScript framework. The workflow implements a code development pipeline with three specialized agents working in sequence.

## Workflow Overview

The example implements a 3-step sequential workflow:

1. **📝 Code Generation** - `CodeWriterAgent` generates initial Python code based on user requirements
2. **🔍 Code Review** - `CodeReviewerAgent` reviews the generated code and provides constructive feedback
3. **🔧 Code Refactoring** - `CodeRefactorerAgent` improves the code based on review comments

## Features

- **Sequential Agent Execution**: Demonstrates how to chain multiple agents together
- **State Management**: Shows how to pass data between agents in a workflow
- **Specialized Agents**: Each agent has a specific role and expertise
- **Comprehensive Logging**: Detailed output showing each step of the workflow
- **Error Handling**: Robust error handling throughout the workflow

## Agents

### 1. CodeWriterAgent
- **Model**: `gemini-1.5-flash`
- **Purpose**: Generate initial Python code based on specifications
- **Input**: User requirements/specifications
- **Output**: Complete Python code block

### 2. CodeReviewerAgent
- **Model**: `gemini-2.0-flash`
- **Purpose**: Review code for correctness, readability, efficiency, and best practices
- **Input**: Generated Python code
- **Output**: Constructive feedback and improvement suggestions

### 3. CodeRefactorerAgent
- **Model**: `gemini-2.0-flash`
- **Purpose**: Improve code based on review feedback
- **Input**: Original code + review comments
- **Output**: Refactored and improved Python code

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and fill in your API key:
   ```bash
   cp .env.example .env
   ```

   Required variables:
   - `GOOGLE_API_KEY`: Your Google AI API key for Gemini

## Usage

Run the example:
```bash
npm start
```

The workflow will demonstrate:
- Two complete code development workflows
- Step-by-step execution with detailed logging
- State management between agents
- Final summary of each workflow

## Example Workflows

The example includes two demonstration workflows:

1. **Factorial Function**: Create a Python function that calculates the factorial of a number
2. **Calculator Class**: Write a Python class for a simple calculator with basic operations

## Workflow Output

Each workflow provides:
- **Generated Code**: Initial code created by the CodeWriterAgent
- **Review Comments**: Feedback from the CodeReviewerAgent
- **Refactored Code**: Improved code from the CodeRefactorerAgent
- **Execution Summary**: Statistics and completion status

## Key Concepts

### Sequential Execution
Agents execute in a predefined order, with each agent processing the output from the previous agent.

### State Management
The `SequentialWorkflow` class manages state between agents:
```typescript
workflow.setState('generated_code', generatedCode);
const code = workflow.getStateValue('generated_code');
```

### Agent Specialization
Each agent is optimized for a specific task:
- Different models for different complexity levels
- Specialized instructions for each role
- Clear input/output expectations

## Use Cases

This pattern is useful for:
- **Code Development Pipelines**: Generation, review, testing, deployment
- **Content Creation Workflows**: Writing, editing, proofreading, formatting
- **Data Processing Pipelines**: Collection, cleaning, analysis, reporting
- **Quality Assurance Processes**: Creation, validation, improvement, approval

## Extension Ideas

- Add a **Code Testing Agent** to write and run unit tests
- Include a **Documentation Agent** to generate code documentation
- Add a **Performance Analysis Agent** to optimize code performance
- Implement **Parallel Workflows** for independent tasks
- Add **Conditional Branching** based on agent outputs

## Implementation Notes

- **Error Handling**: Each step includes try-catch blocks for robust execution
- **Logging**: Comprehensive logging with emoji indicators for easy reading
- **Modularity**: Each agent is independently defined and reusable
- **Flexibility**: Easy to add, remove, or reorder workflow steps

This example demonstrates the power of sequential agent workflows for complex, multi-step tasks that benefit from specialized expertise at each stage.