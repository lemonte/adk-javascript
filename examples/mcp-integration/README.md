# MCP Integration Example

This example demonstrates how to integrate external tools and services using the Model Context Protocol (MCP), enabling the agent to interact with various external systems and APIs.

## What is MCP?

Model Context Protocol (MCP) is a standardized way for AI agents to interact with external tools and services. This example shows how to create simulated MCP tools that can:

- Access file systems
- Make HTTP requests to external APIs
- Query databases
- Execute system commands

## Features

- Simulated MCP tools for demonstration
- File system access with security restrictions
- HTTP API requests with mock responses
- Database queries with simulated data
- System command execution with safe outputs
- Interactive chat mode
- Predefined examples mode

## Files

- `agent.ts` - Defines the MCP agent with simulated tools
- `index.ts` - Main example runner with interactive and examples modes
- `package.json` - Project configuration
- `.env.example` - Environment variables template

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key
   ```

3. Run the example:
   ```bash
   npm start
   ```

## Usage

### Interactive Mode (Default)

Run the example to enter interactive chat mode:

```bash
npm start
```

You can then ask the agent to use various tools:

- "Read the package.json file"
- "Make a GET request to https://api.github.com/users/octocat"
- "Query the users table in the database"
- "List files in the current directory"

### Examples Mode

Run predefined examples to see all tools in action:

```bash
npm start -- --examples
```

This will run four examples demonstrating each tool:
1. File System Access
2. HTTP API Request
3. Database Query
4. System Command

## Available Tools

### read_file
- **Purpose**: Read contents of files from the local filesystem
- **Security**: Restricted to current directory and subdirectories
- **Parameters**: `path` (required), `encoding` (optional, default: utf8)
- **Example**: "Read the package.json file"

### http_request
- **Purpose**: Make HTTP requests to external APIs
- **Simulation**: Returns mock data for demonstration
- **Parameters**: `url` (required), `method`, `headers`, `body`, `timeout`
- **Example**: "Make a GET request to https://api.github.com/users/octocat"

### database_query
- **Purpose**: Execute SQL queries on databases
- **Simulation**: Returns mock data for common queries
- **Parameters**: `query` (required), `database`, `params`
- **Example**: "Query the users table to get all user information"

### system_command
- **Purpose**: Execute system commands
- **Security**: Restricted to safe commands only
- **Simulation**: Returns mock outputs for demonstration
- **Parameters**: `command` (required), `args`, `timeout`
- **Example**: "List files in the current directory"

## Security Features

### File System Protection
- Prevents reading files outside the current directory
- Path traversal attack prevention
- Encoding validation

### Command Execution Safety
- Whitelist of allowed commands
- Argument validation
- Timeout protection

### HTTP Request Validation
- URL format validation
- Timeout limits
- Header sanitization

## Example Interactions

```
User: Read the package.json file and tell me about this project
Agent: I'll read the package.json file for you...
[Tool: read_file called with path: "./package.json"]
Agent: This is an MCP integration example project...

User: Make a request to get GitHub user information
Agent: I'll make an HTTP request to the GitHub API...
[Tool: http_request called with url: "https://api.github.com/users/octocat"]
Agent: Here's the user information from GitHub...
```

## Customization

You can extend this example by:

1. **Adding Real Tools**: Replace simulated tools with actual implementations
2. **Custom Tools**: Create new tools for specific use cases
3. **Enhanced Security**: Add more sophisticated security measures
4. **Error Handling**: Improve error handling and recovery
5. **Logging**: Add detailed logging for debugging

## Real-World Applications

This pattern can be used for:

- **DevOps Automation**: System monitoring and management
- **Data Integration**: Connecting to various data sources
- **API Orchestration**: Coordinating multiple external services
- **File Processing**: Automated document handling
- **Database Operations**: Complex data queries and updates

## Troubleshooting

### Common Issues

1. **Missing API Key**
   - Ensure `GOOGLE_API_KEY` is set in your `.env` file
   - Verify the API key is valid

2. **File Access Errors**
   - Check file paths are relative to the current directory
   - Ensure files exist and are readable

3. **Tool Execution Failures**
   - Review tool parameters for correct format
   - Check security restrictions

4. **Network Issues**
   - Verify internet connectivity for HTTP requests
   - Check firewall settings

## Note on Simulation

This example uses simulated tools for demonstration purposes. In a production environment, you would:

- Replace mock responses with actual API calls
- Implement proper authentication and authorization
- Add comprehensive error handling
- Include monitoring and logging
- Follow security best practices