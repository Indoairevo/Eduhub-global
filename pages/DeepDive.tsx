
import React, { useState, useEffect, useRef } from 'react';
import { SUBJECTS } from '../constants';
import { Subject, EducationLevel, DeepDiveArticle } from '../types';
import { fetchDeepDiveArticle, getGeminiResponse } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { SAVED_ARTICLES } from '../data/permanentDB';
import { Search, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { useAppContext } from '../App';

const ARTICLE_TITLES = Object.values(SAVED_ARTICLES)
  .flat()
  .map(a => ({ title: a.title, type: 'article' as const }));

const POPULAR_TOPICS = [
  { title: 'Indian Constitution', type: 'topic' as const },
  { title: 'Photosynthesis', type: 'topic' as const },
  { title: 'Quantum Mechanics', type: 'topic' as const },
  { title: 'French Revolution', type: 'topic' as const },
  { title: 'Blockchain Technology', type: 'topic' as const },
  { title: 'Cell Biology', type: 'topic' as const },
  { title: 'Vedic Mathematics', type: 'topic' as const },
  { title: 'Sustainable Energy', type: 'topic' as const },
];

const SUGGESTION_POOL = [...ARTICLE_TITLES, ...POPULAR_TOPICS];

export const DeepDive: React.FC = () => {
  const { language, addXP } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [query, setQuery] = useState('');
  const [article, setArticle] = useState<DeepDiveArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [extending, setExtending] = useState(false);
  const [extraContent, setExtraContent] = useState('');
  
  const [suggestions, setSuggestions] = useState<{ title: string; type: 'article' | 'topic' }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length > 1) {
      const filtered = SUGGESTION_POOL.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = async (forceGenerate = false, overrideQuery?: string) => {
    const finalQuery = overrideQuery || query;
    if (!finalQuery.trim() || !selectedSubject || !selectedLevel) return;
    
    setLoading(true);
    setExtraContent('');
    setShowSuggestions(false);

    // Check DB Service first (covers local + permanent)
    const cached = dbService.getArticle(finalQuery, selectedSubject);
    if (cached && !forceGenerate) {
      setArticle(cached);
      setLoading(false);
      return;
    }

    const res = await fetchDeepDiveArticle(finalQuery, selectedSubject, selectedLevel, language);
    if (res) {
      dbService.saveArticle(res);
      setArticle(res);
      addXP(50);
    }
    setLoading(false);
  };

  const extendArticle = async () => {
    if (!article) return;
    setExtending(true);
    const prompt = `Provide a PhD-level deep analysis of "${article.title}" focusing on historical nuances, future implications, and counter-arguments.`;
    const res = await getGeminiResponse(prompt, language);
    setExtraContent(prev => prev + `<div class="mt-8 pt-8 border-t border-slate-100 bg-slate-50 p-6 rounded-2xl"><h4>Advanced Perspective</h4>${res}</div>`);
    setExtending(false);
    addXP(30);
  };

  const selectSuggestion = (suggestionTitle: string) => {
    setQuery(suggestionTitle);
    handleSearch(false, suggestionTitle);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="border-b border-slate-200 pb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">🧠 Deep Knowledge</h2>
          <p className="text-slate-500 mt-1">Explore pre-saved historical insights or generate new analysis.</p>
        </div>
        {article && <button onClick={() => {setArticle(null); setExtraContent(''); setQuery('');}} className="text-slate-400 hover:text-red-500 font-bold flex items-center gap-1">❌ Reset</button>}
      </div>

      {!selectedSubject ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setSelectedSubject(s)} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg font-bold transition-all text-left flex items-center gap-3 group">
              <span className="text-2xl group-hover:scale-110 transition-transform">📖</span> {s}
            </button>
          ))}
        </div>
      ) : !selectedLevel ? (
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl mx-auto text-center border border-slate-100 animate-in zoom-in-95">
           <div className="flex justify-center mb-6">
              <div className="bg-indigo-100 p-4 rounded-full text-2xl">
                ✨
              </div>
           </div>
           <h3 className="text-2xl font-bold mb-2">Select Target Level</h3>
           <p className="text-slate-500 mb-8">This tailors the complexity of the <span className="text-indigo-600 font-bold">{selectedSubject}</span> content.</p>
           <div className="grid gap-3">
              {['Class 10', 'Class 12', 'B.Tech', 'PhD'].map(lvl => (
                <button key={lvl} onClick={() => setSelectedLevel(lvl as EducationLevel)} className="p-5 bg-slate-50 rounded-2xl font-bold hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-all flex justify-between items-center group">
                  {lvl} 
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">➡️</span>
                </button>
              ))}
           </div>
           <button onClick={() => setSelectedSubject(null)} className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">
              &larr; Choose a different subject
           </button>
        </div>
      ) : (
        <div className="space-y-6">
           <div className="relative z-50 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm" ref={suggestionRef}>
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                  onFocus={() => query.trim().length > 1 && setShowSuggestions(suggestions.length > 0)}
                  placeholder={`Search any topic in ${selectedSubject}...`} 
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-transparent focus:border-indigo-100 transition-all" 
                />
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                
                {showSuggestions && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {suggestions.map((item, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectSuggestion(item.title)}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-indigo-50 transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                          {item.type === 'article' ? '📄' : '#️⃣'}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={() => handleSearch()} 
                  disabled={loading || !query.trim()}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📚 Open'}
                 </button>
                 <button 
                  onClick={() => handleSearch(true)} 
                  disabled={loading || !query.trim()}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg disabled:opacity-50 transition-all"
                 >
                   ✨ AI Analysis
                 </button>
              </div>
           </div>

           {loading && !article && (
             <div className="flex flex-col items-center justify-center py-24 animate-pulse">
                <div className="text-6xl mb-6">🔭</div>
                <h3 className="text-xl font-bold text-slate-800">Synthesizing Scholarly Data...</h3>
             </div>
           )}

           {article && (
             <article className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in zoom-in-95 duration-500">
                <div className="mb-8 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">#{tag}</span>
                  ))}
                </div>
                <h3 className="text-4xl md:text-5xl font-black mb-10 text-slate-900 leading-tight">{article.title}</h3>
                <div className="prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: article.content + extraContent }} />
                
                {!extending && (
                    <div className="mt-16 flex flex-col items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-12" />
                        <button onClick={extendArticle} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                            <PlusCircle className="w-5 h-5" /> Dive Deeper (Advanced Analysis)
                        </button>
                    </div>
                )}
                {extending && (
                    <div className="mt-16 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-500 font-bold animate-pulse text-sm">Expanding neural context for PhD analysis...</p>
                    </div>
                )}
             </article>
           )}
           
           {!article && !loading && (
             <div className="py-20 text-center text-slate-400">
                <div className="text-6xl mb-4 opacity-10">📖</div>
                <p className="font-bold">Enter a topic above or try a suggestion to begin your journey.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};
