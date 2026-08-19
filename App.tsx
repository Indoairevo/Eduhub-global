
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { DashboardHome } from './pages/DashboardHome';
import { News } from './pages/News';
import { Learn } from './pages/Learn';
import { DeepDive } from './pages/DeepDive';
import { Quiz } from './pages/Quiz';
import { Chatbot } from './pages/Chatbot';
import { DoubtChat } from './pages/DoubtChat';
import { Competition } from './pages/Competition';
import { Notebook } from './pages/Notebook';
import { DocuMind } from './pages/DocuMind';
import { CareerCompass } from './pages/CareerCompass';
import { MindMap } from './pages/MindMap';
import { StudyPlanner } from './pages/StudyPlanner';
import { GeoQuest } from './pages/GeoQuest';
import { CodeLab } from './pages/CodeLab';
import { NotebookLM } from './pages/NotebookLM';
import { LinguaSphere } from './pages/LinguaSphere';
import { GlobalSearch } from './pages/GlobalSearch';
import { AudioStudio } from './pages/AudioStudio';
import { LiveTutor } from './pages/LiveTutor';
import { CinematicStudio } from './pages/CinematicStudio';
import { ScholarLens } from './pages/ScholarLens';
import { ScholarSlides } from './pages/ScholarSlides';
import { CloudNode } from './pages/CloudNode';
import { DataSheet } from './pages/DataSheet';
import { CinemaHub } from './pages/CinemaHub';
import { StudyBuddy } from './pages/StudyBuddy';
import { NotesGenerator } from './pages/NotesGenerator';
import { QuestionGenerator } from './pages/QuestionGenerator';
import { ModelPaperGenerator } from './pages/ModelPaper';
import { Flashcards } from './pages/Flashcards';
import { FocusMode } from './pages/FocusMode';
import { AdminDashboard } from './pages/AdminDashboard';
import { User, Language } from './types';
import { getCurrentUser } from './services/authService';

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    news: "News Feed",
    learn: "Fact Zone",
    deepDive: "Deep Knowledge",
    quiz: "Quiz Hub",
    chat: "AI Tutor",
    competition: "Competition Prep",
    notebook: "My Notebook",
    documind: "DocuMind",
    career: "Career Compass",
    mindmap: "Mind Map",
    planner: "Study Planner",
    geoquest: "GeoQuest",
    logout: "Logout",
    welcome: "Welcome back",
    progress: "Your Progress",
    streak: "Streak",
    points: "XP",
    hours: "Hours",
    accuracy: "Accuracy",
    international: "International",
    national: "National",
    refresh: "Refresh",
    startQuiz: "Start Quiz",
    continue: "Continue Learning",
    search: "Search...",
    askDoubt: "Ask a doubt...",
    speak: "Speak",
    generateVideo: "Generate Video",
    generateImage: "Generate Image",
    textMode: "Text Mode",
    loading: "Loading...",
    class: "Class",
    notes: "Notes",
    strategy: "Strategy",
    saveNote: "Save to Notebook"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    news: "समाचार फ़ीड",
    learn: "तथ्य क्षेत्र",
    deepDive: "गहरा ज्ञान",
    quiz: "क्विज़ हब",
    chat: "AI शिक्षक",
    competition: "प्रतियोगिता परीक्षा",
    notebook: "मेरी नोटबुक",
    documind: "डोक्यू-माइंड",
    career: "करियर कम्पास",
    mindmap: "माइंड मैप",
    planner: "अध्ययन योजना",
    geoquest: "जियो-क्वेस्ट",
    logout: "लॉग आउट",
    welcome: "वापसी पर स्वागत है",
    progress: "आपकी प्रगति",
    streak: "लगातार",
    points: "अंक",
    hours: "घंटे",
    accuracy: "सटीकता",
    international: "अंतर्राष्ट्रीय",
    national: "राष्ट्रीय (भारत)",
    refresh: "ताज़ा करें",
    startQuiz: "क्विज़ शुरू करें",
    continue: "पढ़ना जारी रखें",
    search: "खोजें...",
    askDoubt: "अपना प्रश्न पूछें...",
    speak: "बोलें",
    generateVideo: "वीडियो बनाएं",
    generateImage: "चित्र बनाएं",
    textMode: "टेक्स्ट मोड",
    loading: "लोड हो रहा है...",
    class: "कक्षा",
    notes: "नोट्स",
    strategy: "रणनीति",
    saveNote: "नोटबुक में सहेजें"
  }
};

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  language: Language;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  t: typeof TRANSLATIONS.en;
  addXP: (amount: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within a AppProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
      const loggedUser = getCurrentUser();
      if (loggedUser) setUser(loggedUser);
  }, []);

  const addXP = (amount: number) => {
    if (user) {
        const updatedUser = { ...user, points: user.points + amount };
        setUser(updatedUser);
    }
  };

  const value = { user, setUser, language, setLanguage, t: TRANSLATIONS[language], addXP };

  return (
    <AppContext.Provider value={value}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={user ? <Layout /> : <Navigate to="/register" />}>
            <Route index element={<DashboardHome />} />
            <Route path="news" element={<News />} />
            <Route path="learn" element={<Learn />} />
            <Route path="deep-dive" element={<DeepDive />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="chat" element={<Chatbot />} />
            <Route path="doubt-chat" element={<DoubtChat />} />
            <Route path="competition" element={<Competition />} />
            <Route path="notebook" element={<Notebook />} />
            <Route path="documind" element={<DocuMind />} />
            <Route path="career" element={<CareerCompass />} />
            <Route path="codelab" element={<CodeLab />} />
            <Route path="mindmap" element={<MindMap />} />
            <Route path="planner" element={<StudyPlanner />} />
            <Route path="geoquest" element={<GeoQuest />} />
            <Route path="notebooklm" element={<NotebookLM />} />
            <Route path="linguasphere" element={<LinguaSphere />} />
            <Route path="globalsearch" element={<GlobalSearch />} />
            <Route path="audiostudio" element={<AudioStudio />} />
            <Route path="livetutor" element={<LiveTutor />} />
            <Route path="cinematicstudio" element={<CinematicStudio />} />
            <Route path="scholarlens" element={<ScholarLens />} />
            <Route path="scholarslides" element={<ScholarSlides />} />
            <Route path="cloudnode" element={<CloudNode />} />
            <Route path="datasheet" element={<DataSheet />} />
            <Route path="cinema" element={<CinemaHub />} />
            <Route path="study-buddy" element={<StudyBuddy />} />
            <Route path="notes-gen" element={<NotesGenerator />} />
            <Route path="questions-gen" element={<QuestionGenerator />} />
            <Route path="model-paper" element={<ModelPaperGenerator />} />
            <Route path="flashcards" element={<Flashcards />} />
            <Route path="focus" element={<FocusMode />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
