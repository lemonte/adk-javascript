// Copyright 2025 Geanderson Lemonte
// Based on Google ADK libraries
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Agent, createTool } from '../../src';

// Mock calendar events data
const mockEvents = [
  {
    id: 'event-1',
    summary: 'Team Meeting',
    description: 'Weekly team sync',
    start: { dateTime: '2024-01-15T10:00:00Z' },
    end: { dateTime: '2024-01-15T11:00:00Z' },
    attendees: [{ email: 'john@example.com' }, { email: 'jane@example.com' }]
  },
  {
    id: 'event-2',
    summary: 'Project Review',
    description: 'Quarterly project review',
    start: { dateTime: '2024-01-16T14:00:00Z' },
    end: { dateTime: '2024-01-16T15:30:00Z' },
    attendees: [{ email: 'manager@example.com' }]
  },
  {
    id: 'event-3',
    summary: 'Client Call',
    description: 'Discussion about new requirements',
    start: { dateTime: '2024-01-17T09:00:00Z' },
    end: { dateTime: '2024-01-17T10:00:00Z' },
    attendees: [{ email: 'client@example.com' }]
  }
];

// List calendar events tool
const listEventsTool = createTool(
  async function listEvents({ timeMin, timeMax, maxResults = 10 }: any) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`📅 Listing calendar events (max: ${maxResults})`);
    if (timeMin) console.log(`   From: ${timeMin}`);
    if (timeMax) console.log(`   To: ${timeMax}`);
    
    // Filter events based on time range (simplified)
    let filteredEvents = mockEvents;
    if (timeMin || timeMax) {
      filteredEvents = mockEvents.filter(event => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);
        
        if (timeMin && eventEnd < new Date(timeMin)) return false;
        if (timeMax && eventStart > new Date(timeMax)) return false;
        
        return true;
      });
    }
    
    const limitedEvents = filteredEvents.slice(0, maxResults);
    
    return {
      success: true,
      events: limitedEvents,
      count: limitedEvents.length,
      message: `Found ${limitedEvents.length} events`
    };
  },
  {
    name: 'list_events',
    description: 'List calendar events for a specified time range',
    parameters: {
      type: 'object',
      properties: {
        timeMin: {
          type: 'string',
          description: 'Lower bound (inclusive) for an event\'s end time to filter by. Optional. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z.'
        },
        timeMax: {
          type: 'string',
          description: 'Upper bound (exclusive) for an event\'s start time to filter by. Optional. Must be an RFC3339 timestamp with mandatory time zone offset, for example, 2011-06-03T10:00:00-07:00, 2011-06-03T10:00:00Z.'
        },
        maxResults: {
          type: 'integer',
          description: 'Maximum number of events returned on one result page. By default the value is 10 events. The page size can never be larger than 100 events.',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      required: []
    }
  }
);

// Create calendar event tool
const createEventTool = createTool(
  async function createEvent({ summary, description, startDateTime, endDateTime, attendees = [] }: any) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`📝 Creating new event: "${summary}"`);
    console.log(`   Start: ${startDateTime}`);
    console.log(`   End: ${endDateTime}`);
    if (attendees.length > 0) {
      console.log(`   Attendees: ${attendees.join(', ')}`);
    }
    
    const newEvent = {
      id: `event-${Date.now()}`,
      summary,
      description: description || '',
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      attendees: attendees.map((email: any) => ({ email }))
    };
    
    // Add to mock events
    mockEvents.push(newEvent);
    
    return {
      success: true,
      event: newEvent,
      message: `Event "${summary}" created successfully`,
      eventId: newEvent.id
    };
  },
  {
    name: 'create_event',
    description: 'Create a new calendar event',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'The title of the event'
        },
        description: {
          type: 'string',
          description: 'Description of the event'
        },
        startDateTime: {
          type: 'string',
          description: 'Start date and time (RFC3339 timestamp)'
        },
        endDateTime: {
          type: 'string',
          description: 'End date and time (RFC3339 timestamp)'
        },
        attendees: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of attendee email addresses'
        }
      },
      required: ['summary', 'startDateTime', 'endDateTime']
    }
  }
);

