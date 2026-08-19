
import { NewsItem, Fact, Question, DeepDiveArticle, StudyPlan, CompetitionTopic } from '../types';

// ==========================================
// 1. PERMANENT NEWS FEED (2024-2026 Context)
// ==========================================
export const SAVED_NEWS: NewsItem[] = [
  {
    id: 'p-news-01',
    title: 'ISRO Reveals Gaganyaan Mission Progress',
    summary: 'India\'s first human spaceflight mission, Gaganyaan, has successfully completed key parachute deployment tests. The mission aims to send a 3-member crew to a 400km orbit for 3 days.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=101',
    date: 'June 10, 2024',
    timestamp: 1717977600000,
    url: 'https://www.isro.gov.in/Gaganyaan.html'
  },
  {
    id: 'p-news-02',
    title: 'Gemini 3.0: The Leap to Agentic AI',
    summary: 'Google DeepMind has introduced new agentic capabilities to Gemini, allowing it to perform multi-step research and code execution with near-human reasoning accuracy.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/400?random=102',
    date: 'June 08, 2024',
    timestamp: 1717804800000
  },
  {
    id: 'p-news-03',
    title: 'Breakthrough in Solid-State Battery Tech',
    summary: 'Researchers in Japan have demonstrated a solid-state battery that can charge a car in 10 minutes with a range of 1,200km, potentially ending EV range anxiety forever.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/400?random=103',
    date: 'June 05, 2024',
    timestamp: 1717545500000
  },
  {
    id: 'p-news-10',
    title: 'India to Launch Shukrayaan-1 by 2028',
    summary: 'The Department of Space has cleared the mission to Venus, Shukrayaan-1, which will study the Venusian atmosphere and surface chemistry using high-resolution synthetic aperture radar.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=110',
    date: 'June 25, 2024',
    timestamp: 1719273600000
  },
  {
    id: 'p-news-11',
    title: 'Global Semiconductor Pact Signed',
    summary: 'A coalition of 15 nations, including India and the US, signed a pact to secure the global microchip supply chain against future geopolitical disruptions.',
    category: 'Economy',
    imageUrl: 'https://picsum.photos/800/400?random=111',
    date: 'June 22, 2024',
    timestamp: 1719014400000
  },
  {
    id: 'p-news-15',
    title: 'Quantum Advantage Reached in Error Correction',
    summary: 'Physicists have demonstrated a 100-qubit processor with logical error rates lower than physical error rates, a critical milestone for scalable quantum computing.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/400?random=115',
    date: 'August 12, 2024',
    timestamp: 1723420800000
  },
  {
    id: 'p-news-16',
    title: 'New CBSE Curriculum Framework for 2025',
    summary: 'The Ministry of Education has announced a transition to a "Credit-Based System" for secondary classes, allowing students more flexibility in subject choice.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=116',
    date: 'September 05, 2024',
    timestamp: 1725494400000
  },
  // --- ULTRA EXTENSION NEWS ---
  {
    id: 'p-news-20',
    title: 'India Launches First Hydrogen Train Prototype',
    summary: 'Indian Railways successfully tested its first hydrogen-fuel-cell powered train on the Jind-Sonipat section, marking a green shift in public transport.',
    category: 'National',
    imageUrl: 'https://picsum.photos/800/400?random=120',
    date: 'December 15, 2024',
    timestamp: 1734220800000
  },
  {
    id: 'p-news-21',
    title: 'Neuralink Receives Approval for "Blindsight"',
    summary: 'Elon Musk\'s Neuralink has received FDA breakthrough device designation for "Blindsight", an implant aiming to restore vision even in those born blind.',
    category: 'Health',
    imageUrl: 'https://picsum.photos/800/400?random=121',
    date: 'January 10, 2025',
    timestamp: 1736467200000
  },
  {
    id: 'p-news-22',
    title: 'Fusion Energy Net Gain Repeated',
    summary: 'US National Ignition Facility has repeated nuclear fusion ignition multiple times, proving the viability of clean, limitless star-power energy for the future.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/400?random=122',
    date: 'February 02, 2025',
    timestamp: 1738454400000
  }
];

