
import React, { useState, useEffect } from 'react';
import { NewsItem, NewsCategory } from '../types';
import { fetchNews, fetchFullNewsStory } from '../services/geminiService';
import { useAppContext } from '../App';
import { Newspaper, RefreshCw, X, ArrowRight, Clock, Globe } from 'lucide-react';

const CATEGORIES: { id: NewsCategory | 'All', label: string, emoji: string }[] = [
    { id: 'All', label: 'Global', emoji: '🌐' },
    { id: 'National', label: 'India', emoji: '🇮🇳' },
    { id: 'International', label: 'World', emoji: '🌍' },
    { id: 'Sports', label: 'Sports', emoji: '🏀' },
    { id: 'Politics', label: 'Politics', emoji: '🏛️' },
    { id: 'Economy', label: 'Economy', emoji: '💹' },
    { id: 'Technology', label: 'Tech', emoji: '💻' },
    { id: 'Health', label: 'Health', emoji: '🏥' },
];

const LOADING_STATUS = [
    "Scouring the Digital Archives...",
    "Consulting Global Wire Services...",
    "Translating Local Cultural Nuances...",
    "Verifying Facts with Secondary Sources...",
    "Formatting Educational Context...",
    "Finalizing Scholarly Review...",
    "Printing Digital Edition..."
];

