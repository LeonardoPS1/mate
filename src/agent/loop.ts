import fs from 'fs';
import path from 'path';
import { memory, ChatMessage } from './memory.js';
import { createChatCompletion, LLMMessage } from './llm.js';
import { getAvailableTools, executeTool } from '../tools/registry.js';

// Import tools to register them
import '../tools/get_current_time.js';
import '../tools/search_and_learn_skill.js';
import '../tools/install_superpowers_library.js';
import '../tools/n8n_automation.js';

const SYSTEM_PROMPT_BASE = `You are Mate, a powerful agentic AI assistant with SUPERPOWERS and EXPERT KNOWLEDGE in n8n automation.
You prioritize high-quality software engineering: Spec-first design, TDD (Red-Green-Refactor), YAGNI, and DRY.

N8N AUTOMATION EXPERT:
1. ALWAYS start with \`n8n_mcp_operation\` with operation='tools_documentation' to understand available tools.
2. Use 'search_nodes' and 'get_node_essentials' to find and configure nodes.
3. VALIDATE early: use 'validate_node_minimal' or 'validate_node_operation' BEFORE building/deploying.
4. Manage workflows using 'n8n_create_workflow', 'n8n_get_workflow', and 'n8n_update_partial_workflow'.

DYNAMIC SKILLS & SUPERPOWERS:
1. If you need a new capability, use 'search_and_learn_skill' to find it in prompts.chat.
2. For core engineering skills, use 'install_superpowers_library' to fetch official Superpowers.
3. Always verify and test before declaring success.

Be concise, friendly, and operate primarily in Spanish.`;

/**
 * Loads all installed skills from src/skills directory.
 */
function loadLearnedSkills(): string {
  const skillsDir = path.join(process.cwd(), 'src', 'skills');
  if (!fs.existsSync(skillsDir)) return "";

  let skillsContext = "\n\nINSTALLED SKILLS:\n";
  const skillFolders = fs.readdirSync(skillsDir);

  for (const folder of skillFolders) {
    const skillPath = path.join(skillsDir, folder, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf8');
      skillsContext += `\n--- SKILL: ${folder} ---\n${content}\n`;
    }
  }

  return skillsContext === "\n\nINSTALLED SKILLS:\n" ? "" : skillsContext;
}

export async function runAgentLoop(
  userId: number,
  userMessage: string,
  maxIterations = 5,
  onProviderChange?: (provider: string) => void
): Promise<string> {
  // 1. Add user message to memory
  await memory.addMessage({
    userId,
    role: 'user',
    content: userMessage
  });

  const tools = getAvailableTools();
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    // 2. Prepare System Prompt with dynamic skills
    const learnedSkills = loadLearnedSkills();
    const fullSystemPrompt = SYSTEM_PROMPT_BASE + learnedSkills;

    // 3. Fetch History
    const history = await memory.getHistory(userId, 30);
    const messages: LLMMessage[] = [
      { role: 'system', content: fullSystemPrompt },
      ...history.map(msg => {
        const formattedMsg: LLMMessage = {
          role: msg.role as any,
          content: msg.content
        };
        if (msg.toolCalls) formattedMsg.tool_calls = JSON.parse(msg.toolCalls);
        if (msg.toolCallId) formattedMsg.tool_call_id = msg.toolCallId;
        return formattedMsg;
      })
    ];

    // 4. Call LLM
    const response = await createChatCompletion(messages, tools, onProviderChange);
    const responseMessage = response.choices[0].message;

    // 5. Handle LLM response
    const hasToolCalls = responseMessage.tool_calls && responseMessage.tool_calls.length > 0;

    await memory.addMessage({
      userId,
      role: 'assistant',
      content: responseMessage.content || "",
      toolCalls: hasToolCalls ? JSON.stringify(responseMessage.tool_calls) : undefined
    });

    if (!hasToolCalls) {
      // Agent is done, return the content
      return responseMessage.content || "Se ha procesado tu solicitud, pero no emití ningún texto.";
    }

    // 6. Execute tools
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.type === 'function') {
        const functionName = toolCall.function.name;
        
        let args = {};
        try {
          args = JSON.parse(toolCall.function.arguments || '{}');
        } catch (e) {
          console.error("Failed to parse tool arguments:", e);
        }
        
        console.log(`[Tool Execution] ${functionName} with args:`, args);
        const result = await executeTool(functionName, args);
        
        // Add tool result to memory
        await memory.addMessage({
          userId,
          role: 'tool',
          content: typeof result === 'string' ? result : JSON.stringify(result),
          toolCallId: toolCall.id
        });
      }
    }
  }

  return "He alcanzado el límite de iteraciones de pensamiento. Quizás necesite más ayuda para completar esta tarea.";
}
