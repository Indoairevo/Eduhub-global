
import React, { useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../App';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export const Layout: React.FC = () => {
  const { user, setUser, language, setLanguage, t } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const fixAI = async () => {
    if (window.aistudio) {
        await window.aistudio.openSelectKey();
    }
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  const isDashboardHome = location.pathname === '/dashboard';

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Top Navbar */}
      <header className="glass sticky top-0 z-50 transition-all duration-300">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <div className="flex items-center gap-4">
                {!isDashboardHome && (
                    <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100/50 rounded-full text-xl transition-all active:scale-90">
                        🔙
                    </button>
                )}
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')} role="button">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg text-lg shadow-md group-hover:scale-110 transition-transform">
                        🎓
                    </div>
                    <h1 className="font-black text-xl text-slate-900 hidden sm:block tracking-tighter group-hover:text-indigo-600 transition-colors">EduSphere<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span></h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                {/* AI Status Fixer */}
                <button 
                    onClick={fixAI}
                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-50/80 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors backdrop-blur-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    Fix AI Connection
                </button>

                {/* Language Toggle */}
                <div className="flex bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${language === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        EN
                    </button>
                    <button 
                        onClick={() => setLanguage('hi')}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${language === 'hi' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        हि
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-2 bg-indigo-50/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-indigo-100">
                    {user?.picture ? (
                        <img 
                            src={user.picture} 
                            alt={user.name} 
                            className="w-6 h-6 rounded-full shadow-sm object-cover border border-white"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                            {user?.name.charAt(0)}
                        </div>
                    )}
                    <span className="text-xs font-bold text-indigo-900">{user?.name.split(' ')[0]}</span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="hover:bg-red-50 p-2 rounded-xl transition-all text-xl"
                  title={t.logout}
                >
                  🚪
                </button>
            </div>
         </div>
      </header>

      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">
        <div className={`${location.pathname === '/dashboard/chat' ? 'w-full h-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
           <Outlet />
        </div>
      </main>
    </div>
  );
};
