import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, CheckCircle2, Circle, Plus, Trash2, Coffee, Brain } from 'lucide-react';
import { useAppContext } from '../App';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export const FocusMode: React.FC = () => {
    const { addXP } = useAppContext();
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState('');
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const MODES = {
        focus: { time: 25 * 60, label: 'Focus Time', color: 'indigo', icon: Brain },
        shortBreak: { time: 5 * 60, label: 'Short Break', color: 'emerald', icon: Coffee },
        longBreak: { time: 15 * 60, label: 'Long Break', color: 'blue', icon: Coffee },
    };

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        
        // Play sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio play failed:", e));

        if (mode === 'focus') {
            setSessionsCompleted(prev => prev + 1);
            addXP(50); // Reward XP for completing a focus session
            
            if ((sessionsCompleted + 1) % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('focus');
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(MODES[mode].time);
    };

    const switchMode = (newMode: 'focus' | 'shortBreak' | 'longBreak') => {
        setIsActive(false);
        setMode(newMode);
        setTimeLeft(MODES[newMode].time);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => {
            if (t.id === id) {
                if (!t.completed) addXP(10); // Reward XP for completing a task
                return { ...t, completed: !t.completed };
            }
            return t;
        }));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;
    const CurrentIcon = MODES[mode].icon;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl bg-${MODES[mode].color}-50 flex items-center justify-center text-${MODES[mode].color}-600`}>
                    <CurrentIcon size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Focus Mode</h1>
                    <p className="text-slate-500">Boost your productivity with the Pomodoro technique</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timer Section */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden">
                        {/* Background Progress */}
                        <div 
                            className={`absolute bottom-0 left-0 right-0 bg-${MODES[mode].color}-50 transition-all duration-1000 ease-linear -z-10`}
                            style={{ height: `${progress}%` }}
                        />

                        {/* Mode Selectors */}
                        <div className="flex gap-2 bg-slate-100/50 p-2 rounded-2xl backdrop-blur-sm mb-12 z-10">
                            {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => switchMode(m)}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        mode === m 
                                            ? `bg-white text-${MODES[m].color}-600 shadow-sm` 
                                            : 'text-slate-500 hover:bg-slate-200/50'
                                    }`}
                                >
                                    {MODES[m].label}
                                </button>
                            ))}
                        </div>

                        {/* Timer Display */}
                        <div className="text-[8rem] font-black tracking-tighter text-slate-800 leading-none mb-12 z-10 font-mono">
                            {formatTime(timeLeft)}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-6 z-10">
                            <button
                                onClick={toggleTimer}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                                    isActive ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' : `bg-${MODES[mode].color}-600 hover:bg-${MODES[mode].color}-700 shadow-${MODES[mode].color}-600/30`
                                }`}
                            >
                                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                            </button>
                            <button
                                onClick={resetTimer}
                                className="w-14 h-14 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="absolute bottom-8 flex items-center gap-2 text-slate-400 font-medium z-10">
                            <span>Sessions completed:</span>
                            <span className={`text-${MODES[mode].color}-600 font-bold text-lg`}>{sessionsCompleted}</span>
                        </div>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 h-full">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Tasks for this session</h2>
                        
                        <form onSubmit={addTask} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                                placeholder="What are you working on?"
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                type="submit"
                                disabled={!newTask.trim()}
                                className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Plus size={24} />
                            </button>
                        </form>

                        <div className="space-y-3">
                            {tasks.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <p>No tasks added yet.</p>
                                    <p className="text-sm mt-1">Add a task to stay focused!</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                                            task.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-indigo-200'
                                        }`}
                                    >
                                        <button 
                                            onClick={() => toggleTask(task.id)}
                                            className="flex items-center gap-3 flex-1 text-left"
                                        >
                                            {task.completed ? (
                                                <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                                            ) : (
                                                <Circle className="text-slate-300 shrink-0" size={24} />
                                            )}
                                            <span className={`font-medium transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                {task.text}
                                            </span>
                                        </button>
                                        <button 
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors ml-2"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
