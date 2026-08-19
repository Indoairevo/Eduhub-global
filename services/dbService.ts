import { SAVED_NEWS, SAVED_FACTS, SAVED_QUIZ, SAVED_ARTICLES, SAVED_PLANS, COMPETITION_DB } from '../data/permanentDB';
import { NewsItem, Fact, Question, DeepDiveArticle, StudyPlan, MindMapNode, CareerRoadmap, CompetitionTopic, GeoResult, DocAnalysisResult, CodeSnippet, UserProgress, ModelPaper, ChatMessage, Subject, EducationLevel } from '../types';

const PREFIX = 'edu_v16_';

export const dbService = {
  // CORE PERSISTENCE
  get: (key: string) => {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : null;
  },
  save: (key: string, data: any) => {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  },

  // FEATURE SPECIFIC
  getSavedResult: (feature: string, query: string) => {
    const key = `${feature}_${query.toLowerCase().trim().replace(/\s+/g, '_')}`;
    return dbService.get(key);
  },
  saveResult: (feature: string, query: string, data: any) => {
    const key = `${feature}_${query.toLowerCase().trim().replace(/\s+/g, '_')}`;
    dbService.save(key, data);
  },

  // PROGRESS TRACKING
  getProgress: (): UserProgress => {
      return dbService.get('user_progress') || {
          masteredTopics: [],
          totalStudyMinutes: 0,
          subjectStrengths: {},
          recentActivity: []
      };
  },
  saveProgress: (progress: UserProgress) => {
      dbService.save('user_progress', progress);
  },
  trackActivity: (activity: string) => {
      const p = dbService.getProgress();
      const updated = {
          ...p,
          recentActivity: [{ date: new Date().toISOString(), activity }, ...p.recentActivity].slice(0, 15)
      };
      dbService.saveProgress(updated);
  },

  // CHAT HISTORY
  getChatHistory: (subject: string): ChatMessage[] => {
      return dbService.get(`chat_${subject.toLowerCase()}`) || [];
  },
  saveChatMessage: (subject: string, message: ChatMessage) => {
      const history = dbService.getChatHistory(subject);
      dbService.save(`chat_${subject.toLowerCase()}`, [...history, message].slice(-50));
  },
  clearChat: (subject: string) => {
    dbService.save(`chat_${subject.toLowerCase()}`, []);
  },

  // OFFLINE FALLBACKS & PERMANENT SAVES
  getNews: (): NewsItem[] => {
    const cached = dbService.get('news_cache') || [];
    return [...SAVED_NEWS, ...cached].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
  },

  // Get facts from cache or permanent storage
  getFacts: (subject: Subject, level: EducationLevel): Fact[] => {
    const cached = dbService.get(`facts_${subject}_${level}`) || [];
    const permanent = SAVED_FACTS[subject]?.filter(f => f.level === level) || [];
    return [...permanent, ...cached].filter((v, i, a) => a.findIndex(t => t.content === v.content) === i);
  },
  // Save new facts to cache
  saveFacts: (subject: Subject, level: EducationLevel, facts: Fact[]) => {
    const existing = dbService.get(`facts_${subject}_${level}`) || [];
    dbService.save(`facts_${subject}_${level}`, [...existing, ...facts].slice(-20));
  },

  // Get deep dive article
  getArticle: (query: string, subject: Subject): DeepDiveArticle | null => {
    const cached = dbService.get(`article_${subject}_${query}`);
    if (cached) return cached;
    return SAVED_ARTICLES[subject]?.find(a => a.title.toLowerCase().includes(query.toLowerCase())) || null;
  },
  // Save deep dive article
  saveArticle: (article: DeepDiveArticle) => {
    dbService.save(`article_${article.subject}_${article.title}`, article);
  },

  // Get last quiz for a subject/level
  getLastQuiz: (subject: Subject, level: EducationLevel): Question[] => {
    const cached = dbService.get(`quiz_${subject}_${level}`) || [];
    const permanent = SAVED_QUIZ[`${subject}-${level}`] || [];
    return [...permanent, ...cached];
  },
  // Save last generated quiz
  saveLastQuiz: (subject: Subject, level: EducationLevel, questions: Question[]) => {
    dbService.save(`quiz_${subject}_${level}`, questions);
  },

  // Competition topics persistence
  getCompetitionTopics: (exam: string, subject: string): CompetitionTopic[] => {
    const cached = dbService.get(`comp_topics_${exam}_${subject}`) || [];
    const permanent = COMPETITION_DB[`${exam}-${subject}`] || [];
    return [...permanent, ...cached];
  },
  saveCompetitionTopics: (exam: string, subject: string, topics: CompetitionTopic[]) => {
    dbService.save(`comp_topics_${exam}_${subject}`, topics);
  },

  // Competition notes persistence
  getCompetitionNotes: (exam: string, topic: string): string | null => {
    return dbService.get(`comp_notes_${exam}_${topic}`);
  },
  saveCompetitionNotes: (exam: string, topic: string, notes: string) => {
    dbService.save(`comp_notes_${exam}_${topic}`, notes);
  },

  // Document analysis results history
  getDocAnalysis: (): DocAnalysisResult[] => {
    return dbService.get('doc_analysis_history') || [];
  },
  saveDocAnalysis: (result: DocAnalysisResult) => {
    const history = dbService.getDocAnalysis();
    dbService.save('doc_analysis_history', [result, ...history].slice(0, 20));
  },

  // Mind map data persistence
  getMindMap: (topic: string): MindMapNode | null => {
    return dbService.get(`mindmap_${topic}`);
  },
  saveMindMap: (topic: string, data: MindMapNode) => {
    dbService.save(`mindmap_${topic}`, data);
  },

  // Study plan persistence
  getPlan: (exam: string): StudyPlan | null => {
    const cached = dbService.get(`plan_${exam}`);
    if (cached) return cached;
    return SAVED_PLANS[exam] || null;
  },
  savePlan: (exam: string, plan: StudyPlan) => {
    dbService.save(`plan_${exam}`, plan);
  },

  // Code snippets history
  getCodeSnippets: (): CodeSnippet[] => {
    return dbService.get('code_snippets') || [];
  },
  saveCodeSnippet: (snippet: CodeSnippet) => {
    const snippets = dbService.getCodeSnippets();
    dbService.save('code_snippets', [snippet, ...snippets].slice(0, 50));
  },

  // Video generation URL persistence
  getVideo: (prompt: string): string | null => {
    return dbService.get(`video_${prompt}`);
  },
  saveVideo: (prompt: string, url: string) => {
    dbService.save(`video_${prompt}`, url);
  },

  // Model paper persistence
  getSavedPaper: (subject: string, level: string, board: string): ModelPaper | null => {
    return dbService.get(`paper_${subject}_${level}_${board}`);
  },
  saveModelPaper: (paper: ModelPaper) => {
    dbService.save(`paper_${paper.subject}_${paper.level}_${paper.board}`, paper);
  }
};