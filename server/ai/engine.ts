import { DatabaseService } from "../db/sqlite.js";

interface AIResponse {
  text: string;
  emotion?: string;
  timestamp: Date;
}

class AIEngine {
  private modelLoaded: boolean = false;
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  async loadModel(): Promise<void> {
    console.log("🧠 AI Engine initialized");
    this.modelLoaded = true;
  }

  async chat(characterId: number, message: string, userId?: number): Promise<AIResponse> {
    if (!this.modelLoaded) await this.loadModel();
    const response = await this.generateResponse(characterId, message);
    this.db.saveMessage({
      characterId, userId: userId || 0, content: message,
      response: response.text, role: "user", createdAt: new Date(),
    });
    this.db.saveMessage({
      characterId, userId: userId || 0, content: response.text,
      response: null, role: "ai", createdAt: new Date(),
    });
    return response;
  }

  private async generateResponse(characterId: number, _message: string): Promise<AIResponse> {
    const responses: Record<number, string[]> = {
      1: ["مرحباً! أنا نور، مساعدك الذكي.", "هذا موضوع مثير للاهتمام!", "أنا هنا لأستمع إليك."],
      2: ["أهلاً بك! أنا سارة 😊", "وجهة نظرك مثيرة!", "دعنا نناقش هذا!"],
      3: ["مرحباً. أنا أحمد.", "من الناحية التقنية...", "أفهم ما تقصد."],
    };
    const characterResponses = responses[characterId] || responses[1];
    const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];
    return { text: randomResponse, emotion: "happy", timestamp: new Date() };
  }

  async getHistory(characterId: number, userId?: number): Promise<any[]> {
    return this.db.getMessages(characterId, userId);
  }

  async getStatus(): Promise<{ loaded: boolean; ready: boolean }> {
    return { loaded: this.modelLoaded, ready: this.modelLoaded };
  }
}

export const aiEngine = new AIEngine();
