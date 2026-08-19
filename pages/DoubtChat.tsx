
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../App';
import { getGeminiResponse } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { SUBJECTS } from '../constants';
import { ChatMessage, Subject } from '../types';

export const DoubtChat: React.FC = () => {
    const { language } = useAppContext();
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = localStorage.getItem('edusphere_doubt_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem('edusphere_doubt_history', JSON.stringify(messages));
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { 
            id: Date.now().toString() + Math.random().toString(36).substring(7), 
            role: 'user', 
            text: input, 
            timestamp: new Date() 
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const aiText = await getGeminiResponse(`User Doubt: ${input}`, language);
            const aiMsg: ChatMessage = { 
                id: Date.now().toString() + Math.random().toString(36).substring(7), 
                role: 'ai', 
                text: aiText, 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-white overflow-hidden animate-in fade-in duration-500 relative">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">AI Doubt Solver</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instant Academic Support</p>
                    </div>
                </div>
                <button onClick={() => { if(confirm("Clear history?")) { setMessages([]); localStorage.removeItem('edusphere_doubt_history'); } }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-xl hover:bg-rose-100 transition-colors">Reset Chat</button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center space-y-6">
                        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-inner flex items-center justify-center text-5xl">💬</div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-700">Ask Anything!</h3>
                            <p className="max-w-xs mx-auto font-medium">I'm your 24/7 academic assistant. No subject filters, just pure knowledge.</p>
                        </div>
                    </div>
                )}
                
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                        <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm ${
                            msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        }`}>
                            <p className="text-base font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-3 block opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white border border-slate-100 p-5 rounded-[2rem] rounded-tl-none flex items-center gap-3 shadow-sm">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tutor is thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
                <form onSubmit={handleSend} className="flex gap-4 max-w-4xl mx-auto">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your academic question here..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-8 focus:ring-indigo-50 font-medium text-lg transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-slate-900 text-white px-8 rounded-2xl shadow-2xl hover:bg-indigo-600 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center"
                    >
                        <span className="text-2xl">🚀</span>
                    </button>
                </form>
            </div>
        </div>
    );
};
