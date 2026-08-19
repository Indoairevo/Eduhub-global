
import React, { useState } from 'react';
import { Search, Globe, Link as LinkIcon, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { performGlobalSearch } from '../services/geminiService';
import { useAppContext } from '../App';

export const GlobalSearch: React.FC = () => {
    const { language } = useAppContext();
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ text: string, citations: { title: string, uri: string }[] } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setLoading(true);
        const res = await performGlobalSearch(query, language);
        setResult(res);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="text-center space-y-4">
                <div className="flex justify-center">
                    <div className="bg-slate-900 text-white p-4 rounded-[2rem] shadow-2xl">
                        <Search className="w-10 h-10 text-indigo-400" />
                    </div>
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Global Research Console</h2>
                <p className="text-slate-500 font-medium text-lg">Real-time web grounding for scholars & researchers.</p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search anything from the web..."
                    className="w-full px-10 py-8 bg-white border border-slate-200 rounded-[3rem] shadow-2xl focus:outline-none focus:ring-8 focus:ring-indigo-50 transition-all text-xl font-medium"
                />
                <button 
                    type="submit" 
                    disabled={loading || !query}
                    className="absolute right-4 top-4 bg-slate-900 text-white p-5 rounded-full shadow-lg hover:bg-indigo-600 transition-all active:scale-90 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                </button>
            </form>

            {result && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
                        <div className="flex items-center gap-2 mb-6 text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">
                            <Sparkles className="w-4 h-4" /> AI Grounded Answer
                        </div>
                        <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed whitespace-pre-line">
                            {result.text}
                        </div>
                    </div>

                    {result.citations.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Web Citations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.citations.map((c, i) => (
                                    <a 
                                        key={i} 
                                        href={c.uri} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between hover:border-indigo-400 hover:bg-white transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-2 rounded-xl shadow-sm text-slate-400 group-hover:text-indigo-600 transition-colors">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{c.title}</span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
