
import React, { useState, useEffect } from 'react';
import { EducationLevel, Question, Subject } from '../types';
import { SUBJECTS } from '../constants';
import { fetchQuizQuestions, getQuizHint } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useAppContext } from '../App';
import { Trophy, Brain, Zap, Sparkles, Clock, ArrowRight, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';

type QuizViewMode = 'quiz' | 'flashcards';
type QuizState = 'intro' | 'subject_select' | 'level_select' | 'loading' | 'active' | 'result';

export const Quiz: React.FC = () => {
  const { language, addXP } = useAppContext();
  const [gameState, setGameState] = useState<QuizState>('intro');
  const [viewMode, setViewMode] = useState<QuizViewMode>('quiz');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(20); 
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [isFlipped, setIsFlipped] = useState(false); // For flashcards

  const isAnswered = userAnswers.length > currentQuestionIndex;

  useEffect(() => {
    let timer: any;
    if (gameState === 'active' && viewMode === 'quiz' && timeLeft > 0 && !isAnswered) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'active' && !isAnswered) {
      handleAnswer(-1); // Auto-fail on timeout
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, isAnswered, viewMode]);

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setGameState('level_select');
  };

  const loadQuestions = async (level: EducationLevel, forceNew = false) => {
    if (!selectedSubject) return;
    setSelectedLevel(level);

    // 1. Check Memory first
    const saved = dbService.getLastQuiz(selectedSubject, level);
    if (saved.length > 0 && !forceNew) {
      setQuestions(saved);
      setGameState('active');
      initQuiz();
      return;
    }

    // 2. Otherwise generate
    setGameState('loading');
    const newQuestions = await fetchQuizQuestions(level, selectedSubject, language);
    if (newQuestions.length > 0) {
      dbService.saveLastQuiz(selectedSubject, level, newQuestions);
      setQuestions(newQuestions);
      setGameState('active');
      initQuiz();
    } else {
      setGameState('subject_select');
      alert("Offline questions unavailable for this combination. Please try another.");
    }
  };

  const initQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeLeft(20);
    setShowHint(false);
    setIsFlipped(false);
  };

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    
    const correct = questions[currentQuestionIndex].correctAnswer;
    if (optionIndex !== correct && optionIndex !== -1) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    const newAnswers = [...userAnswers, optionIndex];
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(20);
      setShowHint(false);
      setIsFlipped(false);
    } else {
      setGameState('result');
      const score = userAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
      addXP(score * 25);
    }
  };

  const getHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    const h = await getQuizHint(questions[currentQuestionIndex].question, language);
    setHintText(h);
    setShowHint(true);
    setLoadingHint(false);
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center animate-in zoom-in duration-500">
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-50 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-100 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Trophy className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter">Quiz Hub</h2>
            <p className="text-slate-500 mb-12 font-medium text-xl max-w-lg mx-auto leading-relaxed">Challenge your mind with AI-generated tests or master concepts via interactive Flashcards.</p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button onClick={() => { setViewMode('quiz'); setGameState('subject_select'); }} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 text-lg active:scale-95 group/btn">
                    <Zap className="w-6 h-6 text-yellow-400 group-hover/btn:animate-pulse" /> Start Quiz
                </button>
                <button onClick={() => { setViewMode('flashcards'); setGameState('subject_select'); }} className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-5 rounded-[2rem] font-black hover:border-pink-500 hover:text-pink-600 transition-all flex items-center justify-center gap-3 text-lg active:scale-95">
                    <Brain className="w-6 h-6" /> Flashcards
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'subject_select') {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Select Subject</h2>
            <p className="text-slate-500 font-medium">Choose your battlefield</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {SUBJECTS.map(s => (
            <button 
                key={s} 
                onClick={() => handleSubjectSelect(s)} 
                className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all font-black text-slate-800 text-sm uppercase tracking-widest flex flex-col items-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-indigo-50 group-hover:scale-110 transition-all">
                  📚
              </div>
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameState === 'level_select') {
    return (
      <div className="max-w-3xl mx-auto py-12 animate-in fade-in duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          <div className="relative z-10">
              <h2 className="text-3xl font-black mb-10 text-slate-900 tracking-tighter">
                  Choose Level for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{selectedSubject}</span>
              </h2>
              <div className="grid gap-4">
                {['Class 10', 'Class 12', 'B.A', 'B.Tech', 'General Learner'].map(lvl => (
                  <button 
                    key={lvl} 
                    onClick={() => loadQuestions(lvl as EducationLevel)} 
                    className="p-6 text-left bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-indigo-500 hover:bg-white hover:shadow-xl transition-all font-black text-lg text-slate-700 flex justify-between items-center group"
                  >
                    {lvl} 
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                  </button>
                ))}
              </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in duration-500">
        <div className="relative mb-8">
            <div className="w-32 h-32 bg-indigo-100 rounded-full animate-ping absolute top-0 left-0 opacity-50" />
            <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-indigo-50">
                <Zap className="w-16 h-16 text-indigo-600 animate-pulse" />
            </div>
        </div>
        <h3 className="text-3xl font-black mt-4 text-slate-900 tracking-tighter mb-2">Consulting the Knowledge Base...</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating custom questions</p>
      </div>
    );
  }

  if (gameState === 'active') {
    const q = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100;

    if (viewMode === 'flashcards') {
      return (
        <div className="max-w-3xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex justify-between items-center mb-8 px-6">
             <span className="font-black text-slate-400 text-xs tracking-widest uppercase bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                 Card {currentQuestionIndex + 1} of {questions.length}
             </span>
             <button onClick={() => setGameState('intro')} className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:text-indigo-800 transition-colors">Exit</button>
          </div>
          
          <div 
            onClick={() => setIsFlipped(!isFlipped)}
            className={`cursor-pointer min-h-[450px] perspective-1000 relative transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
          >
            {/* Front */}
            <div className={`absolute inset-0 backface-hidden bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-16 flex flex-col items-center justify-center text-center group`}>
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
               <div className="relative z-10">
                   <div className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center justify-center gap-2">
                       <Brain className="w-4 h-4" /> Question
                   </div>
                   <h3 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{q.question}</h3>
                   <div className="mt-16 inline-flex items-center gap-2 text-indigo-500 font-bold animate-pulse text-sm bg-indigo-50 px-6 py-3 rounded-full">
                       Click to reveal answer <RefreshCw className="w-4 h-4" />
                   </div>
               </div>
            </div>
            
            {/* Back */}
            <div className={`absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-[4rem] shadow-2xl p-16 flex flex-col items-center justify-center text-center`}>
               <div className="text-indigo-200 text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center justify-center gap-2">
                   <Sparkles className="w-4 h-4" /> Correct Answer
               </div>
               <h3 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{q.options[q.correctAnswer]}</h3>
               <div className="p-6 bg-white/10 rounded-[2rem] backdrop-blur-sm border border-white/10">
                   <p className="text-indigo-50 font-medium text-lg leading-relaxed">{q.rationale}</p>
               </div>
            </div>
          </div>

          <div className="flex gap-6 mt-12">
            <button 
              onClick={() => { setCurrentQuestionIndex(prev => Math.max(0, prev - 1)); setIsFlipped(false); }}
              className="flex-1 bg-white border-2 border-slate-200 p-6 rounded-[2rem] font-black text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all text-lg active:scale-95"
            >
              Previous
            </button>
            <button 
              onClick={handleNext}
              className="flex-1 bg-slate-900 text-white p-6 rounded-[2rem] font-black hover:bg-indigo-600 transition-all text-lg shadow-xl active:scale-95"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Study' : 'Next Card'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`max-w-4xl mx-auto py-8 ${shake ? 'animate-shake' : ''} animate-in slide-in-from-bottom-8 duration-500`}>
        {/* Header */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
           </div>
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg">
                      {currentQuestionIndex + 1}
                  </div>
                  <span className="font-black text-xs text-slate-400 tracking-[0.3em] uppercase">
                      of {questions.length} Questions
                  </span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-black text-sm tracking-widest uppercase ${timeLeft < 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-50 text-slate-500'}`}>
                  <Clock className="w-4 h-4" /> {timeLeft}s
              </div>
           </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
           <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
           
           <h3 className="text-3xl md:text-4xl font-black mb-12 leading-tight text-slate-900 relative z-10">{q.question}</h3>
           
           <div className="grid gap-4 relative z-10">
             {q.options.map((opt, idx) => {
               let style = "bg-slate-50 border-slate-100 hover:border-indigo-500 hover:bg-white hover:shadow-lg text-slate-700";
               let icon = null;
               
               if (isAnswered) {
                 if (idx === q.correctAnswer) {
                     style = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-lg shadow-emerald-100 z-10 scale-[1.02]";
                     icon = <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
                 }
                 else if (idx === userAnswers[currentQuestionIndex]) {
                     style = "bg-rose-50 border-rose-500 text-rose-800 shadow-lg shadow-rose-100";
                     icon = <XCircle className="w-6 h-6 text-rose-500" />;
                 }
                 else style = "opacity-40 grayscale bg-slate-50 border-slate-100";
               }
               
               return (
                 <button 
                   key={idx} 
                   onClick={() => handleAnswer(idx)} 
                   disabled={isAnswered} 
                   className={`p-6 md:p-8 rounded-[2rem] border-2 text-left font-bold text-lg transition-all duration-300 flex justify-between items-center group ${style}`}
                 >
                   <span>{opt}</span>
                   {icon ? icon : (
                       <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors" />
                   )}
                 </button>
               );
             })}
           </div>

           {isAnswered && (
             <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-indigo-100 mb-8">
                   <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       <Brain className="w-4 h-4" /> AI Explanation
                   </h4>
                   <p className="text-indigo-900 font-medium text-lg leading-relaxed">
                       {q.rationale}
                   </p>
                </div>
                <button onClick={handleNext} className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-indigo-600 flex justify-center items-center gap-3 transition-all active:scale-95">
                   {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Final Results'} <ArrowRight className="w-6 h-6" />
                </button>
             </div>
           )}

           {!isAnswered && (
             <button onClick={getHint} disabled={loadingHint} className="mt-10 text-xs font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-700 transition-colors mx-auto flex items-center justify-center gap-2 relative z-10">
                {loadingHint ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loadingHint ? 'Consulting AI...' : 'Need a hint?'}
             </button>
           )}
           {showHint && !isAnswered && (
               <div className="mt-6 p-6 bg-yellow-50 border border-yellow-100 rounded-[2rem] text-sm font-bold text-yellow-800 text-center animate-in zoom-in relative z-10">
                   💡 {hintText}
               </div>
           )}
        </div>

        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
          @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
          .animate-shake { animation: shake 0.4s ease-in-out; }
        `}</style>
      </div>
    );
  }

  if (gameState === 'result') {
    const score = userAnswers.filter((a, i) => a === questions[i].correctAnswer).length;
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="max-w-2xl mx-auto py-12 text-center animate-in zoom-in duration-700">
         <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {percentage >= 80 && (
                    <>
                        <div className="absolute top-10 left-10 text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>🎊</div>
                        <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🎉</div>
                        <div className="absolute bottom-20 left-20 text-4xl animate-bounce" style={{ animationDelay: '400ms' }}>✨</div>
                    </>
                )}
            </div>
            
            <div className="relative z-10">
                <div className="text-8xl mb-8">{percentage >= 80 ? '👑' : percentage >= 50 ? '🔥' : '📚'}</div>
                <h2 className="text-4xl font-black mb-4 text-slate-900 tracking-tighter">Quiz Complete!</h2>
                <p className="text-slate-500 font-medium text-lg mb-8">
                    {percentage >= 80 ? 'Outstanding performance! You are a master.' : percentage >= 50 ? 'Good job! Keep practicing to reach the top.' : 'Every expert was once a beginner. Keep learning!'}
                </p>
                
                <div className="bg-slate-50 p-10 rounded-[3rem] mb-10 border border-slate-100">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Final Score</div>
                    <div className="text-8xl font-black text-indigo-600 tracking-tighter">
                        {score} <span className="text-4xl text-slate-300">/ {questions.length}</span>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <button onClick={() => setGameState('intro')} className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black shadow-xl hover:bg-slate-800 transition-all text-lg active:scale-95">
                       Return to Hub
                   </button>
                   <button onClick={() => loadQuestions(selectedLevel!, true)} className="bg-white border-2 border-slate-200 text-slate-800 px-8 py-5 rounded-[2rem] font-black hover:border-indigo-500 hover:text-indigo-600 transition-all text-lg active:scale-95 flex items-center justify-center gap-2">
                       <RefreshCw className="w-5 h-5" /> Try Another
                   </button>
                </div>
            </div>
         </div>
      </div>
    );
  }

  return null;
};