// ==========================================
// 2. PERMANENT ACADEMIC FACTS (Subject-Wise)
// ==========================================
export const SAVED_FACTS: Record<string, Fact[]> = {
  'History': [
    { id: 'hf1', subject: 'History', level: 'Class 10', content: 'The Dandi March (1930) lasted for 24 days and covered 240 miles to protest the British salt tax.' },
    { id: 'hf2', subject: 'History', level: 'Class 12', content: 'The Vijayanagara Empire reached its zenith under Krishnadevaraya of the Tuluva dynasty (1509–1529).' },
    { id: 'hf3', subject: 'History', level: 'UPSC/PSC', content: 'The "Lothal" dockyard is the oldest man-made dock in the world, proving ancient India\'s maritime prowess.' },
    { id: 'hf10', subject: 'History', level: 'Class 9', content: 'The Tennis Court Oath was a pivotal event during the first days of the French Revolution (1789).' },
    { id: 'hf11', subject: 'History', level: 'B.A', content: 'The Maurya Empire was the first power to unify most of the Indian subcontinent under a single administration.' },
    { id: 'hf12', subject: 'History', level: 'General Learner', content: 'Genghis Khan created the largest contiguous land empire in history, stretching from China to Europe.' },
    { id: 'hf20', subject: 'History', level: 'UPSC/PSC', content: 'The "Doctrine of Lapse" was introduced by Lord Dalhousie to annex Indian states without a natural heir.' }
  ],
  'Physics': [
    { id: 'pf1', subject: 'Physics', level: 'Class 11', content: 'The Zeroth Law of Thermodynamics defines temperature and provides a basis for thermometers.' },
    { id: 'pf2', subject: 'Physics', level: 'B.Tech', content: 'The "Heisenberg Uncertainty Principle" implies that vacuum contains virtual particles that constantly pop in and out of existence.' },
    { id: 'pf3', subject: 'Physics', level: 'PhD', content: 'Superstring theory proposes that particles are vibrating 1-dimensional strings in 10 or 11 dimensions.' },
    { id: 'pf15', subject: 'Physics', level: 'Class 12', content: 'Coulomb’s law states that the force between two charges is inversely proportional to the square of the distance between them.' },
    { id: 'pf16', subject: 'Physics', level: 'B.Sc', content: 'Maxwell’s Equations unified electricity, magnetism, and light into the single field of electromagnetism.' },
    { id: 'pf20', subject: 'Physics', level: 'General Learner', content: 'The "Higgs Boson", discovered in 2012, is responsible for giving other particles their mass.' }
  ],
  'Chemistry': [
    { id: 'cf1', subject: 'Chemistry', level: 'Class 11', content: 'The Pauli Exclusion Principle states no two electrons in an atom can have the same four quantum numbers.' },
    { id: 'cf10', subject: 'Chemistry', level: 'Class 12', content: 'Catalysts speed up a chemical reaction by providing an alternative pathway with lower activation energy.' },
    { id: 'cf11', subject: 'Chemistry', level: 'NEET', content: 'Benzene exhibits resonance stability due to the delocalization of six pi-electrons in the hexagonal ring.' },
    { id: 'cf12', subject: 'Chemistry', level: 'B.Sc', content: 'The Gibbs Free Energy (ΔG) must be negative for a reaction to be spontaneous at constant pressure and temperature.' },
    { id: 'cf20', subject: 'Chemistry', level: 'B.Tech', content: 'Graphene is a single layer of carbon atoms arranged in a 2D honeycomb lattice and is the strongest material known.' }
  ],
  'Biology': [
    { id: 'bf1', subject: 'Biology', level: 'Class 10', content: 'Mitochondria contain their own DNA, which is inherited exclusively from the biological mother.' },
    { id: 'bf15', subject: 'Biology', level: 'NEET', content: 'The "Double Helix" structure of DNA was first proposed by James Watson and Francis Crick in 1953.' },
    { id: 'bf16', subject: 'Biology', level: 'Class 12', content: 'Transcription is the process of copying a segment of DNA into RNA by the enzyme RNA polymerase.' },
    { id: 'bf17', subject: 'Biology', level: 'General Learner', content: 'The human eye can distinguish approximately 10 million different colors.' },
    { id: 'bf20', subject: 'Biology', level: 'NEET', content: 'The "Islets of Langerhans" in the pancreas contain Alpha cells (Glucagon) and Beta cells (Insulin).' }
  ],
  'Mathematics': [
    { id: 'mf1', subject: 'Mathematics', level: 'Class 10', content: 'The Pythagorean theorem states that a² + b² = c² in any right-angled triangle.' },
    { id: 'mf10', subject: 'Mathematics', level: 'Class 12', content: 'The area under a curve is calculated using the definite integral of the function representing that curve.' },
    { id: 'mf11', subject: 'Mathematics', level: 'B.Sc', content: 'Euler\'s identity, e^(iπ) + 1 = 0, links five of the most important mathematical constants.' },
    { id: 'mf12', subject: 'Mathematics', level: 'General Learner', content: 'The number Zero (0) as a digit was developed by Indian mathematicians like Brahmagupta around 628 AD.' }
  ],
  'Economics': [
    { id: 'ef1', subject: 'Economics', level: 'UPSC/PSC', content: 'Gresham\'s Law states that "bad money drives out good" when both are in circulation.' },
    { id: 'ef10', subject: 'Economics', level: 'B.Com', content: 'The "Invisible Hand" is a metaphor used by Adam Smith to describe the self-regulating nature of the marketplace.' },
    { id: 'ef11', subject: 'Economics', level: 'M.A', content: 'The Keynesian Multiplier effect suggests that an initial injection of spending leads to a larger increase in national income.' }
  ],
  'Computer Science': [
    { id: 'csf1', subject: 'Computer Science', level: 'B.Tech', content: 'P vs NP is an unsolved problem asking if every problem whose solution can be verified quickly can also be solved quickly.' },
    { id: 'csf10', subject: 'Computer Science', level: 'Class 12', content: 'Python is an interpreted, high-level, general-purpose programming language created by Guido van Rossum.' },
    { id: 'csf11', subject: 'Computer Science', level: 'PhD', content: 'The "Halting Problem" proved by Alan Turing shows that no algorithm exists that can determine if any program will eventually stop.' },
    { id: 'csf20', subject: 'Computer Science', level: 'B.Tech', content: 'The CAP Theorem states that a distributed data store can only guarantee two of three: Consistency, Availability, or Partition Tolerance.' }
  ],
  // --- ULTRA EXTENSION SUBJECTS ---
  'Psychology': [
    { id: 'psy1', subject: 'Psychology', level: 'B.A', content: 'Pavlov\'s Dog experiment demonstrated "Classical Conditioning", where a neutral stimulus evokes a response.' },
    { id: 'psy2', subject: 'Psychology', level: 'M.A', content: 'Maslow\'s Hierarchy of Needs places "Self-Actualization" at the top of human motivation.' },
    { id: 'psy3', subject: 'Psychology', level: 'General Learner', content: 'The "Placebo Effect" occurs when a patient experiences real improvement after receiving a fake treatment.' }
  ],
  'Literature': [
    { id: 'lit1', subject: 'English', level: 'B.A', content: 'Shakespeare is credited with inventing over 1,700 words in the English language, including "assassination" and "lonely".' },
    { id: 'lit2', subject: 'English', level: 'M.A', content: '"The Tale of Genji" (11th Century, Japan) is often considered the world\'s first novel.' }
  ],
  'Political Science': [
    { id: 'pol1', subject: 'Political Science', level: 'UPSC/PSC', content: 'Habeas Corpus is a writ that ensures a person under arrest is brought before a judge or into court.' },
    { id: 'pol2', subject: 'Political Science', level: 'Class 11', content: 'The preamble of the Indian Constitution was inspired by the Objective Resolution moved by Jawaharlal Nehru.' }
  ]
};

