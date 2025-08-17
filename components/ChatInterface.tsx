import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChatMessage } from '../types';
import { initWellnessChat, sendChatMessage } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { RecommendationCard } from './RecommendationCard';

export const ChatInterface: React.FC = () => {
    const { currentUser, addHistory, addNotification } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (currentUser) {
            initWellnessChat(currentUser);
            setMessages([
                {
                    id: Date.now(),
                    sender: 'ai',
                    text: `¡Hola, ${currentUser.name}! Soy Caliope, tu asistente de bienestar. ¿Cómo te sientes hoy o qué estás buscando?`,
                    quickReplies: ['Necesito relajarme', 'Quiero más energía', 'Busco mejorar mi estado físico']
                }
            ]);
        }
    }, [currentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const submitMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading || !currentUser) return;

        const userMessage: ChatMessage = { id: Date.now(), sender: 'user', text: messageText };

        const updatedMessages = messages.map(m => ({ ...m, quickReplies: undefined }));
        setMessages([...updatedMessages, userMessage]);
        
        setIsLoading(true);

        try {
            const { text: aiText, recommendations } = await sendChatMessage(messageText);

            const aiResponse: ChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: aiText,
                recommendations: recommendations.length > 0 ? recommendations : undefined
            };

            setMessages(prev => [...prev, aiResponse]);
            
            if (recommendations.length > 0) {
                addHistory(messageText, recommendations);
                addNotification(`Encontré ${recommendations.length} sugerencias para ti.`, 'success');
            }

        } catch (err: any) {
            addNotification(err.message || 'Ocurrió un error.', 'error');
            const errorResponse: ChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: "Lo siento, tuve un problema al procesar tu solicitud. Por favor, inténtalo de nuevo."
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitMessage(input);
        setInput('');
    };
    
    const handleQuickReplyClick = (replyText: string) => {
        submitMessage(replyText);
    };


    return (
        <div className="bg-white rounded-lg shadow-md h-[80vh] flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-primary">Conversa con Caliope</h2>
                <p className="text-sm text-gray-500">Tu asistente personal de bienestar</p>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.text && (
                             <div className={`max-w-lg px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        )}
                        {msg.quickReplies && !isLoading && (
                             <div className="mt-2 flex flex-wrap gap-2 items-start">
                                {msg.quickReplies.map((reply, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickReplyClick(reply)}
                                        className="px-4 py-2 bg-secondary/50 text-primary-dark font-semibold rounded-full text-sm hover:bg-secondary transition-colors"
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        )}
                        {msg.recommendations && (
                            <div className="mt-2 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                {msg.recommendations.map(service => (
                                     <RecommendationCard 
                                        key={service.id} 
                                        service={service} 
                                        isAlreadyBooked={!!currentUser?.appointments?.some(a => a.serviceId === service.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start">
                        <div className="max-w-lg px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none animate-pulse">
                           <span className="text-sm">Caliope está pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Describe cómo te sientes..."
                        className="flex-1 p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent transition"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
};