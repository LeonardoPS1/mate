import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class SkillMCPClient {
  private client: Client;
  private transport: SSEClientTransport;
  private isConnected: boolean = false;

  constructor(serverUrl: string = "https://prompts.chat/api/mcp") {
    this.transport = new SSEClientTransport(new URL(serverUrl));
    this.client = new Client({
      name: "Mate-Agent-Client",
      version: "1.0.0",
    }, {
      capabilities: {}
    });
  }

  async connect() {
    if (this.isConnected) return;
    try {
      await this.client.connect(this.transport);
      this.isConnected = true;
      console.log("[SkillMCPClient] Connected to skill library.");
    } catch (error) {
      console.error("[SkillMCPClient] Connection failed:", error);
      throw error;
    }
  }

  async searchSkills(query: string, category?: string) {
    return await this.client.callTool({
      name: "search_skills",
      arguments: { query, category }
    });
  }

  async getSkill(id: string) {
    return await this.client.callTool({
      name: "get_skill",
      arguments: { id }
    });
  }

  async close() {
    await this.client.close();
  }
}

export class N8nMCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor(apiUrl?: string, apiKey?: string) {
    const env: Record<string, string> = {
      "MCP_MODE": "stdio",
      "LOG_LEVEL": "error",
      "DISABLE_CONSOLE_OUTPUT": "true"
    };
    
    if (apiUrl) env["N8N_API_URL"] = apiUrl;
    if (apiKey) env["N8N_API_KEY"] = apiKey;

    this.transport = new StdioClientTransport({
      command: "npx",
      args: ["n8n-mcp"],
      env
    });

    this.client = new Client({
      name: "Mate-N8n-Client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async callTool(name: string, args: any) {
    return await this.client.callTool({
      name,
      arguments: args
    });
  }

  async listTools() {
    return await this.client.listTools();
  }

  async close() {
    await this.client.close();
  }
}

export const mcpClient = new SkillMCPClient();
