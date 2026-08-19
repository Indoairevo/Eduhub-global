
import React, { useState, useRef, useEffect } from 'react';
import { FileText, Upload, Sparkles, Loader2, List, HelpCircle, Link as LinkIcon, RefreshCcw, CheckCircle2, History } from 'lucide-react';
import { analyzeDocument } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { DocAnalysisResult } from '../types';

type ResultTab = 'summary' | 'keypoints' | 'quiz';

export const DocuMind: React.FC = () => {
    const { language } = useAppContext();
    const [inputText, setInputText] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DocAnalysisResult | null>(null);
    const [activeTab, setActiveTab] = useState<ResultTab>('summary');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // History
    const [history, setHistory] = useState<DocAnalysisResult[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Mini-Quiz State
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        setHistory(dbService.getDocAnalysis());
    }, [result]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setImage(ev.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!inputText && !image && !inputUrl) return;
        setLoading(true);
        setResult(null);
        setShowResults(false);
        setUserAnswers([]);

        try {
            const data = await analyzeDocument(inputText, image, inputUrl, language);
            if (data) {
                setResult(data);
                dbService.saveDocAnalysis(data); // Save persistence
                setUserAnswers(new Array(data.quiz.length).fill(-1));
                setActiveTab('summary');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadFromHistory = (item: DocAnalysisResult) => {
        setResult(item);
        setUserAnswers(new Array(item.quiz.length).fill(-1));
        setShowResults(false);
        setShowHistory(false);
        setActiveTab('summary');
    };

    const handleReset = () => {
        setResult(null);
        setImage(null);
        setInputText('');
        setInputUrl('');
        setUserAnswers([]);
        setShowResults(false);
    };

    const handleAnswer = (qIndex: number, optionIndex: number) => {
        const newAnswers = [...userAnswers];
        newAnswers[qIndex] = optionIndex;
        setUserAnswers(newAnswers);
    };

    const calculateScore = () => {
        if (!result) return 0;
        return userAnswers.reduce((acc, ans, idx) => ans === result.quiz[idx].correctAnswer ? acc + 1 : acc, 0);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative">
            <div className="border-b border-slate-200 pb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                        <div className="bg-teal-100 p-2 rounded-xl">
                            <FileText className="w-6 h-6 text-teal-600" />
                        </div>
                        DocuMind
                    </h2>
                    <p className="text-slate-500 mt-2 max-w-2xl">
                        {language === 'hi' 
                        ? 'AI का उपयोग करके किसी भी दस्तावेज, छवि या लिंक का विश्लेषण करें और सारांश प्राप्त करें।' 
                        : 'Transform any text, image, or URL into clear summaries, key takeaways, and practice quizzes instantly.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                         onClick={() => setShowHistory(!showHistory)}
                         className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm"
                    >
                        <History className="w-4 h-4" /> History
                    </button>
                    {result && (
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold text-sm transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4" /> New
                        </button>
                    )}
                </div>
            </div>

            {/* History Sidebar */}
            {showHistory && (
                <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex justify-end" onClick={() => setShowHistory(false)}>
                    <div className="w-80 bg-white h-full shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Saved Analysis</h3>
                            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-red-500">✕</button>
                        </div>
                        <div className="space-y-3">
                            {history.length === 0 && <p className="text-slate-400 text-sm">No saved documents yet.</p>}
                            {history.map(item => (
                                <button key={item.id} onClick={() => loadFromHistory(item)} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-teal-300 hover:bg-teal-50 transition-all group">
                                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!result && !loading && (
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in zoom-in-95 duration-300">
                     <div className="space-y-6">
                        {/* URL Input */}
                         <div className="relative">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source URL (Optional)</label>
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="https://wikipedia.org/wiki/..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition-colors"
                            />
                            <LinkIcon className="absolute left-3 top-9 w-5 h-5 text-slate-400" />
                        </div>

                        {/* Text Area */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paste Text / Notes</label>
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Paste your study material here..."
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        
                        {/* Image Preview */}
                        {image ? (
                            <div className="relative mb-4 group">
                                <img src={image} alt="Upload" className="h-48 w-full object-cover rounded-xl border-2 border-teal-500" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <button 
                                        onClick={() => setImage(null)}
                                        className="bg-white text-red-600 px-4 py-2 rounded-full font-bold shadow-lg"
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            </div>
                        ) : (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all group"
                             >
                                <div className="bg-slate-100 p-4 rounded-full mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-teal-600" />
                                </div>
                                <p className="font-bold text-slate-600">Click to upload image</p>
                                <p className="text-xs text-slate-400">Supports JPG, PNG (Max 5MB)</p>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                        <button 
                            onClick={handleAnalyze}
                            disabled={!inputText && !image && !inputUrl}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 text-teal-400" />
                            Analyze Document
                        </button>
                     </div>
                </div>
            )}
            
            {loading && (
                 <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                     <Loader2 className="w-16 h-16 text-teal-600 animate-spin mb-6" />
                     <h3 className="text-xl font-bold text-slate-900">Analyzing Content...</h3>
                     <p className="text-slate-500">Extracting key insights and generating quiz.</p>
                 </div>
            )}

            {result && !loading && (
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Tabs */}
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2">
                         {[
                             { id: 'summary', label: 'Summary', icon: FileText },
                             { id: 'keypoints', label: 'Key Points', icon: List },
                             { id: 'quiz', label: 'Practice Quiz', icon: HelpCircle },
                         ].map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as ResultTab)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-teal-50 text-teal-700 shadow-sm ring-1 ring-teal-200' 
                                    : 'text-slate-500 hover:bg-slate-50'
                                }`}
                             >
                                 <tab.icon className="w-4 h-4" /> {tab.label}
                             </button>
                         ))}
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 min-h-[400px]">
                         {activeTab === 'summary' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <h3 className="text-2xl font-bold text-slate-900 mb-6">Executive Summary</h3>
                                 <div className="prose prose-lg prose-teal max-w-none text-slate-700 leading-relaxed">
                                     {result.summary}
                                 </div>
                             </div>
                         )}

                         {activeTab === 'keypoints' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <h3 className="text-2xl font-bold text-slate-900 mb-6">Key Takeaways</h3>
                                 <ul className="grid gap-4">
                                     {result.keyPoints.map((point, idx) => (
                                         <li key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-teal-200 transition-colors">
                                             <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                                 {idx + 1}
                                             </div>
                                             <p className="text-slate-700 font-medium pt-1">{point}</p>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         )}

                         {activeTab === 'quiz' && (
                             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                 <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900">Knowledge Check</h3>
                                    {showResults ? (
                                        <div className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold">
                                            Score: {calculateScore()} / {result.quiz.length}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowResults(true)}
                                            disabled={userAnswers.includes(-1)}
                                            className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            Submit Answers
                                        </button>
                                    )}
                                 </div>

                                 <div className="space-y-8">
                                     {result.quiz.map((q, qIdx) => (
                                         <div key={qIdx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                             <p className="font-bold text-lg text-slate-800 mb-4">{qIdx + 1}. {q.question}</p>
                                             <div className="space-y-3">
                                                 {q.options.map((opt, oIdx) => {
                                                     let statusClass = "border-slate-200 hover:bg-slate-100";
                                                     if (showResults) {
                                                         if (oIdx === q.correctAnswer) statusClass = "bg-green-100 border-green-500 text-green-800 ring-1 ring-green-500";
                                                         else if (oIdx === userAnswers[qIdx]) statusClass = "bg-red-50 border-red-300 text-red-800";
                                                     } else {
                                                         if (userAnswers[qIdx] === oIdx) statusClass = "bg-teal-600 text-white border-teal-600 shadow-md";
                                                     }

                                                     return (
                                                         <button 
                                                             key={oIdx}
                                                             onClick={() => !showResults && handleAnswer(qIdx, oIdx)}
                                                             className={`w-full text-left p-4 rounded-xl border transition-all font-medium ${statusClass}`}
                                                             disabled={showResults}
                                                         >
                                                             <div className="flex justify-between items-center">
                                                                 <span>{opt}</span>
                                                                 {showResults && oIdx === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                                                             </div>
                                                         </button>
                                                     );
                                                 })}
                                             </div>
                                             {showResults && (
                                                 <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-sm text-slate-600 italic">
                                                     <span className="font-bold text-slate-800 not-italic">Explanation: </span>
                                                     {q.rationale}
                                                 </div>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};
