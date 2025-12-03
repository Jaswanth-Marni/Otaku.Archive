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

  constructor() {
    this.resetChat();
  }

  public getActiveProvider(): string {
    return "GEMINI PRO";
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
      const reply = await this.callBackend();

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

  private async callBackend(): Promise<string> {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: this.history
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Backend API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.reply || "NO_DATA_RECEIVED";
  }
}

export const geminiService = new GeminiService();