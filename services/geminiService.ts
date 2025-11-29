import { GoogleGenAI, Chat } from "@google/genai";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a knowledgeable anime database assistant.
Your interface is clean and minimal.
When discussing anime, focus on animation quality, studio history, and themes.
Keep responses concise (under 50 words). 
`;

export class GeminiService {
  private chat: Chat | null = null;

  constructor() {
    this.initChat();
  }

  private initChat() {
    try {
      this.chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          thinkingConfig: { thinkingBudget: 0 }
        },
      });
    } catch (error) {
      console.error("Failed to initialize Gemini chat:", error);
    }
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chat) {
      this.initChat();
    }
    
    if (!process.env.API_KEY) {
      return "SYSTEM ERROR: API_KEY_MISSING. Please configure your neural link.";
    }

    try {
      if (!this.chat) throw new Error("Chat not initialized");
      
      const response = await this.chat.sendMessage({ message });
      return response.text || "NO_DATA_RECEIVED";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "CONNECTION_INTERRUPTED. Re-establishing link...";
    }
  }
}

export const geminiService = new GeminiService();