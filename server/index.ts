import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000; // MUST be 3000
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere_v14_secure_key_2025';

// --- MONGODB CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found. Data will NOT be persistent across restarts.');
}

// --- MONGODB SCHEMAS ---
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  email: { type: String, unique: true },
  password: { type: String, select: false },
  picture: String,
  educationLevel: String,
  points: { type: Number, default: 0 },
  streak: { type: Number, default: 1 },
  joinedAt: { type: String, default: () => new Date().toISOString() },
  badges: Array,
  progress: {
    masteredTopics: Array,
    totalStudyMinutes: Number,
    subjectStrengths: Object,
    recentActivity: Array
  }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const chatSchema = new mongoose.Schema({
  userId: String,
  subject: String,
  messages: Array
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

const notebookSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  folders: Array
});

const Notebook = mongoose.models.Notebook || mongoose.model('Notebook', notebookSchema);

// Initialize Gemini AI on backend using the environment secret
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- Authentication Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- GOOGLE OAUTH ROUTES ---
const getRedirectUri = (req: any) => {
  let baseUrl = process.env.APP_URL;
  if (!baseUrl) {
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    baseUrl = `${protocol}://${req.get('host')}`;
  }
  baseUrl = baseUrl.replace(/\/$/, '');
  return `${baseUrl}/auth/google/callback`;
};

app.get('/api/auth/google/url', (req, res) => {
  const redirectUri = getRedirectUri(req);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    access_type: 'offline',
    prompt: 'consent',
  });
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const redirectUri = getRedirectUri(req);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) throw new Error(tokens.error_description || tokens.error);

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();
    
    let user = await User.findOne({ email: googleUser.email } as any);
    
    if (!user) {
      user = new User({
        id: Date.now().toString(),
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        educationLevel: 'General Learner',
        points: 0, streak: 1,
        progress: { masteredTopics: [], totalStudyMinutes: 0, subjectStrengths: {}, recentActivity: [] }
      });
      await user.save();
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    
    res.send(`
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', user: ${JSON.stringify(user)}, token: '${token}' }, '*');
          window.close();
        } else {
          window.location.href = '/dashboard';
        }
      </script>
      <p>Authentication successful. You can close this window.</p>
    `);
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, educationLevel } = req.body;
  const existing = await User.findOne({ email } as any);
  if (existing) return res.status(400).json({ error: "Email already registered" });
  
  const newUser = new User({
    id: Date.now().toString(),
    name, email, password, educationLevel,
    progress: { masteredTopics: [], totalStudyMinutes: 0, subjectStrengths: {}, recentActivity: [] }
  });
  await newUser.save();
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET);
  res.json({ user: newUser, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password } as any);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });
  
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
  res.json({ user, token });
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  const user = await User.findOne({ id: req.user.id } as any);
  if (!user) return res.sendStatus(404);
  res.json(user);
});

// --- ADMIN ROUTES ---
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({} as any);
  res.json(users);
});

// --- AI PROXY ROUTES ---
app.post('/api/ai/generate', authenticateToken, async (req, res) => {
  try {
    const { prompt, config, model = 'gemini-3-flash-preview' } = req.body;
    const response = await ai.models.generateContent({ model, contents: prompt, config });
    res.json({ text: response.text, candidates: response.candidates });
  } catch (error: any) {
    console.error("Gemini Proxy Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- PERSISTENCE ROUTES ---
app.get('/api/user/notebook', authenticateToken, async (req: any, res) => {
  const notebook = await Notebook.findOne({ userId: req.user.id } as any);
  res.json(notebook?.folders || []);
});

app.post('/api/user/notebook', authenticateToken, async (req: any, res) => {
  await Notebook.findOneAndUpdate(
    { userId: req.user.id } as any,
    { folders: req.body.folders } as any,
    { upsert: true } as any
  );
  res.json({ success: true });
});

app.get('/api/chat/:subject', authenticateToken, async (req: any, res) => {
  const chat = await Chat.findOne({ userId: req.user.id, subject: req.params.subject } as any);
  res.json(chat?.messages || []);
});

app.post('/api/chat/:subject', authenticateToken, async (req: any, res) => {
  await Chat.findOneAndUpdate(
    { userId: req.user.id, subject: req.params.subject } as any,
    { $push: { messages: req.body.message } } as any,
    { upsert: true } as any
  );
  res.json({ success: true });
});

app.post('/api/user/progress', authenticateToken, async (req: any, res) => {
  const user = await User.findOneAndUpdate(
    { id: req.user.id } as any,
    { progress: req.body.progress, points: req.body.points } as any,
    { new: true } as any
  );
  if (!user) return res.sendStatus(404);
  res.json(user);
});

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '../dist')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduSphere Secure Backend running on port ${PORT}`);
  });
};

startServer();
