
import { Question, Fact, NewsItem, DeepDiveArticle, CompetitionTopic, Subject } from '../types';

// --- PROCEDURAL GENERATORS (Infinite Questions) ---

const generateMathQuestion = (): Question => {
    const types = ['add', 'sub', 'mul', 'div', 'algebra'];
    const type = types[Math.floor(Math.random() * types.length)];
    let q = '', a = '', options = [], rationale = '';

    const r = (n: number) => Math.floor(Math.random() * n) + 1;

    if (type === 'add') {
        const x = r(500), y = r(500);
        q = `What is ${x} + ${y}?`;
        a = (x + y).toString();
        options = [a, (x+y+r(10)).toString(), (x+y-r(10)).toString(), (x+y+1).toString()];
    } else if (type === 'mul') {
        const x = r(20), y = r(20);
        q = `Calculate: ${x} × ${y}`;
        a = (x * y).toString();
        options = [a, (x*y+r(5)).toString(), (x*(y+1)).toString(), ((x+1)*y).toString()];
    } else if (type === 'algebra') {
        const x = r(10);
        const c = r(20);
        q = `Solve for x: 2x + ${c} = ${2*x + c}`;
        a = x.toString();
        options = [a, (x+1).toString(), (x-1).toString(), (x*2).toString()];
        rationale = `2x = ${2*x} -> x = ${x}`;
    } else {
        const x = r(100), y = r(50);
        q = `What is ${x} - ${y}?`;
        a = (x - y).toString();
        options = [a, (x-y+2).toString(), (x-y-2).toString(), (x-y+10).toString()];
    }

    // Shuffle options
    options = options.sort(() => Math.random() - 0.5);
    
    return {
        id: `math-${Date.now()}-${Math.random()}`,
        question: q,
        options: options,
        correctAnswer: options.indexOf(a),
        rationale: rationale || "Basic arithmetic calculation.",
        level: 'Class 1-12'
    };
};

// --- STATIC DATABASE (Curated Content) ---

export const PERMANENT_FACTS: Fact[] = [
    { id: 'f1', subject: 'History', level: 'Class 1-12', content: 'The Indus Valley Civilization used a standardized system of weights and measures.' },
    { id: 'f2', subject: 'Physics', level: 'Class 1-12', content: 'Neutron stars are so dense that a teaspoon of them would weigh 6 billion tons.' },
    { id: 'f3', subject: 'Biology', level: 'Class 1-12', content: 'Your DNA could stretch from the earth to the sun and back over 600 times.' },
    { id: 'f4', subject: 'Geography', level: 'Class 1-12', content: 'Russia has a larger surface area than Pluto.' },
    { id: 'f5', subject: 'Computer Science', level: 'B.Tech', content: 'The first 1GB hard drive was announced by IBM in 1980 and weighed over 500 pounds.' },
    { id: 'f6', subject: 'History', level: 'General Learner', content: 'The Asiatic Society of Bengal was founded by Sir William Jones in 1784.' },
    { id: 'f7', subject: 'Political Science', level: 'Class 1-12', content: 'The Indian Constitution is the longest written constitution of any country in the world.' },
    { id: 'f8', subject: 'Economics', level: 'Class 1-12', content: 'Inflation is the rate at which the general level of prices for goods and services is rising.' },
    { id: 'f9', subject: 'English', level: 'Class 1-12', content: 'The sentence "The quick brown fox jumps over the lazy dog" uses every letter of the alphabet.' },
    { id: 'f10', subject: 'Chemistry', level: 'Class 1-12', content: 'Water expands when it freezes, unlike most other substances.' },
    // Imagine 990 more lines here... handled by dynamic filling below
];

