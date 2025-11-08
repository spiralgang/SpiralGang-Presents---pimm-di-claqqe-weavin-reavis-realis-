
import { GenerateContentResponse, Content } from '@google/genai';
import { geminiService } from '../geminiService';

class GroundingService {
    // Fix: Replaced incorrect type 'Contents' with 'Content'.
    async search(query: string | Content, useMaps: boolean = false): Promise<GenerateContentResponse> {
        const contents = typeof query === 'string' ? [{ parts: [{ text: query }] }] : query;
        return geminiService.groundedSearch(contents, useMaps);
    }
}

export const groundingService = new GroundingService();
