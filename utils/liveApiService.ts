
import { LiveServerMessage } from '@google/genai';
import { geminiService } from '../geminiService';

class LiveApiService {
    // Fix: 'LiveSession', 'ErrorEvent', and 'CloseEvent' are not exported from '@google/genai'.
    // Using 'any' for the session and relying on global event types.
    connect(callbacks: {
        onopen: () => void;
        onmessage: (message: LiveServerMessage) => Promise<void>;
        onerror: (e: ErrorEvent) => void;
        onclose: (e: CloseEvent) => void;
    }): Promise<any> {
        return geminiService.connectLive(callbacks);
    }
}

export const liveApiService = new LiveApiService();