export const News: React.FC = () => {
  const { language, t } = useAppContext();
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<NewsCategory | 'All'>('All');
  const [loading, setLoading] = useState(false);
  
  const [selectedStory, setSelectedStory] = useState<NewsItem | null>(null);
  const [fullStoryContent, setFullStoryContent] = useState<string>('');
  const [loadingStory, setLoadingStory] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'web' | 'ai'>('web');

  useEffect(() => {
    const initNews = async () => {
        setLoading(true);
        const news = await fetchNews(language, false); 
        setNewsItems(news);
        setLoading(false);
    };
    initNews();
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (loadingStory) {
        interval = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % LOADING_STATUS.length);
        }, 1800);
    }
    return () => clearInterval(interval);
  }, [loadingStory]);

  const updateNews = async () => {
    setLoading(true);
    const updatedNews = await fetchNews(language, true);
    setNewsItems(updatedNews);
    setLoading(false);
  };

  const openFullStory = async (news: NewsItem) => {
    setSelectedStory(news);
    setViewMode(news.url ? 'web' : 'ai');
    
    // Always fetch AI summary in background just in case web view fails
    setLoadingStory(true);
    setFullStoryContent('');
    setStatusIndex(0);
    
    try {
        const content = await fetchFullNewsStory(news.title, language);
        setFullStoryContent(content);
    } catch (error) {
        setFullStoryContent("<div class='bg-rose-50 p-6 rounded-xl border border-rose-200 text-rose-800 font-bold'>The AI took too long to respond. This usually happens during high server traffic. Please close this modal and try again in 30 seconds.</div>");
    } finally {
        setLoadingStory(false);
    }
  };

  const filteredNews = filter === 'All' 
    ? newsItems 
    : newsItems.filter(item => item.category === filter);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />
            
            <div className="flex items-center gap-3 sm:gap-5 z-10">
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-3 sm:p-4 rounded-xl sm:rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                    <Newspaper className="w-6 h-6 sm:w-10 sm:h-10" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">
                        {t.news}
                    </h2>
                    <p className="text-indigo-600 mt-0.5 sm:mt-1 font-bold uppercase tracking-widest text-[8px] sm:text-xs">
                        {language === 'hi' ? 'ताज़ा शैक्षिक और ऐतिहासिक समाचार अपडेट' : 'AI-Summarized global updates for modern scholars'}
                    </p>
                </div>
            </div>
            
            <button onClick={updateNews} disabled={loading} className="w-full md:w-auto bg-slate-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 sm:gap-3 hover:bg-indigo-600 transition-all shadow-xl active:scale-95 z-10 text-sm sm:text-base">
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
            </button>
        </div>
        
        {/* Categories */}
        <div className="flex overflow-x-auto pb-2 gap-2 sm:gap-3 no-scrollbar">
            {CATEGORIES.map((cat) => (
                <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-[1.5rem] text-xs sm:text-sm font-black border-2 transition-all whitespace-nowrap ${
                    filter === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200 scale-105' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50'
                }`}
                >
                <span className="text-base sm:text-lg">{cat.emoji}</span> {cat.label}
                </button>
            ))}
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((news, idx) => (
              <div 
                key={news.id} 
                className={`bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group h-full cursor-pointer hover:-translate-y-2 ${idx === 0 ? 'md:col-span-2 lg:col-span-2 md:flex-row' : ''}`} 
                onClick={() => openFullStory(news)}
              >
                  <div className={`relative overflow-hidden ${idx === 0 ? 'md:w-1/2 h-64 md:h-auto' : 'h-56'}`}>
                      <img src={news.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="News" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <Globe className="w-3 h-3" /> {news.category}
                      </div>
                  </div>
                  <div className={`p-8 flex-1 flex flex-col ${idx === 0 ? 'md:w-1/2 justify-center' : ''}`}>
                      <h3 className={`font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors ${idx === 0 ? 'text-2xl md:text-3xl' : 'text-xl line-clamp-2'}`}>
                          {news.title}
                      </h3>
                      <p className={`text-slate-500 font-medium leading-relaxed mb-8 ${idx === 0 ? 'text-lg line-clamp-4' : 'text-sm line-clamp-3'}`}>
                          {news.summary}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                          <span className="text-slate-400 text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Just now</span>
                          <button className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <ArrowRight className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {/* Full Story Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className={`bg-white rounded-2xl sm:rounded-[3rem] w-full max-w-5xl ${viewMode === 'web' ? 'h-[95vh] sm:h-[90vh]' : 'max-h-[95vh] sm:max-h-[90vh]'} overflow-hidden relative flex flex-col shadow-2xl animate-in zoom-in-95 duration-500`}>
              <button onClick={() => setSelectedStory(null)} className="absolute top-4 sm:top-6 right-4 sm:right-6 p-2 sm:p-4 bg-white/80 hover:bg-white backdrop-blur-md rounded-full z-30 shadow-lg text-slate-900 transition-all hover:rotate-90 border border-slate-200">
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Mode Toggle */}
              {selectedStory.url && (
                  <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md p-1 rounded-full shadow-lg border border-slate-200 flex items-center gap-1">
                      <button 
                          onClick={() => setViewMode('web')}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'web' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                          Web
                      </button>
                      <button 
                          onClick={() => setViewMode('ai')}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[8px] sm:text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                      >
                          AI
                      </button>
                  </div>
              )}

              {viewMode === 'web' && selectedStory.url ? (
                  <div className="flex-1 w-full h-full bg-slate-50 relative pt-24">
                      <div className="absolute top-24 left-8 right-8 z-0 flex flex-col items-center justify-center text-center p-8">
                          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
                              <Globe className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-black text-slate-800 mb-2">Website Refused to Connect?</h3>
                          <p className="text-slate-500 font-medium max-w-md mb-6">
                              Many news publishers block their websites from being opened inside other apps for security reasons.
                          </p>
                          <div className="flex gap-4">
                              <button onClick={() => setViewMode('ai')} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors">
                                  Read AI Summary
                              </button>
                              <a href={selectedStory.url} target="_blank" rel="noopener noreferrer" className="bg-white text-indigo-600 border border-indigo-200 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                  Open in New Tab <ArrowRight className="w-4 h-4" />
                              </a>
                          </div>
                      </div>
                      <iframe 
                          src={selectedStory.url} 
                          className="w-full h-full border-0 rounded-b-[3rem] relative z-10 bg-white" 
                          sandbox="allow-same-origin allow-scripts allow-popups allow-forms" 
                          title={selectedStory.title}
                      />
                  </div>
              ) : (
                  <div className="overflow-y-auto no-scrollbar">
                      <div className="h-64 sm:h-96 w-full relative flex-shrink-0">
                         <img src={selectedStory.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                         <div className="absolute bottom-8 left-8 right-8 sm:left-12 sm:right-12">
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-flex items-center gap-2 shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" /> AI Analysis
                            </span>
                            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tighter">{selectedStory.title}</h1>
                         </div>
                      </div>

                      <div className="p-8 sm:p-12 bg-white relative">
                         {loadingStory ? (
                            <div className="flex flex-col items-center justify-center py-32 text-center">
                                <div className="newspaper-printer mb-12">
                                    <div className="printer-base shadow-xl"></div>
                                    <div className="printer-paper shadow-md">
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                        <div className="line"></div>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{LOADING_STATUS[statusIndex]}</h4>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Drafting scholarly analysis in {language === 'hi' ? 'Hindi' : 'English'}...</p>
                            </div>
                         ) : (
                            <div className="prose prose-lg md:prose-xl prose-indigo max-w-none text-slate-800 font-serif leading-loose" dangerouslySetInnerHTML={{ __html: fullStoryContent }} />
                         )}
                      </div>
                  </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        .newspaper-printer {
            width: 100px;
            height: 80px;
            position: relative;
        }
        .printer-base {
            width: 100%;
            height: 24px;
            background: #0f172a;
            border-radius: 8px;
            position: absolute;
            bottom: 0;
            z-index: 2;
        }
        .printer-paper {
            width: 70px;
            height: 80px;
            background: #fff;
            border: 3px solid #0f172a;
            margin: 0 auto;
            position: absolute;
            top: 10px;
            left: 15px;
            padding: 8px;
            animation: printPaper 2s infinite ease-in-out;
            z-index: 1;
        }
        .printer-paper .line {
            height: 4px;
            background: #cbd5e1;
            margin-bottom: 8px;
            width: 100%;
            border-radius: 2px;
        }
        @keyframes printPaper {
            0% { transform: translateY(0); opacity: 0; }
            50% { transform: translateY(-50px); opacity: 1; }
            100% { transform: translateY(-60px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
