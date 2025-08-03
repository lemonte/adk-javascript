# Code Execution Example

This example demonstrates how to use the ADK JavaScript library with code execution capabilities. It shows how an AI agent can write, execute, and analyze JavaScript code to solve data analysis and computational problems.

## Features

- **Code Execution**: AI agent can write and execute JavaScript code
- **Data Analysis**: Process and analyze data using code
- **Mathematical Computations**: Perform complex calculations
- **Interactive Problem Solving**: Step-by-step code generation and execution
- **Stateful Environment**: Variables persist across code executions

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and configure your API key:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Google AI API key:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

## Running the Example

```bash
npm start
```

## What It Does

1. **Mathematical Calculations**: Computes factorial of 10
2. **Sequence Generation**: Creates Fibonacci number sequences
3. **Data Processing**: Analyzes sales data from JSON objects
4. **Data Analysis**: Performs statistical analysis and comparisons
5. **Algorithm Implementation**: Generates prime number algorithms

## Example Queries

The example demonstrates various types of computational tasks:

- **Factorial Calculation**: `Calculate the factorial of 10 using JavaScript`
- **Fibonacci Sequence**: `Create an array of the first 20 Fibonacci numbers`
- **Data Analysis**: Processing sales data and calculating totals/averages
- **Prime Numbers**: Finding all prime numbers up to a given limit

## Expected Output

The example will show:
- User queries
- AI agent's reasoning and approach
- Generated JavaScript code
- Code execution results
- Analysis and conclusions

## Key Concepts

- **Code Execution Environment**: How AI agents can execute code safely
- **Stateful Programming**: Variables and functions persist between executions
- **Data Processing**: Using code to analyze and transform data
- **Interactive Development**: AI writing code step-by-step
- **Problem Decomposition**: Breaking complex problems into smaller steps

## Use Cases

This example is particularly useful for:
- **Data Analysis**: Processing and analyzing datasets
- **Mathematical Computations**: Complex calculations and algorithms
- **Prototyping**: Quick code generation and testing
- **Educational Tools**: Learning programming concepts
- **Business Intelligence**: Automated data processing and reporting

## Safety and Limitations

- Code execution is sandboxed for security
- No access to file system or network operations
- Limited to computational and data processing tasks
- Cannot install external packages during execution

This example showcases the power of combining AI reasoning with code execution capabilities, enabling sophisticated data analysis and computational problem-solving.