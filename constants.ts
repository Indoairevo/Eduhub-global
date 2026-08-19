import { NewsItem, Subject, Fact, DeepDiveArticle, Question, CompetitionExam } from './types';

export const SUBJECTS: Subject[] = [
  'History', 'Geography', 'Economics', 'Political Science', 
  'Sociology', 'Mathematics', 'Physics', 'Chemistry', 
  'Biology', 'Hindi', 'English', 'Computer Science',
  'General Knowledge', 'Pedagogy', 'Reasoning', 'Psychology'
];

export const COMPETITION_EXAMS: CompetitionExam[] = [
  'UPSC CSE', 'JEE Mains', 'JEE Advanced', 'NEET', 'SSC CGL', 
  'IBPS PO', 'GATE', 'CAT', 'NDA', 'CTET', 'UGC NET/JRF', 'TGT', 'PGT', 'State PSC'
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Global AI Summit 2024 Reaches Historic Agreement',
    summary: 'Leaders from 50 nations pledge to ensure ethical AI development across borders.',
    category: 'International',
    imageUrl: 'https://picsum.photos/800/400?random=1',
    date: 'Oct 24, 2024',
    timestamp: 1729728000000
  },
  {
    id: '2',
    title: 'New Education Policy Implementation Phase 3 Begins',
    summary: 'The government rolls out digital infrastructure updates for rural schools nationwide.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=2',
    date: 'Oct 23, 2024',
    timestamp: 1729641600000
  },
  {
    id: '3',
    title: 'SpaceX Starship Successfully Orbits Earth',
    summary: 'A major milestone in space exploration as the massive rocket completes its full test flight.',
    category: 'International',
    imageUrl: 'https://picsum.photos/800/400?random=3',
    date: 'Oct 22, 2024',
    timestamp: 1729555200000
  },
  {
    id: '4',
    title: 'Tech Hub Expansion in Bangalore Announced',
    summary: 'Major investments pouring into the southern tech capital to boost startups.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=4',
    date: 'Oct 20, 2024',
    timestamp: 1729382400000
  },
];

export const MOCK_FACTS: Fact[] = [
  { id: '1', subject: 'Sociology', level: 'B.A', content: 'Emile Durkheim established sociology as an academic discipline with his study on Suicide.' },
  { id: '2', subject: 'Computer Science', level: 'Class 1-12', content: 'The first computer bug was an actual moth found in the Harvard Mark II computer in 1947.' },
  { id: '3', subject: 'Physics', level: 'General Learner', content: 'Light from the sun takes approximately 8 minutes and 20 seconds to reach Earth.' },
  { id: '4', subject: 'History', level: 'Class 1-12', content: 'The Great Wall of China is not visible from the moon without aid, contrary to popular belief.' },
  { id: '5', subject: 'Computer Science', level: 'M.Tech', content: 'P vs NP is one of the seven Millennium Prize Problems in mathematics and computer science.' },
  { id: '6', subject: 'Economics', level: 'PhD', content: 'The concept of the "Invisible Hand" was introduced by Adam Smith in The Wealth of Nations.' },
];

export const MOCK_ARTICLES: DeepDiveArticle[] = [
  {
    id: '1',
    subject: 'Computer Science',
    title: 'Understanding Neural Networks',
    content: 'Neural networks are a series of algorithms that endeavor to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates. In this sense, neural networks refer to systems of neurons, either organic or artificial in nature. Neural networks can adapt to changing input; so the network generates the best possible result without needing to redesign the output criteria.',
    tags: ['AI', 'Machine Learning', 'Algorithms'],
    level: 'B.Tech'
  },
  {
    id: '2',
    subject: 'Sociology',
    title: 'The Impact of Social Media on Modern Interaction',
    content: 'Social media has fundamentally shifted how humans communicate. From the "global village" predicted by Marshall McLuhan to the echo chambers of today, digital interaction has altered community structures. We observe a decline in face-to-face social capital but an increase in weak-tie bridging social capital.',
    tags: ['Society', 'Digital Age', 'Communication'],
    level: 'General Learner'
  },
  {
    id: '3',
    subject: 'Physics',
    title: 'Quantum Entanglement Explained',
    content: 'Quantum entanglement is a physical phenomenon that occurs when a group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle of the group cannot be described independently of the state of the others, including when the particles are separated by a large distance.',
    tags: ['Quantum Mechanics', 'Physics', 'Science'],
    level: 'M.Sc'
  },
  {
    id: '4',
    subject: 'History',
    title: 'The Industrial Revolution: A Turning Point',
    content: 'The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban. Prior to the Industrial Revolution, which began in Britain in the late 1700s, manufacturing was often done in people\'s homes, using hand tools or basic machines.',
    tags: ['History', 'Industrial Revolution', 'Economy'],
    level: 'Class 1-12'
  }
];

export const MOCK_QUIZ: Question[] = [
  {
    id: 'q1',
    question: 'Who is considered the father of the World Wide Web?',
    options: ['Bill Gates', 'Tim Berners-Lee', 'Steve Jobs', 'Alan Turing'],
    correctAnswer: 1,
    rationale: 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN.',
    level: 'Class 1-12'
  },
  {
    id: 'q2',
    question: 'Which sociological perspective views society as a complex system whose parts work together to promote solidarity and stability?',
    options: ['Conflict Theory', 'Symbolic Interactionism', 'Functionalism', 'Feminism'],
    correctAnswer: 2,
    rationale: 'Functionalism, largely associated with Emile Durkheim, views society as a system of interconnected parts.',
    level: 'M.A'
  },
  {
    id: 'q3',
    question: 'What is the capital of Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctAnswer: 2,
    rationale: 'Canberra was selected as the capital in 1908 as a compromise between rivals Sydney and Melbourne.',
    level: 'General Learner'
  },
  {
    id: 'q4',
    question: 'In Python, which keyword is used to define a function?',
    options: ['func', 'define', 'def', 'function'],
    correctAnswer: 2,
    rationale: 'The "def" keyword is used to declare a function in Python.',
    level: 'Class 1-12'
  },
  {
    id: 'q5',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi Apparatus'],
    correctAnswer: 1,
    rationale: 'Mitochondria are known as the powerhouses of the cell because they generate most of the cell\'s supply of adenosine triphosphate (ATP).',
    level: 'Class 1-12'
  },
  {
    id: 'q6',
    question: 'What is the derivative of x^2?',
    options: ['x', '2x', 'x^2', '2'],
    correctAnswer: 1,
    rationale: 'The power rule states that the derivative of x^n is nx^(n-1).',
    level: 'B.Sc'
  }
];