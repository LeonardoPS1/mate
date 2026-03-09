import 'dotenv/config';

export interface Config {
  telegram: {
    botToken: string;
    allowedUserIds: number[];
  };
  llm: {
    groqApiKey: string;
    openRouterApiKey?: string;
    openRouterModel: string;
    zaiApiKey?: string;
  };
  firebase: {
    projectId: string;
    serviceAccountPath?: string;
  };
  elevenlabs: {
    apiKey: string;
    voiceId: string;
  };
  n8n?: {
    apiUrl: string;
    apiKey: string;
  };
}

function parseAllowedUserIds(value: string | undefined): number[] {
  if (!value) return [];
  return value
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
}

function loadConfig(): Config {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is required in .env file');
  }

  const allowedIdsStr = process.env.TELEGRAM_ALLOWED_USER_IDS;
  const allowedUserIds = parseAllowedUserIds(allowedIdsStr);
  if (allowedUserIds.length === 0) {
    console.warn('WARNING: TELEGRAM_ALLOWED_USER_IDS is empty. Bot might discard all messages.');
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is required in .env file');
  }

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY is required in .env file');
  }

  return {
    telegram: {
      botToken: TELEGRAM_BOT_TOKEN,
      allowedUserIds,
    },
    llm: {
      groqApiKey: GROQ_API_KEY,
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
      openRouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
      zaiApiKey: process.env.ZAI_API_KEY,
    },
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || 'mate-agent-db-2026',
      serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    },
    elevenlabs: {
      apiKey: ELEVENLABS_API_KEY,
      voiceId: process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'
    },
    n8n: process.env.N8N_API_URL && process.env.N8N_API_KEY ? {
      apiUrl: process.env.N8N_API_URL,
      apiKey: process.env.N8N_API_KEY,
    } : undefined
  };
}

export const config = loadConfig();
