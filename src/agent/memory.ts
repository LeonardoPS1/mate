import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { config } from '../config.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export interface ChatMessage {
  id?: string;
  userId: number;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  toolCalls?: string | null; // JSON string of tool calls
  toolCallId?: string | null; // For tool responses
  createdAt?: Timestamp;
}

export class Memory {
  private db: FirebaseFirestore.Firestore;

  constructor() {
    if (config.firebase.serviceAccountPath) {
      console.log(`[Firebase] Initializing with service account: ${config.firebase.serviceAccountPath}`);
      
      const serviceAccount = require(`../../${config.firebase.serviceAccountPath}`);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } else {
      console.log(`[Firebase] Initializing via Application Default Credentials...`);
      initializeApp({
        credential: applicationDefault(),
        projectId: config.firebase.projectId
      });
    }

    this.db = getFirestore();
  }

  public async addMessage(msg: ChatMessage) {
    const docRef = this.db.collection(`users/${msg.userId}/messages`).doc();
    
    await docRef.set({
      user_id: msg.userId,
      role: msg.role,
      content: msg.content || null,
      tool_calls: msg.toolCalls || null,
      tool_call_id: msg.toolCallId || null,
      created_at: FieldValue.serverTimestamp()
    });
  }

  public async getHistory(userId: number, limit: number = 20): Promise<ChatMessage[]> {
    const snapshot = await this.db
      .collection(`users/${userId}/messages`)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();
    
    const messages: ChatMessage[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        userId: data.user_id,
        role: data.role as ChatMessage['role'],
        content: data.content,
        toolCalls: data.tool_calls,
        toolCallId: data.tool_call_id,
        createdAt: data.created_at
      });
    });

    return messages.reverse();
  }

  public async clearHistory(userId: number) {
    const snapshot = await this.db.collection(`users/${userId}/messages`).get();
    
    const batch = this.db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}

export const memory = new Memory();
