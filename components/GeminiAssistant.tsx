import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';
import { X, Send, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeminiAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'model', text: 'Hello! I am your ZYRA stylist. Ask me anything about the Zyra Ultra Green features or styling tips.' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsThinking(true);

        try {
            // Use process.env.API_KEY directly as per GenAI guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-2.5-flash'; 
            
            const prompt = `
            You are a helpful product assistant for a shoe brand called ZYRA.
            The product is "Zyra Ultra Green".
            Key features: Bioluminescent sole, recycled ocean plastic mesh, adaptive fit, lightweight (200g).
            Tone: Futuristic, energetic, helpful.
            User query: ${inputValue}
            `;

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
            });

            // Use response.text directly
            const text = response.text || "I'm having trouble connecting to the styling network. Please try again.";

            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I encountered an error. Please try again later." }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%', opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: '100%', opacity: 0 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="fixed right-0 top-0 h-full w-full md:w-[400px] bg-brand-dark/95 backdrop-blur-md border-l border-brand-green/20 z-50 flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-brand-green/20 flex justify-between items-center bg-gradient-to-r from-brand-dark to-green-900/20">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-brand-green" />
                            <h2 className="text-xl font-display text-white tracking-wider">ZYRA <span className="text-brand-green">AI</span></h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-brand-green text-brand-dark font-medium rounded-tr-none' 
                                        : 'bg-white/10 text-gray-100 rounded-tl-none border border-white/5'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none">
                                    <Loader2 className="w-5 h-5 text-brand-green animate-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-brand-dark">
                        <div className="relative">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask about sizing, materials, styling..."
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-5 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50 transition-all"
                            />
                            <button 
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isThinking}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-green rounded-full text-brand-dark hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GeminiAssistant;