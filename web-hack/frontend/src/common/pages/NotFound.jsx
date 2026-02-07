import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Terminal, Cpu, WifiOff } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="relative h-screen w-screen bg-[#020202] flex flex-col items-center justify-center overflow-hidden font-mono text-red-600">
      
      {/* 1. THE TERMINAL GRID LAYER */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* 2. THE CRT SCANLINE OVERLAY */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
      <div className="absolute inset-0 z-50 pointer-events-none animate-scan opacity-20 bg-gradient-to-b from-transparent via-red-500/10 to-transparent" />

      {/* 3. CENTER ERROR CONTENT */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex flex-col items-center text-center p-12"
      >
        {/* MASSIVE BACKGROUND TEXT */}
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <span className="text-[30vw] font-black opacity-[0.03] select-none italic tracking-tighter">
            VOID
          </span>
        </div>

        <motion.div 
          animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
          transition={{ repeat: Infinity, duration: 0.1 }}
          className="mb-6"
        >
          <AlertTriangle size={80} strokeWidth={1} />
        </motion.div>

        <h1 className="text-6xl font-black uppercase tracking-[0.2em] italic mb-4">
          Error 404
        </h1>
        
        <div className="space-y-2 max-w-xl">
          <p className="text-sm uppercase tracking-[0.4em] font-bold">
            Sector_Not_Found // Connection_Lost
          </p>
          <p className="text-[10px] opacity-60 uppercase tracking-widest leading-relaxed">
            The requested navigational coordinates have been purged from the active star-chart. 
            The current sector is currently outside of controlled space.
          </p>
        </div>

        {/* LIVE SYSTEM LOGS (FULL PAGE DECOR) */}
        <div className="absolute bottom-10 left-10 text-left space-y-1 hidden md:block opacity-40">
           <p className="text-[9px] uppercase tracking-tighter flex gap-2"><Cpu size={10}/> CPU_STATE: IDLE</p>
           <p className="text-[9px] uppercase tracking-tighter flex gap-2"><WifiOff size={10}/> COMM_LINK: NULL</p>
           <p className="text-[9px] uppercase tracking-tighter text-white">0x000404: ADDR_UNREACHABLE</p>
        </div>

        <div className="absolute top-10 right-10 text-right space-y-1 hidden md:block opacity-40">
           <p className="text-[9px] uppercase tracking-tighter">Lat: 00.0000</p>
           <p className="text-[9px] uppercase tracking-tighter">Long: 00.0000</p>
           <p className="text-[9px] uppercase tracking-tighter text-white animate-pulse">Scanning Sector...</p>
        </div>
      </motion.div>

      {/* 4. FOOTER STATUS BAR */}
      <div className="absolute bottom-0 w-full p-4 border-t border-red-900/30 flex justify-between items-center px-10 bg-red-950/5">
        <div className="flex gap-6">
          <span className="text-[9px] uppercase tracking-widest font-black">CosmicWatch OS v2.0</span>
          <span className="text-[9px] uppercase tracking-widest hidden sm:block">Runtime: Error_0404</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
          <span className="text-[9px] uppercase tracking-widest">Protocol: Fail</span>
        </div>
      </div>

    </div>
  );
};

export default NotFound;