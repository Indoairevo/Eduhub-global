
import React, { useState } from 'react';
import { useAppContext } from '../App';
import { searchPlaces } from '../services/geminiService';
import { Place } from '../types';

export const GeoQuest: React.FC = () => {
  const { language } = useAppContext();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [activePlace, setActivePlace] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setPlaces([]);
    setResultText('');

    try {
        const res = await searchPlaces(query, language);
        if (res) {
            setResultText(res.text);
            setPlaces(res.places);
            if (res.places.length > 0) setActivePlace(res.places[0].title);
        }
    } catch (err) {
        setResultText("Location details unavailable.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col" dir="ltr" style={{ textAlign: 'left' }}>
      <div className="border-b border-slate-200 pb-6 flex-shrink-0">
        <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="text-4xl">🌍</span> Geography Mastery
        </h2>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
         <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search site (e.g. Red Fort, Hawa Mahal)..." 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold" 
                    style={{ direction: 'ltr', textAlign: 'left' }}
                />
                <span className="absolute left-4 top-4 text-2xl">🔍</span>
            </form>

            {loading ? (
                <div className="flex flex-col items-center justify-center flex-1 py-20">
                    <div className="text-7xl animate-bounce">🔭</div>
                    <p className="text-slate-500 font-black mt-4 animate-pulse uppercase text-xs">Locating Data Coordinates...</p>
                </div>
            ) : resultText ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md">
                    <h3 className="font-black text-slate-400 mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Site Intelligence
                    </h3>
                    <div 
                        className="prose prose-emerald max-w-none text-slate-800 leading-relaxed whitespace-pre-line text-lg font-medium"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                    >
                        {resultText}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-100 rounded-[3rem]">
                    <div className="text-8xl mb-4 opacity-10">🗺️</div>
                    <p className="font-black uppercase tracking-widest text-sm">Enter a location to explore history</p>
                </div>
            )}
         </div>

         <div className="lg:w-[400px] flex-shrink-0 flex flex-col gap-4 overflow-hidden">
             <div className="w-full h-80 bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden relative">
                 {activePlace ? (
                     <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(activePlace)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} 
                        className="w-full h-full grayscale-[20%]"
                    />
                 ) : <div className="w-full h-full flex items-center justify-center text-slate-400 font-black uppercase text-xs bg-slate-50">Map Preview Ready</div>}
             </div>
             {places.length > 0 && (
                 <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 p-6 overflow-y-auto space-y-3">
                     <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-widest mb-4">Nearby Highlights</h3>
                     {places.map((p, idx) => (
                         <div 
                            key={idx} 
                            onClick={() => setActivePlace(p.title)} 
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${activePlace === p.title ? 'bg-emerald-50 border-emerald-500 scale-[1.02]' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                         >
                             <h4 className="font-black text-slate-800 text-sm mb-1">{p.title}</h4>
                             <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">📍 View on Map</p>
                         </div>
                     ))}
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};
