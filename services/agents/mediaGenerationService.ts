import { geminiService } from '../geminiService';

class MediaGenerationService {
    async generateImage(prompt: string): Promise<string> {
        return geminiService.generateImage(prompt);
    }
    // A method for video generation could be added here in the future.
}

export const mediaGenerationService = new MediaGenerationService();
