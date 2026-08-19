

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Brain, Globe, GraduationCap, Sparkles, CheckCircle2, Zap, Users, PlayCircle, Star, Shield, Rocket } from 'lucide-react';

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full glass z-50 transition-all duration-300 top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">EduSphere<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span></span>
            </div>
            <div className="flex items-center gap-6">
                <button 
                onClick={() => navigate('/register')}
                className="text-slate-600 font-bold hover:text-indigo-600 transition-colors hidden sm:block text-sm uppercase tracking-wider"
                >
                Log In
                </button>
                <button 
                onClick={() => navigate('/register')}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 group"
                >
                Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 pt-20">
        <div className="relative overflow-hidden bg-slate-900 text-white pb-20 lg:pb-32 pt-20 lg:pt-32">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse duration-[4000ms]" />
             <div className="absolute bottom-[-10%] left-[-10%] w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse duration-[6000ms]" />
             <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[80px] animate-pulse duration-[5000ms]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 gap-16 items-center">
                <div className="text-center lg:text-left animate-slide-up">
                    <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 text-indigo-200 px-4 py-1.5 rounded-full text-sm font-bold mb-8 backdrop-blur-md hover:bg-white/20 transition-colors cursor-default">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span>Powered by Gemini 3.0 Flash</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                        Master Any Subject <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            10x Faster with AI
                        </span>
                    </h1>
                    <p className="mt-6 text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                        Your personalized AI tutor that creates quizzes, summarizes documents, plans your study schedule, and explains complex topics instantly.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button
                        onClick={() => navigate('/register')}
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-900/50 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
                        >
                            Start Learning Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-lg backdrop-blur-sm transition-all flex items-center justify-center gap-2 border border-white/10 hover:border-white/20"
                        >
                            <PlayCircle className="w-5 h-5" /> Watch Demo
                        </button>
                    </div>
                    <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-400 font-medium">
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> No Credit Card Required</div>
                        <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-400" /> Free Tier Available</div>
                    </div>
                </div>

                {/* Floating UI Mockup */}
                <div className="hidden lg:block relative perspective-1000 animate-float">
                    <div className="relative bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 p-4 shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-all duration-700 ease-out group">
                         <div className="bg-slate-900/50 rounded-[2rem] overflow-hidden border border-slate-700/50 h-[500px] relative">
                             {/* Mockup Header */}
                             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
                                 <div className="flex gap-2">
                                     <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                     <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                     <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                 </div>
                                 <div className="text-xs font-mono text-slate-500">AI Tutor Session</div>
                             </div>
                             
                             {/* Chat Interface */}
                             <div className="p-6 space-y-6">
                                 <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                     <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20"><GraduationCap className="w-5 h-5"/></div>
                                     <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-300 text-sm max-w-xs shadow-md border border-slate-700/50">
                                         Hello! I'm your AI Tutor. Upload your history notes, and I'll create a quiz for you.
                                     </div>
                                 </div>
                                 <div className="flex gap-4 flex-row-reverse animate-slide-up" style={{ animationDelay: '0.8s' }}>
                                     <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600"><Users className="w-5 h-5 text-slate-400"/></div>
                                     <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-xs shadow-lg">
                                         Sure! Here is a photo of my textbook page on the Industrial Revolution.
                                     </div>
                                 </div>
                                 <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '1.4s' }}>
                                     <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20"><GraduationCap className="w-5 h-5"/></div>
                                     <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-300 text-sm max-w-xs shadow-md border border-slate-700/50">
                                         <div className="flex items-center gap-2 mb-2">
                                            <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full"></span>
                                            <span className="text-xs font-bold text-emerald-400 uppercase">Analyzing</span>
                                         </div>
                                         Generating 5 key points and a practice quiz based on your image...
                                     </div>
                                 </div>
                             </div>

                             {/* Floating Elements inside Mockup */}
                             <div className="absolute bottom-8 left-8 right-8 bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4 shadow-xl animate-slide-up" style={{ animationDelay: '2s' }}>
                                <div className="p-2 bg-indigo-500/20 rounded-lg"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
                                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-2/3 animate-pulse"></div>
                                </div>
                             </div>
                         </div>
                    </div>
                    
                    {/* Floating Badges */}
                    <div className="absolute -top-10 -right-10 bg-white text-slate-900 p-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 animate-bounce duration-[3000ms] z-20 border border-slate-100">
                        <div className="bg-orange-100 p-2.5 rounded-xl"><Zap className="w-6 h-6 text-orange-600" /></div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Speed</div>
                            <div className="text-sm">Instant Results</div>
                        </div>
                    </div>
                    <div className="absolute -bottom-5 -left-10 bg-white text-slate-900 p-4 rounded-2xl shadow-xl font-bold flex items-center gap-3 animate-bounce duration-[4000ms] z-20 border border-slate-100">
                         <div className="bg-green-100 p-2.5 rounded-xl"><Brain className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Accuracy</div>
                            <div className="text-sm">GPT-4 Class AI</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="bg-slate-50 py-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-50 pointer-events-none">
                <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-indigo-200 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[5%] w-64 h-64 bg-purple-200 rounded-full blur-[100px]" />
            </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
                <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-xs mb-3 bg-indigo-50 inline-block px-4 py-1 rounded-full border border-indigo-100">Features</h2>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Everything you need to excel</h3>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">Powerful tools designed to help you learn faster, retain more, and ace your exams.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  emoji: '🌐',
                  color: 'bg-blue-50 text-blue-600',
                  title: 'Global News Feed',
                  desc: 'Stay updated with AI-curated news from India and the world, summarized for students.'
                },
                {
                  emoji: '💡',
                  color: 'bg-yellow-50 text-yellow-600',
                  title: 'Fact Zone',
                  desc: 'Bite-sized knowledge and facts across 12+ subjects tailored to your specific grade level.'
                },
                {
                  emoji: '📄',
                  color: 'bg-purple-50 text-purple-600',
                  title: 'DocuMind',
                  desc: 'Upload any document or image. AI analyzes it to create summaries and instant quizzes.'
                },
                {
                  emoji: '🎓',
                  color: 'bg-indigo-50 text-indigo-600',
                  title: 'AI Tutor Chat',
                  desc: 'Ask doubts, generate diagrams, or request videos. Your personal tutor is available 24/7.'
                },
                {
                  emoji: '⚡',
                  color: 'bg-orange-50 text-orange-600',
                  title: 'Competition Prep',
                  desc: 'Specialized modules for UPSC, JEE, and NEET with high-yield notes generation.'
                },
                {
                  emoji: '👥',
                  color: 'bg-pink-50 text-pink-600',
                  title: 'Career Compass',
                  desc: 'Confused about the future? Let AI analyze your skills and build a roadmap for you.'
                }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color.split(' ')[0]} rounded-bl-[100px] opacity-20 group-hover:scale-150 transition-transform duration-500`} />
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-3xl shadow-sm relative z-10`}>
                    {feature.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed relative z-10">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-slate-900 py-20 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: "Active Learners", value: "10,000+" },
                        { label: "Questions Solved", value: "1.5M+" },
                        { label: "AI Tutors", value: "24/7" },
                        { label: "Success Rate", value: "98%" }
                    ].map((stat, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="text-4xl md:text-5xl font-black text-white">{stat.value}</div>
                            <div className="text-slate-400 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
              <div className="bg-slate-900 p-2 rounded-xl shadow-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">EduSphere AI</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">&copy; 2024 EduSphere AI. Built with ❤️ for Learners.</p>
        </div>
      </footer>
    </div>
  );
};