// ==========================================
// 3. DEEP DIVE ARTICLES (Hyper-Detailed)
// ==========================================
export const SAVED_ARTICLES: Record<string, DeepDiveArticle[]> = {
  'History': [
    {
      id: 'da-h4',
      subject: 'History',
      title: 'The Green Revolution in India',
      content: `
        <h3>Genesis</h3>
        <p>The Green Revolution began in the mid-1960s with the introduction of High-Yielding Variety (HYV) seeds, developed by Norman Borlaug.</p>
        <h3>Core Components</h3>
        <ul>
          <li><b>Irrigation:</b> Expansion of tube wells in Punjab and Haryana.</li>
          <li><b>Chemical Input:</b> Synthetic fertilizers and pesticides.</li>
          <li><b>Mechanization:</b> Transition to tractor-based farming.</li>
        </ul>
        <h3>Impact</h3>
        <p>India became self-sufficient in food grains, but the long-term cost included soil degradation and groundwater depletion.</p>
      `,
      tags: ['Agriculture', 'Modern History', 'Economy'],
      level: 'UPSC/PSC'
    },
    {
        id: 'da-h10',
        subject: 'History',
        title: 'The French Revolution (1789)',
        content: `
          <h3>Causes</h3>
          <p>Social inequality (The Three Estates), economic hardship, and the influence of Enlightenment thinkers like Rousseau and Voltaire.</p>
          <h3>Key Stages</h3>
          <ul>
            <li><b>National Assembly:</b> The Third Estate declared themselves the true representatives of France.</li>
            <li><b>The Reign of Terror:</b> Led by Robespierre, resulting in thousands of executions via the guillotine.</li>
            <li><b>Rise of Napoleon:</b> A military genius who ended the revolutionary chaos by declaring himself Emperor.</li>
          </ul>
        `,
        tags: ['World History', 'Revolution', 'France'],
        level: 'Class 9'
      },
      {
        id: 'da-h20',
        subject: 'History',
        title: 'The Renaissance: Rebirth of Europe',
        content: `
          <h3>Origins</h3>
          <p>Beginning in Florence, Italy, in the 14th century, the Renaissance marked the transition from the Middle Ages to Modernity.</p>
          <h3>Humanism</h3>
          <p>A shift from religious scholasticism to the study of humanities (grammar, rhetoric, history, poetry, and moral philosophy).</p>
          <h3>Artistic Revolution</h3>
          <p>Masters like Leonardo da Vinci and Michelangelo introduced linear perspective and anatomical realism to art.</p>
        `,
        tags: ['Art', 'Europe', 'Culture'],
        level: 'B.A'
      }
  ],
  'Computer Science': [
    {
      id: 'da-cs2',
      subject: 'Computer Science',
      title: 'Blockchain: The Decentralized Future',
      content: `
        <h3>Mechanism</h3>
        <p>A blockchain is a distributed ledger where transactions are recorded across many computers so the record cannot be altered retroactively.</p>
        <h3>Consensus Algorithms</h3>
        <ul>
          <li><b>Proof of Work (PoW):</b> Used by Bitcoin; requires massive computational power.</li>
          <li><b>Proof of Stake (PoS):</b> Used by Ethereum 2.0; more energy-efficient, based on coins held.</li>
        </ul>
        <h3>Smart Contracts</h3>
        <p>Self-executing contracts with the terms directly written into code, enabling trustless automation.</p>
      `,
      tags: ['Web3', 'Security', 'Cryptography'],
      level: 'B.Tech'
    },
    {
      id: 'da-cs3',
      subject: 'Computer Science',
      title: 'Zero Trust Security Architecture',
      content: `
        <h3>The Core Principle</h3>
        <p>"Never Trust, Always Verify." Unlike traditional security which defends the perimeter, Zero Trust assumes threats exist both inside and outside the network.</p>
        <h3>Pillars</h3>
        <ul>
          <li><b>Verify Explicitly:</b> Always authenticate and authorize based on all available data points.</li>
          <li><b>Least Privilege:</b> Limit user access with Just-In-Time and Just-Enough-Access (JIT/JEA).</li>
          <li><b>Assume Breach:</b> Minimize blast radius and segment access.</li>
        </ul>
      `,
      tags: ['Cybersecurity', 'Enterprise', 'IT'],
      level: 'M.Tech'
    }
  ],
  'Biology': [
    {
      id: 'da-b10',
      subject: 'Biology',
      title: 'The Architecture of DNA',
      content: `
        <h3>Double Helix</h3>
        <p>The structure consists of two strands that wind around each other like a twisted ladder. Each strand has a backbone made of alternating sugar and phosphate groups.</p>
        <h3>Nitrogenous Bases</h3>
        <ul>
          <li><b>Adenine (A)</b> pairs with <b>Thymine (T)</b>.</li>
          <li><b>Cytosine (C)</b> pairs with <b>Guanine (G)</b>.</li>
        </ul>
        <h3>Biological Role</h3>
        <p>DNA contains the genetic instructions for the development, functioning, and reproduction of all known organisms.</p>
      `,
      tags: ['Genetics', 'Molecular Bio', 'NEET'],
      level: 'Class 12'
    }
  ],
  'Sociology': [
      {
          id: 'da-soc1',
          subject: 'Sociology',
          title: 'Emile Durkheim: Social Facts',
          content: `
            <h3>Definition</h3>
            <p>Durkheim defined sociology as the study of social facts—ways of acting, thinking, and feeling that are external to the individual and endowed with coercive power.</p>
            <h3>Organic vs Mechanical Solidarity</h3>
            <ul>
                <li><b>Mechanical:</b> Found in primitive societies with a low division of labor and high collective conscience.</li>
                <li><b>Organic:</b> Found in modern industrial societies with high interdependence.</li>
            </ul>
          `,
          tags: ['Theory', 'Founders', 'Society'],
          level: 'B.A'
      }
  ],
  'Psychology': [
      {
          id: 'da-psy1',
          subject: 'Psychology',
          title: 'Cognitive Behavioral Therapy (CBT)',
          content: `
            <h3>Concept</h3>
            <p>CBT is a psycho-social intervention that aims to improve mental health by challenging and changing unhelpful cognitive distortions and behaviors.</p>
            <h3>The Triangle</h3>
            <p>Thoughts, Feelings, and Behaviors are interconnected. Changing one can influence the others.</p>
          `,
          tags: ['Therapy', 'Mental Health', 'Clinical'],
          level: 'M.A'
      }
  ]
};

