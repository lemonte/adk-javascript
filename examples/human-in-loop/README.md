# Human-in-the-Loop Example

This example demonstrates how to implement human-in-the-loop workflows using the ADK JavaScript library. It shows how to handle scenarios where an AI agent needs human approval before proceeding with certain actions.

## Features

- **Long-Running Tools**: Uses tools that require external approval
- **Conditional Logic**: Automatic approval for small amounts, human approval for larger amounts
- **Event Handling**: Captures and processes tool calls and responses
- **Approval Simulation**: Simulates external approval processes
- **Reimbursement Workflow**: Practical example of expense approval

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

1. **Reimbursement Agent**: Creates an agent that handles employee reimbursement requests
2. **Automatic Approval**: Amounts under $100 are automatically approved
3. **Human Approval**: Amounts over $100 require manager approval
4. **Long-Running Tools**: Demonstrates tools that don't complete immediately
5. **Approval Simulation**: Simulates external approval and feeds the result back to the agent

## Workflow

### Small Amount ($50)
- User requests reimbursement for $50
- Agent automatically approves (under $100 threshold)
- Calls `reimburse()` function directly
- Process completes immediately

### Large Amount ($200)
- User requests reimbursement for $200
- Agent calls `askForApproval()` (long-running tool)
- Tool returns pending status with ticket ID
- System simulates manager approval
- Updated approval result is sent back to agent
- Agent calls `reimburse()` function to complete the process

## Expected Output

The example will show:
- User reimbursement requests
- Agent decision-making process
- Tool calls and responses
- Approval workflow simulation
- Final reimbursement actions

## Key Concepts

- **Long-Running Function Tools**: Tools that require external input or approval
- **Event-Driven Architecture**: Using events to capture tool interactions
- **Conditional Workflows**: Different paths based on business rules
- **Human Approval Integration**: How to integrate human decision-making into AI workflows
- **State Management**: Tracking approval status and ticket IDs

This example is particularly useful for building business applications that require approval workflows, compliance checks, or any scenario where human oversight is needed before the AI can proceed with certain actions.