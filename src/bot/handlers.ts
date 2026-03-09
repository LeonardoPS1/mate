import fs from 'fs';
import { Bot, Context, InputFile } from 'grammy';
import { runAgentLoop } from '../agent/loop.js';
import { memory } from '../agent/memory.js';
import { transcribeVoiceMessage } from '../utils/voice.js';
import { synthesizeSpeech } from '../utils/tts.js';
import { config } from '../config.js';

/**
 * Checks if the user asked for a voice response.
 */
function shouldReplyWithVoice(text: string): boolean {
  const keywords = ['voz', 'audio', 'habla', 'decir', 'escuchar', 'nota de voz'];
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
}

async function handleResponse(ctx: Context, userId: number, text: string) {
  await ctx.replyWithChatAction('typing');

  try {
    const response = await runAgentLoop(userId, text, 5, async (provider) => {
      await ctx.reply(`⚠️ Cambiando a modelo: ${provider}`);
    });
    
    if (shouldReplyWithVoice(text)) {
      await ctx.replyWithChatAction('record_voice');
      const audioPath = await synthesizeSpeech(response);
      
      try {
        await ctx.replyWithVoice(new InputFile(audioPath));
      } finally {
        // Clean up temp audio file
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      }
    } else {
      await ctx.reply(response);
    }
  } catch (error: any) {
    console.error("[Agent Error]", error);
    await ctx.reply("Ocurrió un error al procesar tu solicitud: " + error.message);
  }
}

export function setupHandlers(bot: Bot) {
  bot.command('start', async (ctx: Context) => {
    await ctx.reply("¡Hola! Soy Mate, tu agente de IA personal. ¿En qué te puedo ayudar?");
  });

  bot.command('clear', async (ctx: Context) => {
    if (ctx.from) {
      await memory.clearHistory(ctx.from.id);
      await ctx.reply("He borrado mi memoria de nuestra conversación.");
    }
  });

  bot.on('message:text', async (ctx: Context) => {
    const userId = ctx.from?.id;
    const text = ctx.message?.text;
    if (!userId || !text) return;
    await handleResponse(ctx, userId, text);
  });

  bot.on('message:voice', async (ctx: Context) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    await ctx.replyWithChatAction('typing');

    try {
      const file = await ctx.getFile();
      if (!file.file_path) {
        throw new Error("No file path found.");
      }
      
      const fileUrl = `https://api.telegram.org/file/bot${config.telegram.botToken}/${file.file_path}`;
      const text = await transcribeVoiceMessage(fileUrl);

      if (!text || text.trim() === '') {
         await ctx.reply("No pude escuchar nada claro en este audio.");
         return;
      }
      
      await ctx.reply(`🎙️ _${text}_`);
      await handleResponse(ctx, userId, text);

    } catch (error: any) {
      console.error("[Voice Error]", error);
      await ctx.reply("Hubo un problema procesando tu audio: " + error.message);
    }
  });
}
