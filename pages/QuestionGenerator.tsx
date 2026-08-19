import React, { useState } from 'react';
import { generateExamQuestions } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { ExamQuestion, Subject } from '../types';
import { SUBJECTS } from '../constants';

const BOARDS = ['CBSE', 'ICSE', 'State Board', 'International'];
const CATEGORIES = ['School (1-12)', 'Graduation (College)', 'Competitive Exam'];
const EXAMS = ['UPSC', 'JEE Mains', 'NEET', 'SSC CGL', 'CAT', 'GATE', 'Other'];

export const QuestionGenerator: React.FC = () => {
    const { language, addXP } = useAppContext();
    const [subject, setSubject] = useState<Subject | ''>('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [board, setBoard] = useState(BOARDS[0]);
    const [level, setLevel] = useState('Class 10');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);

    const handleGenerate = async () => {
        if (!subject) return;
        setLoading(true);
        const res = await generateExamQuestions(subject as Subject, level, board, category, language);
        setQuestions(res);
        setLoading(false);
        addXP(50);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="text-center">
                <div className="bg-amber-100 w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6">🎓</div>
                <h2 className="text-4xl font-black text-slate-900">AI Question Bank</h2>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Assessment Type</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Board / Council</label>
                        <select value={board} onChange={(e) => setBoard(e.target.value)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none">
                            {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Level / Class</label>
                        <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="e.g. Class 12 or UPSC Prelims" className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Subject</label>
                        <select value={subject} onChange={(e) => setSubject(e.target.value as any)} className="w-full p-4 bg-slate-50 border rounded-2xl font-bold outline-none">
                            <option value="">Select Subject...</option>
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                <button onClick={handleGenerate} disabled={loading || !subject} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3">
                    {loading ? "⏳ Generating Bank..." : "✨ Generate Questions"}
                </button>
            </div>

            <div className="space-y-6">
                {questions.map((q, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{q.type}</span>
                            <span className="text-slate-300 font-black">#0{i+1}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6">{q.question}</h3>
                        <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 text-sm font-medium italic">
                            <span className="not-italic font-black text-slate-900 block mb-2">Model Answer:</span>
                            {q.answer}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};