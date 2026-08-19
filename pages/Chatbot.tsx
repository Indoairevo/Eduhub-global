
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatMessage } from '../types';
import { Send, Bot, Trash2, Loader2, Sparkles, MessageSquare, Mic, Video, Info, Copy, Share2, X, Image as ImageIcon, Search, MapPin, Volume2, FileUp, Paperclip, BookOpen, FileText, Library, Code, Globe, Headphones, ChevronDown, ExternalLink, Key } from 'lucide-react';
import { streamGeminiResponse, getLangInstruction, generateVideo, generateImage, performGlobalSearch, searchPlaces, generateSpeech, GeminiModel } from '../services/geminiService';
import { useAppContext } from '../App';

import { StudyBuddy } from './StudyBuddy';
import { LiveTutor } from './LiveTutor';
import { DocuMind } from './DocuMind';
import { NotebookLM } from './NotebookLM';
import { CodeLab } from './CodeLab';
import { LinguaSphere } from './LinguaSphere';
import { AudioStudio } from './AudioStudio';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

/**
 * Enhanced Markdown component with syntax highlighting
 */
const RichText: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
    return (
        <div className={`markdown-body prose prose-sm md:prose-lg max-w-none ${isUser ? 'text-white prose-invert' : 'text-slate-700 prose-slate'}`}>
            <Markdown 
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={atomDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl my-4"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={`${className} bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold`} {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {text}
            </Markdown>
        </div>
    );
};

