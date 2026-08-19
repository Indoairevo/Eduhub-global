import React, { useState, useEffect } from 'react';
import { Question, Language } from '../types';
import { CheckCircle, XCircle, HelpCircle, BookOpen, ArrowRight, ArrowLeft, RefreshCw, Trophy, Brain, Sparkles, MessageSquare, Lightbulb, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getQuizHint } from '../services/geminiService';
import { useAppContext } from '../App';

interface CompetitiveQuizProps {
    questions: Question[];
    examName: string;
    subject: string;
    onComplete?: (score: number, total: number) => void;
    onBack: () => void;
    onNextLevel?: () => void;
}

export const CompetitiveQuiz: React.FC<CompetitiveQuizProps> = ({ questions, examName, subject, onComplete, onBack, onNextLevel }) => {
    const navigate = useNavigate();
    const { language } = useAppContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [answers, setAnswers] = useState<{ [key: string]: number }>({}); // questionId -> selectedOptionIndex
    const [hint, setHint] = useState<string | null>(null);
    const [loadingHint, setLoadingHint] = useState(false);

    const currentQuestion = questions[currentIndex];

    // Scroll to top when question changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentIndex]);

    const handleOptionSelect = (index: number) => {
        if (selectedOption !== null) return; // Prevent changing answer
        setSelectedOption(index);
        setShowExplanation(true);
        
        const isCorrect = index === currentQuestion.correctAnswer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }
        
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: index }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowExplanation(false);
            setHint(null);
        } else {
            setQuizCompleted(true);
            if (onComplete) onComplete(score, questions.length);
        }
    };

    const handleGetHint = async () => {
        if (loadingHint) return;
        setLoadingHint(true);
        try {
            const res = await getQuizHint(currentQuestion.question, language as Language);
            setHint(res);
        } catch (error) {
            console.error("Failed to get hint", error);
        } finally {
            setLoadingHint(false);
        }
    };

    const handleDoubt = () => {
        // Navigate to Study Buddy with context
        const doubtContext = `I have a doubt regarding this question from ${examName} (${subject}):\n\nQuestion: ${currentQuestion.question}\n\nOptions:\n${currentQuestion.options?.map((o, i) => `${i + 1}. ${o}`).join('\n')}\n\nCorrect Answer: ${currentQuestion.options?.[currentQuestion.correctAnswer || 0]}\n\nExplanation given: ${currentQuestion.rationale}\n\nMy doubt is: `;
        navigate('/dashboard/study-buddy', { state: { initialMessage: doubtContext } });
    };

    if (quizCompleted) {
        const percentage = Math.round((score / questions.length) * 100);
        const correctAnswers = score;
        const incorrectAnswers = questions.length - score;
        
        return (
            <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500 pb-20">
                <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-500/20 relative z-10"
                        >
                            <Trophy className="w-16 h-16 text-white" />
                        </motion.div>
                        <h2 className="text-5xl font-black text-white mb-2 tracking-tight relative z-10">Quiz Report Card</h2>
                        <p className="text-slate-400 text-lg font-medium relative z-10">Performance analysis for {examName} {subject}</p>
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="p-8 bg-indigo-50 rounded-[2.5rem] text-center border border-indigo-100 group hover:bg-indigo-100 transition-colors">
                                <div className="text-5xl font-black text-indigo-600 mb-2">{percentage}%</div>
                                <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">Accuracy Rate</div>
                            </div>
                            <div className="p-8 bg-emerald-50 rounded-[2.5rem] text-center border border-emerald-100 group hover:bg-emerald-100 transition-colors">
                                <div className="text-5xl font-black text-emerald-600 mb-2">{correctAnswers}</div>
                                <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">Correct Answers</div>
                            </div>
                            <div className="p-8 bg-rose-50 rounded-[2.5rem] text-center border border-rose-100 group hover:bg-rose-100 transition-colors">
                                <div className="text-5xl font-black text-rose-600 mb-2">{incorrectAnswers}</div>
                                <div className="text-xs font-black text-rose-400 uppercase tracking-widest">Incorrect Answers</div>
                            </div>
                        </div>

                        {/* Question Review */}
                        <div className="space-y-6 mb-12">
                            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                                Question-by-Question Review
                            </h3>
                            {questions.map((q, idx) => {
                                const userAns = answers[q.id];
                                const isCorrect = userAns === q.correctAnswer;
                                return (
                                    <div key={q.id} className={`p-8 rounded-[2.5rem] border-2 transition-all ${isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'}`}>
                                        <div className="flex items-start gap-6">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-4 flex-1">
                                                <p className="text-xl font-bold text-slate-800 leading-snug">{q.question}</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {q.options?.map((opt, i) => (
                                                        <div key={i} className={`p-4 rounded-xl text-sm font-bold border ${
                                                            i === q.correctAnswer ? 'bg-emerald-100 border-emerald-200 text-emerald-800' :
                                                            i === userAns ? 'bg-rose-100 border-rose-200 text-rose-800' :
                                                            'bg-white border-slate-100 text-slate-500'
                                                        }`}>
                                                            <span className="mr-2 opacity-50">{String.fromCharCode(65 + i)}.</span>
                                                            {opt}
                                                            {i === q.correctAnswer && <CheckCircle className="w-4 h-4 inline ml-2 text-emerald-600" />}
                                                            {i === userAns && i !== q.correctAnswer && <XCircle className="w-4 h-4 inline ml-2 text-rose-600" />}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className={`p-5 rounded-2xl text-sm font-medium leading-relaxed ${isCorrect ? 'bg-emerald-100/50 text-emerald-900' : 'bg-rose-100/50 text-rose-900'}`}>
                                                    <span className="font-black uppercase tracking-widest text-[10px] block mb-1 opacity-60">Explanation</span>
                                                    {q.rationale}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={onBack} 
                                className="flex-1 px-8 py-5 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                            </button>
                            <button 
                                onClick={() => {
                                    setQuizCompleted(false);
                                    setCurrentIndex(0);
                                    setScore(0);
                                    setAnswers({});
                                    setSelectedOption(null);
                                    setShowExplanation(false);
                                }} 
                                className="flex-1 px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
                            >
                                <RefreshCw className="w-5 h-5" /> Retake Quiz
                            </button>
                            {onNextLevel && (
                                <button 
                                    onClick={onNextLevel} 
                                    className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95"
                                >
                                    <Brain className="w-5 h-5" /> Next Level
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col min-h-[650px] relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    className="h-full bg-indigo-600"
                />
            </div>

            {/* Header */}
            <div className="bg-slate-900 text-white p-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Brain className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">{examName}</h3>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">Question {currentIndex + 1} of {questions.length}</div>
                    </div>
                </div>
                <div className="bg-white/10 px-6 py-2 rounded-2xl text-lg font-black backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    {score}
                </div>
            </div>

            {/* Question Area */}
            <div className="p-8 md:p-12 flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-10 leading-tight">
                            {currentQuestion.question}
                        </h2>

                        <div className="flex flex-wrap gap-4 mb-8">
                            <button 
                                onClick={handleGetHint}
                                disabled={selectedOption !== null || loadingHint}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-sm font-black hover:bg-amber-100 transition-all disabled:opacity-50"
                            >
                                {loadingHint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                                Get AI Hint
                            </button>
                            <AnimatePresence>
                                {hint && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-amber-100 text-amber-900 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200"
                                    >
                                        💡 {hint}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mb-10">
                            {currentQuestion.options?.map((option, idx) => {
                                let optionClass = "border-2 border-slate-100 hover:border-indigo-200 hover:bg-slate-50";
                                let icon = null;

                                if (selectedOption !== null) {
                                    if (idx === currentQuestion.correctAnswer) {
                                        optionClass = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-100";
                                        icon = <CheckCircle className="w-6 h-6 text-emerald-600" />;
                                    } else if (idx === selectedOption) {
                                        optionClass = "border-rose-500 bg-rose-50 text-rose-900 shadow-md shadow-rose-100";
                                        icon = <XCircle className="w-6 h-6 text-rose-600" />;
                                    } else {
                                        optionClass = "border-slate-50 opacity-40 grayscale";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={selectedOption !== null}
                                        className={`group w-full p-6 rounded-[2rem] text-left font-bold transition-all flex justify-between items-center ${optionClass} active:scale-[0.98]`}
                                    >
                                        <span className="flex items-center gap-5">
                                            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${selectedOption === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <span className="text-lg">{option}</span>
                                        </span>
                                        {icon}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation Section */}
                        {showExplanation && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-auto space-y-6"
                            >
                                <div className={`p-8 rounded-[2.5rem] border-2 ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-xl ${selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        <h4 className={`text-lg font-black ${selectedOption === currentQuestion.correctAnswer ? 'text-emerald-800' : 'text-rose-800'}`}>
                                            {selectedOption === currentQuestion.correctAnswer ? 'Brilliant! Correct Answer' : 'Oops! Let\'s learn why'}
                                        </h4>
                                    </div>
                                    <p className="text-slate-700 text-lg leading-relaxed font-medium">
                                        {currentQuestion.rationale}
                                    </p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleDoubt}
                                        className="flex-1 py-5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        <MessageSquare className="w-6 h-6" /> Any Doubt? Ask AI
                                    </button>
                                    <button 
                                        onClick={handleNext}
                                        className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 active:scale-95"
                                    >
                                        {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <ArrowRight className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
