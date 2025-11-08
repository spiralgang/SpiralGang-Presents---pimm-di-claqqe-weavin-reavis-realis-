
import React, { useState } from 'react';
import { useConversationManager } from './hooks/useConversationManager';
import { useOrchestrator } from './hooks/useOrchestrator';
import { PaperAirplaneIcon, SparklesIcon, UserIcon, CubeIcon, CubeTransparentIcon } from './components/icons';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isFluxModeActive, setIsFluxModeActive] = useState(false);
    const conversationManager = useConversationManager();
    const { messages, isLoading, error } = conversationManager;
    const { handleNewPrompt } = useOrchestrator(conversationManager);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading || !prompt.trim()) return;
        handleNewPrompt(prompt);
        setPrompt('');
    };

    return (
        <div className={`flex flex-col h-screen bg-gray-900 text-white font-sans flux-background ${isFluxModeActive ? 'flux-active' : ''}`}>
            <div className="flux-container-transform w-full h-full flex flex-col">
                <header className="p-4 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                        <span>Gemini Conceptual Catalyst</span>
                    </h1>
                    <button
                        onClick={() => setIsFluxModeActive(!isFluxModeActive)}
                        className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                        aria-label="Toggle Flux Mode"
                        title="Toggle Flux Mode"
                    >
                        {isFluxModeActive ? (
                            <CubeIcon className="w-6 h-6 text-purple-400" />
                        ) : (
                            <CubeTransparentIcon className="w-6 h-6 text-gray-400" />
                        )}
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <SparklesIcon className="w-16 h-16 mb-4" />
                            <h2 className="text-2xl font-semibold">Start a conversation</h2>
                            <p>Ask me anything to get started.</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-purple-400" /></div>}
                            <div className={`max-w-2xl px-4 py-3 rounded-lg shadow-md ${msg.role === 'user' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                                <div className="prose prose-invert prose-sm md:prose-base max-w-none">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                            {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-gray-300" /></div>}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-4 justify-start">
                            <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><SparklesIcon className="w-5 h-5 text-purple-400 animate-pulse" /></div>
                            <div className="max-w-2xl px-4 py-3 rounded-lg shadow-md bg-gray-800">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="flex justify-start">
                            <div className="max-w-2xl p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300">
                            <p><strong>Error:</strong> {error.message}</p>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSubmit} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !prompt.trim()}
                                className="p-2 w-10 h-10 flex items-center justify-center bg-purple-600 rounded-full hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                                aria-label="Send message"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default App;
