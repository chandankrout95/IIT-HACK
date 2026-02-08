import React, { useState } from 'react';
import { Bell, Zap, ShieldAlert, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopStatusBar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'alert', text: 'New NEO detected in Sector Alpha', time: '2m ago' },
    { id: 2, type: 'status', text: 'Telemetry Uplink Stabilized', time: '14m ago' },
  ]);

  return (
    <header className="h-16 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-[200]">
      {/* LEFT: SYSTEM STATUS */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-20" />
          </div>
          <span className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase">System: Operational</span>
        </div>
        
        <div className="h-4 w-[1px] bg-white/10" />
        
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
          <Radio size={12} className="text-cyan-500 animate-pulse" />
          UPLINK: <span className="text-white">98.4%</span>
        </div>
      </div>

      {/* RIGHT: NOTIFICATIONS & CLOCK */}
      <div className="flex items-center gap-6 text-[10px] font-mono text-gray-500">
        <div className="hidden md:flex items-center gap-2 uppercase tracking-widest">
          <Zap size={12} className="text-yellow-500" />
          Scanning sector: <span className="text-red-500 italic"></span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

        {/* 🔔 NOTIFICATION CENTER */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 transition-colors ${showNotifications ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-400 hover:text-white'}`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black animate-bounce" />
            )}
          </button>

          {/* DROPDOWN FEED */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-64 bg-[#080808] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500">Alert Log</span>
                  <ShieldAlert size={12} className="text-cyan-500" />
                </div>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
                      <p className="text-[11px] text-gray-300 group-hover:text-white leading-tight mb-1">{n.text}</p>
                      <span className="text-[8px] text-gray-600 uppercase">{n.time}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2 text-[8px] uppercase tracking-[0.3em] text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                  Clear Archive
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className="text-white bg-white/5 px-3 py-1.5 border border-white/10 italic font-bold">
          UTC 14:22:09
        </span>
      </div>
    </header>
  );
};

export default TopStatusBar;