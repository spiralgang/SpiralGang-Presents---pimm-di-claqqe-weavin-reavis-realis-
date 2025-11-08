import { useState, useCallback } from 'react';

export type Message = {
    id: string;
    role: 'user' | 'model';
    content: string;
    // Future extensions could include grounding metadata, media attachments, etc.
};

export const useConversationManager = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const addUserMessage = useCallback((content: string) => {
        const newMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content,
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const addModelMessage = useCallback((content: string) => {
        const newMessage: Message = {
            id: `model-${Date.now()}`,
            role: 'model',
            content,
        };
        setMessages(prev => [...prev, newMessage]);
        return newMessage;
    }, []);

    const updateModelMessage = useCallback((id: string, newContent: string) => {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, content: newContent } : msg));
    }, []);
    
    const startTurn = useCallback((userMessageContent: string) => {
        setIsLoading(true);
        setError(null);
        addUserMessage(userMessageContent);
    }, [addUserMessage]);

    const endTurn = useCallback((modelMessageContent?: string, err?: Error) => {
        setIsLoading(false);
        if (err) {
            setError(err);
            addModelMessage(`Sorry, an error occurred: ${err.message}`);
        } else if (modelMessageContent) {
            addModelMessage(modelMessageContent);
        }
    }, [addModelMessage]);

    const clearConversation = useCallback(() => {
        setMessages([]);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        messages,
        isLoading,
        error,
        startTurn,
        endTurn,
        clearConversation,
    };
};