// Update calendar event tool
const updateEventTool = createTool(
  async function updateEvent({ eventId, summary, description, startDateTime, endDateTime }: any) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    console.log(`✏️  Updating event: ${eventId}`);
    
    const eventIndex = mockEvents.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      return {
        success: false,
        message: `Event with ID "${eventId}" not found`
      };
    }
    
    const event = mockEvents[eventIndex];
    
    // Update fields if provided
    if (summary) event.summary = summary;
    if (description !== undefined) event.description = description;
    if (startDateTime) event.start.dateTime = startDateTime;
    if (endDateTime) event.end.dateTime = endDateTime;
    
    console.log(`   Updated: "${event.summary}"`);
    
    return {
      success: true,
      event,
      message: `Event "${event.summary}" updated successfully`
    };
  },
  {
    name: 'update_event',
    description: 'Update an existing calendar event',
    parameters: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'The ID of the event to update'
        },
        summary: {
          type: 'string',
          description: 'New title of the event'
        },
        description: {
          type: 'string',
          description: 'New description of the event'
        },
        startDateTime: {
          type: 'string',
          description: 'New start date and time (RFC3339 timestamp)'
        },
        endDateTime: {
          type: 'string',
          description: 'New end date and time (RFC3339 timestamp)'
        }
      },
      required: ['eventId']
    }
  }
);

// Delete calendar event tool
const deleteEventTool = createTool(
  async function deleteEvent({ eventId }: any) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`🗑️  Deleting event: ${eventId}`);
    
    const eventIndex = mockEvents.findIndex(event => event.id === eventId);
    if (eventIndex === -1) {
      return {
        success: false,
        message: `Event with ID "${eventId}" not found`
      };
    }
    
    const deletedEvent = mockEvents.splice(eventIndex, 1)[0];
    console.log(`   Deleted: "${deletedEvent.summary}"`);
    
    return {
      success: true,
      message: `Event "${deletedEvent.summary}" deleted successfully`,
      deletedEvent
    };
  },
  {
    name: 'delete_event',
    description: 'Delete a calendar event',
    parameters: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'The ID of the event to delete'
        }
      },
      required: ['eventId']
    }
  }
);

// Create the OAuth Calendar Agent
export const oauthCalendarAgent = new Agent({
  model: 'gemini-2.0-flash',
  name: 'oauth_calendar_agent',
  description: 'An AI assistant that helps manage your calendar using OAuth authentication (simulated)',
  instruction: `You are a helpful calendar assistant that can:

1. **List Events**: Show calendar events with detailed information
2. **Create Events**: Schedule new meetings and appointments
3. **Update Events**: Modify existing calendar events
4. **Delete Events**: Remove calendar events

When interacting with users:
- Always be helpful and provide clear information about calendar operations
- Use the appropriate tools to perform calendar actions
- Provide feedback about the success or failure of operations
- Format dates and times in a user-friendly way
- Ask for clarification if needed information is missing
- Be proactive in suggesting useful calendar management actions

Example interactions:
- "Show me my events for today"
- "Create a meeting with John tomorrow at 2 PM"
- "Update the team meeting to start at 10:30 AM"
- "Delete the client call on Friday"

Always confirm successful operations and provide relevant details about the calendar events.`,
  tools: [listEventsTool, createEventTool, updateEventTool, deleteEventTool]
});

// Example usage
if (require.main === module) {
  async function main() {
    try {
      console.log('🗓️  OAuth Calendar Agent initialized successfully!');
      console.log('Agent name:', oauthCalendarAgent.name);
      console.log('Agent description:', oauthCalendarAgent.description);
      console.log('Available tools:', oauthCalendarAgent.tools?.length || 0);
      console.log('\nTry asking the agent to:');
      console.log('- "List my calendar events"');
      console.log('- "Create a meeting with the team tomorrow at 2 PM"');
      console.log('- "Update event-1 to start at 11 AM"');
      console.log('- "Delete the client call event"');
    } catch (error) {
      console.error('Error initializing agent:', error);
    }
  }
  
  main();
}