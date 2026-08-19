import React, { useState, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { useAppContext } from '../App';

export const AudioStudio: React.FC = () => {
    const { language } = useAppContext();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [voice, setVoice] = useState('Kore');

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        try {
            const base64 = await generateSpeech(text, voice);
            if (base64) {
                const blob = await fetch(`data:audio/pcm;base64,${base64}`).then(res => res.blob());
                setAudioUrl(URL.createObjectURL(blob));
            }
        } catch (e) {
            alert("Speech generation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">🎙️</div>
                <h2 className="text-4xl font-black text-slate-900">Audio Studio</h2>
                <p className="text-slate-500 font-medium mt-2">Turn your notes into high-quality spoken lectures</p>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
                <div className="flex gap-4 justify-center">
                    {['Kore', 'Puck', 'Charon', 'Fenrir'].map(v => (
                        <button key={v} onClick={() => setVoice(v)} className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${voice === v ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {v}
                        </button>
                    ))}
                </div>

                <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    placeholder="Paste your study notes here to convert to audio..." 
                    className="w-full h-64 p-8 bg-slate-50 border rounded-[2rem] font-medium text-lg focus:bg-white outline-none transition-all"
                />

                <button onClick={handleGenerate} disabled={loading || !text} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3">
                    {loading ? "⏳ Encoding Voice..." : "🔊 Generate Audio Lecture"}
                </button>

                {audioUrl && (
                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex flex-col items-center gap-4">
                        <p className="text-xs font-black text-amber-700 uppercase">Playback Ready</p>
                        <audio controls src={audioUrl} className="w-full" />
                        <a href={audioUrl} download="lecture.mp3" className="text-sm font-bold text-amber-600 underline">Download File</a>
                    </div>
                )}
            </div>
        </div>
    );
};