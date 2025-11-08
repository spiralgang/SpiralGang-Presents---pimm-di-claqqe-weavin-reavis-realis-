import { geminiService } from '../geminiService';

class TtsService {
    /**
     * Converts a string of text into spoken audio.
     * @param text The text to synthesize.
     * @returns A base64 encoded string of the audio data.
     */
    async generateSpeech(text: string): Promise<string> {
        return geminiService.generateSpeech(text);
    }
}

export const ttsService = new TtsService();
