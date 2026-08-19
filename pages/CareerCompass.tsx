
import React, { useState } from 'react';
import { Compass, Sparkles, Loader2, ArrowRight, Target, BookOpen, Briefcase, Award } from 'lucide-react';
import { generateCareerRoadmap } from '../services/geminiService';
import { useAppContext } from '../App';
import { CareerRoadmap } from '../types';

export const CareerCompass: React.FC = () => {
    const { language, user } = useAppContext();
    const [step, setStep] = useState<'input' | 'result'>('input');
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [interests, setInterests] = useState('');
    const [strengths, setStrengths] = useState('');
    const [subjects, setSubjects] = useState('');
    
    // Result
    const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
    const [selectedRoadmap, setSelectedRoadmap] = useState<number>(0);

    const handleGenerate = async () => {
        if (!interests || !strengths) return;
        setLoading(true);
        const results = await generateCareerRoadmap(interests, strengths, subjects, language);
        if (results.length > 0) {
            setRoadmaps(results);
            setStep('result');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-slate-200 pb-6">
                <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <div className="bg-violet-100 p-2 rounded-lg">
                        <Compass className="w-6 h-6 text-violet-600" />
                    </div>
                    Career Compass
                </h2>
                <p className="text-slate-500 mt-2">
                    {language === 'hi' 
                     ? 'अपने कौशल और रुचियों के आधार पर सही करियर खोजें। AI आपको एक रोडमैप देगा।' 
                     : 'Find the perfect career path based on your skills and interests. AI will generate a personalized roadmap for you.'}
                </p>
            </div>

            {step === 'input' ? (
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                What are your hobbies & interests?
                            </label>
                            <textarea
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                placeholder="e.g. Coding, Drawing, Helping people, Solving puzzles..."
                                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 h-28 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                What are your key strengths/skills?
                            </label>
                            <textarea
                                value={strengths}
                                onChange={(e) => setStrengths(e.target.value)}
                                placeholder="e.g. Good at Math, Public Speaking, Creative writing..."
                                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 h-28 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Favorite Subjects (Optional)
                            </label>
                            <input
                                type="text"
                                value={subjects}
                                onChange={(e) => setSubjects(e.target.value)}
                                placeholder="e.g. Physics, History, CS"
                                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !interests || !strengths}
                            className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                            {loading ? 'Analyzing Profile...' : 'Generate My Roadmap'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar Selection */}
                    <div className="lg:col-span-1 space-y-4">
                         {roadmaps.map((map, idx) => (
                             <button
                                key={idx}
                                onClick={() => setSelectedRoadmap(idx)}
                                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                                    selectedRoadmap === idx 
                                    ? 'bg-violet-600 text-white shadow-lg scale-105' 
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                             >
                                 <div className="flex justify-between items-start mb-2">
                                     <h3 className="font-bold text-lg">{map.careerTitle}</h3>
                                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${selectedRoadmap === idx ? 'bg-white/20' : 'bg-violet-100 text-violet-700'}`}>
                                         {map.matchScore}% Match
                                     </span>
                                 </div>
                                 <p className={`text-sm line-clamp-2 ${selectedRoadmap === idx ? 'text-violet-100' : 'text-slate-500'}`}>
                                     {map.description}
                                 </p>
                             </button>
                         ))}
                         <button 
                            onClick={() => setStep('input')}
                            className="w-full py-3 text-slate-500 font-bold hover:text-violet-600 mt-4"
                         >
                             &larr; Start Over
                         </button>
                    </div>

                    {/* Detail View */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-in slide-in-from-right-8 duration-500">
                        {roadmaps[selectedRoadmap] && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{roadmaps[selectedRoadmap].careerTitle}</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed">{roadmaps[selectedRoadmap].description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                                        <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                                            <Target className="w-5 h-5" /> Required Skills
                                        </h4>
                                        <ul className="space-y-2">
                                            {roadmaps[selectedRoadmap].skillsRequired.map((skill, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-emerald-700">
                                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2" />
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                        <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5" /> Potential Roles
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {roadmaps[selectedRoadmap].potentialRoles.map((role, i) => (
                                                <span key={i} className="bg-white text-blue-700 px-3 py-1 rounded-lg text-sm font-bold shadow-sm border border-blue-100">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-violet-600" /> Education Roadmap
                                    </h3>
                                    <div className="space-y-6 relative pl-4">
                                        {/* Timeline Line */}
                                        <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-slate-200" />
                                        
                                        {roadmaps[selectedRoadmap].educationPath.map((step, i) => (
                                            <div key={i} className="relative flex items-start gap-4">
                                                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">
                                                    {i + 1}
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1">
                                                    <p className="text-slate-800 font-medium">{step}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="relative flex items-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center font-bold text-sm shrink-0 z-10 ring-4 ring-white">
                                                <Award className="w-4 h-4 text-yellow-800" />
                                            </div>
                                            <div className="pt-1">
                                                <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Career Goal Reached</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
