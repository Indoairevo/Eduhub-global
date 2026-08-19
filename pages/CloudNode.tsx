
import React, { useState, useEffect } from 'react';
import { Cloud, Sparkles, Loader2, Database, Shield, Zap, Search, Layout, FileText, Clock } from 'lucide-react';
import { useAppContext } from '../App';
import { analyzeCloudStorage } from '../services/geminiService';
import { getUserFolders } from '../services/authService';
import { CloudInsight } from '../types';

export const CloudNode: React.FC = () => {
    const { language } = useAppContext();
    const [insights, setInsights] = useState<CloudInsight[]>([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ folders: 0, notes: 0, lastSync: '' });

    const handleSync = async () => {
        setLoading(true);
        const folders = getUserFolders();
        const contextString = folders.map(f => `Folder: ${f.name}, Notes: ${f.notes.map(n => n.title).join(', ')}`).join('\n');
        
        setStats({
            folders: folders.length,
            notes: folders.reduce((acc, f) => acc + f.notes.length, 0),
            lastSync: new Date().toLocaleTimeString()
        });

        const res = await analyzeCloudStorage(contextString, language);
        setInsights(res);
        setLoading(false);
    };

    useEffect(() => { handleSync(); }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            <div className="bg-slate-900 rounded-[4rem] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-600 p-4 rounded-[2rem] shadow-2xl shadow-blue-500/40">
                                <Cloud className="w-10 h-10" />
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter">CloudNode <span className="text-blue-500 font-medium">Intelligence</span></h2>
                        </div>
                        <p className="text-slate-400 text-lg font-medium max-w-md">Your centralized cross-app study data analytics hub powered by Gemini 3.0.</p>
                    </div>
                    <button 
                        onClick={handleSync}
                        disabled={loading}
                        className="px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-lg hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-2xl shadow-white/10 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : '🔄 Synchronize Neural Hub'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Total Sync Points', val: stats.folders, icon: <Database className="w-6 h-6 text-blue-500" />, desc: 'Connected Knowledge Folders' },
                    { label: 'Analyzed Assets', val: stats.notes, icon: <FileText className="w-6 h-6 text-emerald-500" />, desc: 'Individual Scholarly Notes' },
                    { label: 'Security Protocols', val: 'Active', icon: <Shield className="w-6 h-6 text-amber-500" />, desc: 'End-to-End Encryption' }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-4">
                        <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center">{s.icon}</div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{s.val}</div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                            <p className="text-xs text-slate-500 mt-2 font-medium">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] ml-6 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-blue-500" /> AI Storage Insights
                </h3>
                
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-6">
                        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Deep Scanning Virtual Drive...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {insights.map((insight, i) => (
                            <div key={i} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 hover:border-blue-500 transition-all group">
                                <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 group-hover:scale-110 origin-left transition-transform">{insight.category}</div>
                                <h4 className="text-xl font-black text-slate-900 mb-4">{insight.summary}</h4>
                                <div className="pt-6 border-t border-slate-50">
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Recommendation</p>
                                    <p className="text-slate-600 font-medium leading-relaxed">{insight.recommendation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="bg-white p-4 rounded-2xl text-blue-600 shadow-sm"><Clock className="w-6 h-6" /></div>
                    <div>
                        <p className="text-sm font-black text-blue-900 uppercase tracking-widest">Real-time Persistence</p>
                        <p className="text-xs text-blue-700 font-medium">All notebooks and analysis results are automatically synced to your local cloud instance.</p>
                    </div>
                </div>
                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Last Updated: {stats.lastSync || 'Never'}</div>
            </div>
        </div>
    );
};
