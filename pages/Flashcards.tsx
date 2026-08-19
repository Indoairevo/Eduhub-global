import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Sparkles, RefreshCw, ChevronRight, ChevronLeft, Check, X } from 'lucide-react';
import { useAppContext } from '../App';
import { getAI, getLangInstruction } from '../services/geminiService';
import { Type } from '@google/genai';

interface Flashcard {
    front: string;
    back: string;
}

export const Flashcards: React.FC = () => {
    const { language } = useAppContext();
    const [topic, setTopic] = useState('');
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [knownCards, setKnownCards] = useState<Set<number>>(new Set());

    const generateCards = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setCards([]);
        setCurrentIndex(0);
        setIsFlipped(false);
        setKnownCards(new Set());

        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 10 high-yield educational flashcards for the topic: "${topic}". ${getLangInstruction(language)}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            flashcards: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        front: { type: Type.STRING, description: "The question or concept" },
                                        back: { type: Type.STRING, description: "The answer or definition" }
                                    },
                                    required: ["front", "back"]
                                }
                            }
                        },
                        required: ["flashcards"]
                    }
                }
            });

            const text = response.text || "{}";
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);
            
            if (data && data.flashcards && data.flashcards.length > 0) {
                setCards(data.flashcards);
            } else {
                alert("Failed to generate flashcards. Please try another topic.");
            }
        } catch (error) {
            console.error(error);
            alert("Error generating flashcards.");
        } finally {
            setLoading(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1));
        }, 150);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }, 150);
    };

    const markKnown = () => {
        const newSet = new Set(knownCards);
        newSet.add(currentIndex);
        setKnownCards(newSet);
        nextCard();
    };

    const markUnknown = () => {
        const newSet = new Set(knownCards);
        newSet.delete(currentIndex);
        setKnownCards(newSet);
        nextCard();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Brain size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">AI Flashcards</h1>
                        <p className="text-slate-500">Master any topic with smart, AI-generated flashcards</p>
                    </div>
                </div>

                <div className="flex gap-4 flex-col md:flex-row">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Enter a topic (e.g., Quantum Physics, French Verbs)..."
                        className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && generateCards()}
                    />
                    <button
                        onClick={generateCards}
                        disabled={loading || !topic.trim()}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        Generate
                    </button>
                </div>
            </div>

            {cards.length > 0 && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                        <span className="text-slate-500 font-medium">
                            Card {currentIndex + 1} of {cards.length}
                        </span>
                        <span className="text-emerald-600 font-medium bg-emerald-50 px-4 py-1 rounded-full">
                            {knownCards.size} Mastered
                        </span>
                    </div>

                    <div className="relative h-96 w-full" style={{ perspective: '1000px' }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex + (isFlipped ? '-back' : '-front')}
                                initial={{ rotateX: isFlipped ? -90 : 90, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                exit={{ rotateX: isFlipped ? 90 : -90, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setIsFlipped(!isFlipped)}
                                className="absolute inset-0 w-full h-full cursor-pointer"
                                style={{ transformStyle: 'preserve-3d' }}
                            >
                                <div className={`w-full h-full rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center shadow-lg border-2 transition-colors duration-300 ${
                                    isFlipped 
                                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                                        : 'bg-white border-slate-100 text-slate-800 hover:border-indigo-200'
                                }`}>
                                    <span className={`text-sm font-bold tracking-widest uppercase mb-6 opacity-60 ${isFlipped ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        {isFlipped ? 'Answer' : 'Question'}
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-medium leading-tight">
                                        {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
                                    </h2>
                                    <p className={`absolute bottom-8 text-sm opacity-50 ${isFlipped ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        Click to flip
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={prevCard}
                            disabled={currentIndex === 0}
                            className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={markUnknown}
                            className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Needs Review"
                        >
                            <X size={28} />
                        </button>

                        <button
                            onClick={markKnown}
                            className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Mastered"
                        >
                            <Check size={28} />
                        </button>

                        <button
                            onClick={nextCard}
                            disabled={currentIndex === cards.length - 1}
                            className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
