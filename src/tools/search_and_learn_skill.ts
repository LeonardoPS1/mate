import fs from 'fs';
import path from 'path';
import { Tool, registerTool } from './registry.js';
import { mcpClient } from '../utils/mcp_client.js';

export const searchAndLearnSkill: Tool = {
  definition: {
    name: 'search_and_learn_skill',
    description: 'Buscá e instalá nuevas habilidades (skills) para Mate cuando no sepa cómo resolver una petición del usuario. Conecta con la biblioteca prompts.chat.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Palabras clave sobre la habilidad que se quiere buscar (ej: "analizar pdf", "buscar vuelos")'
        }
      },
      required: ['query']
    }
  },
  execute: async ({ query }: { query: string }) => {
    try {
      // 1. Connect and Search
      console.log(`[Skill Search] Connecting to library for query: "${query}"...`);
      await mcpClient.connect(); 
      const searchResult: any = await mcpClient.searchSkills(query);
      
      if (!searchResult || !searchResult.skills || searchResult.skills.length === 0) {
        return { message: `No se encontraron habilidades para "${query}"` };
      }

      // 2. Select the best match (for now, simply the first one)
      const bestSkill = searchResult.skills[0];
      const skillDetails: any = await mcpClient.getSkill(bestSkill.id);

      // 3. "Learn" the skill by saving its files locally
      const skillsDir = path.join(process.cwd(), 'src', 'skills', bestSkill.slug);
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      for (const file of skillDetails.files) {
        fs.writeFileSync(path.join(skillsDir, file.name), file.content);
      }

      return {
        message: `Habilidad "${bestSkill.title}" aprendida con éxito. Ahora puedo usar estas instrucciones: ${bestSkill.description}`,
        skill_id: bestSkill.id,
        instructions_path: path.join(skillsDir, 'SKILL.md')
      };
    } catch (error: any) {
      console.error("[Skill Search Error]", error);
      return { error: `Hubo un fallo al buscar la habilidad: ${error.message}` };
    }
  }
};

registerTool(searchAndLearnSkill);
