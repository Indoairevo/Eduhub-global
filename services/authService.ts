import { User } from '../types';

const SESSION_KEY = 'edusphere_session';
const LOCAL_USERS_KEY = 'edusphere_local_users';
const DB_KEY = 'edusphere_db';

// Helper to simulate processing
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const registerUser = async (user: Partial<User>): Promise<User> => {
    await wait(800);
    const users: User[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    
    if (users.find(u => u.email === user.email)) {
        throw new Error("User already exists");
    }

    const newUser: User = {
        id: 'u-' + Date.now(),
        name: user.name || 'Learner',
        email: user.email!,
        password: user.password,
        educationLevel: user.educationLevel || 'General Learner',
        points: 0,
        streak: 1,
        joinedAt: new Date().toISOString(),
        badges: [],
        progress: { masteredTopics: [], totalStudyMinutes: 0, subjectStrengths: {}, recentActivity: [] },
        ...user
    } as User;

    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    
    return newUser;
};

export const loginUser = async (email: string, password?: string): Promise<User> => {
    await wait(600);
    const users: User[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        throw new Error("Invalid email or password");
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const logoutUser = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    const uStr = localStorage.getItem(SESSION_KEY);
    return uStr ? JSON.parse(uStr) : null;
};

export const syncUserProgress = async (user: User) => {
    const users: User[] = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
        users[idx] = user;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

export const getUserFolders = () => {
    const dbStr = localStorage.getItem(DB_KEY) || '{"notebooks":{}}';
    const db = JSON.parse(dbStr);
    const user = getCurrentUser();
    return user ? db.notebooks[user.id] || [] : [];
};

export const saveUserFolders = async (folders: any) => {
    const user = getCurrentUser();
    if (!user) return;
    
    const dbStr = localStorage.getItem(DB_KEY) || '{"notebooks":{}}';
    const db = JSON.parse(dbStr);
    db.notebooks[user.id] = folders;
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};
