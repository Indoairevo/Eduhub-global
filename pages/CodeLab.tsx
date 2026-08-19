import React, { useState, useEffect } from 'react';
import { useAppContext } from '../App';
import { analyzeCode } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { CodeSnippet } from '../types';
import { Terminal, Play, Bug, RefreshCw, Copy, Check, ChevronRight, Code, Loader2 } from 'lucide-react';

export const CodeLab: React.FC = () => {
    const { language } = useAppContext();
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'explain' | 'debug' | 'convert'>('explain');
    const [targetLang, setTargetLang] = useState('Python');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CodeSnippet | null>(null);
    const [history, setHistory] = useState<CodeSnippet[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setHistory(dbService.getCodeSnippets());
    }, [result]);

    const handleRun = async () => {
        if (!code.trim()) return;
        setLoading(true);
        const res = await analyzeCode(code, 'auto', mode, mode === 'convert' ? targetLang : undefined);
        if (res) {
            setResult(res);
            dbService.saveCodeSnippet(res);
        }
        setLoading(false);
    };

    const loadHistory = (snippet: CodeSnippet) => {
        setCode(snippet.code);
        setResult(snippet);
        setShowHistory(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col font-mono">
             <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg">
                        <Terminal className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Code Lab</h2>
                        <p className="text-slate-500 text-xs font-sans">AI-Powered Coding Assistant</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-sm font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-sans"
                >
                    <Code className="w-4 h-4" /> History
                </button>
             </div>

             <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 relative">
                 {/* Sidebar History */}
                 {showHistory && (
                     <div className="absolute lg:relative z-20 inset-0 lg:inset-auto bg-white lg:w-64 rounded-xl shadow-xl lg:shadow-none border border-slate-200 flex flex-col overflow-hidden">
                         <div className="p-3 bg-slate-100 font-bold text-xs uppercase tracking-widest text-slate-500 flex justify-between">
                             <span>Saved Snippets</span>
                             <button onClick={() => setShowHistory(false)} className="lg:hidden text-slate-400">✕</button>
                         </div>
                         <div className="overflow-y-auto flex-1 p-2 space-y-2">
                             {history.map(h => (
                                 <button key={h.id} onClick={() => loadHistory(h)} className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group">
                                     <div className="font-bold text-slate-800 text-sm truncate">{h.title}</div>
                                     <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                                         <span>{h.language}</span>
                                         <span>{new Date(h.timestamp).toLocaleDateString()}</span>
                                     </div>
                                 </button>
                             ))}
                             {history.length === 0 && <div className="p-4 text-center text-slate-400 text-xs">No history yet</div>}
                         </div>
                     </div>
                 )}

                 {/* Input Editor */}
                 <div className="flex-1 flex flex-col gap-4">
                     <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                         <button onClick={() => setMode('explain')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'explain' ? 'bg-white shadow text-indigo-600' : 'text-slate-50'}`}>Explain</button>
                         <button onClick={() => setMode('debug')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'debug' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Debug</button>
                         <button onClick={() => setMode('convert')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${mode === 'convert' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Convert</button>
                     </div>

                     {mode === 'convert' && (
                         <div className="flex items-center gap-2 font-sans">
                             <span className="text-sm font-bold text-slate-500">To:</span>
                             <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="p-2 rounded-lg border border-slate-300 text-sm font-bold">
                                 {['Python', 'JavaScript', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'Swift'].map(l => (
                                     <option key={l} value={l}>{l}</option>
                                 ))}
                             </select>
                         </div>
                     )}

                     <textarea 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="// Paste your code here..."
                        className="flex-1 w-full bg-slate-900 text-slate-50 p-6 rounded-2xl font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                     />
                     
                     <button 
                        onClick={handleRun}
                        disabled={loading || !code.trim()}
                        className="bg-indigo-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all font-sans"
                     >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                         {mode === 'explain' ? 'Analyze Code' : mode === 'debug' ? 'Fix Bugs' : 'Translate Code'}
                     </button>
                 </div>

                 {/* Output Panel */}
                 {(result || loading) && (
                     <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-lg flex flex-col overflow-hidden animate-in slide-in-from-right">
                         <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                             <h3 className="font-bold text-slate-800 font-sans truncate pr-4">{result?.title || 'Processing...'}</h3>
                             {result && (
                                 <button onClick={() => copyToClipboard(result.code)} className="text-slate-400 hover:text-indigo-600 shrink-0">
                                     {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                 </button>
                             )}
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-6 space-y-6">
                             {loading ? (
                                 <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                                     <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                     <p className="font-sans text-sm font-bold">Consulting Neural Network...</p>
                                 </div>
                             ) : result ? (
                                 <>
                                    <div className="prose prose-sm max-w-none text-slate-600 font-sans border-b border-slate-100 pb-4">
                                        <div dangerouslySetInnerHTML={{ __html: result.explanation.replace(/\n/g, '<br/>') }} />
                                    </div>
                                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 px-2 py-1 rounded text-[10px] text-white font-sans">{result.language}</div>
                                        <pre className="text-sm text-green-400 font-mono">
                                            <code>{result.code}</code>
                                        </pre>
                                    </div>
                                 </>
                             ) : null}
                         </div>
                     </div>
                 )}
             </div>
        </div>
    );
};