
import { GenerateContentResponse, Content } from '@google/genai';
import { geminiService } from '../geminiService';

class ReasoningService {
    /**
     * Sends a query to a model optimized for complex reasoning.
     * @param contents The user's query/prompt.
     * @param model The model to use, defaulting to a 'pro' version.
     * @returns The model's response.
     */
    // Fix: Replaced incorrect type 'Contents' with 'Content[]' to match usage.
    async query(contents: Content[], model: string = 'gemini-2.5-pro'): Promise<GenerateContentResponse> {
        return geminiService.generateContent(model, contents);
    }
}

export const reasoningService = new ReasoningService();
