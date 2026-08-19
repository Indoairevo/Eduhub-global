
import React, { useState } from 'react';
import { Calendar, Sparkles, Loader2, ArrowLeft, CheckCircle2, ListTodo, Lightbulb, Clock, ChevronRight } from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { StudyPlan } from '../types';

export const StudyPlanner: React.FC = () => {
  const { language } = useAppContext();
  const [examName, setExamName] = useState('');
  const [days, setDays] = useState(7);
  const [subjects, setSubjects] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  const EXAM_PRESETS = [
    { name: 'UPSC CSE', days: 30, subjects: 'History, Polity, Economics' },
    { name: 'NEET', days: 15, subjects: 'Biology, Physics, Chemistry' },
    { name: 'NDA', days: 20, subjects: 'Mathematics, GAT' },
    { name: 'Class 10 Boards', days: 10, subjects: 'Full Syllabus' }
  ];

  const handleGenerate = async (e?: React.FormEvent, preset?: any) => {
    if (e) e.preventDefault();
    const finalExam = preset?.name || examName;
    const finalDays = preset?.days || days;
    const finalSubj = preset?.subjects || subjects;

    if (!finalExam) return;
    
    setLoading(true);

    // Check Cache first - satisfies "don't regenerate if already done"
    const cached = dbService.getPlan(finalExam);
    if (cached) {
        setPlan(cached);
        setLoading(false);
        return;
    }

    const result = await generateStudyPlan(finalExam, finalDays, finalSubj, language);
    if (result) {
      dbService.savePlan(finalExam, result);
      setPlan(result);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">📅 Study Architect 🏗️</h2>
        <p className="text-slate-500 mt-1">Get custom-built strategies for India's toughest exams.</p>
      </div>

      {!plan ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Saved/Popular Plans 📁</h3>
                <div className="grid gap-3">
                    {EXAM_PRESETS.map(ex => (
                        <button key={ex.name} onClick={() => handleGenerate(undefined, ex)} className="p-5 bg-white rounded-3xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all text-left flex justify-between items-center group">
                            <div>
                                <h4 className="font-bold text-slate-800 group-hover:text-indigo-600">{ex.name} 🏆</h4>
                                <p className="text-xs text-slate-400">Personalized Master Plan</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 h-fit">
                <form onSubmit={handleGenerate} className="space-y-6">
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Exam Name 🏛️</label>
                    <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. UPSC, JEE..." className="w-full p-4 rounded-xl border border-slate-200" required />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Days ⏱️</label>
                            <input type="number" min="3" max="60" value={days} onChange={(e) => setDays(parseInt(e.target.value))} className="w-full p-4 rounded-xl border border-slate-200" />
                        </div>
                    </div>
                    <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Focus Subjects 📚</label>
                    <textarea value={subjects} onChange={(e) => setSubjects(e.target.value)} className="w-full p-4 rounded-xl border border-slate-200 h-24 resize-none" />
                    </div>
                    <button type="submit" disabled={loading || !examName} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />} Start Planning
                    </button>
                </form>
            </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 pb-12">
          <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h4 className="text-3xl font-extrabold">{plan.examName} Schedule 📆</h4>
            <button onClick={() => setPlan(null)} className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl font-bold flex items-center gap-2">🔄 Reset</button>
          </div>

          <div className="grid gap-6">
            {plan.schedule.map((day) => (
              <div key={day.day} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="md:w-32 flex-shrink-0">
                      <div className="bg-slate-100 text-slate-500 w-16 h-16 rounded-2xl flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         <span className="text-xs font-bold uppercase">Day</span>
                         <span className="text-2xl font-black">{day.day}</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">🎯 Topics</h5>
                            <ul className="space-y-2">
                               {day.topics.map((t, i) => (<li key={i} className="text-slate-600 text-sm bg-slate-50 px-3 py-2 rounded-lg">{t}</li>))}
                            </ul>
                         </div>
                         <div>
                            <h5 className="font-bold text-slate-900 mb-3 flex items-center gap-2">✅ Tasks</h5>
                            <ul className="space-y-2">
                               {day.tasks.map((t, i) => (<li key={i} className="text-slate-600 text-sm flex items-start gap-2">✔️ {t}</li>))}
                            </ul>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
