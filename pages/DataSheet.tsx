
import React, { useState } from 'react';
import { Table, Sparkles, Loader2, Download, Trash2, Plus, Edit2, Grid, ChevronDown } from 'lucide-react';
import { textToTable } from '../services/geminiService';
import { useAppContext } from '../App';

export const DataSheet: React.FC = () => {
    const { language } = useAppContext();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any[]>([]);
    const [editingCell, setEditingCell] = useState<{row: number, key: string} | null>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        const res = await textToTable(text, language);
        if (res && res.length > 0) {
            // Flatten the structure for the grid
            const processed = res.map((item: any) => item.row || item);
            setData(processed);
        }
        setLoading(false);
    };

    const keys = data.length > 0 ? Object.keys(data[0]) : [];

    const handleCellEdit = (row: number, key: string, val: string) => {
        const newData = [...data];
        newData[row][key] = val;
        setData(newData);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-xl"><Grid className="w-6 h-6 text-emerald-600" /></div>
                        DataSheet AI
                    </h2>
                    <p className="text-slate-500 mt-1">Convert descriptive research into structured tabular data.</p>
                </div>
                {data.length > 0 && (
                    <button onClick={() => setData([])} className="text-rose-500 font-bold text-sm flex items-center gap-1 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" /> Clear Sheet
                    </button>
                )}
            </div>

            {!data.length && !loading && (
                <div className="max-w-3xl mx-auto bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Raw Research Data</label>
                        <textarea 
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="e.g. Paste a list of countries with their populations and GDP, or a list of chemicals with properties..."
                            className="w-full h-48 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-8 focus:ring-emerald-50 outline-none transition-all font-medium text-lg leading-relaxed resize-none"
                        />
                    </div>
                    <button 
                        onClick={handleGenerate}
                        disabled={loading || !text.trim()}
                        className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl active:scale-95"
                    >
                        <Sparkles className="w-6 h-6" /> Structure Data
                    </button>
                </div>
            )}

            {loading && (
                <div className="py-24 flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Running Tabular Synthesis...</p>
                </div>
            )}

            {data.length > 0 && !loading && (
                <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-8">
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className="bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active Sheet</span>
                            <span className="text-slate-400 text-xs font-bold">{data.length} Rows structured</span>
                        </div>
                        <button className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-emerald-600 transition-all"><Download className="w-5 h-5" /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    {keys.map(k => (
                                        <th key={k} className="p-6 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b border-r border-slate-100">{k}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                        {keys.map(k => (
                                            <td 
                                                key={k} 
                                                className="p-6 border-b border-r border-slate-50 relative"
                                                onDoubleClick={() => setEditingCell({row: i, key: k})}
                                            >
                                                {editingCell?.row === i && editingCell?.key === k ? (
                                                    <input 
                                                        autoFocus 
                                                        value={row[k]}
                                                        onChange={(e) => handleCellEdit(i, k, e.target.value)}
                                                        onBlur={() => setEditingCell(null)}
                                                        onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
                                                        className="absolute inset-0 w-full h-full px-6 bg-emerald-50 focus:outline-none font-bold text-emerald-900"
                                                    />
                                                ) : (
                                                    <span className="text-slate-800 font-bold text-sm">{row[k]}</span>
                                                )}
                                                <Edit2 className="w-3 h-3 text-slate-200 absolute top-2 right-2 opacity-0 group-hover:opacity-100" />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-slate-50/50 flex justify-center">
                        <button className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add New Row
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
