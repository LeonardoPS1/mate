import Groq from 'groq-sdk';
import { config } from '../config.js';

const groq = new Groq({ apiKey: config.llm.groqApiKey });

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
}

export async function createChatCompletion(
  messages: LLMMessage[],
  tools?: any[],
  onProviderChange?: (provider: string) => void
): Promise<any> {
  const requestBody: any = {
    model: 'llama-3.3-70b-versatile',
    messages,
  };
  
  if (tools && tools.length > 0) {
    requestBody.tools = tools.map(t => ({ type: 'function', function: t }));
    requestBody.tool_choice = 'auto';
  }

  // 1. Try Groq
  try {
    return await groq.chat.completions.create(requestBody);
  } catch (error) {
    console.warn('Groq request failed, attempting OpenRouter fallback...', error);
    
    if (!config.llm.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured for fallback. Original error: ' + error);
    }

    if (onProviderChange) onProviderChange('OpenRouter');

    // 2. Try OpenRouter
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.llm.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://mate-agent.local',
          'X-Title': 'Mate Agent'
        },
        body: JSON.stringify({
          model: config.llm.openRouterModel,
          messages,
          tools: requestBody.tools,
          tool_choice: requestBody.tools ? 'auto' : undefined
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter failed (${response.status}): ${errText}`);
      }

      return await response.json();
    } catch (orError: any) {
      console.warn('OpenRouter failed, attempting z.ai fallback...', orError);

      if (!config.llm.zaiApiKey) {
        throw new Error('z.ai API key not configured for fallback. OpenRouter error: ' + orError.message);
      }

      if (onProviderChange) onProviderChange('z.ai');

      // 3. Try z.ai
      const zaiResponse = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.llm.zaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-v3', // Defaulting to a sensible large model on z.ai
          messages,
          tools: requestBody.tools,
          tool_choice: requestBody.tools ? 'auto' : undefined
        })
      });

      if (!zaiResponse.ok) {
        const errText = await zaiResponse.text();
        console.error('[z.ai Error Detail]', errText);
        throw new Error(`z.ai fallback failed (${zaiResponse.status}): ${errText}`);
      }

      return await zaiResponse.json();
    }
  }
}
