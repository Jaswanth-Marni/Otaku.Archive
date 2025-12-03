const OPENROUTER_API_KEY = "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";
const SITE_URL = "http://localhost:5173";
const SITE_NAME = "Otaku Archive";

const SYSTEM_INSTRUCTION = `
You are a knowledgeable anime database assistant.
Your interface is clean and minimal.
When discussing anime, focus on animation quality, studio history, and themes.
Keep responses concise (under 50 words). 
`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export class GeminiService {
  private history: Message[] = [];
  private openAIKey: string | null = null;

  constructor() {
    this.resetChat();
    if (typeof window !== 'undefined') {
      this.openAIKey = localStorage.getItem('openai_api_key');
    }
  }

  public setOpenAIKey(key: string) {
    this.openAIKey = key;
    if (typeof window !== 'undefined') {
      if (key) localStorage.setItem('openai_api_key', key);
      else localStorage.removeItem('openai_api_key');
    }
  }

  public getActiveProvider(): string {
    return this.openAIKey ? "OPENAI (GPT-4o)" : "GLM-4.5 AIR";
  }

  private resetChat() {
    this.history = [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "assistant", content: "Understood. I am ready to assist with anime inquiries." }
    ];
  }

  public async sendMessage(message: string): Promise<string> {
    // Add user message to history
    this.history.push({ role: "user", content: message });

    try {
      let reply = "";
      if (this.openAIKey) {
        reply = await this.callOpenAI();
      } else {
        reply = await this.callOpenRouter();
      }

      // Add assistant reply to history
      this.history.push({ role: "assistant", content: reply });

      return reply;
    } catch (error: any) {
      console.error("API Error:", error);
      // Remove the failed user message so we can retry or just keep state consistent
      this.history.pop(); 
      return `SYSTEM ERROR: ${error.message || "Unknown Error"}. Check console for details.`;
    }
  }

  private async callOpenAI(): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.openAIKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: this.history
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "NO_DATA_RECEIVED";
  }

  private async callOpenRouter(): Promise<string> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "z-ai/glm-4.5-air:free",
        "messages": this.history
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "NO_DATA_RECEIVED";
  }
}

export const geminiService = new GeminiService();