// ==========================================
// 4. PERMANENT QUIZ REPOSITORY
// ==========================================
export const SAVED_QUIZ: Record<string, Question[]> = {
  'Geography-Class 9': [
    { id: 'q-g9-1', question: 'Which mountain range acts as a climatic barrier to India?', options: ['Western Ghats', 'Himalayas', 'Aravallis', 'Satpuras'], correctAnswer: 1, rationale: 'The Himalayas block cold winds from Central Asia.', level: 'Class 9' },
    { id: 'q-g9-2', question: 'What is the latitude of the Tropic of Cancer?', options: ['23.5 S', '66.5 N', '23.5 N', '0'], correctAnswer: 2, rationale: 'The Tropic of Cancer passes through the middle of India.', level: 'Class 9' }
  ],
  'Physics-Class 12': [
      { id: 'q-p12-10', question: 'What is the SI unit of Magnetic Flux?', options: ['Tesla', 'Weber', 'Henry', 'Gauss'], correctAnswer: 1, rationale: 'Weber is the SI unit; Tesla is the unit for magnetic field density.', level: 'Class 12' },
      { id: 'q-p12-11', question: 'The phenomenon of diffraction is based on which principle?', options: ['Newton', 'Huygens', 'Einstein', 'Planck'], correctAnswer: 1, rationale: 'Diffraction is explained by Huygens-Fresnel wave principle.', level: 'Class 12' }
  ],
  'Mathematics-Class 12': [
      { id: 'q-m12-1', question: 'What is the integral of sin(x)?', options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'], correctAnswer: 1, rationale: 'The derivative of -cos(x) is sin(x).', level: 'Class 12' }
  ],
  'Biology-NEET': [
    { id: 'q-b-neet-10', question: 'Which part of the brain controls body temperature?', options: ['Cerebrum', 'Hypothalamus', 'Medulla', 'Pons'], correctAnswer: 1, rationale: 'Hypothalamus acts as the thermostat of the body.', level: 'NEET' }
  ],
  'Psychology-B.A': [
    { id: 'q-psy-1', question: 'Who is known as the father of Psychoanalysis?', options: ['Carl Jung', 'Sigmund Freud', 'B.F. Skinner', 'Jean Piaget'], correctAnswer: 1, rationale: 'Sigmund Freud founded the discipline of psychoanalysis.', level: 'B.A' }
  ],
  'Political Science-UPSC/PSC': [
    { id: 'q-pol-1', question: 'The power of Judicial Review in India is derived from which country?', options: ['UK', 'USA', 'Canada', 'Ireland'], correctAnswer: 1, rationale: 'The concept of Judicial Review is borrowed from the US Constitution.', level: 'UPSC/PSC' }
  ]
};

// ==========================================
// 5. PERMANENT STUDY ARCHITECTURE
// ==========================================
export const SAVED_PLANS: Record<string, StudyPlan> = {
    'UPSC CSE 30-Day': {
        examName: 'UPSC CSE',
        totalDays: 30,
        schedule: [
            { day: 1, topics: ['Ancient History: Indus Valley', 'Art & Culture'], tasks: ['NCERT 6-12', '20 PYQs'], tip: 'Focus on drainage patterns in IVC.' },
            { day: 2, topics: ['Polity: Preamble', 'Fundamental Rights'], tasks: ['Laxmikanth Ch 7-10', 'Mock 1'], tip: 'Learn non-suspensible rights.' },
            { day: 3, topics: ['Economics: National Income', 'Banking'], tasks: ['Mrunal Notes Ch 1', 'Economic Survey Summary'], tip: 'Understand Repo vs Reverse Repo.' }
        ]
    },
    'JEE Advanced 15-Day': {
        examName: 'JEE Advanced',
        totalDays: 15,
        schedule: [
            { day: 1, topics: ['Physics: Rotational Motion', 'Math: Integration'], tasks: ['Solve 50 Problems', 'PYQ Set A'], tip: 'Focus on Torque equilibrium.' },
            { day: 2, topics: ['Chemistry: Organic Mechanisms', 'Math: Probability'], tasks: ['Reagent summary', 'Bayes Theorem practice'], tip: 'Master SN1/SN2 differences.' }
        ]
    },
    'SSC CGL 45-Day': {
        examName: 'SSC CGL',
        totalDays: 45,
        schedule: [
            { day: 1, topics: ['Math: Number System', 'English: Grammar'], tasks: ['100 MCQs', 'Active/Passive rules'], tip: 'Focus on remainder theorems.' },
            { day: 2, topics: ['GS: Mughal History', 'Reasoning: Puzzles'], tasks: ['Timeline chart', '5 Linear puzzles'], tip: 'Reasoning speed is crucial.' }
        ]
    },
    'GATE CS 30-Day': {
        examName: 'GATE CS',
        totalDays: 30,
        schedule: [
            { day: 1, topics: ['Operating Systems: Paging', 'Data Structures: Trees'], tasks: ['CLRS Tree problems', 'Logical memory calc'], tip: 'Calculate page table sizes carefully.' }
        ]
    },
    // --- ULTRA EXTENSION PLANS ---
    'CLAT (Law)': {
        examName: 'CLAT 2025',
        totalDays: 45,
        schedule: [
            { day: 1, topics: ['Legal Reasoning: Torts', 'Current Affairs'], tasks: ['Read 3 Editorials', 'Solve 20 Tort Principles'], tip: 'Focus on "Strict Liability" vs "Absolute Liability".' },
            { day: 2, topics: ['English: Comprehension', 'Logical: Syllogism'], tasks: ['Solve 5 RC Passages', 'Venn Diagrams'], tip: 'Read faster, do not re-read passages.' }
        ]
    },
    'CA Foundation': {
        examName: 'CA Foundation',
        totalDays: 60,
        schedule: [
            { day: 1, topics: ['Accounting: BRS', 'Law: Contract Act'], tasks: ['Solve 10 BRS problems', 'Memorize Section 10 essentials'], tip: 'In BRS, start with the balance given.' },
            { day: 2, topics: ['Maths: Time Value of Money', 'Economics: Demand'], tasks: ['Calculator tricks for TVM', 'Elasticity graphs'], tip: 'TVM is 15 marks, master the calculator.' }
        ]
    },
    'GRE General': {
        examName: 'GRE',
        totalDays: 30,
        schedule: [
            { day: 1, topics: ['Verbal: Text Completion', 'Quant: Geometry'], tasks: ['Learn 50 Barron Words', 'Circle Formulas'], tip: 'Look for pivot words (however, although).' },
            { day: 2, topics: ['Analytical Writing', 'Quant: Data Interpretation'], tasks: ['Write 1 Issue Essay', 'Solve 3 DI Sets'], tip: 'Structure is key for AWA.' }
        ]
    }
};

// ==========================================
// 6. COMPETITION PRIORITY TOPICS
// ==========================================
export const COMPETITION_DB: Record<string, CompetitionTopic[]> = {
    'UPSC CSE-History': [
        { id: 'c-h1', title: 'The Buddhist Councils', description: 'Locations, patrons, and outcomes of all four councils.', importance: 'High' },
        { id: 'c-h2', title: 'Land Revenue Systems', description: 'Permanent Settlement vs Ryotwari vs Mahalwari.', importance: 'High' },
        { id: 'c-h10', title: '1857 Revolt Leadership', description: 'Mapping local leaders to their specific regions of revolt.', importance: 'Medium' }
    ],
    'NEET-Biology': [
        { id: 'c-b1', title: 'Genetics and Evolution', description: 'Mendelian ratios and molecular basis of inheritance.', importance: 'High' },
        { id: 'c-b2', title: 'Human Endocrine System', description: 'Hormonal regulation and feedback loops.', importance: 'High' },
        { id: 'c-b15', title: 'Plant Anatomy', description: 'Xylem, Phloem, and Meristematic tissues.', importance: 'Medium' }
    ],
    'JEE-Mathematics': [
        { id: 'c-j1', title: 'Coordinate Geometry', description: 'Circles, Conic Sections, and Parabola properties.', importance: 'High' },
        { id: 'c-j10', title: 'Vector Algebra', description: 'Dot and Cross product applications in 3D geometry.', importance: 'High' }
    ],
    // --- ULTRA EXTENSION TOPICS ---
    'CLAT-Legal': [
        { id: 'c-clat1', title: 'Law of Torts: Negligence', description: 'Duty of care, Breach, and Damages.', importance: 'High' },
        { id: 'c-clat2', title: 'Criminal Law: General Exceptions', description: 'Self-defense, Insanity (Section 84 IPC).', importance: 'Medium' }
    ],
    'CA-Accounting': [
        { id: 'c-ca1', title: 'Bank Reconciliation Statement', description: 'Timing differences and errors in Cash Book vs Pass Book.', importance: 'High' },
        { id: 'c-ca2', title: 'Consignment Accounts', description: 'Valuation of unsold stock and abnormal loss.', importance: 'High' }
    ]
};
