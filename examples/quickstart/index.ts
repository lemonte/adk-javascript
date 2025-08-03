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

import * as dotenv from 'dotenv';


dotenv.config({ override: true });
const getWeatherTool = createTool(
  function getWeather(city: string): { status: string; report?: string; error_message?: string } {
    if (city.toLowerCase() === 'new york') {
      return {
        status: 'success',
        report: 'The weather in New York is sunny with a temperature of 25 degrees Celsius (77 degrees Fahrenheit).'
      };
    } else {
      return {
        status: 'error',
        error_message: `Weather information for '${city}' is not available.`
      };
    }
  },
  {
    name: 'getWeather',
    description: 'Retrieves the current weather report for a specified city.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The name of the city for which to retrieve the weather report.'
        }
      },
      required: ['city']
    }
  }
);

const getCurrentTimeTool = createTool(
  function getCurrentTime(city: string): { status: string; report?: string; error_message?: string } {
    if (city.toLowerCase() === 'new york') {
      const now = new Date();
      // Convert to New York timezone (EST/EDT)
      const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
      const report = `The current time in ${city} is ${nyTime.toISOString().replace('T', ' ').substring(0, 19)} EST`;
      return {
        status: 'success',
        report
      };
    } else {
      return {
        status: 'error',
        error_message: `Sorry, I don't have timezone information for ${city}.`
      };
    }
  },
  {
    name: 'getCurrentTime',
    description: 'Returns the current time in a specified city.',
    parameters: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'The name of the city for which to retrieve the current time.'
        }
      },
      required: ['city']
    }
  }
);

export const rootAgent = new Agent({
  name: 'weather_time_agent',
  model: 'gemini-2.0-flash',
  description: 'Agent to answer questions about the time and weather in a city.',
  instruction: 'I can answer your questions about the time and weather in a city.',
  tools: [getWeatherTool, getCurrentTimeTool]
});

// Example usage
if (require.main === module) {
  async function main() {
    try {
      console.log('Weather Time Agent initialized successfully!');
      console.log('Agent name:', rootAgent.name);
      console.log('Agent description:', rootAgent.description);
      console.log('Available tools:', rootAgent.tools?.length || 0);
    } catch (error) {
      console.error('Error initializing agent:', error);
    }
  }
  
  main();
}