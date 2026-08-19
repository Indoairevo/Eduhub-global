import React, { useState, useEffect } from 'react';
import { 
    Trophy, BookOpen, Sparkles, ArrowLeft, Loader2, Bookmark, 
    ChevronRight, Brain, Target, FileText, Settings2, CheckCircle,
    CheckCircle2, Zap, Layers, BarChart3, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMPETITION_EXAMS } from '../constants';
import { CompetitionExam, CompetitionTopic, Question } from '../types';
import { fetchCompetitionTopics, streamGeminiResponse, generateCompetitiveQuizStream, generateCompetitiveMockPaperStream } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { PGT_SOCIOLOGY_QUESTIONS } from '../data/pgtSociologyData';
import { PGT_SOCIOLOGY_QUESTIONS_2 } from '../data/pgtSociologyData2';
import { CompetitiveQuiz } from '../components/CompetitiveQuiz';
import { CompetitiveMockPaper } from '../components/CompetitiveMockPaper';

export const Competition: React.FC = () => {
    const { language, addXP } = useAppContext();
    const [selectedExam, setSelectedExam] = useState<CompetitionExam | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [topics, setTopics] = useState<CompetitionTopic[]>([]);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [quizLevel, setQuizLevel] = useState<1 | 2 | 3 | 4>(1);
    const [mockLevel, setMockLevel] = useState<1 | 2 | 3 | 4>(1);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedPaper, setSelectedPaper] = useState<number>(1);
    
    // Quiz State
    const [quizMode, setQuizMode] = useState(false);
    const [mockPaperMode, setMockPaperMode] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [questionCount, setQuestionCount] = useState(10);

    // Exam Categories
    const DIRECT_ACCESS_EXAMS = ['JEE Mains', 'JEE Advanced', 'NEET', 'NDA'];
    const SUBJECT_BASED_EXAMS = ['PGT', 'TGT', 'UGC NET/JRF', 'CTET', 'State PSC', 'UPSC CSE', 'SSC CGL', 'IBPS PO', 'GATE', 'CAT'];

    const getExamSubjects = () => {
        if (selectedExam === 'NEET') return ['Biology', 'Physics', 'Chemistry'];
        if (selectedExam === 'JEE Mains' || selectedExam === 'JEE Advanced') return ['Mathematics', 'Physics', 'Chemistry'];
        if (selectedExam === 'PGT' || selectedExam === 'TGT' || selectedExam === 'UGC NET/JRF') {
             return ['Sociology', 'History', 'Geography', 'Economics', 'Political Science', 'Hindi', 'English', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science'];
        }
        return ['General Studies', 'Reasoning', 'Quantitative Aptitude', 'English', 'Current Affairs'];
    };

    const handleExamSelect = (exam: CompetitionExam) => {
        setSelectedExam(exam);
        setSelectedSubject('');
        setQuizMode(false);
        setMockPaperMode(false);
    };

    const handleSubjectSelect = async (subj: string) => {
        setSelectedSubject(subj);
        setLoading(true);
        
        // Special Case: PGT Sociology (Offline Data)
        if (selectedExam === 'PGT' && subj === 'Sociology') {
            setQuizQuestions(PGT_SOCIOLOGY_QUESTIONS);
            setLoading(false);
            return;
        }

        // Default: Load Topics for Notes (Existing Flow)
        const cachedTopics = dbService.getCompetitionTopics(selectedExam!, subj);
        if (cachedTopics && cachedTopics.length > 0) {
             setTopics(cachedTopics);
             setLoading(false);
             return;
        }

        const res = await fetchCompetitionTopics(selectedExam!, subj, language);
        if (res.length > 0) {
             setTopics(res);
             dbService.saveCompetitionTopics(selectedExam!, subj, res);
        }
        setLoading(false);
    };

    const startQuiz = async () => {
        if (!selectedSubject) return;

        const cacheKey = `comp_quiz_${selectedExam}_${selectedSubject}_${quizLevel}_p${selectedPaper}`;
        const cachedQuiz = dbService.getSavedResult('quiz', cacheKey);
        
        if (cachedQuiz) {
            setQuizQuestions(cachedQuiz);
            setQuizMode(true);
            return;
        }

        if (quizLevel >= 2) {
            setIsGenerating(true);
            setGenerationProgress(0);
            try {
                const stream = generateCompetitiveQuizStream(selectedExam || '', selectedSubject, language, quizLevel);
                let finalQuestions: Question[] = [];
                for await (const chunk of stream) {
                    setGenerationProgress(chunk.progress);
                    if (chunk.questions.length > 0) finalQuestions = chunk.questions;
                }
                if (finalQuestions.length > 0) {
                    dbService.saveResult('quiz', cacheKey, finalQuestions);
                    setQuizQuestions(finalQuestions);
                    setQuizMode(true);
                }
            } catch (error) {
                console.error("Quiz generation failed", error);
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        // Offline logic for Level 1
        if (selectedExam === 'PGT' && selectedSubject === 'Sociology') {
            const paperData = selectedPaper === 2 ? PGT_SOCIOLOGY_QUESTIONS_2 : PGT_SOCIOLOGY_QUESTIONS;
            const shuffled = [...paperData].sort(() => 0.5 - Math.random());
            const finalQuestions = shuffled.slice(0, questionCount);
            dbService.saveResult('quiz', cacheKey, finalQuestions);
            setQuizQuestions(finalQuestions);
            setQuizMode(true);
        } else {
            // Fallback to AI if no offline data
            setIsGenerating(true);
            setGenerationProgress(0);
            const stream = generateCompetitiveQuizStream(selectedExam || '', selectedSubject, language, quizLevel);
            let finalQuestions: Question[] = [];
            try {
                for await (const chunk of stream) {
                    setGenerationProgress(chunk.progress);
                    if (chunk.questions.length > 0) finalQuestions = chunk.questions;
                }
                if (finalQuestions.length > 0) {
                    dbService.saveResult('quiz', cacheKey, finalQuestions);
                    setQuizQuestions(finalQuestions);
                    setQuizMode(true);
                } else {
                    alert("Failed to generate quiz. Please try again.");
                }
            } catch (e) {
                console.error(e);
                alert("An error occurred while generating the quiz.");
            }
            setIsGenerating(false);
        }
    };

    const startMockPaper = async () => {
        if (!selectedSubject) return;

        const cacheKey = `comp_mock_${selectedExam}_${selectedSubject}_${mockLevel}_p${selectedPaper}`;
        const cachedMock = dbService.getSavedResult('mock', cacheKey);
        
        if (cachedMock) {
            setQuizQuestions(cachedMock);
            setMockPaperMode(true);
            return;
        }

        if (mockLevel >= 2) {
            setIsGenerating(true);
            setGenerationProgress(0);
            try {
                const stream = generateCompetitiveMockPaperStream(selectedExam || '', selectedSubject, language, mockLevel);
                let finalQuestions: Question[] = [];
                for await (const chunk of stream) {
                    setGenerationProgress(chunk.progress);
                    if (chunk.questions.length > 0) finalQuestions = chunk.questions;
                }
                if (finalQuestions.length > 0) {
                    dbService.saveResult('mock', cacheKey, finalQuestions);
                    setQuizQuestions(finalQuestions);
                    setMockPaperMode(true);
                } else {
                    alert("Failed to generate mock paper. Please try again.");
                }
            } catch (error) {
                console.error("Mock paper generation failed", error);
                alert("An error occurred while generating the mock paper.");
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        // Offline logic for Level 1
        if (selectedExam === 'PGT' && selectedSubject === 'Sociology') {
            const paperData = selectedPaper === 2 ? PGT_SOCIOLOGY_QUESTIONS_2 : PGT_SOCIOLOGY_QUESTIONS;
            dbService.saveResult('mock', cacheKey, paperData);
            setQuizQuestions(paperData); // All 125 questions
            setMockPaperMode(true);
        } else {
            // Fallback to AI
            setIsGenerating(true);
            setGenerationProgress(0);
            const stream = generateCompetitiveMockPaperStream(selectedExam || '', selectedSubject, language, mockLevel);
            let finalQuestions: Question[] = [];
            try {
                for await (const chunk of stream) {
                    setGenerationProgress(chunk.progress);
                    if (chunk.questions.length > 0) finalQuestions = chunk.questions;
                }
                if (finalQuestions.length > 0) {
                    dbService.saveResult('mock', cacheKey, finalQuestions);
                    setQuizQuestions(finalQuestions);
                    setMockPaperMode(true);
                } else {
                    alert("Failed to generate mock paper. Please try again.");
                }
            } catch (e) {
                console.error(e);
                alert("An error occurred while generating the mock paper.");
            }
            setIsGenerating(false);
        }
    };

    const startStreaming = async (topic: string) => {
        const cachedNotes = dbService.getCompetitionNotes(selectedExam!, topic);
        if (cachedNotes) {
             setContent(cachedNotes);
             return;
        }

        setIsStreaming(true);
        setContent('');
        const prompt = `Provide detailed competitive-level notes for ${topic} focused on the ${selectedExam} exam. Include key data and historical context where applicable.`;
        const iterator = streamGeminiResponse(prompt);
        let text = '';
        for await (const chunk of iterator) {
            text += chunk;
            setContent(text);
        }
        setIsStreaming(false);
        dbService.saveCompetitionNotes(selectedExam!, topic, text);
        addXP(60);
    };

    // Effect to auto-start quiz when level changes via Next Level button
    const [autoStartNextLevel, setAutoStartNextLevel] = useState(false);

    useEffect(() => {
        if (autoStartNextLevel) {
            if (quizMode) {
                startQuiz();
            } else if (mockPaperMode) {
                startMockPaper();
            }
            setAutoStartNextLevel(false);
        }
    }, [quizLevel, mockLevel, autoStartNextLevel]);

    if (mockPaperMode && quizQuestions.length > 0) {
        return (
            <CompetitiveMockPaper 
                exam={selectedExam!}
                subject={selectedSubject}
                questions={quizQuestions}
                onClose={() => setMockPaperMode(false)}
                onNextLevel={() => {
                    if (mockLevel < 4) {
                        setMockPaperMode(false); // Close current mock paper
                        setMockLevel(prev => (prev + 1) as 1 | 2 | 3 | 4);
                        setAutoStartNextLevel(true);
                    }
                }}
            />
        );
    }

    if (quizMode && quizQuestions.length > 0) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <CompetitiveQuiz 
                    questions={quizQuestions}
                    examName={selectedExam!}
                    subject={selectedSubject}
                    onBack={() => setQuizMode(false)}
                    onComplete={(score) => addXP(score * 10)}
                    onNextLevel={() => {
                        if (quizLevel < 4) {
                            setQuizMode(false); // Close current quiz
                            setQuizLevel(prev => (prev + 1) as 1 | 2 | 3 | 4);
                            setAutoStartNextLevel(true);
                        }
                    }}
                />
            </div>
        );
    }

    if (!selectedExam) {
        return (
            <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex p-5 bg-gradient-to-br from-red-500 to-orange-600 rounded-[2rem] shadow-xl shadow-red-200 mb-4">
                        <Trophy className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tight">Competitive Exam Hub</h2>
                    <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Master your dream exam with AI-powered notes, quizzes, and real-time doubt solving.</p>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Entrance Exams (Direct Access)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {COMPETITION_EXAMS.filter(e => DIRECT_ACCESS_EXAMS.includes(e)).map(exam => (
                                <button key={exam} onClick={() => handleExamSelect(exam)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-red-500 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-150" />
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">🎯</div>
                                        <span className="font-black text-slate-800 text-lg">{exam}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-2">Recruitment & Eligibility</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {COMPETITION_EXAMS.filter(e => !DIRECT_ACCESS_EXAMS.includes(e)).map(exam => (
                                <button key={exam} onClick={() => handleExamSelect(exam)} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-transform group-hover:scale-150" />
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">💼</div>
                                        <span className="font-black text-slate-800 text-lg">{exam}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 max-w-7xl mx-auto pb-20 px-4">
             <button onClick={() => {setSelectedExam(null); setSelectedSubject(''); setTopics([]); setContent('');}} className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-black px-4 py-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back to Exams
             </button>
             
             <div className="flex flex-col lg:flex-row gap-10">
                 {/* Sidebar: Subject Selection */}
                 <div className="lg:w-1/3 space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <h3 className="text-3xl font-black mb-2 tracking-tight">{selectedExam}</h3>
                        <p className="text-slate-400 font-medium">Select a subject to access study material and quizzes.</p>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm">
                        <h4 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-4 ml-2">Syllabus Subjects</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {getExamSubjects().map(subj => (
                                <button 
                                    key={subj} 
                                    onClick={() => handleSubjectSelect(subj)} 
                                    className={`p-4 rounded-2xl text-left font-bold transition-all flex justify-between items-center ${selectedSubject === subj ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md'}`}
                                >
                                    {subj}
                                    {selectedSubject === subj && <ChevronRight className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>

                 {/* Main Content Area */}
                 <div className="lg:w-2/3">
                    {!selectedSubject ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-[3rem] border border-slate-100 border-dashed">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <BookOpen className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Select a Subject</h3>
                            <p className="text-slate-400 font-medium">Choose a subject from the left menu to start your preparation.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            {/* Header for Subject */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 mb-2">{selectedSubject}</h2>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                        <Target className="w-4 h-4" />
                                        {selectedExam} Preparation
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                                            {[1, 2, 3, 4].map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => setMockLevel(l as 1 | 2 | 3 | 4)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mockLevel === l ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                                                >
                                                    L{l} {l >= 2 ? 'AI' : 'OFF'}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={startMockPaper}
                                            disabled={isGenerating}
                                            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                            Full Mock Paper
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                                            {[1, 2, 3, 4].map(l => (
                                                <button
                                                    key={l}
                                                    onClick={() => setQuizLevel(l as 1 | 2 | 3 | 4)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${quizLevel === l ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                                >
                                                    L{l} {l >= 2 ? 'AI' : 'OFF'}
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={startQuiz}
                                            disabled={isGenerating}
                                            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                                            Quick Quiz
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Generation Progress Overlay */}
                            <AnimatePresence>
                                {isGenerating && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 flex flex-col items-center text-center"
                                    >
                                        <Sparkles className="w-12 h-12 mb-4 animate-pulse" />
                                        <h3 className="text-2xl font-black mb-2">AI is Crafting Your Paper</h3>
                                        <p className="text-indigo-100 font-medium mb-8 max-w-md">We're generating high-quality competitive questions specifically for {selectedSubject}. This might take a moment.</p>
                                        
                                        <div className="w-full max-w-md bg-indigo-800/50 h-4 rounded-full overflow-hidden mb-4 border border-indigo-400/30">
                                            <motion.div 
                                                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${generationProgress}%` }}
                                            />
                                        </div>
                                        <span className="text-4xl font-black font-mono">{generationProgress}%</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Quiz Settings (Only for PGT Sociology Quick Quiz) */}
                            {selectedExam === 'PGT' && selectedSubject === 'Sociology' && (
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                            <Settings2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Practice Settings</h4>
                                            <p className="text-sm text-slate-500">Select paper & quiz length</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Paper:</span>
                                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setSelectedPaper(1)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedPaper === 1 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Set 1 (2021)
                                                </button>
                                                <button
                                                    onClick={() => setSelectedPaper(2)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${selectedPaper === 2 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                >
                                                    Set 2 (2022)
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quiz Size:</span>
                                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                                {[10, 20, 30, 50].map(count => (
                                                    <button
                                                        key={count}
                                                        onClick={() => setQuestionCount(count)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${questionCount === count ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                    >
                                                        {count}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Logic for PGT Sociology (Offline) vs Others (AI Notes) */}
                            {selectedExam === 'PGT' && selectedSubject === 'Sociology' ? (
                                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-8 rounded-[2.5rem] border border-indigo-100">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-700">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-indigo-900 mb-2">Master Sociology PGT</h3>
                                            <p className="text-indigo-700 font-medium mb-6">
                                                Choose "Full Mock Paper" for a real exam experience (120 mins) or "Quick Quiz" for targeted practice.
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-sm font-bold text-indigo-800">
                                                <span className="bg-white px-3 py-1 rounded-lg shadow-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    50+ PYQs
                                                </span>
                                                <span className="bg-white px-3 py-1 rounded-lg shadow-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    Real Exam Timer
                                                </span>
                                                <span className="bg-white px-3 py-1 rounded-lg shadow-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    Detailed Analysis
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Existing AI Notes Flow */
                                <>
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                                            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                                            <p className="text-slate-400 font-bold animate-pulse">Analyzing syllabus priorities...</p>
                                        </div>
                                    ) : content ? (
                                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl prose prose-lg prose-indigo max-w-none">
                                            <button onClick={() => setContent('')} className="mb-6 text-xs font-black text-indigo-600 flex items-center gap-2 uppercase tracking-widest hover:underline">
                                                <ArrowLeft className="w-4 h-4" /> Back to topics
                                            </button>
                                            <div className="whitespace-pre-line leading-relaxed">{content}</div>
                                            {isStreaming && <div className="mt-4 flex gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100"></div></div>}
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {topics.map(topic => (
                                                <div key={topic.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-indigo-500 hover:shadow-xl transition-all group cursor-pointer" onClick={() => startStreaming(topic.title)}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{topic.title}</h4>
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${topic.importance === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{topic.importance} Priority</span>
                                                    </div>
                                                    <p className="text-slate-500 font-medium text-sm mb-6 leading-relaxed">{topic.description}</p>
                                                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                                        <Sparkles className="w-4 h-4" /> Generate Notes
                                                    </div>
                                                </div>
                                            ))}
                                            {topics.length === 0 && <div className="text-center py-20 text-slate-300 font-bold">Select a subject to view topics</div>}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                 </div>
             </div>
        </div>
    );
};

// Helper components for icons used in the updated code
const ZapIcon = ({ className }: { className?: string }) => (
    <Zap className={className} />
);
