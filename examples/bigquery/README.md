# BigQuery Agent Example

This example demonstrates how to use the ADK BigQuery tools to interact with Google BigQuery datasets and tables.

## Features

The BigQuery agent provides access to the following tools:
- `list_dataset_ids`: List all dataset IDs in your project
- `get_dataset_info`: Get detailed information about a specific dataset
- `list_table_ids`: List all table IDs in a dataset
- `get_table_info`: Get detailed information about a specific table
- `execute_sql`: Execute SQL queries against BigQuery

## Setup

### Prerequisites

1. A Google Cloud Project with BigQuery API enabled
2. Appropriate authentication credentials
3. Node.js and npm installed

### Authentication

You can authenticate using one of these methods:

#### Option 1: Application Default Credentials (Recommended)

```bash
# Install Google Cloud CLI
# Then authenticate
gcloud auth application-default login
```

#### Option 2: Service Account

1. Create a service account in Google Cloud Console
2. Download the service account key file
3. Set the environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

#### Option 3: OAuth2

Uncomment the OAuth2 configuration in the code and set:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Environment Variables

```bash
# Required
export GOOGLE_CLOUD_PROJECT_ID="your-project-id"

# Optional (for Google AI Studio)
export GOOGLE_AI_STUDIO_API_KEY="your-api-key"

# Optional (for Vertex AI)
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

The example starts with a demonstration query and then enters interactive mode where you can:

- Ask about available datasets
- Explore table schemas
- Execute SQL queries
- Analyze data

### Example Queries

- "List all datasets in my project"
- "Show me the schema of the 'users' table in the 'analytics' dataset"
- "Execute a query to count rows in the public dataset 'bigquery-public-data.usa_names.usa_1910_2013'"
- "What are the top 10 most popular names in the USA names dataset?"

## Write Mode Configuration

The agent supports different write modes:

- `allowed`: Allow all write operations (INSERT, UPDATE, DELETE, CREATE, DROP)
- `blocked`: Block all write operations (read-only mode)
- `protected`: Require confirmation for write operations (default)

## Error Handling

Common issues and solutions:

1. **Authentication Error**: Make sure you have valid credentials set up
2. **Project Not Found**: Verify your `GOOGLE_CLOUD_PROJECT_ID` is correct
3. **Permission Denied**: Ensure your account has BigQuery permissions
4. **API Not Enabled**: Enable the BigQuery API in Google Cloud Console

## Security Notes

- Never commit service account keys to version control
- Use Application Default Credentials in production
- Be cautious with write operations on production data
- Consider using the 'protected' write mode for safety