
import { 
    GoogleGenAI, 
    Modality, 
    GenerateContentResponse, 
    Chat, 
    LiveServerMessage, 
    Content,
    Part
} from "@google/genai";

class GeminiService {
    private ai: GoogleGenAI;

    constructor() {
        // As per guidelines, API_KEY must be from process.env.
        // It's assumed to be available in the execution context.
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    }
    
    // Fix: Changed the type of 'contents' to 'string | Content | Content[]' to match the Gemini API SDK.
    async generateContent(model: string, contents: string | Content | Content[]): Promise<GenerateContentResponse> {
        return this.ai.models.generateContent({ model, contents });
    }
    
    createChat(model: string): Chat {
        return this.ai.chats.create({ model });
    }
    
    // Fix: Changed the type of 'contents' to 'string | Content | Content[]' to match the Gemini API SDK.
    async groundedSearch(contents: string | Content | Content[], useMaps: boolean = false): Promise<GenerateContentResponse> {
        const tools: any[] = [{ googleSearch: {} }];
        if (useMaps) {
            tools.push({ googleMaps: {} });
        }

        return this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                tools,
            },
        });
    }

    async generateContentWithParts(model: string, parts: Part[]): Promise<GenerateContentResponse> {
        const contents = { parts };
        return this.ai.models.generateContent({ model, contents });
    }

    async generateImage(prompt: string): Promise<string> {
        const response = await this.ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        const base64ImageBytes = response.generatedImages[0]?.image.imageBytes;
        if (!base64ImageBytes) {
            throw new Error("Image generation failed.");
        }
        return base64ImageBytes;
    }
    
    async generateSpeech(text: string): Promise<string> {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from TTS service.");
        }
        return base64Audio;
    }

    // Fix: 'LiveSession', 'ErrorEvent', and 'CloseEvent' are not exported from '@google/genai'.
    // Using 'any' for the session and relying on global event types.
    connectLive(callbacks: {
        onopen: () => void;
        onmessage: (message: LiveServerMessage) => Promise<void>;
        onerror: (e: ErrorEvent) => void;
        onclose: (e: CloseEvent) => void;
    }): Promise<any> {
        return this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks,
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
    }
}

export const geminiService = new GeminiService();