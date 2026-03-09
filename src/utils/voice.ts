import fs from 'fs';
import os from 'os';
import path from 'path';
import Groq from 'groq-sdk';
import { config } from '../config.js';

const groq = new Groq({ apiKey: config.llm.groqApiKey });

/**
 * Downloads a file stream from a URL and saves it to a temporary path.
 * Then sends it to Groq Whisper for transcription.
 */
export async function transcribeVoiceMessage(fileUrlUrl: string): Promise<string> {
  const tempFilePath = path.join(os.tmpdir(), `voice_${Date.now()}.ogg`);
  
  try {
    // 1. Download file from Telegram to local temp file
    const response = await fetch(fileUrlUrl);
    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(tempFilePath, buffer);
    
    // 2. Send to Groq for transcription (Whisper)
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      language: 'es' // Setting default to Spanish to improve accuracy for Hispanic users
    });
    
    return transcription.text;
  } catch (error) {
    console.error("[Voice Transcription Error]", error);
    throw error;
  } finally {
    // 3. Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}
