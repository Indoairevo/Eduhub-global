import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Clock, 
    Send, 
    AlertCircle, 
    CheckCircle2, 
    XCircle, 
    HelpCircle,
    RotateCcw,
    FileText,
    BarChart3,
    ArrowLeft
} from 'lucide-react';
import { Question, CompetitionExam, MockPaperResult } from '../types';
import { useNavigate } from 'react-router-dom';

interface CompetitiveMockPaperProps {
    exam: CompetitionExam;
    subject: string;
    questions: Question[];
    onClose: () => void;
    onNextLevel?: () => void;
}

export const CompetitiveMockPaper: React.FC<CompetitiveMockPaperProps> = ({
    exam,
    subject,
    questions,
    onClose,
    onNextLevel
}) => {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number | string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120 * 60); // 120 minutes default
    const [showReview, setShowReview] = useState(false);

    useEffect(() => {
        if (isSubmitted) return;
        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isSubmitted]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleTheoryInput = (questionId: string, text: string) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [questionId]: text
        }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToQuestion = (id: string) => {
        const element = document.getElementById(`question-${id}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100; // Offset for sticky header
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach(q => {
            if (q.options && answers[q.id] === q.correctAnswer) {
                score++;
            }
        });
        return score;
    };

    const getQuestionStatus = (index: number) => {
        const q = questions[index];
        if (answers[q.id] !== undefined) return 'answered';
        return 'unvisited';
    };

    if (isSubmitted) {
        const score = calculateScore();
        const percentage = (score / questions.length) * 100;

        return (
            <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 animate-in fade-in duration-700">
                <div className="max-w-5xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100"
                    >
                        {/* Hero Header */}
                        <div className="bg-slate-900 p-16 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
                            
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                className="relative z-10 inline-block mb-8"
                            >
                                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                    <CheckCircle2 className="w-14 h-14 text-white" />
                                </div>
                            </motion.div>
                            
                            <h2 className="text-5xl font-black mb-4 relative z-10 tracking-tight">Mock Paper Analysis</h2>
                            <p className="text-slate-400 text-xl font-medium relative z-10 max-w-2xl mx-auto">
                                You've completed the {exam} {subject} proctored session. Here is your performance breakdown.
                            </p>
                        </div>

                        <div className="p-8 md:p-16">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                                <div className="bg-indigo-50/50 p-10 rounded-[2.5rem] text-center border border-indigo-100 group hover:bg-indigo-50 transition-all">
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Total Score</p>
                                    <p className="text-6xl font-black text-indigo-600 mb-1">{score}</p>
                                    <p className="text-sm font-bold text-indigo-300">Out of {questions.length}</p>
                                </div>
                                <div className="bg-emerald-50/50 p-10 rounded-[2.5rem] text-center border border-emerald-100 group hover:bg-emerald-50 transition-all">
                                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">Accuracy</p>
                                    <p className="text-6xl font-black text-emerald-600 mb-1">{percentage.toFixed(1)}%</p>
                                    <p className="text-sm font-bold text-emerald-300">Success Rate</p>
                                </div>
                                <div className="bg-amber-50/50 p-10 rounded-[2.5rem] text-center border border-amber-100 group hover:bg-amber-50 transition-all">
                                    <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3">Time Invested</p>
                                    <p className="text-6xl font-black text-amber-600 font-mono tracking-tighter mb-1">{formatTime((120 * 60) - timeLeft)}</p>
                                    <p className="text-sm font-bold text-amber-300">Total Duration</p>
                                </div>
                            </div>

                            {/* Detailed Review Section */}
                            <div className="space-y-10">
                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-4">
                                        <div className="p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
                                            <BarChart3 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Question Review</h3>
                                            <p className="text-slate-500 font-medium">Analyze your mistakes and learn from explanations</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex gap-3">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> {score} Correct
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-100">
                                            <div className="w-2 h-2 rounded-full bg-rose-500" /> {questions.length - score} Incorrect
                                        </div>
                                    </div>
                                </div>
                                
                                {questions.map((q, idx) => {
                                    const userAns = answers[q.id];
                                    const isCorrect = userAns === q.correctAnswer;
                                    const isUnanswered = userAns === undefined;

                                    return (
                                        <div key={q.id} className={`group border-2 rounded-[3rem] p-10 transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${
                                            isCorrect ? 'bg-white border-emerald-100' : isUnanswered ? 'bg-slate-50 border-slate-200' : 'bg-white border-rose-100'
                                        }`}>
                                            <div className="flex items-start gap-8 mb-10">
                                                <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-110
                                                    ${isCorrect ? 'bg-emerald-100 text-emerald-700' : isUnanswered ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                                                    {idx + 1}
                                                </div>
                                                <div className="pt-2 flex-1">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {isCorrect ? (
                                                            <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5"/> Correct Answer</span>
                                                        ) : isUnanswered ? (
                                                            <span className="px-4 py-1.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5"/> Question Skipped</span>
                                                        ) : (
                                                            <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><XCircle className="w-3.5 h-3.5"/> Incorrect Answer</span>
                                                        )}
                                                    </div>
                                                    <p className="text-2xl font-bold text-slate-800 leading-tight">{q.question}</p>
                                                </div>
                                            </div>

                                            {q.options ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-20">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isOptCorrect = optIdx === q.correctAnswer;
                                                        const isOptSelected = userAns === optIdx;
                                                        
                                                        let bgColor = 'bg-slate-50';
                                                        let borderColor = 'border-slate-100';
                                                        let textColor = 'text-slate-600';
                                                        let icon = null;

                                                        if (isOptCorrect) {
                                                            bgColor = 'bg-emerald-50';
                                                            borderColor = 'border-emerald-500';
                                                            textColor = 'text-emerald-800 font-black';
                                                            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
                                                        } else if (isOptSelected && !isOptCorrect) {
                                                            bgColor = 'bg-rose-50';
                                                            borderColor = 'border-rose-500';
                                                            textColor = 'text-rose-800 font-black';
                                                            icon = <XCircle className="w-5 h-5 text-rose-600" />;
                                                        }

                                                        return (
                                                            <div 
                                                                key={optIdx}
                                                                className={`p-6 rounded-[1.5rem] border-2 transition-all ${borderColor} ${bgColor} flex items-center justify-between gap-4`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${isOptCorrect ? 'bg-emerald-200 text-emerald-700' : isOptSelected ? 'bg-rose-200 text-rose-700' : 'bg-slate-200 text-slate-500'}`}>
                                                                        {String.fromCharCode(65 + optIdx)}
                                                                    </span>
                                                                    <span className={`text-lg ${textColor}`}>{opt}</span>
                                                                </div>
                                                                {icon}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="ml-0 md:ml-20 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Your Response</p>
                                                    <p className="text-slate-800 text-xl font-medium leading-relaxed italic">"{userAns || 'No answer provided'}"</p>
                                                </div>
                                            )}

                                            {q.rationale && (
                                                <div className="mt-10 ml-0 md:ml-20 p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                                        <HelpCircle className="w-12 h-12 text-indigo-600" />
                                                    </div>
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                                        AI Explanation
                                                    </p>
                                                    <p className="text-indigo-900 text-lg leading-relaxed font-medium relative z-10">{q.rationale}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Final Actions */}
                            <div className="mt-20 flex flex-col sm:flex-row gap-6">
                                <button 
                                    onClick={onClose}
                                    className="flex-1 bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                    Back to Menu
                                </button>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="flex-1 bg-white text-slate-900 border-4 border-slate-900 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4 active:scale-95"
                                >
                                    <RotateCcw className="w-6 h-6" />
                                    Retake Exam
                                </button>
                                {onNextLevel && (
                                    <button 
                                        onClick={onNextLevel}
                                        className="flex-1 bg-emerald-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 flex items-center justify-center gap-4 active:scale-95"
                                    >
                                        <CheckCircle2 className="w-6 h-6" />
                                        Next Level
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
            {/* Main Content Area */}
            <div className="flex-1 pb-36 lg:pb-0">
                {/* Sticky Header */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm px-4 py-4 md:px-8">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onClose}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-none mb-1">{exam} {subject}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">Mock Paper</span>
                                    <span className="text-xs text-slate-400 font-bold">{questions.length} Questions</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 md:gap-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-2xl border border-amber-100">
                                <Clock className="w-5 h-5 text-amber-600" />
                                <span className="font-mono font-black text-amber-700">{formatTime(timeLeft)}</span>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 active:scale-95 hidden md:flex"
                            >
                                <Send className="w-4 h-4" />
                                Submit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="space-y-12">
                        {questions.map((q, idx) => (
                            <motion.div
                                id={`question-${q.id}`}
                                key={q.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 relative group"
                            >
                                <div className="absolute -left-4 top-10 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-xl shadow-indigo-200 transform -rotate-6 group-hover:rotate-0 transition-transform">
                                    {idx + 1}
                                </div>

                                <div className="ml-8">
                                    <h2 className="text-2xl font-bold text-slate-900 mb-10 leading-relaxed">
                                        {q.question}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {q.options ? (
                                            q.options.map((option, optIdx) => {
                                                const isSelected = answers[q.id] === optIdx;
                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleOptionSelect(q.id, optIdx)}
                                                        className={`
                                                            w-full p-5 rounded-2xl text-left transition-all border-2 flex items-start gap-5 group/opt
                                                            ${isSelected 
                                                                ? 'bg-indigo-50/50 border-indigo-600 shadow-md shadow-indigo-100/50' 
                                                                : 'bg-white border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                                                        `}
                                                    >
                                                        <div className={`
                                                            w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all mt-[0.15rem]
                                                            ${isSelected ? 'border-indigo-600' : 'border-slate-300 group-hover/opt:border-indigo-400'}
                                                        `}>
                                                            {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                                                        </div>
                                                        <span className={`text-lg font-medium flex-1 whitespace-normal leading-snug break-words ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option}</span>
                                                    </button>
                                                );
                                            })
                                        ) : (
                                            <div className="col-span-2 space-y-4">
                                                <textarea 
                                                    value={(answers[q.id] as string) || ''}
                                                    onChange={(e) => handleTheoryInput(q.id, e.target.value)}
                                                    placeholder="Write your detailed response here..."
                                                    className="w-full h-48 p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-600 focus:ring-0 transition-all text-lg resize-none font-medium"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center lg:hidden">
                        <button 
                            onClick={handleSubmit}
                            className="bg-slate-900 text-white px-12 py-6 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-300 flex items-center gap-4 mx-auto active:scale-95"
                        >
                            <Send className="w-6 h-6" />
                            Submit Final Paper
                        </button>
                        <p className="mt-6 text-slate-400 font-bold uppercase tracking-widest text-xs">Make sure to review all answers before submitting</p>
                    </div>
                </div>
            </div>

            {/* Sidebar Palette (Desktop) */}
            <div className="hidden lg:flex flex-col w-80 bg-white border-l border-slate-200 sticky top-0 h-screen overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Question Palette
                    </h3>
                    <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" /> Answered
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full border-2 border-slate-300" /> Unanswered
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-5 gap-2">
                        {questions.map((q, idx) => {
                            const isAnswered = answers[q.id] !== undefined;
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => scrollToQuestion(q.id)}
                                    className={`
                                        w-10 h-10 rounded-xl font-black text-sm transition-all flex items-center justify-center
                                        ${isAnswered 
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 hover:bg-emerald-600' 
                                            : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'}
                                    `}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="mb-4">
                        <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                            <span>Progress</span>
                            <span className="text-indigo-600">{Object.keys(answers).length} / {questions.length}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                            />
                        </div>
                    </div>
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                        Submit Paper
                    </button>
                </div>
            </div>

            {/* Floating Progress Indicator (Mobile) */}
            <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 z-40 border border-slate-800 w-[90%] max-w-sm justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-black text-white">
                        {Object.keys(answers).length}/{questions.length}
                    </span>
                </div>
                <div className="w-px h-6 bg-slate-700" />
                <button 
                    onClick={handleSubmit}
                    className="text-amber-400 font-black text-sm uppercase tracking-widest flex items-center gap-1"
                >
                    Submit <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

