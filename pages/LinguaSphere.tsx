
import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Copy, Check, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { translateText } from '../services/geminiService';
import { useAppContext } from '../App';

export const LinguaSphere: React.FC = () => {
    const { language } = useAppContext();
    const [sourceText, setSourceText] = useState('');
    const [targetText, setTargetText] = useState('');
    const [targetLang, setTargetLang] = useState('Hindi');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const LANGUAGES = ['Hindi', 'English', 'Sanskrit', 'French', 'German', 'Spanish', 'Japanese', 'Bengali', 'Marathi', 'Tamil'];

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;
        setLoading(true);
        const res = await translateText(sourceText, targetLang);
        setTargetText(res);
        setLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(targetText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-slate-200 pb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-xl"><Languages className="w-6 h-6 text-blue-600" /></div>
                        LinguaSphere
                    </h2>
                    <p className="text-slate-500 mt-1">Multi-modal Academic Translator Powered by Gemini</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                {/* Source */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Auto-Detect</span>
                        <Volume2 className="w-5 h-5 text-slate-300" />
                    </div>
                    <textarea 
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Paste text to translate..."
                        className="w-full h-64 bg-transparent focus:outline-none text-slate-800 text-lg leading-relaxed resize-none"
                    />
                    <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-[10px] text-slate-300 font-bold">{sourceText.length} characters</span>
                        <button onClick={handleTranslate} disabled={loading || !sourceText} className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Translate
                        </button>
                    </div>
                </div>

                {/* Target */}
                <div className="bg-slate-50 rounded-[2.5rem] p-8 shadow-inner border border-slate-200 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <select 
                            value={targetLang} 
                            onChange={(e) => setTargetLang(e.target.value)}
                            className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-blue-600 outline-none"
                        >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <button onClick={copyToClipboard} className="text-slate-400 hover:text-blue-600">
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <div className="flex-1 text-slate-900 text-lg leading-relaxed whitespace-pre-line min-h-[256px]">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
                                <Loader2 className="w-10 h-10 animate-spin" />
                                <p className="text-sm font-bold animate-pulse">Encoding...</p>
                            </div>
                        ) : targetText}
                    </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex w-12 h-12 bg-white rounded-full border border-slate-200 items-center justify-center shadow-lg z-10">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                </div>
            </div>
        </div>
    );
};
