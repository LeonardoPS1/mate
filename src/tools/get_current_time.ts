import { Tool, registerTool } from './registry.js';

const getCurrentTime: Tool = {
  definition: {
    name: 'get_current_time',
    description: 'Returns the current local time of the agent.',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  execute: async () => {
    return {
      time: new Date().toISOString()
    };
  }
};

registerTool(getCurrentTime);
