import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../common/components/Sidebar';

const MainLayout = () => {
  return (
    // Fixed height of 100vh prevents the whole window from scrolling
    <div className="h-screen w-screen bg-[#020202] text-white flex overflow-hidden font-sans relative">
      
      {/* 🌌 PERSISTENT SPACE BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
      </div>

      {/* 📟 SIDE NAVIGATION BAR - Fixed width, no shrink */}
      <aside className="h-full flex-shrink-0 z-50">
        <Sidebar />
      </aside>

      {/* 🚀 MAIN MISSION CONTROL AREA */}
      <main className="flex-1 min-w-0 h-full relative z-10 flex flex-col overflow-hidden">
        
        {/* 🛰️ TOP STATUS BAR */}
        <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase">System: Operational</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
              UPLINK: <span className="text-white">98.4%</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-mono text-gray-500">
             <span className="hidden md:inline uppercase tracking-widest">Scanning sector: <span className="text-red-500 italic">Alpha-9</span></span>
             <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
             <span className="text-white bg-white/5 px-2 py-1 border border-white/10 italic">UTC 14:22:09</span>
          </div>
        </header>

        {/* 🎞️ DYNAMIC PAGE CONTENT - This area scrolls */}
        <section className="flex-1 overflow-y-auto relative custom-scrollbar bg-black/20">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-red-600/20 animate-scan pointer-events-none z-50" />
          
          <motion.div
            key={window.location.pathname} // Forces animation re-trigger on route change
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-8 min-h-full"
          >
            <Outlet /> 
          </motion.div>
        </section>

      </main>

      {/* GLOBAL HUD ELEMENTS */}
      <div className="fixed bottom-4 right-4 z-50 pointer-events-none opacity-30">
        <p className="text-[8px] font-mono text-red-500 uppercase tracking-[0.5em] origin-bottom-right -rotate-90">
          Cosmic Watch // v1.0.4
        </p>
      </div>
    </div>
  );
};

export default MainLayout;