export const Chatbot: React.FC = () => {
  const { t, language } = useAppContext();
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('edusphere_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [mapsMode, setMapsMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(() => {
    const state = location.state as { tab?: string };
    return state?.tab || 'chat';
  });
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3-flash-preview');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (location.state && (location.state as any).tab) {
        setActiveTab((location.state as any).tab);
    }
  }, [location.state]);

  const tabs = [
    { id: 'chat', label: 'Doubt Solver', icon: <Bot className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'study-buddy', label: 'Study Buddy', icon: <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'live-tutor', label: 'Live Tutor', icon: <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'documind', label: 'DocuMind', icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'notebook-lm', label: 'Notebook LM', icon: <Library className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'code-lab', label: 'Code Lab', icon: <Code className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'lingua-sphere', label: 'Lingua Sphere', icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'audio-studio', label: 'Audio Studio', icon: <Headphones className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  useEffect(() => {
    localStorage.setItem('edusphere_chat_history', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const finalInput = customInput || input;
    if (!finalInput.trim() && !fileBase64) return;
    if (isLoading) return;

    const userMsg: ChatMessage = { 
        id: Date.now().toString() + Math.random().toString(36).substring(7), 
        role: 'user', 
        text: finalInput, 
        timestamp: new Date(),
        attachmentType: fileBase64 ? 'image' : undefined,
        attachmentUrl: fileBase64 || undefined
    };
    setMessages(prev => [...prev, userMsg]);
    if (!customInput) setInput('');
    setFile(null);
    setFileBase64(null);
    setIsLoading(true);

    try {
        const aiMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
        setMessages(prev => [...prev, { id: aiMsgId, role: 'ai', text: '', timestamp: new Date(), model: selectedModel }]);
        
        let accumulatedText = '';
        let accumulatedSources: { title: string; url: string }[] = [];
        
        if (searchMode) {
            const res = await performGlobalSearch(finalInput, language);
            accumulatedText = res.text;
            accumulatedSources = res.citations.map(c => ({ title: c.title, url: c.uri }));
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText, sources: accumulatedSources } : m));
        } else if (mapsMode) {
            const res = await searchPlaces(finalInput, language);
            accumulatedText = res.text;
            accumulatedSources = res.places.map(p => ({ title: p.title, url: p.uri }));
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText, sources: accumulatedSources } : m));
        } else {
            // Construct Memory Context (Last 3 turns)
            const recentHistory = messages.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n');
            const contextPrompt = `
            Previous Context:
            ${recentHistory}
            
            Current User Request: ${finalInput}
            ${fileBase64 ? '(User has uploaded an image for context)' : ''}
            
            ${getLangInstruction(language)}. 
            Provide a structured, deep academic response. Use emojis.
            CRITICAL: Keep simple answers extremely short and concise (one or two sentences) unless the user specifically asks for detail.
            `;

            const iterator = streamGeminiResponse(contextPrompt, selectedModel, true); // Search enabled by default for Gemini-like feel
            for await (const chunk of iterator) {
                accumulatedText += chunk.text;
                if (chunk.sources && chunk.sources.length > 0) {
                    // Deduplicate sources
                    const newSources = [...accumulatedSources];
                    chunk.sources.forEach(s => {
                        if (!newSources.some(ns => ns.url === s.url)) {
                            newSources.push(s);
                        }
                    });
                    accumulatedSources = newSources;
                }
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: accumulatedText, sources: accumulatedSources } : m));
            }
        }
    } catch (e: any) { 
        console.error(e); 
        if (e.message?.includes("entity was not found")) {
            setHasApiKey(false);
            alert("API Key session expired. Please select your API key again.");
        }
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random().toString(36).substring(7), role: 'ai', text: '❌ Error: The AI tutor is currently offline. Please try again later.', timestamp: new Date() }]);
    } finally { 
        setIsLoading(false); 
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setHasApiKey(true);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
    };
    recognition.start();
  };

  const handleTTS = async (text: string) => {
    const audioData = await generateSpeech(text, 'Zephyr');
    if (audioData) {
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audio.play();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setFileBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt.trim() || isGeneratingVideo) return;
    
    setIsGeneratingVideo(true);
    setShowVideoModal(false);
    
    const videoMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
    const placeholderMsg: ChatMessage = { 
        id: videoMsgId, 
        role: 'ai', 
        text: `🎬 Visualizing: **${videoPrompt}**...`, 
        timestamp: new Date(),
        attachmentType: 'video' 
    };
    setMessages(prev => [...prev, placeholderMsg]);

    try {
        const videoUrl = await generateVideo(videoPrompt);
        if (videoUrl) {
            setMessages(prev => prev.map(m => m.id === videoMsgId ? { 
                ...m, 
                text: `✅ Video rendering complete for: **${videoPrompt}**`, 
                attachmentUrl: videoUrl 
            } : m));
        } else {
            throw new Error("Empty URL returned");
        }
    } catch (error) {
        setMessages(prev => prev.map(m => m.id === videoMsgId ? { 
            ...m, 
            text: "⚠️ Failed to generate cinematic video. Please try a simpler prompt.", 
            attachmentType: undefined 
        } : m));
    } finally {
        setIsGeneratingVideo(false);
        setVideoPrompt('');
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    setShowImageModal(false);
    
    const imageMsgId = Date.now().toString() + Math.random().toString(36).substring(7);
    const placeholderMsg: ChatMessage = { 
        id: imageMsgId, 
        role: 'ai', 
        text: `🎨 Generating image for: **${imagePrompt}**...`, 
        timestamp: new Date(),
        attachmentType: 'image' 
    };
    setMessages(prev => [...prev, placeholderMsg]);

    try {
        const imageUrl = await generateImage(imagePrompt);
        if (imageUrl) {
            setMessages(prev => prev.map(m => m.id === imageMsgId ? { 
                ...m, 
                text: `✅ Image created for: **${imagePrompt}**`, 
                attachmentUrl: imageUrl 
            } : m));
        } else {
            throw new Error("Failed to generate image");
        }
    } catch (error) {
        setMessages(prev => prev.map(m => m.id === imageMsgId ? { 
            ...m, 
            text: "⚠️ Failed to generate image. Try another description.", 
            attachmentType: undefined 
        } : m));
    } finally {
        setIsGeneratingImage(false);
        setImagePrompt('');
    }
  };

  const clearHistory = () => {
    if (confirm("Clear all chat history?")) {
        setMessages([]);
        localStorage.removeItem('edusphere_chat_history');
    }
  };

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden animate-in zoom-in-95 duration-700 relative">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white shadow-sm z-20">
        <div className="p-6 border-b border-slate-100">
            <h2 className="font-black text-slate-900 tracking-tight text-xl flex items-center gap-2">
                <Bot className="w-6 h-6 text-indigo-600" />
                AI Scholar
            </h2>
            <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase mt-1">Multi-Modal Suite</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        {activeTab === 'chat' ? (
            <div className="flex flex-col h-full bg-white relative">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-2xl px-4 sm:px-10 py-4 sm:py-6 flex justify-between items-center border-b border-slate-100 z-30">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="relative">
            <div className="w-10 h-10 sm:w-14 h-14 rounded-xl sm:rounded-[1.5rem] bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-2xl shadow-indigo-300">
                <Bot className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 sm:border-4 border-white rounded-full" />
          </div>
          <div className="relative">
            <button 
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-colors group"
            >
                <h2 className="font-black text-slate-900 tracking-tight text-sm sm:text-xl">AI Scholar Assistant 🤖</h2>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showModelSelector && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {[
                        { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', desc: 'Fast & efficient' },
                        { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', desc: 'Complex reasoning', premium: true },
                        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Balanced performance' },
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id as GeminiModel); setShowModelSelector(false); }}
                            className={`w-full text-left p-3 rounded-xl transition-all ${selectedModel === m.id ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'}`}
                        >
                            <div className="flex items-center justify-between">
                                <p className="font-black text-sm">{m.label}</p>
                                {m.premium && <Sparkles className="w-3 h-3 text-amber-500" />}
                            </div>
                            <p className="text-[10px] font-medium opacity-60">{m.desc}</p>
                        </button>
                    ))}
                    <div className="mt-2 pt-2 border-t border-slate-50">
                        <button 
                            onClick={handleOpenKeySelector}
                            className="w-full flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 text-slate-400 transition-all"
                        >
                            <Key className={`w-4 h-4 ${hasApiKey ? 'text-emerald-500' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{hasApiKey ? 'API Key Active' : 'Select API Key'}</span>
                        </button>
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[8px] sm:text-[10px] text-slate-400 font-black tracking-widest uppercase">{selectedModel.split('-')[1]}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full" />
                <span className="text-[8px] sm:text-[10px] text-indigo-500 font-bold uppercase">{isLoading ? 'Synthesizing...' : 'Ready'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 sm:gap-2">
            <button 
                onClick={() => setSearchMode(!searchMode)} 
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${searchMode ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                title="Google Search Mode"
            >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline">Search</span>
            </button>
            <button 
                onClick={() => setMapsMode(!mapsMode)} 
                className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${mapsMode ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                title="Google Maps Mode"
            >
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline">Maps</span>
            </button>
            <div className="w-px h-8 sm:h-10 bg-slate-100 mx-1 sm:mx-2" />
            <button onClick={() => setShowImageModal(true)} className="p-2 sm:p-3 bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 rounded-xl sm:rounded-2xl transition-all shadow-sm" title="Generate AI Image">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={() => setShowVideoModal(true)} className="p-2 sm:p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl sm:rounded-2xl transition-all shadow-sm" title="Generate AI Video">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={clearHistory} className="p-2 sm:p-3 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 rounded-xl sm:rounded-2xl transition-all shadow-sm" title="Clear History">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 sm:py-8 space-y-8 sm:space-y-10 custom-scrollbar scroll-smooth">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-white rounded-[2rem] flex items-center justify-center mb-4 shadow-inner">
                    <Sparkles className="w-12 h-12 text-indigo-600" />
                </div>
                <div className="space-y-3">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Your Academic Universe 🌌</h3>
                    <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">I can search the web, find places, generate videos, and analyze your documents.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                    {[
                        { icon: "🔍", text: "Latest NASA missions", mode: 'search' },
                        { icon: "📍", text: "Historical sites in Delhi", mode: 'maps' },
                        { icon: "⚛️", text: "Explain Quantum Physics", mode: 'chat' },
                        { icon: "🎨", text: "Draw a cell diagram", mode: 'image' }
                    ].map(item => (
                        <button 
                            key={item.text} 
                            onClick={() => {
                                if (item.mode === 'search') setSearchMode(true);
                                if (item.mode === 'maps') setMapsMode(true);
                                handleSend(undefined, item.text);
                            }} 
                            className="p-5 bg-white border border-slate-200 rounded-[1.5rem] text-base font-bold text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm flex items-center gap-4 text-left group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span>{item.text}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
            <div className="flex flex-col gap-3 max-w-[90%] sm:max-w-[85%]">
                <div className={`
                    p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] shadow-sm relative group transition-all
                    ${msg.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}
                `}>
                    <RichText text={msg.text} isUser={msg.role === 'user'} />
                    
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Search className="w-3 h-3" /> Sources
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {msg.sources.map((source, sIdx) => (
                                    <a 
                                        key={sIdx}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 rounded-full text-[10px] font-bold text-slate-600 hover:text-indigo-600 transition-all"
                                    >
                                        <Globe className="w-3 h-3" />
                                        <span className="truncate max-w-[120px]">{source.title}</span>
                                        <ExternalLink className="w-2 h-2" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {msg.attachmentType && (
                        <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-slate-900 border border-slate-800 min-h-[200px] flex items-center justify-center shadow-2xl">
                            {msg.attachmentUrl ? (
                                msg.attachmentType === 'video' ? (
                                    <video controls className="w-full aspect-video">
                                        <source src={msg.attachmentUrl} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img src={msg.attachmentUrl} alt="AI Content" className="w-full h-full object-contain" />
                                )
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-10 text-center">
                                    <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Generating Content...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bubble Actions */}
                    <div className={`
                        absolute -bottom-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2
                        ${msg.role === 'user' ? 'right-4' : 'left-4'}
                    `}>
                        <button onClick={() => handleTTS(msg.text)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-md transition-all hover:scale-110">
                            <Volume2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 shadow-md transition-all hover:scale-110">
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest text-slate-300 ${msg.role === 'user' ? 'text-right mr-4' : 'text-left ml-4'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {msg.role === 'user' ? 'You' : 'AI Scholar'}
                </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-6 duration-500">
                <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] rounded-tl-none flex flex-col gap-4 shadow-sm min-w-[200px]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-indigo-600 animate-pulse" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholar is thinking...</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 sm:px-10 pb-4 sm:pb-8 pt-4 bg-white/60 backdrop-blur-3xl border-t border-slate-100 relative">
         {file && (
            <div className="absolute -top-16 sm:-top-20 left-4 sm:left-10 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 shadow-xl flex items-center gap-2 sm:gap-3 animate-in slide-in-from-bottom-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-lg sm:rounded-xl flex items-center justify-center text-indigo-600">
                    <Paperclip className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="pr-2 sm:pr-4">
                    <p className="text-[10px] sm:text-xs font-black text-slate-900 truncate max-w-[100px] sm:max-w-[150px]">{file.name}</p>
                    <button onClick={() => { setFile(null); setFileBase64(null); }} className="text-[8px] sm:text-[10px] font-bold text-rose-500 uppercase tracking-widest">Remove</button>
                </div>
            </div>
         )}

         <form onSubmit={handleSend} className="flex gap-2 sm:gap-4 items-end bg-white p-1.5 sm:p-2 pl-4 sm:pl-6 rounded-2xl sm:rounded-[2.5rem] shadow-2xl border border-slate-100 group focus-within:ring-8 focus-within:ring-indigo-50 transition-all">
            <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-3 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-50 mb-1"
            >
                <FileUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            
            <div className="flex-1 py-2 sm:py-3">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={searchMode ? "Search..." : mapsMode ? "Find..." : "Ask your doubt..."}
                    className="w-full bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 font-medium resize-none max-h-32 text-sm sm:text-lg leading-relaxed"
                    rows={1}
                />
            </div>
            <div className="flex items-center gap-1 sm:gap-2 pb-1 pr-1">
                <button 
                    type="button" 
                    onClick={handleVoiceInput}
                    className={`p-2 sm:p-3 transition-colors rounded-full ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-50'}`}
                >
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button 
                    type="submit" 
                    disabled={(!input.trim() && !fileBase64) || isLoading} 
                    className={`
                        p-3 sm:p-4 rounded-xl sm:rounded-2xl text-white shadow-2xl transition-all active:scale-90 disabled:opacity-50
                        ${(input.trim() || fileBase64) ? 'bg-indigo-600 shadow-indigo-300' : 'bg-slate-200'}
                    `}
                >
                    <Send className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
            </div>
         </form>
         <div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 sm:gap-6 text-[7px] sm:text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase">
            <span className={`flex items-center gap-1 sm:gap-1.5 ${searchMode ? 'text-indigo-500' : ''}`}><Search className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Web</span>
            <span className="w-1 h-1 bg-slate-100 rounded-full" />
            <span className={`flex items-center gap-1 sm:gap-1.5 ${mapsMode ? 'text-emerald-500' : ''}`}><MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Spatial</span>
            <span className="w-1 h-1 bg-slate-100 rounded-full" />
            <span className="flex items-center gap-1 sm:gap-1.5"><ImageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Vision</span>
         </div>
      </div>

      {/* Video Generation Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] sm:rounded-[4rem] w-full max-w-2xl p-6 sm:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border border-white max-h-[90vh] overflow-y-auto no-scrollbar">
                <button onClick={() => setShowVideoModal(false)} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-2 sm:p-4 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                
                <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-4">
                    <div className="bg-indigo-100 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6">
                        <Video className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Cinematic Visualization 🎥</h3>
                    <p className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed">Describe a complex concept, and our AI will render a high-fidelity educational video for you.</p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="bg-amber-50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-amber-100 text-[10px] sm:text-xs text-amber-800 font-black uppercase tracking-widest flex gap-3 sm:gap-4">
                        <Info className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span>Requires a selected API Key from a paid project.</span>
                    </div>

                    <div className="relative">
                        <textarea 
                            value={videoPrompt}
                            onChange={(e) => setVideoPrompt(e.target.value)}
                            placeholder="e.g. A 3D simulation of a black hole..."
                            className="w-full p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-indigo-50 outline-none h-32 sm:h-48 resize-none text-sm sm:text-lg leading-relaxed transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleGenerateVideo}
                        disabled={!videoPrompt.trim() || isGeneratingVideo}
                        className="w-full bg-slate-900 text-white py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-black text-lg sm:text-xl flex items-center justify-center gap-3 sm:gap-4 hover:bg-slate-800 transition-all shadow-2xl disabled:opacity-50 active:scale-95"
                    >
                        {isGeneratingVideo ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-400" /> : <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />}
                        Generate Visualization
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Image Generation Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] sm:rounded-[4rem] w-full max-w-2xl p-6 sm:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative border border-white max-h-[90vh] overflow-y-auto no-scrollbar">
                <button onClick={() => setShowImageModal(false)} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-2 sm:p-4 hover:bg-slate-100 rounded-full transition-colors text-slate-300">
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
                
                <div className="mb-6 sm:mb-10 space-y-2 sm:space-y-4">
                    <div className="bg-emerald-100 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-4 sm:mb-6">
                        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">AI Image Studio 🎨</h3>
                    <p className="text-slate-500 text-sm sm:text-lg font-medium leading-relaxed">Create diagrams, illustrations, or artistic representations of any topic instantly.</p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    <div className="relative">
                        <textarea 
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            placeholder="e.g. A detailed scientific diagram..."
                            className="w-full p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 bg-slate-50 focus:bg-white focus:ring-8 focus:ring-emerald-50 outline-none h-32 sm:h-48 resize-none text-sm sm:text-lg leading-relaxed transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleGenerateImage}
                        disabled={!imagePrompt.trim() || isGeneratingImage}
                        className="w-full bg-emerald-600 text-white py-4 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-black text-lg sm:text-xl flex items-center justify-center gap-3 sm:gap-4 hover:bg-emerald-700 transition-all shadow-2xl disabled:opacity-50 active:scale-95"
                    >
                        {isGeneratingImage ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-white" /> : <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-200" />}
                        Generate Image
                    </button>
                </div>
            </div>
        </div>
      )}
            </div>
        ) : (
            <div className="flex-1 overflow-y-auto w-full h-full p-4 md:p-8">
                {activeTab === 'study-buddy' && <StudyBuddy />}
                {activeTab === 'live-tutor' && <LiveTutor />}
                {activeTab === 'documind' && <DocuMind />}
                {activeTab === 'notebook-lm' && <NotebookLM />}
                {activeTab === 'code-lab' && <CodeLab />}
                {activeTab === 'lingua-sphere' && <LinguaSphere />}
                {activeTab === 'audio-studio' && <AudioStudio />}
            </div>
        )}

        {/* Bottom Nav for Mobile */}
        <div className="md:hidden flex overflow-x-auto border-t border-slate-100 bg-white/80 backdrop-blur-xl p-2 gap-1 z-20 no-scrollbar shrink-0">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center min-w-[64px] p-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`${activeTab === tab.id ? 'scale-110' : ''} transition-transform`}>
                        {tab.icon}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-center leading-tight">{tab.label.split(' ')[0]}</span>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};
