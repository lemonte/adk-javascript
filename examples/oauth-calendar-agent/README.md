# OAuth Calendar Agent Example

This example demonstrates how to create an AI agent that integrates with Google Calendar using OAuth2 authentication. The agent can manage calendar events, schedule meetings, and provide calendar insights.

## Features

- OAuth2 authentication flow for secure Google Calendar access
- Complete calendar management (list, create, update, delete events)
- Intelligent scheduling and free time finding
- Time zone handling
- Interactive calendar assistant
- Secure token management and refresh

## Setup

### Prerequisites

1. Google Cloud Project with Calendar API enabled
2. OAuth2 credentials configured
3. Node.js and npm installed

### Step 1: Create OAuth2 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create OAuth2 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Desktop application" or "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:8080/oauth2callback`
     - `urn:ietf:wg:oauth:2.0:oob` (for desktop apps)

5. Download the credentials JSON file

### Step 2: Environment Variables

```bash
# Required OAuth2 credentials
export GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
export GOOGLE_CLIENT_SECRET="your-client-secret"

# Optional configuration
export GOOGLE_REDIRECT_URI="http://localhost:8080/oauth2callback"
export TIMEZONE="America/New_York"

# Optional: For Google AI Studio
export GOOGLE_AI_STUDIO_API_KEY="your-api-key"
```

### Step 3: Install Dependencies

```bash
npm install
```

## Running the Example

```bash
# Run the example
npm run start
```

### First Run (Authentication)

1. The application will detect you're not authenticated
2. It will display an authorization URL
3. Open the URL in your browser
4. Sign in to your Google account
5. Grant calendar permissions
6. Copy the authorization code from the redirect URL
7. Paste the code in the terminal

## Usage

Once authenticated, you can interact with your calendar using natural language:

### Example Commands

**Viewing Events:**
- "What events do I have today?"
- "Show me my schedule for tomorrow"
- "List all my calendars"
- "What's on my calendar this week?"

**Creating Events:**
- "Schedule a meeting with John tomorrow at 2 PM"
- "Create a dentist appointment for Friday at 10 AM"
- "Block my calendar for lunch from 12 to 1 PM"
- "Set up a recurring weekly team meeting on Mondays at 9 AM"

**Finding Free Time:**
- "When am I free tomorrow between 9 AM and 5 PM?"
- "Find a 2-hour slot for a workshop next week"
- "What's the best time to schedule a call with someone in London?"

**Managing Events:**
- "Move my 3 PM meeting to 4 PM"
- "Cancel the meeting with Sarah on Thursday"
- "Add a reminder to my doctor's appointment"
- "Change the location of tomorrow's meeting to Conference Room B"

## Calendar Tools Available

The agent has access to these calendar operations:

### Core Tools
- `list_calendars`: List all available calendars
- `get_calendar_info`: Get details about a specific calendar
- `list_events`: List events from a calendar with filtering
- `get_event`: Get detailed information about a specific event

### Event Management
- `create_event`: Create new calendar events
- `update_event`: Update existing events
- `delete_event`: Delete events
- `move_event`: Move events to different times/dates

### Smart Scheduling
- `find_free_time`: Find available time slots
- `check_availability`: Check if a time slot is free
- `suggest_meeting_times`: Suggest optimal meeting times
- `find_conflicts`: Identify scheduling conflicts

### Advanced Features
- `create_recurring_event`: Create recurring events
- `manage_attendees`: Add/remove event attendees
- `set_reminders`: Configure event reminders
- `handle_timezones`: Manage events across time zones

## OAuth2 Configuration

### Scopes

The agent requests these Google Calendar scopes:

```typescript
const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly', // Read calendar data
  'https://www.googleapis.com/auth/calendar.events',   // Manage events
  'https://www.googleapis.com/auth/calendar'           // Full calendar access
];
```

### Token Management

```typescript
// Check authentication status
if (!isAuthenticated()) {
  await authenticateUser();
}

// Automatic token refresh
await refreshTokenIfNeeded();
```

### Secure Storage

In production, store tokens securely:

```typescript
// Example: Store in encrypted database
const encryptedTokens = encrypt(tokens);
await database.storeUserTokens(userId, encryptedTokens);

// Example: Use environment variables for development
process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;
```

## Advanced Configuration

### Custom Calendar Settings

