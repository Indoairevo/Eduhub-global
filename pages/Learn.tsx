
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SUBJECTS } from '../constants';
import { Subject, EducationLevel, Fact } from '../types';
import { fetchFacts } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { X, Sparkles, ChevronRight, Loader2, Lightbulb, Copy, Share2, Check, Brain, Zap } from 'lucide-react';
import { useAppContext } from '../App';

export const Learn: React.FC = () => {
  const { language } = useAppContext();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const observerTarget = useRef(null);

  const handleLevelSelect = async (level: EducationLevel) => {
    setSelectedLevel(level);
    const cachedFacts = dbService.getFacts(selectedSubject!, level);
    if (cachedFacts.length > 0) {
      setFacts(cachedFacts);
    } else {
      setFacts([]);
      loadMoreFacts(selectedSubject!, level, true);
    }
  };

  const loadMoreFacts = async (subj: Subject, lvl: EducationLevel, reset = false) => {
    setLoading(true);
    // Fetch from AI
    const newFacts = await fetchFacts(subj, lvl, language, 6);
    
    if (newFacts.length > 0) {
      dbService.saveFacts(subj, lvl, newFacts);
    }

    if (reset) {
        setFacts(dbService.getFacts(subj, lvl));
    } else {
        setFacts(prev => {
          const combined = [...prev, ...newFacts];
          return Array.from(new Map(combined.map(item => [item.content, item])).values());
        });
    }
    setLoading(false);
  };

  const resetSelection = () => {
    setSelectedSubject(null);
    setSelectedLevel(null);
    setFacts([]);
  };

  const handleCopyFact = (fact: Fact) => {
    navigator.clipboard.writeText(fact.content);
    setCopiedId(fact.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareFact = async (fact: Fact) => {
    const shareData = {
      title: 'EduSphere AI Fact',
      text: `Did you know? ${fact.content} \n\nLearn more on EduSphere AI!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyFact(fact);
        alert("Sharing not supported. Fact copied!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && selectedSubject && selectedLevel) {
          loadMoreFacts(selectedSubject, selectedLevel, false);
      }
  }, [loading, selectedSubject, selectedLevel]);

  useEffect(() => {
      const observer = new IntersectionObserver(handleObserver, {
          root: null,
          rootMargin: "20px",
          threshold: 0
      });
      if (observerTarget.current) observer.observe(observerTarget.current);
      return () => observer.disconnect();
  }, [handleObserver]);

  const renderLevelGroup = (title: string, levels: string[]) => (
    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
        <h4 className="font-black text-slate-400 mb-4 text-xs tracking-[0.2em] uppercase flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-400" /> {title}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {levels.map(lvl => (
                <button
                    key={lvl}
                    onClick={() => handleLevelSelect(lvl as EducationLevel)}
                    className="p-4 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg hover:-translate-y-1 transition-all text-sm font-black text-slate-600 shadow-sm"
                >
                    {lvl}
                </button>
            ))}
        </div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-slate-200 gap-6">
        <div className="flex items-center gap-5">
           <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-[2rem] shadow-xl shadow-yellow-200">
             <Sparkles className="w-10 h-10 text-white" />
           </div>
           <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                 {language === 'hi' ? 'तथ्य क्षेत्र' : 'Fact Zone'}
               </h2>
               <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-xs">
                   {language === 'hi' ? 'अपनी कक्षा के अनुसार ज्ञान बढ़ाएं।' : 'Bite-sized knowledge tailored to your grade.'}
               </p>
           </div>
        </div>
        {(selectedSubject || selectedLevel) && (
           <button 
             onClick={resetSelection}
             className="text-sm bg-slate-900 hover:bg-slate-800 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center gap-2"
           >
             <X className="w-4 h-4" /> {language === 'hi' ? 'रिसेट करें' : 'Reset Selection'}
           </button>
        )}
      </div>

      {!selectedSubject ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          {SUBJECTS.map((subject, idx) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className="group relative bg-white overflow-hidden rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-40 flex flex-col items-center justify-center gap-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-110 transition-transform
                ${idx % 4 === 0 ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 
                  idx % 4 === 1 ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 
                  idx % 4 === 2 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 
                  'bg-gradient-to-br from-rose-400 to-pink-600'}
              `}>
                {subject.charAt(0)}
              </div>
              <div className="font-black text-slate-700 group-hover:text-indigo-700 relative z-10 tracking-tight">{subject}</div>
            </button>
          ))}
        </div>
      ) : !selectedLevel ? (
        <div className="bg-white rounded-[3.5rem] p-10 sm:p-16 max-w-4xl mx-auto shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in duration-500">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="relative z-10">
              <h3 className="text-4xl font-black text-slate-900 mb-12 tracking-tighter text-center">
                {language === 'hi' ? 'अपना स्तर चुनें' : 'Select Level for'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{selectedSubject}</span>
              </h3>
              
              <div className="space-y-8 text-left">
                 {renderLevelGroup(language === 'hi' ? 'स्कूल' : 'School', ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'])}
                 {renderLevelGroup(language === 'hi' ? 'स्नातक' : 'College', ['B.A', 'B.Sc', 'B.Tech'])}
                 {renderLevelGroup(language === 'hi' ? 'अन्य' : 'Other', ['General Learner', 'PhD'])}
              </div>

              <div className="text-center mt-12">
                  <button onClick={() => setSelectedSubject(null)} className="text-slate-400 hover:text-indigo-600 text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto">
                    <ChevronRight className="w-4 h-4 rotate-180" /> {language === 'hi' ? 'विषय बदलें' : 'Choose a different subject'}
                  </button>
              </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-white/10 rounded-[2rem] flex items-center justify-center backdrop-blur-md border border-white/20">
                       <Brain className="w-8 h-8 text-indigo-300" />
                   </div>
                   <div>
                      <h3 className="text-4xl font-black tracking-tighter mb-2">{selectedSubject}</h3>
                      <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                          <Zap className="w-3 h-3" /> {selectedLevel}
                      </div>
                   </div>
               </div>
               <button onClick={resetSelection} className="bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors backdrop-blur-sm border border-white/10">
                 <X className="w-6 h-6" />
               </button>
             </div>
          </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {facts.map((fact, idx) => (
                  <div key={fact.id || idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="w-12 h-12 bg-amber-50 rounded-[1.5rem] flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-sm">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleCopyFact(fact)} className={`p-3 rounded-2xl transition-all ${copiedId === fact.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                                {copiedId === fact.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                            <button onClick={() => handleShareFact(fact)} className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-xl text-slate-800 leading-relaxed font-medium flex-1 relative z-10">
                      {fact.content}
                    </p>
                  </div>
                ))}
              </div>
              
            <div ref={observerTarget} className="flex justify-center py-12">
                {loading && (
                    <div className="bg-white px-8 py-4 rounded-full shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                        <span className="font-black text-slate-600 text-sm uppercase tracking-widest">Discovering...</span>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};
