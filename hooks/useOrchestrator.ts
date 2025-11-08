import { useCallback } from 'react';
import { reasoningService } from '../services/agents/reasoningService';
import { useConversationManager } from './useConversationManager';

/**
 * The Orchestrator is responsible for receiving a user prompt
 * and routing it to the appropriate agent based on its content and intent.
 * This is a simplified version that defaults to the reasoning agent.
 */
export const useOrchestrator = (
    conversationManager: ReturnType<typeof useConversationManager>
) => {
    const { startTurn, endTurn } = conversationManager;

    const handleNewPrompt = useCallback(async (prompt: string) => {
        if (!prompt) return;

        startTurn(prompt);

        try {
            const contents = [{ parts: [{ text: prompt }] }];
            // Default to the reasoning service for general queries.
            const response = await reasoningService.query(contents);
            
            // Per guidelines, response.text is the correct and simplest way to get text output.
            const responseText = response.text;
            
            if (responseText) {
                endTurn(responseText);
            } else {
                endTurn("I'm sorry, I couldn't generate a response.");
            }
        } catch (error) {
            console.error("Orchestrator error:", error);
            endTurn(undefined, error instanceof Error ? error : new Error("An unknown error occurred."));
        }
    }, [startTurn, endTurn]);

    return {
        handleNewPrompt,
    };
};
