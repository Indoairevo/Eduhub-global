import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../App';
import { fetchFacts } from '../services/geminiService';
import { Fact, Subject } from '../types';
import { Sparkles, RefreshCw } from 'lucide-react';

export const DashboardHome: React.FC = () => {
  const { user, language } = useAppContext();
  const [dailyFact, setDailyFact] = useState<Fact | null>(null);
  const [loadingFact, setLoadingFact] = useState(false);

  useEffect(() => {
    loadDailyFact();
  }, []);

  const loadDailyFact = async () => {
    setLoadingFact(true);
    try {
        // Random subject for variety
        const subjects: Subject[] = ['History', 'Geography', 'Mathematics', 'Physics', 'Biology', 'General Knowledge'];
        const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
        const facts = await fetchFacts(randomSubject, (user?.educationLevel as any) || 'Class 10', language, 1);
        if (facts && facts.length > 0) {
            setDailyFact(facts[0]);
        }
    } catch (e) {
        console.error("Failed to load fact", e);
    } finally {
        setLoadingFact(false);
    }
  };

  const toolCategories = [
    {
      title: "Core Learning",
      items: [
        { to: '/dashboard/news', label: "News Feed", emoji: "📰", bg: 'bg-blue-50 text-blue-600', desc: "Global Updates" },
        { to: '/dashboard/learn', label: "Fact Zone", emoji: "💡", bg: 'bg-yellow-50 text-yellow-600', desc: "Daily Knowledge" },
        { to: '/dashboard/deep-dive', label: "Deep Knowledge", emoji: "🧠", bg: 'bg-purple-50 text-purple-600', desc: "PhD Insights" },
        { to: '/dashboard/quiz', label: "Quiz Hub", emoji: "🏆", bg: 'bg-orange-50 text-orange-600', desc: "Challenge Mode" },
        { to: '/dashboard/flashcards', label: "AI Flashcards", emoji: "🎴", bg: 'bg-emerald-50 text-emerald-600', desc: "Smart Revision" },
      ]
    },
    {
      title: "AI Assistants",
      items: [
        { to: '/dashboard/chat', label: "AI Scholar Assistant", emoji: "🤖", bg: 'bg-indigo-600 text-white shadow-indigo-200', desc: "Ultimate AI Tutor", state: { tab: 'chat' } },
        { to: '/dashboard/chat', label: "AI Doubt Chat", emoji: "💬", bg: 'bg-rose-50 text-rose-600', desc: "24/7 Support", state: { tab: 'chat' } },
        { to: '/dashboard/chat', label: "AI Study Buddy", emoji: "📖", bg: 'bg-indigo-50 text-indigo-600', desc: "Step-by-Step", state: { tab: 'study-buddy' } },
        { to: '/dashboard/chat', label: "Live Voice Tutor", emoji: "🎙️", bg: 'bg-slate-900 text-white', desc: "Talk to AI", state: { tab: 'live-tutor' } },
      ]
    },
    {
      title: "Exam Mastery",
      items: [
        { to: '/dashboard/model-paper', label: "Model Paper Gen", emoji: "📄", bg: 'bg-purple-100 text-purple-700', desc: "Proctored Exam" },
        { to: '/dashboard/questions-gen', label: "Question Bank", emoji: "🎓", bg: 'bg-amber-50 text-amber-600', desc: "Custom Practice" },
        { to: '/dashboard/notes-gen', label: "Notes Generator", emoji: "✒️", bg: 'bg-emerald-50 text-emerald-600', desc: "Exam Revision" },
        { to: '/dashboard/competition', label: "Competition Prep", emoji: "🎖️", bg: 'bg-red-50 text-red-600', desc: "UPSC/JEE/NEET" },
      ]
    },
    {
      title: "Smart Productivity",
      items: [
        { to: '/dashboard/notebook', label: "My Notepad", emoji: "📓", bg: 'bg-amber-100 text-amber-700', desc: "Saved Notes" },
        { to: '/dashboard/chat', label: "NotebookLM Clone", emoji: "🧪", bg: 'bg-cyan-50 text-cyan-600', desc: "Source Grounding", state: { tab: 'notebook-lm' } },
        { to: '/dashboard/chat', label: "DocuMind", emoji: "📋", bg: 'bg-teal-50 text-teal-600', desc: "File Analysis", state: { tab: 'documind' } },
        { to: '/dashboard/mindmap', label: "AI Mind Map", emoji: "🌳", bg: 'bg-sky-50 text-sky-600', desc: "Visual Trees" },
        { to: '/dashboard/planner', label: "Study Architect", emoji: "📅", bg: 'bg-indigo-100 text-indigo-700', desc: "Strategic Plans" },
        { to: '/dashboard/focus', label: "Focus Mode", emoji: "🍅", bg: 'bg-rose-50 text-rose-600', desc: "Pomodoro Timer" },
      ]
    },
    {
      title: "Advanced Tools",
      items: [
        { to: '/dashboard/chat', label: "Code Lab", emoji: "💻", bg: 'bg-slate-800 text-white', desc: "AI Coding Tutor", state: { tab: 'code-lab' } },
        { to: '/dashboard/chat', label: "LinguaSphere", emoji: "🌐", bg: 'bg-blue-100 text-blue-700', desc: "Translator", state: { tab: 'lingua-sphere' } },
        { to: '/dashboard/chat', label: "Audio Studio", emoji: "🔊", bg: 'bg-amber-50 text-amber-600', desc: "Text to Speech", state: { tab: 'audio-studio' } },
        { to: '/dashboard/cinematicstudio', label: "Cinematic Studio", emoji: "🎬", bg: 'bg-red-100 text-red-700', desc: "Veo 3.1 Videos" },
        { to: '/dashboard/scholarlens', label: "Scholar Lens", emoji: "📷", bg: 'bg-emerald-100 text-emerald-700', desc: "Vision AI" },
        { to: '/dashboard/scholarslides', label: "Scholar Slides", emoji: "📊", bg: 'bg-amber-100 text-amber-700', desc: "Deck Generator" },
      ]
    },
    {
      title: "Research & Data",
      items: [
        { to: '/dashboard/globalsearch', label: "Search Console", emoji: "🔍", bg: 'bg-indigo-50 text-indigo-600', desc: "Real-time Web" },
        { to: '/dashboard/geoquest', label: "GeoQuest", emoji: "🌍", bg: 'bg-emerald-50 text-emerald-600', desc: "History & Maps" },
        { to: '/dashboard/cloudnode', label: "CloudNode", emoji: "☁️", bg: 'bg-blue-50 text-blue-600', desc: "Data Insights" },
        { to: '/dashboard/datasheet', label: "DataSheet AI", emoji: "📊", bg: 'bg-teal-50 text-teal-600', desc: "Table Generator" },
        { to: '/dashboard/cinema', label: "CinemaHub", emoji: "📽️", bg: 'bg-rose-100 text-rose-700', desc: "Educational TV" },
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-50" />
        
        <div className="z-10 flex items-center gap-4">
          {user?.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl shadow-lg border-2 border-white object-cover"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-1 sm:mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h2>
            <p className="text-slate-500 font-medium text-sm sm:text-lg">Your academic universe is ready for exploration.</p>
          </div>
        </div>
        <div className="flex gap-3 sm:gap-4 z-10 w-full md:w-auto">
            <div className="flex-1 md:flex-none text-center px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-indigo-100 shadow-sm">
                <p className="text-[8px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Points</p>
                <p className="text-lg sm:text-2xl font-black text-indigo-600">{user?.points || 0} XP</p>
            </div>
            <div className="flex-1 md:flex-none text-center px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-emerald-100 shadow-sm">
                <p className="text-[8px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Level</p>
                <p className="text-lg sm:text-2xl font-black text-emerald-600">{user?.educationLevel || 'N/A'}</p>
            </div>
        </div>
      </div>

      {/* Daily Insight Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-300" />
                    <span className="text-[8px] sm:text-xs font-bold uppercase tracking-wider">Daily Insight</span>
                </div>
                <button onClick={loadDailyFact} className="p-2 hover:bg-white/10 rounded-full transition-colors" disabled={loadingFact}>
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loadingFact ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {loadingFact ? (
                <div className="h-20 sm:h-24 flex items-center justify-center">
                    <div className="animate-pulse flex space-x-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full animation-delay-200"></div>
                        <div className="w-2 h-2 bg-white rounded-full animation-delay-400"></div>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-xl sm:text-3xl font-bold leading-snug mb-2">
                        "{dailyFact?.content || "Did you know? The human brain processes images 60,000 times faster than text."}"
                    </h3>
                    <p className="text-indigo-200 font-medium text-[10px] sm:text-sm uppercase tracking-widest opacity-80">
                        — {dailyFact?.subject || "Neuroscience"} • {dailyFact?.level || "General"}
                    </p>
                </div>
            )}
        </div>
      </div>

      {toolCategories.map((cat, idx) => (
        <div key={idx} className="space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-4 flex items-center gap-4">
                {cat.title}
                <div className="h-px bg-slate-100 flex-1" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cat.items.map((tool) => (
                    <NavLink
                        key={tool.label}
                        to={tool.to}
                        state={tool.state}
                        className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 ${tool.bg.split(' ')[0]} rounded-bl-[60px] opacity-10 group-hover:scale-150 transition-transform duration-500`} />
                        <div className={`w-16 h-16 ${tool.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl shadow-sm relative z-10`}>
                        {tool.emoji}
                        </div>
                        <h3 className="font-black text-slate-900 mb-1 relative z-10">{tool.label}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest relative z-10">{tool.desc}</p>
                    </NavLink>
                ))}
            </div>
        </div>
      ))}
    </div>
  );
};