import fs from 'fs';
import os from 'os';
import path from 'path';
import { config } from '../config.js';

/**
 * Synthesizes speech from text using ElevenLabs API and returns the path to the temporary audio file.
 */
export async function synthesizeSpeech(text: string): Promise<string> {
  const voiceId = config.elevenlabs.voiceId;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': config.elevenlabs.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs TTS failed: ${response.statusText} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const tempFilePath = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, buffer);
    
    return tempFilePath;
  } catch (error) {
    console.error("[TTS Error]", error);
    throw error;
  }
}