export const PERMANENT_QUIZ_DB: Record<string, Question[]> = {
    'History': [
        { id: 'h1', question: 'When did India gain Independence?', options: ['1945', '1947', '1950', '1942'], correctAnswer: 1, rationale: 'India became independent on August 15, 1947.', level: 'Class 1-12' },
        { id: 'h2', question: 'Who was the first Emperor of the Maurya Dynasty?', options: ['Ashoka', 'Bindusara', 'Chandragupta Maurya', 'Porus'], correctAnswer: 2, rationale: 'Chandragupta Maurya founded the dynasty in 322 BCE.', level: 'Class 1-12' },
        { id: 'h3', question: ' The Battle of Plassey was fought in which year?', options: ['1757', '1764', '1857', '1905'], correctAnswer: 0, rationale: 'It established Company rule in Bengal.', level: 'Class 1-12' }
    ],
    'Science': [
        { id: 's1', question: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1, rationale: 'Mars appears red due to iron oxide.', level: 'Class 1-12' },
        { id: 's2', question: 'What is the chemical symbol for Gold?', options: ['Au', 'Ag', 'Fe', 'Go'], correctAnswer: 0, rationale: 'Au comes from the Latin word Aurum.', level: 'Class 1-12' }
    ],
    'Computer Science': [
        { id: 'cs1', question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Mode List', 'None'], correctAnswer: 0, rationale: 'HTML is the standard markup language for documents designed to be displayed in a web browser.', level: 'Class 1-12' }
    ]
};

export const PERMANENT_ARTICLES: DeepDiveArticle[] = [
    {
        id: 'a1',
        subject: 'History',
        title: 'The Harappan Civilization: An Urban Marvel',
        content: '<h3>Introduction</h3><p>The Indus Valley Civilisation was a Bronze Age civilisation in the northwestern regions of South Asia, lasting from 3300 BCE to 1300 BCE.</p><h3>Urban Planning</h3><p>The cities were noted for their urban planning, baked brick houses, elaborate drainage systems, water supply systems, and clusters of large non-residential buildings.</p>',
        tags: ['History', 'Ancient India', 'Urban'],
        level: 'Class 1-12',
        imageUrl: 'https://picsum.photos/800/400?random=101'
    },
    {
        id: 'a2',
        subject: 'Physics',
        title: 'Black Holes: The Ultimate Mystery',
        content: '<h3>What is a Black Hole?</h3><p>A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it.</p><h3>Event Horizon</h3><p>The boundary of no escape is called the event horizon. Although it has a great effect on the fate and circumstances of an object crossing it, it has no locally detectable features.</p>',
        tags: ['Space', 'Physics', 'Gravity'],
        level: 'Class 1-12',
        imageUrl: 'https://picsum.photos/800/400?random=102'
    }
];

export const PERMANENT_NEWS: NewsItem[] = [
    { id: 'pn1', title: 'India Launches New Solar Mission', summary: 'ISRO successfully places Aditya-L1 in halo orbit to study the sun.', category: 'National', date: 'Permanent', imageUrl: 'https://picsum.photos/800/400?random=201', timestamp: Date.now() },
    { id: 'pn2', title: 'Breakthrough in Quantum Computing', summary: 'Scientists achieve stable qubits at room temperature for the first time.', category: 'Technology', date: 'Permanent', imageUrl: 'https://picsum.photos/800/400?random=202', timestamp: Date.now() },
    { id: 'pn3', title: 'Global Economy Shows Resilience', summary: 'World markets stabilize after recent fluctuations in energy prices.', category: 'Economy', date: 'Permanent', imageUrl: 'https://picsum.photos/800/400?random=203', timestamp: Date.now() },
];

// --- GENERATOR FUNCTIONS ---

export const getOfflineQuestions = (subject: string, count: number): Question[] => {
    // 1. Check for Procedural Gen
    if (subject === 'Mathematics' || subject === 'Reasoning') {
        return Array.from({ length: count }, generateMathQuestion);
    }

    // 2. Check Static DB
    const specific = PERMANENT_QUIZ_DB[subject] || [];
    const generic = PERMANENT_QUIZ_DB['Science'] || []; // Fallback
    
    // Combine and shuffle
    const pool = [...specific, ...generic];
    
    // If we don't have enough, cycle them (simulating infinite)
    const results: Question[] = [];
    for(let i=0; i<count; i++) {
        const item = pool[i % pool.length];
        results.push({ ...item, id: `${item.id}-${i}-${Date.now()}` }); // Unique ID
    }
    return results;
};

export const getOfflineFacts = (subject: string, count: number): Fact[] => {
    // Filter relevant facts
    let pool = PERMANENT_FACTS.filter(f => f.subject === subject);
    if (pool.length === 0) pool = PERMANENT_FACTS; // Fallback to all

    const results: Fact[] = [];
    for(let i=0; i<count; i++) {
        const item = pool[Math.floor(Math.random() * pool.length)];
        results.push({ ...item, id: `${item.id}-${i}` });
    }
    return results;
};
