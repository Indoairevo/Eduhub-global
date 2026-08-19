
import React, { useState } from 'react';
import { Presentation as PresentationIcon, Play, Sparkles, Loader2, ChevronLeft, ChevronRight, X, Download, FileText } from 'lucide-react';
import { generateScholarSlides } from '../services/geminiService';
import { useAppContext } from '../App';
import { Presentation } from '../types';

export const ScholarSlides: React.FC = () => {
    const { language } = useAppContext();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [deck, setDeck] = useState<Presentation | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPreview, setIsPreview] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        const res = await generateScholarSlides(topic, language);
        if (res) {
            setDeck(res);
            setCurrentSlide(0);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="border-b border-slate-200 pb-6">
                <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-xl"><PresentationIcon className="w-6 h-6 text-amber-600" /></div>
                    ScholarSlides
                </h2>
                <p className="text-slate-500 mt-1">AI-Powered Educational Deck Generator</p>
            </div>

            {!deck && (
                <div className="max-w-2xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Presentation Topic</label>
                        <textarea 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. The Lifecycle of a Star or The Impact of AI on Modern Education..."
                            className="w-full h-32 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-8 focus:ring-amber-50 outline-none transition-all font-bold text-lg leading-relaxed"
                        />
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                        Generate Presentation
                    </button>
                </div>
            )}

            {deck && !isPreview && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 min-h-[500px] flex flex-col">
                        <div className="flex-1 space-y-8">
                            <div className="flex justify-between items-start">
                                <h3 className="text-4xl font-black text-slate-900 leading-tight">{deck.slides[currentSlide].title}</h3>
                                <span className="bg-amber-50 text-amber-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Slide {currentSlide + 1}</span>
                            </div>
                            <ul className="space-y-4">
                                {deck.slides[currentSlide].content.map((point, i) => (
                                    <li key={i} className="flex gap-4 items-start text-xl text-slate-700 leading-relaxed font-medium">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-3 shrink-0" />
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-12 pt-8 border-t border-slate-50 bg-slate-50/50 p-6 rounded-[2rem]">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Speaker Notes
                            </h4>
                            <p className="text-slate-500 text-sm italic font-medium leading-relaxed">{deck.slides[currentSlide].speakerNotes}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <button 
                            onClick={() => setIsPreview(true)}
                            className="w-full py-4 bg-amber-600 text-white rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg active:scale-95"
                        >
                            <Play className="w-5 h-5" /> Start Presentation
                        </button>
                        <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-100 overflow-y-auto max-h-[400px] space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-4">Slide List</h4>
                            {deck.slides.map((s, i) => (
                                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-full text-left p-4 rounded-2xl transition-all border ${currentSlide === i ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500' : 'bg-slate-50 border-transparent hover:bg-white hover:border-amber-200'}`}>
                                    <span className="text-[10px] font-black text-amber-600 uppercase block mb-1">Slide {i + 1}</span>
                                    <p className="font-bold text-slate-800 text-sm truncate">{s.title}</p>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setDeck(null)} className="w-full py-4 bg-slate-50 text-slate-400 rounded-[2rem] font-black flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                            <X className="w-5 h-5" /> Discard Deck
                        </button>
                    </div>
                </div>
            )}

            {isPreview && deck && (
                <div className="fixed inset-0 z-[60] bg-slate-900 flex items-center justify-center animate-in fade-in duration-500">
                    <button onClick={() => setIsPreview(false)} className="absolute top-10 right-10 p-4 bg-white/10 text-white rounded-full hover:bg-rose-600 transition-all z-10">
                        <X className="w-8 h-8" />
                    </button>
                    <div className="w-full h-full max-w-6xl max-h-[80vh] p-20 flex flex-col justify-center">
                        <div className="animate-in slide-in-from-right-10">
                            <h3 className="text-7xl font-black text-white mb-12 leading-tight">{deck.slides[currentSlide].title}</h3>
                            <ul className="space-y-6">
                                {deck.slides[currentSlide].content.map((point, i) => (
                                    <li key={i} className="text-3xl text-slate-400 font-medium leading-relaxed list-disc ml-8">
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-10 bg-black/40 backdrop-blur-xl px-10 py-5 rounded-full border border-white/10">
                        <button onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))} className="text-white hover:text-amber-500 disabled:opacity-20" disabled={currentSlide === 0}><ChevronLeft className="w-10 h-10" /></button>
                        <span className="text-white font-black text-xl tabular-nums">{currentSlide + 1} / {deck.slides.length}</span>
                        <button onClick={() => setCurrentSlide(prev => Math.min(deck.slides.length - 1, prev + 1))} className="text-white hover:text-amber-500 disabled:opacity-20" disabled={currentSlide === deck.slides.length - 1}><ChevronRight className="w-10 h-10" /></button>
                    </div>
                </div>
            )}
        </div>
    );
};
