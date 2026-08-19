
import React, { useState } from 'react';
import { useAppContext } from '../App';
import { generateMindMapData } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { MindMapNode } from '../types';
import { Search, Loader2, ZoomIn, ZoomOut, Maximize, X } from 'lucide-react';

export const MindMap: React.FC = () => {
  const { language } = useAppContext();
  const [topic, setTopic] = useState('');
  const [data, setData] = useState<MindMapNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullScreen, setFullScreen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setData(null);
    setZoom(1);

    // Check DB first
    const cached = dbService.getMindMap(topic);
    if (cached) {
        setData(cached);
        setLoading(false);
        return;
    }
    
    const result = await generateMindMapData(topic, language);
    if (result) {
      dbService.saveMindMap(topic, result);
      setData(result);
    }
    setLoading(false);
  };

  const TreeNode: React.FC<{ node: MindMapNode; depth?: number }> = ({ node, depth = 0 }) => {
    return (
      <div className="flex flex-col items-center">
        <div 
           className={`
             relative z-10 px-4 py-2 rounded-xl shadow-md border-2 border-white text-center font-bold transition-transform hover:scale-105
             ${depth === 0 ? 'bg-indigo-600 text-white text-xl p-6' : 'bg-white text-slate-800 text-sm'}
           `}
           style={{ backgroundColor: node.color || (depth === 0 ? '#4f46e5' : '#ffffff'), color: depth === 0 || node.color ? 'white' : 'inherit' }}
        >
          {node.label}
        </div>
        
        {node.children && node.children.length > 0 && (
          <div className="flex pt-8 relative">
            {node.children.map((child, index) => (
               <div key={child.id || index} className="flex flex-col items-center relative px-4">
                  <div className="absolute top-0 w-px h-8 bg-slate-300 left-1/2 -translate-x-1/2" />
                  {node.children!.length > 1 && (
                      <div 
                        className={`absolute top-0 h-px bg-slate-300 w-full 
                        ${index === 0 ? 'left-1/2 w-1/2' : ''} 
                        ${index === node.children!.length - 1 ? 'w-1/2 right-1/2 left-auto' : ''}
                        ${index > 0 && index < node.children!.length - 1 ? 'w-full' : ''}
                        `} 
                      />
                  )}
                  <TreeNode node={child} depth={depth + 1} />
               </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 ${fullScreen ? 'fixed inset-0 z-50 bg-slate-50 p-6 overflow-auto' : ''}`}>
       <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
             <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
               <div className="bg-sky-100 p-2 rounded-lg text-2xl">
                 🌳
               </div>
               AI Mind Map
             </h2>
             <p className="text-slate-500">
               {language === 'hi' 
                ? 'जटिल विचारों को समझने के लिए एक ट्री मैप बनाएं।' 
                : 'Visualize any topic. Generate a structured tree map to understand complex concepts.'}
             </p>
          </div>
          {fullScreen && (
            <button onClick={() => setFullScreen(false)} className="p-2 bg-white rounded-full shadow-md hover:bg-slate-100">
              <X className="w-6 h-6" />
            </button>
          )}
       </div>

       {!fullScreen && (
         <form onSubmit={handleGenerate} className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={language === 'hi' ? 'विषय दर्ज करें...' : 'Enter a topic (e.g. Photosynthesis)...'}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <button 
              type="submit" 
              disabled={loading || !topic}
              className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
            </button>
         </form>
       )}

       <div className={`
         bg-slate-100 rounded-3xl border border-slate-200 shadow-inner overflow-hidden relative flex items-center justify-center
         ${fullScreen ? 'h-[90vh]' : 'h-[600px]'}
       `}>
          <div className="absolute bottom-4 right-4 flex gap-2 z-20">
             <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50"><ZoomOut className="w-5 h-5 text-slate-600" /></button>
             <button onClick={() => setZoom(1)} className="px-3 py-2 bg-white rounded-lg shadow-md hover:bg-slate-50 font-bold text-slate-600 text-xs">{Math.round(zoom * 100)}%</button>
             <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50"><ZoomIn className="w-5 h-5 text-slate-600" /></button>
             {!fullScreen && (
               <button onClick={() => setFullScreen(true)} className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 ml-2"><Maximize className="w-5 h-5 text-slate-600" /></button>
             )}
          </div>

          {loading ? (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                <p className="text-slate-500 font-medium">Constructing knowledge tree...</p>
             </div>
          ) : data ? (
             <div 
               className="transition-transform duration-200 ease-out origin-center p-10 min-w-max"
               style={{ transform: `scale(${zoom})` }}
             >
                <TreeNode node={data} />
             </div>
          ) : (
             <div className="text-slate-400 flex flex-col items-center">
                <div className="text-6xl mb-4 opacity-30">🕸️</div>
                <p>Enter a topic to generate a mind map</p>
             </div>
          )}
       </div>
    </div>
  );
};
