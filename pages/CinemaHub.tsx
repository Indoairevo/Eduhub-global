
import React, { useState, useEffect } from 'react';
import { Search, Youtube, Menu, Home, Compass, PlaySquare, Clock, ThumbsUp, Share2, MoreVertical, Bell, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    channel: string;
    views: string;
    time: string;
}

export const CinemaHub: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Initial load: Fetch trending educational content
    useEffect(() => {
        handleSearch("Top educational lectures 2025");
    }, []);

    const handleSearch = async (query: string) => {
        const finalQuery = query || searchQuery;
        if (!finalQuery.trim()) return;
        
        setLoading(true);
        setActiveVideoId(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Search YouTube for: "${finalQuery}". List exactly 12 relevant video titles and their YouTube Video IDs. Return ONLY a valid JSON array of objects with keys: id, title, channel, views, time. Example: {"id": "dQw4w9WgXcQ", "title": "Example Video", "channel": "Learn Academy", "views": "1.2M", "time": "2 days ago"}`,
                config: { 
                    responseMimeType: "application/json",
                    tools: [{ googleSearch: {} }] 
                }
            });

            const data = JSON.parse(response.text || "[]");
            const processed = data.map((v: any) => ({
                ...v,
                thumbnail: `https://img.youtube.com/vi/${v.id}/maxresdefault.jpg`
            }));
            setVideos(processed);
        } catch (error) {
            console.error("Search failed:", error);
            // Fallback mock if AI fails
            setVideos([
                { id: 'dQw4w9WgXcQ', title: 'The Future of AI in 2025', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg', channel: 'Tech Guru', views: '1M', time: '1 day ago' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in duration-300 overflow-hidden">
            {/* YouTube Navigation Bar */}
            <nav className="h-14 px-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <Menu className="w-5 h-5 text-slate-600" />
                    </button>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => window.location.reload()}>
                        <div className="bg-red-600 p-1 rounded-lg">
                            <Youtube className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tighter flex items-center">
                            EduTube<span className="text-[10px] text-slate-400 ml-1 font-black uppercase">PRO</span>
                        </span>
                    </div>
                </div>

                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}
                    className="flex-1 max-w-[720px] flex items-center ml-10"
                >
                    <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-l-full px-4 py-1.5 focus-within:border-blue-500 transition-all">
                        <Search className="w-4 h-4 text-slate-400 mr-3" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search YouTube inside EduSphere..."
                            className="w-full bg-transparent outline-none text-sm font-medium"
                        />
                    </div>
                    <button type="submit" className="bg-slate-50 border border-l-0 border-slate-200 px-5 py-1.5 rounded-r-full hover:bg-slate-100 transition-colors">
                        <Search className="w-5 h-5 text-slate-600" />
                    </button>
                    <button type="button" className="ml-4 p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                    </button>
                </form>

                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full"><Bell className="w-5 h-5 text-slate-600" /></button>
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold ml-2 cursor-pointer">
                        U
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-60' : 'w-20'} border-r border-slate-100 flex flex-col bg-white transition-all duration-300 hidden md:flex`}>
                    <div className="p-3 space-y-1">
                        <SidebarItem icon={<Home className="w-5 h-5" />} label="Home" active sidebarOpen={sidebarOpen} />
                        <SidebarItem icon={<Compass className="w-5 h-5" />} label="Explore" sidebarOpen={sidebarOpen} />
                        <SidebarItem icon={<PlaySquare className="w-5 h-5" />} label="Library" sidebarOpen={sidebarOpen} />
                    </div>
                    <div className="p-3 border-t border-slate-100 space-y-1 mt-2">
                        <SidebarItem icon={<Clock className="w-5 h-5" />} label="History" sidebarOpen={sidebarOpen} />
                        <SidebarItem icon={<ThumbsUp className="w-5 h-5" />} label="Liked Videos" sidebarOpen={sidebarOpen} />
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-6 custom-scrollbar">
                    {activeVideoId ? (
                        /* PLAYER VIEW */
                        <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex-1">
                                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                                        title="YouTube video player" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                        allowFullScreen
                                    />
                                </div>
                                <div className="mt-4 space-y-4">
                                    <h1 className="text-xl font-black text-slate-900">{videos.find(v => v.id === activeVideoId)?.title}</h1>
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200" />
                                            <div>
                                                <p className="font-bold text-sm">{videos.find(v => v.id === activeVideoId)?.channel}</p>
                                                <p className="text-xs text-slate-400 font-medium">Subscribers Unlocked</p>
                                            </div>
                                            <button className="bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-bold ml-4">Subscribe</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200"><ThumbsUp className="w-4 h-4" /> Like</button>
                                            <button className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-200"><Share2 className="w-4 h-4" /> Share</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:w-96 space-y-4">
                                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest px-2">Related Videos</h3>
                                {videos.filter(v => v.id !== activeVideoId).map(v => (
                                    <div 
                                        key={v.id} 
                                        onClick={() => setActiveVideoId(v.id)}
                                        className="flex gap-3 cursor-pointer group"
                                    >
                                        <div className="w-40 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                            <img src={v.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug">{v.title}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold">{v.channel}</p>
                                            <p className="text-[10px] text-slate-400">{v.views} views • {v.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* GRID VIEW */
                        <div className="max-w-[1600px] mx-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-40 gap-6">
                                    <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Establishing Live Stream Connection...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-10">
                                    {videos.map((v) => (
                                        <div 
                                            key={v.id} 
                                            onClick={() => setActiveVideoId(v.id)}
                                            className="flex flex-col gap-3 cursor-pointer group"
                                        >
                                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 relative">
                                                <img src={v.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={v.title} />
                                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">12:45</div>
                                            </div>
                                            <div className="flex gap-3 px-1">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex-shrink-0 mt-1 flex items-center justify-center text-[10px] font-black uppercase text-slate-400 border border-slate-200">
                                                    {v.channel.charAt(0)}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <h3 className="font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">{v.title}</h3>
                                                    <div>
                                                        <p className="text-xs text-slate-500 font-medium hover:text-slate-900">{v.channel}</p>
                                                        <p className="text-xs text-slate-400">{v.views} views • {v.time}</p>
                                                    </div>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4 text-slate-400" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

const SidebarItem: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, sidebarOpen: boolean }> = ({ icon, label, active, sidebarOpen }) => (
    <div className={`
        flex items-center gap-6 p-3 rounded-xl cursor-pointer transition-all
        ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
        ${!sidebarOpen ? 'justify-center' : ''}
    `}>
        <div className={active ? 'text-red-600' : ''}>{icon}</div>
        {sidebarOpen && <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>}
    </div>
);
