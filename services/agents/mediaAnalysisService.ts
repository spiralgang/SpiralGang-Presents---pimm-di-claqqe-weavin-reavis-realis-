import { GenerateContentResponse, Part } from '@google/genai';
import { geminiService } from '../geminiService';

class MediaAnalysisService {
    async analyze(parts: Part[], model: string = 'gemini-2.5-flash'): Promise<GenerateContentResponse> {
        return geminiService.generateContentWithParts(model, parts);
    }
}

export const mediaAnalysisService = new MediaAnalysisService();
