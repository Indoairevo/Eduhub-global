import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
    Trophy, 
    BarChart3, 
    HelpCircle, 
    RefreshCw, 
    ArrowLeft,
    CheckCircle,
    BookOpen,
    Clock,
    AlertCircle,
    Search
} from 'lucide-react';
import { generateModelPaperStream, evaluatePaper } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { ModelPaper, GradedPaperResult } from '../types';
import { SUBJECTS } from '../constants';

const BOARDS = ['CBSE', 'ICSE', 'UP Board', 'Bihar Board', 'Maharashtra Board', 'Rajasthan Board', 'International Baccalaureate'];
const CLASSES = [
    'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
    'Class 11', 'Class 12', 'Graduation (1st Yr)', 'Graduation (Final)', 'UPSC/PSC'
];

export const ModelPaperGenerator: React.FC = () => {
    const { language, addXP } = useAppContext();
    const [subject, setSubject] = useState('');
    const [board, setBoard] = useState('CBSE');
    const [level, setLevel] = useState('Class 10');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [questionsFound, setQuestionsFound] = useState(0);
    const [liveQuestions, setLiveQuestions] = useState<string[]>([]);
    
    // Exam State
    const [paper, setPaper] = useState<ModelPaper | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [timeLeft, setTimeLeft] = useState(0); // in seconds
    const [isExamActive, setIsExamActive] = useState(false);
    const [cheatingWarnings, setCheatingWarnings] = useState(0);
    
    // Results
    const [evaluating, setEvaluating] = useState(false);
    const [result, setResult] = useState<GradedPaperResult | null>(null);

    // Anti-Cheat Logic
    useEffect(() => {
        if (!isExamActive) return;

        const handleBlur = () => {
            setCheatingWarnings(prev => {
                const count = prev + 1;
                alert(`⚠️ Warning #${count}: Cheating detected! Switching tabs or windows is strictly prohibited during the exam.`);
                return count;
            });
        };

        window.addEventListener('blur', handleBlur);
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.removeEventListener('blur', handleBlur);
            clearInterval(timer);
        };
    }, [isExamActive]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const handleGenerate = async () => {
        if (!subject) return;

        const aiKey = `${subject}_${level}_${board}`;
        const cached = dbService.getSavedResult('paper', aiKey);
        if (cached) {
            setPaper(cached);
            setTimeLeft(10800);
            setProgress(100);
            setQuestionsFound(25);
            return;
        }

        setLoading(true);
        setPaper(null);
        setResult(null);
        setAnswers({});
        setCheatingWarnings(0);
        setProgress(0);
        setQuestionsFound(0);
        setLiveQuestions([]);

        try {
            const iterator = generateModelPaperStream(subject, level, board, language);
            let finalData: ModelPaper | null = null;
            
            while (true) {
                const { value, done } = await iterator.next();
                if (done) {
                    finalData = value as ModelPaper | null;
                    break;
                }
                if (value) {
                    const streamValue = value as { text: string; questionsFound: number };
                    setQuestionsFound(streamValue.questionsFound);
                    // Estimate progress: typically 25 questions in a 100 mark paper
                    const estimatedProgress = Math.min(99, Math.floor((streamValue.questionsFound / 25) * 100));
                    setProgress(estimatedProgress);
                    
                    // Extract questions from the raw text
                    const matches = [...streamValue.text.matchAll(/"question"\s*:\s*"([^"]+)"/g)];
                    if (matches.length > 0) {
                        setLiveQuestions(matches.map(m => m[1]));
                    }
                }
            }

            if (finalData) {
                setPaper(finalData);
                dbService.saveResult('paper', aiKey, finalData);
                setTimeLeft(10800);
                setProgress(100);
            } else {
                alert("Failed to generate paper. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("Connection error. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const startExam = () => {
        if (confirm("Once you start, leaving the page or switching tabs will be recorded. Are you ready?")) {
            setIsExamActive(true);
        }
    };

    const handleAnswerChange = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleSubmit = async (isAuto = false) => {
        if (!paper) return;
        if (!isAuto && !confirm("Finish and submit paper?")) return;
        
        setIsExamActive(false);
        setEvaluating(true);
        try {
            const graded = await evaluatePaper(paper, answers, language);
            if (graded) {
                setResult(graded);
                addXP(graded.totalScore * 2); 
            }
        } catch (e) {
            alert("Grading failed. Please check your internet.");
        } finally {
            setEvaluating(false);
        }
    };

    if (result) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-700 pb-20">
                <div className="bg-slate-900 p-16 rounded-[4rem] text-white text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                    
                    <motion.div 
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40 relative z-10"
                    >
                        <Trophy className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-6xl font-black mb-4 tracking-tight relative z-10">Paper Evaluated!</h2>
                    <p className="text-slate-400 text-xl font-medium relative z-10 max-w-2xl mx-auto">
                        Your {paper?.subject} paper has been graded by our AI examiner. Here's your performance analysis.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center group hover:bg-indigo-50 transition-all">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Aggregate Score</p>
                        <div className="text-6xl font-black text-indigo-600">{result.totalScore}<span className="text-xl text-slate-300"> / {result.maxScore}</span></div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center group hover:bg-emerald-50 transition-all">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Accuracy</p>
                        <div className="text-6xl font-black text-emerald-600">{result.percentage}%</div>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 text-center group hover:bg-amber-50 transition-all">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Integrity</p>
                        <div className={`text-3xl font-black ${cheatingWarnings === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {cheatingWarnings === 0 ? 'Verified Pure' : 'Flagged Session'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Overall Feedback</p>
                    <p className="text-2xl font-bold text-slate-800 leading-tight italic">"{result.overallFeedback}"</p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center gap-4 ml-6">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Question-wise Analysis</h3>
                    </div>
                    
                    {result.questionResults.map((res, i) => (
                        <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all hover:shadow-2xl ${
                            res.status === 'Correct' ? 'bg-white border-emerald-100' : 
                            res.status === 'Partial' ? 'bg-white border-amber-100' : 
                            'bg-white border-rose-100'
                        }`}>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                <div className="flex-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Question {i+1}</span>
                                    <h4 className="text-2xl font-bold text-slate-800 leading-tight">{res.questionText}</h4>
                                </div>
                                <div className={`px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-widest shrink-0 ${
                                    res.status === 'Correct' ? 'bg-emerald-100 text-emerald-700' : 
                                    res.status === 'Partial' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-rose-100 text-rose-700'
                                }`}>
                                    {res.obtainedMarks} / {res.maxMarks} Marks
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Your Answer</p>
                                    <p className="text-slate-700 font-medium leading-relaxed italic">"{res.userAnswer || 'No answer provided.'}"</p>
                                </div>
                                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase mb-3">Ideal Solution</p>
                                    <p className="text-indigo-900 font-medium leading-relaxed">{res.idealAnswer}</p>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-start gap-4">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Feedback</p>
                                    <p className="text-slate-300 text-sm font-medium leading-relaxed">{res.feedback}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => { setPaper(null); setResult(null); }} 
                        className="flex-1 py-7 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        <RefreshCw className="w-6 h-6" /> Try Another Paper
                    </button>
                    <button 
                        onClick={() => window.location.href = '/dashboard'} 
                        className="flex-1 py-7 bg-white text-slate-900 border-4 border-slate-900 rounded-[2.5rem] font-black text-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-4"
                    >
                        <ArrowLeft className="w-6 h-6" /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (isExamActive && paper) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-10 pb-20">
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200 sticky top-4 z-40 p-5 rounded-[2rem] shadow-2xl flex justify-between items-center transition-all">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">{paper.subject} Exam</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-xs font-black uppercase tracking-widest ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`}>
                                ⏱️ {formatTime(timeLeft)}
                            </span>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-50" style={{ width: `${(Object.keys(answers).length / 10) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {cheatingWarnings > 0 && <span className="text-[10px] bg-rose-100 text-rose-600 px-3 py-1 rounded-full font-black uppercase">⚠️ Flags: {cheatingWarnings}</span>}
                        <button 
                            onClick={() => handleSubmit()} 
                            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl text-sm"
                        >
                            Finish Paper
                        </button>
                    </div>
                </div>

                <div className="space-y-12 mt-10">
                    {paper.sections.map((section, idx) => (
                        <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 relative">
                            <div className="absolute top-8 right-10 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Section {String.fromCharCode(65 + idx)}</div>
                            <div className="mb-10">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{section.title}</h3>
                                <p className="text-sm text-slate-400 font-bold mt-2 uppercase tracking-widest">{section.instruction}</p>
                            </div>
                            <div className="space-y-12">
                                {section.questions.map((q, qIdx) => (
                                    <div key={q.id} className="relative pl-10 border-l-2 border-slate-50 group hover:border-indigo-200 transition-colors">
                                        <div className="absolute -left-[14px] top-1 w-6 h-6 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            {qIdx + 1}
                                        </div>
                                        <div className="flex justify-between items-start mb-6">
                                            <p className="text-xl font-bold text-slate-800 leading-snug max-w-2xl">{q.question}</p>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 whitespace-nowrap ml-4">
                                                {q.marks} Marks
                                            </span>
                                        </div>
                                        {q.type === 'MCQ' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                                                {q.options?.map((opt, i) => (
                                                    <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${answers[q.id] === opt ? 'bg-indigo-50 border-indigo-500 scale-[0.98]' : 'bg-slate-50 border-transparent hover:bg-white hover:border-indigo-100'}`}>
                                                        <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={(e) => handleAnswerChange(q.id, e.target.value)} className="w-5 h-5 accent-indigo-600" />
                                                        <span className="font-bold text-slate-700 text-sm">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <textarea 
                                                value={answers[q.id] || ''} 
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                placeholder="Write your comprehensive answer here..."
                                                rows={q.marks > 5 ? 10 : 5}
                                                className="w-full mt-4 p-6 rounded-2xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 text-lg leading-relaxed resize-none"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center py-20 text-slate-300">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="font-black uppercase tracking-[0.2em] text-xs">End of Question Paper</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="text-center space-y-6">
                <div className="bg-indigo-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto shadow-2xl shadow-indigo-200">
                    📄
                </div>
                <div className="space-y-2">
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Model Paper Gen</h2>
                    <p className="text-slate-500 font-medium text-xl max-w-xl mx-auto">Generate board-level 100-mark exam papers and solve them in a proctored environment.</p>
                </div>
            </div>

            {paper ? (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95">
                    <h3 className="text-3xl font-black text-slate-900 mb-8 border-b border-slate-100 pb-4">Exam Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                        <div className="p-6 bg-slate-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Board</p>
                            <p className="text-lg font-black text-slate-800">{paper.board}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Standard</p>
                            <p className="text-lg font-black text-slate-800">{paper.level}</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                            <p className="text-lg font-black text-slate-800">3 Hours</p>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-3xl text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marks</p>
                            <p className="text-lg font-black text-slate-800">{paper.totalMarks}</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 mb-10">
                        <h4 className="font-black text-amber-800 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">🚩 Instructions</h4>
                        <ul className="space-y-3 text-amber-900 font-medium text-sm">
                            <li className="flex gap-3"><span>1.</span> Switching tabs or closing the window will flag your attempt for cheating.</li>
                            <li className="flex gap-3"><span>2.</span> The paper contains Objective (Section A) and Subjective (Sections B-D) questions.</li>
                            <li className="flex gap-3"><span>3.</span> AI will grade your descriptive answers based on conceptual accuracy.</li>
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={startExam}
                            className="flex-1 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
                        >
                            🚀 Enter Examination Hall
                        </button>
                        <button onClick={() => setPaper(null)} className="px-10 py-6 bg-white border border-slate-200 text-slate-400 rounded-[2rem] font-black hover:bg-rose-50 hover:text-rose-500 transition-all">
                            Discard
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Education Board</label>
                            <select 
                                value={board} 
                                onChange={(e) => setBoard(e.target.value)}
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50"
                            >
                                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Class / Level</label>
                            <select 
                                value={level} 
                                onChange={(e) => setLevel(e.target.value)}
                                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-50"
                            >
                                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Search Subject</label>
                        <select 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-2xl text-slate-800 outline-none focus:ring-8 focus:ring-indigo-50 appearance-none text-center"
                        >
                            <option value="">-- Choose Target Subject --</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !subject}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 relative overflow-hidden"
                    >
                        {loading && (
                            <div 
                                className="absolute left-0 top-0 h-full bg-indigo-500/50 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-4">
                            {loading ? <span className="animate-spin text-3xl">⏳</span> : <span>✨</span>}
                            {loading ? `Synthesizing Curriculum... ${progress}% (${questionsFound} Questions)` : 'Generate 100M Paper'}
                        </span>
                    </button>

                    {loading && liveQuestions.length > 0 && (
                        <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
                            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                Live Generation Feed
                            </h4>
                            <div className="space-y-3">
                                {liveQuestions.map((q, idx) => (
                                    <div key={idx} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-sm font-medium text-slate-700 animate-in slide-in-from-bottom-2">
                                        <span className="text-slate-400 font-black mr-2">Q{idx + 1}.</span>
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {evaluating && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center">
                    <div className="relative mb-10">
                        <div className="w-32 h-32 bg-indigo-600 rounded-full animate-ping opacity-20" />
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center absolute top-4 left-4 shadow-2xl">
                            <span className="text-4xl animate-bounce">🧐</span>
                        </div>
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4">AI is Grading Your Paper...</h3>
                    <p className="text-slate-400 text-lg font-medium max-w-md">Our high-reasoning model is analyzing your explanations for board-standard accuracy.</p>
                </div>
            )}
        </div>
    );
};