```typescript
new CalendarToolset({
  oauth2Config: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'http://localhost:8080/oauth2callback'
  },
  
  // Default settings
  defaultCalendarId: 'primary',
  timeZone: 'America/New_York',
  
  // Event defaults
  defaultEventDuration: 60, // minutes
  defaultReminders: [10, 60], // minutes before event
  
  // Permissions
  allowEventCreation: true,
  allowEventDeletion: true,
  allowCalendarModification: false
})
```

### Time Zone Handling

```typescript
// Configure time zone
process.env.TIMEZONE = 'America/Los_Angeles';

// The agent automatically handles:
// - Converting times to user's time zone
// - Displaying times in local format
// - Managing cross-timezone meetings
```

## Error Handling

### Common Issues

1. **Authentication Errors**
   ```
   Error: invalid_grant
   ```
   - Solution: Re-authenticate using the "auth" command
   - Check that redirect URI matches configuration

2. **Permission Denied**
   ```
   Error: Insufficient Permission
   ```
   - Solution: Ensure all required scopes are granted
   - Re-authenticate with proper permissions

3. **API Quota Exceeded**
   ```
   Error: Quota exceeded
   ```
   - Solution: Check Google Cloud Console quotas
   - Implement rate limiting in your application

4. **Invalid Calendar ID**
   ```
   Error: Calendar not found
   ```
   - Solution: Use "list_calendars" to find valid IDs
   - Check calendar sharing permissions

### Debugging

```typescript
// Enable debug logging
process.env.DEBUG = 'calendar:*';

// Check token status
console.log('Token expires at:', new Date(oauth2Client.credentials.expiry_date));

// Validate scopes
console.log('Granted scopes:', oauth2Client.credentials.scope);
```

## Security Best Practices

### Token Security

1. **Never commit tokens to version control**
2. **Use secure storage for production**
3. **Implement token rotation**
4. **Monitor for suspicious activity**

### Scope Minimization

```typescript
// Request only necessary scopes
const MINIMAL_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly'
];

// For read-only applications
const READ_ONLY_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly'
];
```

### User Consent

- Always explain what permissions you're requesting
- Provide clear privacy policy
- Allow users to revoke access
- Implement granular permissions

## Production Deployment

### Environment Setup

```bash
# Production environment variables
export NODE_ENV=production
export GOOGLE_CLIENT_ID="prod-client-id"
export GOOGLE_CLIENT_SECRET="prod-client-secret"
export GOOGLE_REDIRECT_URI="https://yourdomain.com/oauth2callback"

# Database for token storage
export DATABASE_URL="postgresql://..."

# Encryption key for token storage
export ENCRYPTION_KEY="your-encryption-key"
```

### Scaling Considerations

1. **Rate Limiting**: Implement proper rate limiting
2. **Caching**: Cache calendar data appropriately
3. **Error Handling**: Robust error handling and retry logic
4. **Monitoring**: Monitor API usage and performance

### Compliance

- **GDPR**: Implement data deletion and export
- **SOC 2**: Ensure secure token handling
- **Privacy**: Clear data usage policies

## Testing

### Unit Tests

```typescript
// Mock OAuth2 client for testing
const mockOAuth2Client = {
  credentials: { access_token: 'mock-token' },
  refreshAccessToken: jest.fn()
};

// Test calendar operations
test('should list calendar events', async () => {
  const events = await calendarAgent.run({
    message: 'List my events for today'
  });
  expect(events.message).toContain('events');
});
```

### Integration Tests

```typescript
// Test with real Google Calendar API
test('integration: create and delete event', async () => {
  const createResponse = await calendarAgent.run({
    message: 'Create a test event for tomorrow at 2 PM'
  });
  
  const deleteResponse = await calendarAgent.run({
    message: 'Delete the test event I just created'
  });
  
  expect(deleteResponse.message).toContain('deleted');
});
```

## Troubleshooting

### Debug Commands

```bash
# Check authentication status
npm run check-auth

# Test calendar API connection
npm run test-calendar

# Refresh tokens
npm run refresh-tokens
```

### Common Solutions

1. **Clear stored credentials**: Delete token files and re-authenticate
2. **Check API quotas**: Monitor usage in Google Cloud Console
3. **Verify permissions**: Ensure calendar sharing is configured correctly
4. **Update dependencies**: Keep OAuth libraries up to date