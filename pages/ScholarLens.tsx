
import React, { useState, useRef } from 'react';
import { Camera, Search, Loader2, Sparkles, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { analyzeScholarLens } from '../services/geminiService';
import { useAppContext } from '../App';

export const ScholarLens: React.FC = () => {
    const { language } = useAppContext();
    const [image, setImage] = useState<string | null>(null);
    const [query, setQuery] = useState('Solve this problem and explain step-by-step.');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const base64 = image.split(',')[1];
            const res = await analyzeScholarLens(base64, query, language);
            setResult(res);
        } catch (e) {
            alert("Lens failed to process image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl"><Camera className="w-6 h-6 text-emerald-600" /></div>
                        Scholar Lens
                    </h2>
                    <p className="text-slate-500 mt-1">AI vision for equations, handwriting, and diagrams.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div 
                        onClick={() => !image && fileInputRef.current?.click()}
                        className={`relative aspect-square rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${image ? 'border-emerald-500 bg-black' : 'border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200'}`}
                    >
                        {image ? (
                            <>
                                <img src={image} className="w-full h-full object-contain" />
                                <button onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }} className="absolute top-6 right-6 p-3 bg-white/90 rounded-full shadow-lg text-rose-500"><X /></button>
                            </>
                        ) : (
                            <div className="text-center space-y-4">
                                <ImageIcon className="w-16 h-16 text-slate-300 mx-auto" />
                                <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Upload Photo or Scan</p>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
                    
                    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Analysis Intent</p>
                        <input 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-50 font-bold"
                        />
                        <button 
                            onClick={handleAnalyze}
                            disabled={!image || loading}
                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Analyze Snap
                        </button>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 shadow-inner flex flex-col">
                    <div className="flex items-center gap-2 mb-6 text-xs font-black text-emerald-600 uppercase tracking-widest">
                        <Sparkles className="w-4 h-4" /> Lens Output
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar prose prose-emerald">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                <Loader2 className="w-12 h-12 animate-spin" />
                                <p className="font-bold animate-pulse">Running OCR & Synthesis...</p>
                            </div>
                        ) : result ? (
                            <div className="whitespace-pre-line text-lg leading-relaxed text-slate-700 font-medium">{result}</div>
                        ) : (
                            <p className="text-slate-400 font-bold text-center mt-20 italic">Snap a math problem or historical artifact to begin.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
