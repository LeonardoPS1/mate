import fs from 'fs';
import path from 'path';
import { Tool, registerTool } from './registry.js';

export const installSuperpowersLibrary: Tool = {
  definition: {
    name: 'install_superpowers_library',
    description: 'Descarga e instala el set oficial de habilidades "Superpowers" desde GitHub para mejorar drásticamente mis capacidades de desarrollo, TDD y diseño.',
    parameters: {
      type: 'object',
      properties: {
        skillName: {
          type: 'string',
          description: 'Nombre de la skill específica de Superpowers (ej: "test-driven-development", "brainstorming"). Si se deja vacío, se lista la biblioteca.'
        }
      }
    }
  },
  execute: async ({ skillName }: { skillName?: string }) => {
    const REPO_BASE = "https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/skills";
    
    if (!skillName) {
      return {
        message: "Por favor, indica qué skill de Superpowers quieres instalar. Algunas disponibles son: test-driven-development, brainstorming, writing-plans, systematic-debugging."
      };
    }

    try {
      const skillUrl = `${REPO_BASE}/${skillName}/SKILL.md`;
      const response = await fetch(skillUrl);

      if (!response.ok) {
        throw new Error(`No se pudo encontrar la skill "${skillName}" en el repositorio oficial.`);
      }

      const content = await response.text();
      const skillsDir = path.join(process.cwd(), 'src', 'skills', skillName);
      
      if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
      }

      fs.writeFileSync(path.join(skillsDir, 'SKILL.md'), content);

      return {
        message: `Habilidad "Superpowers:${skillName}" instalada correctamente. He asimilado los nuevos flujos de trabajo de ${skillName}.`,
        instructions_path: path.join(skillsDir, 'SKILL.md')
      };
    } catch (error: any) {
      console.error("[Superpowers Install Error]", error);
      return { error: `Fallo al instalar Superpowers: ${error.message}` };
    }
  }
};

registerTool(installSuperpowersLibrary);
