import React, { useState, useRef, useEffect } from 'react';
import { Bell, Zap, ShieldAlert, Radio, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // 🛰️ Real-time state
  const notificationRef = useRef(null);
  
  const [notifications] = useState([
    { id: 1, type: 'alert', text: 'New NEO detected in Sector Alpha', time: '2m ago' },
    { id: 2, type: 'status', text: 'Telemetry Uplink Stabilized', time: '14m ago' },
    { id: 3, type: 'warning', text: 'Radiation levels rising in Sub-sector 4', time: '1h ago' },
  ]);

  // 🛰️ REAL-TIME IST CLOCK LOGIC
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date to IST string
  const formatIST = (date) => {
    return date.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // 🛰️ HANDLE CLICK OUTSIDE (Already implemented)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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
        
        {/* <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 tracking-widest uppercase">
          <Radio size={12} className="text-cyan-500 animate-pulse" />
          UPLINK: <span className="text-white">98.4%</span>
        </div> */}
      </div>

      {/* RIGHT: NOTIFICATIONS & CLOCK */}
      <div className="flex items-center gap-6 text-[10px] font-mono text-gray-500">
        <div className="hidden md:flex items-center gap-2 uppercase tracking-widest">
          <Zap size={12} className="text-yellow-500" />
          Scanning sector: <span className="text-red-500 italic">Solar system</span>
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

        {/* 🔔 NOTIFICATION CENTER */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 transition-all rounded-sm ${showNotifications ? 'text-cyan-400 bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-black" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute right-0 mt-4 w-72 bg-[#1A1A1A] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden"
              >
                <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-cyan-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Event Log</span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full font-bold">
                    {notifications.length} ACTIVE
                  </span>
                </div>
                
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-[#161616]">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-all group relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <p className="text-[11px] text-gray-300 group-hover:text-white leading-relaxed mb-1">{n.text}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] text-gray-600 uppercase font-mono">{n.time}</span>
                        <ShieldAlert size={10} className="text-gray-700 group-hover:text-cyan-800 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-2.5 text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white hover:bg-red-900/20 transition-all border-t border-white/5">
                  Clear Data Archive
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🛰️ UPDATED IST CLOCK */}
        <div className="flex items-center">
           <span className="text-white bg-white/5 px-3 py-1.5 border border-white/10 italic font-bold tabular-nums">
            IST {formatIST(currentTime)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default StatusBar;