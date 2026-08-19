
import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, FileText, Globe, CheckCircle2, MessageSquare, Sparkles, Trash2, Loader2, Info, ChevronRight, Book, HelpCircle, Layout, Send } from 'lucide-react';
import { useAppContext } from '../App';
import { LMSource, LMGuide, ChatMessage } from '../types';
import { getGroundedChatResponse, generateNotebookGuide } from '../services/geminiService';

export const NotebookLM: React.FC = () => {
    const { language } = useAppContext();
    const [sources, setSources] = useState<LMSource[]>(() => {
        const saved = localStorage.getItem('edu_lm_sources');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSourceModal, setShowSourceModal] = useState(false);
    const [newSourceType, setNewSourceType] = useState<'text' | 'url'>('text');
    const [newSourceTitle, setNewSourceTitle] = useState('');
    const [newSourceContent, setNewSourceContent] = useState('');
    
    const [guide, setGuide] = useState<LMGuide | null>(null);
    const [loadingGuide, setLoadingGuide] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        localStorage.setItem('edu_lm_sources', JSON.stringify(sources));
    }, [sources]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addSource = () => {
        if (!newSourceTitle || !newSourceContent) return;
        const source: LMSource = {
            id: Date.now().toString(),
            title: newSourceTitle,
            content: newSourceContent,
            type: newSourceType,
            selected: true,
            timestamp: Date.now()
        };
        setSources([...sources, source]);
        setNewSourceTitle('');
        setNewSourceContent('');
        setShowSourceModal(false);
    };

    const toggleSource = (id: string) => {
        setSources(sources.map(s => s.id === id ? { ...s, selected: !s.selected } : s));
    };

    const deleteSource = (id: string) => {
        setSources(sources.filter(s => s.id !== id));
    };

    const handleChat = async (e?: React.FormEvent, customInput?: string) => {
        if (e) e.preventDefault();
        const finalInput = customInput || input;
        if (!finalInput.trim() || loading) return;

        const activeSources = sources.filter(s => s.selected);
        if (activeSources.length === 0) {
            alert("Please select at least one source to chat.");
            return;
        }

        const userMsg: ChatMessage = { id: Date.now().toString() + Math.random().toString(36).substring(7), role: 'user', text: finalInput, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        if (!customInput) setInput('');
        setLoading(true);

        try {
            const aiResponse = await getGroundedChatResponse(finalInput, sources, language);
            const aiMsg: ChatMessage = { id: Date.now().toString() + Math.random().toString(36).substring(7), role: 'ai', text: aiResponse, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const generateGuide = async () => {
        const activeSources = sources.filter(s => s.selected);
        if (activeSources.length === 0) return;
        
        setLoadingGuide(true);
        setShowGuide(true);
        try {
            const result = await generateNotebookGuide(sources, language);
            setGuide(result);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingGuide(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl relative font-sans">
            
            {/* Left Sidebar: Sources */}
            <aside className="w-80 bg-white border-r border-slate-100 flex flex-col z-10">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-black text-slate-800 tracking-tight flex items-center gap-2 uppercase text-xs">
                            <Book className="w-4 h-4 text-indigo-600" /> Sources
                        </h2>
                        <button 
                            onClick={() => setShowSourceModal(true)}
                            className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {sources.filter(s => s.selected).length} selected / {sources.length} total
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {sources.map(s => (
                        <div key={s.id} className={`group p-4 rounded-2xl border transition-all cursor-pointer ${s.selected ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100'}`} onClick={() => toggleSource(s.id)}>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.type === 'url' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {s.type === 'url' ? <Globe className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); deleteSource(s.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3 className={`font-bold text-sm truncate ${s.selected ? 'text-indigo-900' : 'text-slate-700'}`}>{s.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className={`w-3 h-3 rounded-full border-2 ${s.selected ? 'bg-indigo-600 border-indigo-200' : 'bg-transparent border-slate-300'}`} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.selected ? 'Active' : 'Muted'}</span>
                            </div>
                        </div>
                    ))}
                    {sources.length === 0 && (
                        <div className="text-center py-20 px-6">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No sources added yet</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                    <button 
                        onClick={generateGuide}
                        disabled={sources.filter(s => s.selected).length === 0}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <Layout className="w-4 h-4" /> Notebook Guide
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative bg-white">
                
                {/* Header Context Bar */}
                <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-black text-slate-900 tracking-tight text-lg">NotebookLM Clone</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Source-Grounded Reasoning</p>
                        </div>
                    </div>
                </div>

                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar scroll-smooth">
                    {messages.length === 0 && !showGuide && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
                            <div className="relative">
                                <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 animate-in zoom-in-95 duration-1000">
                                    <MessageSquare className="w-16 h-16" />
                                </div>
                                <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-indigo-400 animate-pulse" />
                            </div>
                            <div className="max-w-md space-y-4">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Your Grounded Research Assistant</h3>
                                <p className="text-slate-500 font-medium text-lg leading-relaxed">Add sources like PDFs or web articles to chat with the AI about specific knowledge. Every answer is cited from your material.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                                {["Summarize key points", "What is the conclusion?", "Explain Source 1", "Contrast sources"].map(q => (
                                    <button key={q} onClick={() => handleChat(undefined, q)} className="p-5 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95 text-left flex items-center gap-3 group">
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {showGuide && (
                        <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 animate-in slide-in-from-bottom-8 duration-500 relative">
                            <button onClick={() => setShowGuide(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                                <Trash2 className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-white p-4 rounded-3xl shadow-sm text-indigo-600"><Layout className="w-8 h-8" /></div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Source Guide</h2>
                            </div>
                            
                            {loadingGuide ? (
                                <div className="flex flex-col items-center py-20 gap-4">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synthesizing across sources...</p>
                                </div>
                            ) : guide ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Overview</h4>
                                        <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed bg-white p-8 rounded-[2rem] shadow-sm">
                                            {guide.summary}
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Suggested Questions</h4>
                                            <div className="space-y-3">
                                                {guide.suggestedQuestions.map((q, i) => (
                                                    <button key={i} onClick={() => { setShowGuide(false); handleChat(undefined, q); }} className="w-full text-left p-6 bg-white border border-slate-100 rounded-3xl text-sm font-bold text-slate-700 hover:border-indigo-600 transition-all flex items-center gap-4 group">
                                                        <HelpCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Key Topics</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {guide.topics.map(t => (
                                                    <span key={t} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {!showGuide && messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
                            <div className="max-w-[80%] flex flex-col gap-3">
                                <div className={`p-8 rounded-[2.5rem] shadow-sm relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                    <div className="prose prose-lg max-w-none text-inherit leading-relaxed whitespace-pre-line">
                                        {msg.text}
                                    </div>
                                    <div className={`absolute -bottom-8 ${msg.role === 'user' ? 'right-4' : 'left-4'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-2`}>
                                        <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><FileText className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className={`text-[10px] font-black text-slate-300 uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {msg.role === 'user' ? 'You' : 'Grounded Assistant'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-8 bg-white border-t border-slate-50 sticky bottom-0 z-10">
                    <form onSubmit={handleChat} className="flex gap-4 items-end bg-slate-50 p-4 rounded-[2.5rem] border border-slate-200 focus-within:ring-8 focus-within:ring-indigo-50/50 transition-all">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }}
                            placeholder="Ask these sources anything..."
                            className="flex-1 bg-transparent p-4 focus:outline-none text-slate-800 placeholder-slate-400 font-medium resize-none max-h-40 leading-relaxed text-lg"
                            rows={1}
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || loading}
                            className={`p-5 rounded-[2rem] text-white shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${input.trim() ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        >
                            {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8" />}
                        </button>
                    </form>
                </div>
            </main>

            {/* Source Addition Modal */}
            {showSourceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl border border-white/20 relative">
                        <button onClick={() => setShowSourceModal(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
                            <Plus className="w-8 h-8 rotate-45" />
                        </button>
                        
                        <div className="mb-10 text-center space-y-3">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-200 mb-4">
                                <Plus className="w-8 h-8" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Add Source</h3>
                            <p className="text-slate-500 font-medium">Power up your notebook with specific knowledge.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                                <button onClick={() => setNewSourceType('text')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newSourceType === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Text Snippet</button>
                                <button onClick={() => setNewSourceType('url')} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newSourceType === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Web Link</button>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                                <input 
                                    type="text" 
                                    value={newSourceTitle}
                                    onChange={(e) => setNewSourceTitle(e.target.value)}
                                    placeholder="Chapter 1: Quantum Physics..."
                                    className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{newSourceType === 'text' ? 'Content' : 'URL'}</label>
                                <textarea 
                                    value={newSourceContent}
                                    onChange={(e) => setNewSourceContent(e.target.value)}
                                    placeholder={newSourceType === 'text' ? 'Paste the text content here...' : 'https://example.com/article'}
                                    className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-medium h-40 resize-none"
                                />
                            </div>

                            <button onClick={addSource} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg shadow-xl hover:bg-slate-800 transition-all active:scale-95">Add to Notebook</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
