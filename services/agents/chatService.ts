import { Chat } from '@google/genai';
import { geminiService } from '../geminiService';

class ChatService {
    private chat: Chat;

    constructor(model: string = 'gemini-2.5-flash') {
        this.chat = geminiService.createChat(model);
    }

    async sendMessage(message: string): Promise<string> {
        // As per docs, chat.sendMessage can take a simple message object
        const response = await this.chat.sendMessage({ message });
        return response.text;
    }

    async getHistory() {
        return this.chat.getHistory();
    }
}

export const chatService = new ChatService();
