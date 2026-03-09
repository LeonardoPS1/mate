import { Tool, registerTool } from './registry.js';
import { N8nMCPClient } from '../utils/mcp_client.js';
import { config } from '../config.js';

let n8nClient: N8nMCPClient | null = null;

async function getN8nClient() {
  if (!n8nClient) {
    n8nClient = new N8nMCPClient(config.n8n?.apiUrl, config.n8n?.apiKey);
    await n8nClient.connect();
  }
  return n8nClient;
}

/**
 * Proxy tool that allows executing n8n-MCP tools.
 */
export const n8nMcpProxy: Tool = {
  definition: {
    name: 'n8n_mcp_operation',
    description: 'Accede a las capacidades de n8n para buscar nodos, validar configuraciones y gestionar flujos de automatización.',
    parameters: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Nombre de la operación de n8n-MCP (ej: search_nodes, get_node_essentials, n8n_create_workflow, validate_workflow).'
        },
        args: {
          type: 'object',
          description: 'Argumentos para la operación especificada.'
        }
      },
      required: ['operation', 'args']
    }
  },
  execute: async ({ operation, args }: { operation: string, args: any }) => {
    try {
      const client = await getN8nClient();
      const result = await client.callTool(operation, args);
      return result;
    } catch (error: any) {
      console.error(`[n8n-MCP Error] ${operation}:`, error);
      return { error: `Error en operación n8n: ${error.message}` };
    }
  }
};

registerTool(n8nMcpProxy);
