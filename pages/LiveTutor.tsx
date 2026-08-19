
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Bot, Sparkles, Loader2, Volume2 } from 'lucide-react';
import { connectLiveTutor } from '../services/geminiService';
import { useAppContext } from '../App';

export const LiveTutor: React.FC = () => {
    const { language } = useAppContext();
    const [isCalling, setIsCalling] = useState(false);
    const [status, setStatus] = useState('Ready to connect');
    const [isMuted, setIsMuted] = useState(false);
    
    const sessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputNodeRef = useRef<GainNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef(0);

    const startCall = async () => {
        try {
            setIsCalling(true);
            setStatus('Establishing Neural Link...');
            
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            outputNodeRef.current = audioContextRef.current.createGain();
            outputNodeRef.current.connect(audioContextRef.current.destination);
            
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

            const sessionPromise = connectLiveTutor(language, {
                onopen: () => {
                    setStatus('Voice Linked');
                    const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (e) => {
                        if (isMuted) return;
                        const inputData = e.inputBuffer.getChannelData(0);
                        const pcmData = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) pcmData[i] = inputData[i] * 32768;
                        
                        sessionPromise.then(session => {
                            session.sendRealtimeInput({
                                media: {
                                    data: btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer))),
                                    mimeType: 'audio/pcm;rate=16000'
                                }
                            });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: async (message: any) => {
                    const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioData && audioContextRef.current) {
                        const binary = atob(audioData);
                        const bytes = new Uint8Array(binary.length);
                        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                        
                        const int16 = new Int16Array(bytes.buffer);
                        const buffer = audioContextRef.current.createBuffer(1, int16.length, 24000);
                        const channel = buffer.getChannelData(0);
                        for (let i = 0; i < int16.length; i++) channel[i] = int16[i] / 32768.0;

                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = buffer;
                        source.connect(outputNodeRef.current!);
                        
                        const startTime = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
                        source.start(startTime);
                        nextStartTimeRef.current = startTime + buffer.duration;
                    }
                },
                onclose: () => endCall(),
                onerror: (e: any) => { console.error(e); endCall(); }
            });
            
            sessionRef.current = await sessionPromise;
        } catch (e) {
            console.error(e);
            endCall();
        }
    };

    const endCall = () => {
        setIsCalling(false);
        setStatus('Ready to connect');
        streamRef.current?.getTracks().forEach(t => t.stop());
        sessionRef.current?.close();
        audioContextRef.current?.close();
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center bg-slate-900 rounded-[3rem] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                <div className={`w-48 h-48 rounded-full bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.4)] ${isCalling ? 'animate-pulse' : ''}`}>
                    <Bot className="w-24 h-24 text-white" />
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white tracking-tight">Live Academic Tutor</h2>
                    <p className="text-indigo-300 font-bold uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3">
                        {isCalling && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
                        {status}
                    </p>
                </div>

                {!isCalling ? (
                    <button 
                        onClick={startCall}
                        className="px-12 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-4"
                    >
                        <Volume2 className="w-6 h-6 text-indigo-600" /> Start Speaking
                    </button>
                ) : (
                    <div className="flex gap-6">
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className={`p-6 rounded-full transition-all ${isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                        >
                            {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                        </button>
                        <button 
                            onClick={endCall}
                            className="p-6 bg-rose-600 text-white rounded-full shadow-2xl hover:bg-rose-700 transition-all active:scale-95"
                        >
                            <PhoneOff className="w-8 h-8" />
                        </button>
                    </div>
                )}
            </div>

            {isCalling && (
                <div className="absolute bottom-20 flex gap-1 items-end h-12">
                    {[0.5, 0.8, 1, 0.6, 0.9, 0.4, 0.7].map((h, i) => (
                        <div key={i} className="w-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ height: `${h * 100}%`, animationDelay: `${i * 100}ms` }} />
                    ))}
                </div>
            )}
        </div>
    );
};
