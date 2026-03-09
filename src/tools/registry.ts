export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface Tool {
  definition: ToolDefinition;
  execute: (args: any) => Promise<any>;
}

const toolsRegistry: Record<string, Tool> = {};

export function registerTool(tool: Tool) {
  toolsRegistry[tool.definition.name] = tool;
}

export function getAvailableTools(): ToolDefinition[] {
  return Object.values(toolsRegistry).map(t => t.definition);
}

export async function executeTool(name: string, args: any): Promise<any> {
  const tool = toolsRegistry[name];
  if (!tool) {
    throw new Error(`Tool \${name} not found`);
  }
  
  try {
    return await tool.execute(args);
  } catch (error: any) {
    console.error(`Error executing tool \${name}:`, error);
    return { error: error.message || 'Unknown error during tool execution' };
  }
}
