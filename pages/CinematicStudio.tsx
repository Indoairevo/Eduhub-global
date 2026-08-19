
import React, { useState } from 'react';
import { Sparkles, Loader2, Play, Download, Trash2, Info, ArrowRight } from 'lucide-react';
import { startVideoGeneration, pollVideoStatus } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';

export const CinematicStudio: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        // Use cached data if available (Permanent save/Reuse logic)
        const cached = dbService.getVideo(prompt);
        if (cached) {
            setVideoUrl(cached);
            return;
        }

        const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio?.openSelectKey();
            return;
        }

        setIsGenerating(true);
        setStatus('Initializing Veo 3.1 Neural Core...');
        
        try {
            let operation = await startVideoGeneration(prompt);
            
            while (!operation.done) {
                setStatus('Simulating cinematic physics... (takes ~1-2 mins)');
                await new Promise(r => setTimeout(r, 10000));
                operation = await pollVideoStatus(operation);
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const finalUrl = `${downloadLink}&key=${process.env.API_KEY}`;
                setVideoUrl(finalUrl);
                // Save permanently in database
                dbService.saveVideo(prompt, finalUrl);
            } else {
                throw new Error("No video link returned");
            }
        } catch (e) {
            alert("Generation failed. Please ensure you have a paid GCP API Key selected.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="text-center space-y-4">
                {/* Replaced SVG with Emoji as requested */}
                <div className="bg-red-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto shadow-2xl">
                    🎬
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Cinematic Studio</h2>
                <p className="text-slate-500 text-lg">Create high-fidelity educational animations with Veo 3.1</p>
            </div>

            <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 space-y-8">
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex gap-4 text-amber-800">
                    <Info className="w-6 h-6 shrink-0" />
                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">
                        Important: Video generation requires a selected API key from a paid GCP project. 
                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1">Learn more about billing.</a>
                    </p>
                </div>

                <div className="relative">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A 3D realistic simulation of blood cells traveling through an artery with clear labels..."
                        className="w-full h-48 bg-slate-50 p-8 rounded-[2.5rem] focus:outline-none focus:ring-8 focus:ring-red-50 focus:bg-white transition-all text-xl font-medium resize-none border border-slate-100"
                    />
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-red-600 transition-all shadow-2xl disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                    {isGenerating ? status : 'Generate Video'}
                </button>
            </div>

            {videoUrl && (
                <div className="bg-slate-900 rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95">
                    <video controls className="w-full aspect-video rounded-[2rem]" src={videoUrl} />
                    <div className="mt-8 flex justify-between items-center">
                        <span className="text-slate-400 font-bold text-sm">Visual Synthesis Complete</span>
                        <div className="flex gap-4">
                            <a href={videoUrl} download="simulation.mp4" className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black flex items-center gap-2">
                                <Download className="w-4 h-4" /> Save
                            </a>
                            <button onClick={() => setVideoUrl(null)} className="p-3 bg-white/10 text-white rounded-2xl hover:bg-rose-600 transition-all">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
