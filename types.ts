
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  picture?: string;
  educationLevel: string;
  points: number;
  streak: number;
  joinedAt: string;
  badges: Badge[];
  progress: UserProgress;
}

export interface UserProgress {
  masteredTopics: string[];
  totalStudyMinutes: number;
  subjectStrengths: Record<string, number>; // 0 to 100
  recentActivity: { date: string; activity: string }[];
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockedAt?: string;
}

export type Language = 'en' | 'hi';

export type NewsCategory = 'National' | 'International' | 'Sports' | 'Politics' | 'Economy' | 'Technology' | 'Health';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  imageUrl: string;
  date: string;
  timestamp: number;
  url?: string;
}

export type Subject = 
  | 'History' | 'Geography' | 'Economics' | 'Political Science' 
  | 'Sociology' | 'Mathematics' | 'Physics' | 'Chemistry' 
  | 'Biology' | 'Hindi' | 'English' | 'Computer Science'
  | 'General Knowledge' | 'Pedagogy' | 'Reasoning' | 'Psychology';

export interface Fact {
  id: string;
  subject: Subject;
  content: string;
  level: EducationLevel;
}

export interface DeepDiveArticle {
  id: string;
  subject: Subject;
  title: string;
  content: string;
  tags: string[];
  level: EducationLevel;
  imageUrl?: string;
  savedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
  attachmentType?: 'image' | 'video';
  attachmentUrl?: string; 
  userImage?: string; 
  sources?: { title: string; url: string }[];
  model?: string;
}

// Added 'UPSC/PSC' and 'NEET' to EducationLevel to fix type errors in data/permanentDB.ts
export type EducationLevel = 
  | 'Class 1-12' | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' 
  | 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10' 
  | 'Class 11' | 'Class 12' 
  | 'B.A' | 'B.Sc' | 'B.Com' | 'B.Tech' | 'B.Ed'
  | 'M.A' | 'M.Sc' | 'M.Com' | 'M.Tech' | 'MBA'
  | 'PhD' | 'General Learner' | 'UPSC/PSC' | 'NEET';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  rationale: string;
  level: string; 
}

export interface ExamQuestion {
  id: string;
  type: 'MCQ' | '2-Mark' | '5-Mark';
  question: string;
  answer?: string;
  hints?: string[];
}

export interface Slide {
    title: string;
    content: string[];
    speakerNotes: string;
}

export interface Presentation {
    id: string;
    topic: string;
    slides: Slide[];
}

export interface CloudInsight {
    category: string;
    summary: string;
    recommendation: string;
}

export interface LMSource {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'url' | 'file';
  selected: boolean;
  timestamp: number;
}

export interface LMGuide {
  summary: string;
  suggestedQuestions: string[];
  topics: string[];
}

export type CompetitionExam = 'UPSC CSE' | 'JEE Mains' | 'JEE Advanced' | 'NEET' | 'SSC CGL' | 'IBPS PO' | 'GATE' | 'CAT' | 'NDA' | 'CTET' | 'UGC NET/JRF' | 'TGT' | 'PGT' | 'State PSC';

export interface CompetitionTopic {
    id: string;
    title: string;
    description: string;
    importance: 'High' | 'Medium' | 'Low';
}

export interface CodeSnippet {
    id: string;
    title: string;
    code: string;
    language: string;
    explanation: string;
    timestamp: number;
}

export interface CareerRoadmap {
    careerTitle: string;
    matchScore: number;
    description: string;
    skillsRequired: string[];
    educationPath: string[]; 
    potentialRoles: string[];
}

export interface MindMapNode {
  id: string;
  label: string;
  color?: string;
  children?: MindMapNode[];
}

export interface StudyPlan {
  examName: string;
  totalDays: number;
  schedule: {
    day: number;
    topics: string[];
    tasks: string[];
    tip?: string;
  }[];
}

export interface Place {
  title: string;
  uri: string;
}

export interface GeoResult {
  text: string;
  places: Place[];
}

export interface DocAnalysisResult {
    id: string;
    title: string; 
    timestamp: number;
    summary: string;
    keyPoints: string[];
    quiz: Question[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  notes: Note[];
}

export type QuestionType = 'MCQ' | 'FillBlank' | 'TrueFalse' | 'Match' | 'OneWord' | 'Define' | 'Reason' | 'Diff' | 'Short' | 'Long';

export interface PaperQuestion {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
  options?: string[];
  matchPairs?: { left: string; right: string }[];
}

export interface PaperSection {
  title: string;
  instruction: string;
  questions: PaperQuestion[];
}

export interface ModelPaper {
  id: string;
  subject: string;
  level: string;
  board: string;
  totalMarks: number;
  sections: PaperSection[];
  createdAt: number;
}

export interface GradedQuestionResult {
  questionId: string;
  questionText: string;
  userAnswer: string;
  obtainedMarks: number;
  maxMarks: number;
  status: 'Correct' | 'Partial' | 'Incorrect';
  feedback: string;
  idealAnswer: string;
}

export interface GradedPaperResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  overallFeedback: string;
  questionResults: GradedQuestionResult[];
}

export interface MockPaperResult {
    paperId: string;
    score: number;
    totalQuestions: number;
    timeTaken: number; // in seconds
    answers: Record<string, number | string>; // questionId -> answer index or text
    timestamp: number;
}

export interface CompetitionMockPaper {
    id: string;
    examName: CompetitionExam;
    subject: string;
    totalQuestions: number;
    timeLimit: number; // in minutes
    questions: Question[];
}
