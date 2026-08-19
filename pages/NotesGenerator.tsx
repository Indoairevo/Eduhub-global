
import React, { useState } from 'react';
import { generateExamNotes } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { saveUserFolders, getUserFolders } from '../services/authService';
import { useAppContext } from '../App';
import { Folder, Note } from '../types';

export const NotesGenerator: React.FC = () => {
    const { language, addXP } = useAppContext();
    const [topic, setTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        
        // Check for cached notes first
        const cached = dbService.getSavedResult('exam_notes', topic);
        if (cached) {
            setNotes(cached);
            return;
        }

        setLoading(true);
        setSaved(false);
        try {
            const data = await generateExamNotes(topic, language);
            if (data) {
                setNotes(data);
                dbService.saveResult('exam_notes', topic, data);
                addXP(50);
            }
        } catch (e) {
            alert("Generation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToNotebook = () => {
        if (!notes) return;
        
        const folders: Folder[] = getUserFolders();
        let aiFolder = folders.find(f => f.name === 'AI Generated Notes');
        
        if (!aiFolder) {
            aiFolder = { id: 'ai-folder-' + Date.now(), name: 'AI Generated Notes', notes: [] };
            folders.push(aiFolder);
        }

        const newNote: Note = {
            id: 'note-' + Date.now(),
            title: notes.title,
            content: `<h3>${notes.summary}</h3><br/><h4>Key Terms:</h4><ul>${notes.keyTerms.map((t:any) => `<li><b>${t.term}:</b> ${t.definition}</li>`).join('')}</ul><br/><h4>Detailed Points:</h4><ul>${notes.bulletPoints.map((p:string) => `<li>${p}</li>`).join('')}</ul>`,
            images: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        aiFolder.notes.unshift(newNote);
        saveUserFolders(folders);
        setSaved(true);
        alert("Saved to 'AI Generated Notes' folder in your Notebook!");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
            <div className="text-center">
                <div className="bg-emerald-600 w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl">
                    ✒️
                </div>
                <h2 className="text-4xl font-black text-slate-900">Exam Notes Gen</h2>
                <p className="text-slate-500 font-medium">Generate high-yield study summaries and save them to your notebook.</p>
            </div>

            <div className="relative">
                <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic (e.g. Mughal Empire, Quantum Physics)..."
                    className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[2.5rem] shadow-xl focus:ring-8 focus:ring-emerald-50 outline-none transition-all text-xl font-bold"
                />
                <button 
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="absolute right-3 top-3 bg-slate-900 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                    {loading ? '⏳' : '✨'}
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-black text-slate-400 uppercase text-xs">Writing Master Notes...</p>
                </div>
            ) : notes && (
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95">
                    <h3 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">{notes.title}</h3>
                    
                    <div className="bg-emerald-50 p-6 rounded-2xl mb-8 border border-emerald-100">
                        <p className="text-emerald-800 font-medium leading-relaxed">{notes.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Terminology</h4>
                            <div className="space-y-3">
                                {notes.keyTerms.map((t: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="font-black text-indigo-600 block text-sm">{t.term}</span>
                                        <p className="text-xs text-slate-500">{t.definition}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Key Points</h4>
                            <ul className="space-y-3">
                                {notes.bulletPoints.map((p: string, i: number) => (
                                    <li key={i} className="flex gap-3 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl font-medium">
                                        <span>📍</span> {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleSaveToNotebook}
                            disabled={saved}
                            className={`flex-1 py-4 rounded-2xl font-black transition-all shadow-lg flex items-center justify-center gap-2 ${saved ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {saved ? '✅ Saved to Notebook' : '📓 Save to Notebook'}
                        </button>
                        <button onClick={() => window.print()} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                            📥 Download PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
