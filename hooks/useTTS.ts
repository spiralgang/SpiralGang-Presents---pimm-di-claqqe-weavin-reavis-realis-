import { useState, useCallback, useRef } from 'react';
// Fix: Use the ttsService agent instead of directly calling the base geminiService
import { ttsService } from '../services/agents/ttsService';
import { decode, decodeAudioData } from '../utils/audioEncoder';

export const useTTS = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const speak = useCallback(async (text: string) => {
        if (isSpeaking) {
            // Stop current speech if any
            if (sourceRef.current) {
                sourceRef.current.stop();
            }
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        try {
            const base64Audio = await ttsService.generateSpeech(text);
            
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioContext = audioContextRef.current;
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
            
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.destination);
            source.onended = () => {
                setIsSpeaking(false);
                sourceRef.current = null;
            };
            source.start(0);
            sourceRef.current = source;
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    }, [isSpeaking]);

    return { speak, isSpeaking };
};
