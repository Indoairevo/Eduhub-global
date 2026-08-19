
import React, { useState } from 'react';
import { BookOpen, Sparkles, Loader2, ChevronRight, GraduationCap, ArrowRight, BrainCircuit, CheckCircle, PlayCircle } from 'lucide-react';
import { generateStudyBuddyLesson } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';

export const StudyBuddy: React.FC = () => {
    const { language, user, addXP } = useAppContext();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [lesson, setLesson] = useState<any>(null);
    const [activePart, setActivePart] = useState(0);

    const handleLearn = async (overrideTopic?: string) => {
        const finalTopic = overrideTopic || topic;
        if (!finalTopic.trim()) return;
        setLoading(true);
        setLesson(null);
        setActivePart(0);

        try {
            const data = await generateStudyBuddyLesson(finalTopic, user?.educationLevel || 'Class 10', language);
            setLesson(data);
            dbService.trackActivity(`Started lesson on ${finalTopic}`);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markMastered = () => {
        if (!lesson) return;
        const p = dbService.getProgress();
        if (!p.masteredTopics.includes(lesson.title)) {
            p.masteredTopics.push(lesson.title);
            dbService.saveProgress(p);
            addXP(250);
            dbService.trackActivity(`Mastered ${lesson.title}`);
        }
        alert("Topic marked as Mastered! +250 XP earned.");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />
                <div className="flex items-center gap-3 sm:gap-5 z-10">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 sm:p-4 rounded-xl sm:rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                        <GraduationCap className="w-6 h-6 sm:w-10 sm:h-10" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">AI Study Buddy</h2>
                        <p className="text-indigo-600 font-bold uppercase tracking-widest text-[8px] sm:text-xs mt-0.5 sm:mt-1">Step-by-step interactive tutor</p>
                    </div>
                </div>
                <div className="bg-slate-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200 z-10 shadow-sm text-[10px] sm:text-xs">
                    <span className="font-black text-slate-500 uppercase tracking-widest">Level: {user?.educationLevel}</span>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative group z-20">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl sm:rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-white rounded-2xl sm:rounded-[3rem] shadow-xl border border-slate-100 p-1.5 sm:p-2">
                    <input 
                        type="text" 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleLearn(); }}
                        placeholder="Enter any topic..."
                        className="w-full px-4 sm:px-8 py-4 sm:py-6 bg-transparent focus:outline-none text-base sm:text-xl font-medium text-slate-800 placeholder-slate-400"
                    />
                    <button 
                        onClick={() => handleLearn()}
                        disabled={loading || !topic.trim()}
                        className="bg-slate-900 text-white p-4 sm:p-6 rounded-xl sm:rounded-full shadow-lg hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center mr-1 sm:mr-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 sm:w-7 sm:h-7 animate-spin" /> : <Sparkles className="w-5 h-5 sm:w-7 sm:h-7" />}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-8 animate-in zoom-in duration-500">
                    <div className="relative">
                        <div className="w-32 h-32 bg-indigo-100 rounded-full animate-ping absolute top-0 left-0 opacity-50" />
                        <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-indigo-50">
                            <BrainCircuit className="w-16 h-16 text-indigo-600 animate-pulse" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-slate-800">Synthesizing Masterclass...</h3>
                        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Generating custom curriculum for {user?.educationLevel}</p>
                    </div>
                </div>
            ) : lesson ? (
                <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700">
                    {/* Lesson Content */}
                    <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                        
                        <div className="mb-12 relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-6">
                                <PlayCircle className="w-4 h-4" /> Masterclass Active
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tighter">{lesson.title}</h3>
                            <div className="prose prose-lg md:prose-xl max-w-none text-slate-700 leading-relaxed font-medium">
                                {lesson.explanation}
                            </div>
                        </div>

                        {/* Interactive Steps */}
                        <div className="mb-16 relative z-10">
                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-4">
                                Key Concepts <div className="h-px bg-slate-100 flex-1" />
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {lesson.parts.map((p: string, i: number) => (
                                    <div 
                                        key={i} 
                                        onClick={() => setActivePart(i)}
                                        className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group hover:-translate-y-1 ${
                                            activePart === i 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200' 
                                            : 'bg-slate-50 border-transparent hover:bg-white hover:border-indigo-200 hover:shadow-lg text-slate-700'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-2xl mb-6 flex items-center justify-center font-black text-lg transition-colors ${
                                            activePart === i ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 shadow-sm group-hover:bg-indigo-50'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <p className={`text-sm font-bold leading-relaxed ${activePart === i ? 'text-indigo-50' : 'text-slate-600'}`}>
                                            {p}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900 p-8 rounded-[2.5rem] relative z-10 shadow-2xl">
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <button onClick={markMastered} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg hover:bg-emerald-400 active:scale-95 transition-all text-lg">
                                    <CheckCircle className="w-6 h-6" /> Mark as Mastered
                                </button>
                                <button onClick={() => window.print()} className="px-8 py-4 bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-lg">
                                    Save Notes
                                </button>
                            </div>
                            <div className="text-center md:text-right mt-4 md:mt-0">
                                <span className="block text-2xl font-black text-yellow-400">+250 XP</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Reward</span>
                            </div>
                        </div>
                    </div>

                    {/* Follow-up Topics */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-8 flex items-center gap-4">
                            Explore Deeper <div className="h-px bg-slate-200 flex-1" />
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {lesson.followUps.map((f: string, i: number) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleLearn(f)} 
                                    className="p-8 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-indigo-500 hover:shadow-2xl transition-all group flex flex-col justify-between h-full gap-6"
                                >
                                    <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors leading-snug">{f}</span>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors self-end">
                                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-12 rounded-[3rem] border border-indigo-100/50 space-y-6 relative overflow-hidden group hover:shadow-xl transition-all">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
                        <div className="bg-white w-16 h-16 rounded-[2rem] flex items-center justify-center text-indigo-600 shadow-sm relative z-10">
                            <BrainCircuit className="w-8 h-8" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-indigo-950 mb-4 tracking-tight">Neural Tutoring</h3>
                            <p className="text-indigo-800/80 font-medium leading-relaxed text-lg">Describe a concept you're struggling with, and our AI will synthesize a custom, step-by-step curriculum just for you.</p>
                        </div>
                    </div>
                    <div className="bg-slate-900 p-12 rounded-[3rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-700" />
                        <div className="bg-white/10 w-16 h-16 rounded-[2rem] flex items-center justify-center text-emerald-400 border border-white/10 relative z-10 backdrop-blur-md">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Progress Tracking</h3>
                            <p className="text-slate-400 font-medium leading-relaxed text-lg">Mastered topics are recorded in your persistent student profile, unlocking advanced badges and massive XP rewards.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
