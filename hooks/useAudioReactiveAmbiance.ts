import { useEffect, useRef, useState, useCallback } from 'react';

// --- AUDIO-REACTIVE AMBIANCE ENGINE ---
export const useAudioReactiveAmbiance = () => {
    const [isAudioActive, setIsAudioActive] = useState(false);
    const [isPermissionDenied, setIsPermissionDenied] = useState(false);
    
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameId = useRef<number>(0);
    const beatDetection = useRef({
        lastEnergy: 0,
        threshold: 1.1,
        lastBeatTime: 0,
    }).current;

    const cleanup = useCallback(() => {
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = 0;
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        sourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
        setIsAudioActive(false);
    }, []);

    const activate = useCallback(async () => {
        if (isAudioActive || isPermissionDenied) return;

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn("Audio analysis not supported by this browser.");
                setIsPermissionDenied(true);
                return;
            }

            // Stop any running non-reactive animation loop before starting the new one
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = 0;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;

            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.7;
            analyserRef.current = analyser;

            const source = context.createMediaStreamSource(stream);
            source.connect(analyser);
            sourceRef.current = source;
            
            setIsAudioActive(true);
            setIsPermissionDenied(false);

            const root = document.documentElement;
            let beatIntensity = 0;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const animate = (time: number) => {
                // --- Channel 1: Hue Rotation (Slow, Continuous) ---
                const baseHue = (time / 30000) * 360 % 360;
                const hue1 = baseHue;
                const hue2 = (baseHue + 120) % 360;
                root.style.setProperty('--dynamic-hue-1', `${hue1}`);
                root.style.setProperty('--dynamic-hue-2', `${hue2}`);

                // --- Channel 2: Audio Beat Detection ---
                if (analyserRef.current) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    
                    const bassEnergy = dataArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

                    if (bassEnergy > beatDetection.lastEnergy * beatDetection.threshold && time - beatDetection.lastBeatTime > 200) {
                         if(bassEnergy > 50) {
                            beatIntensity = 1.0;
                            beatDetection.lastBeatTime = time;
                         }
                    }
                    beatDetection.lastEnergy = (beatDetection.lastEnergy * 0.98) + (bassEnergy * 0.02);
                }

                root.style.setProperty('--beat-intensity', `${beatIntensity}`);
                beatIntensity *= 0.94;
                if (beatIntensity < 0.01) beatIntensity = 0;

                animationFrameId.current = requestAnimationFrame(animate);
            };
            animate(0);

        } catch (err) {
            console.error("Microphone access denied for audio-reactive UI.", err);
            setIsPermissionDenied(true);
            setIsAudioActive(false);
        }
    }, [isAudioActive, isPermissionDenied, cleanup, beatDetection]);

    // Effect for the default, non-reactive animation
    useEffect(() => {
        if (isAudioActive) return;

        const root = document.documentElement;
        const animateFallback = (time: number) => {
            const baseHue = (time / 30000) * 360 % 360;
            const hue1 = baseHue;
            const hue2 = (baseHue + 120) % 360;
            root.style.setProperty('--dynamic-hue-1', `${hue1}`);
            root.style.setProperty('--dynamic-hue-2', `${hue2}`);
            animationFrameId.current = requestAnimationFrame(animateFallback);
        };
        
        // Start the fallback animation only if no other loop is running
        if (!animationFrameId.current) {
            animateFallback(0);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = 0;
            }
        };
    }, [isAudioActive]);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return { isAudioActive, isPermissionDenied, activate };
};