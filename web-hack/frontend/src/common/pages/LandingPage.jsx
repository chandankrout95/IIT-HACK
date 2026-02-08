import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Activity, Target, Zap, Database, Search } from 'lucide-react';
import { SpaceCanvas } from '../../common/components/SpaceCanvas'; 

// Local Assets
import databaseGif from '../../assets/images/database.gif';
import galaxyImg from '../../assets/images/galaxy.webp';
import radarGif from '../../assets/images/radar.gif';
import warningGif from '../../assets/images/warning.gif';

const LandingPage = () => {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    document.getElementById('core-features').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#020202] text-white min-h-screen font-sans selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 📡 1. HERO SECTION WITH 3D */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6">
        <SpaceCanvas /> 

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="z-10 relative"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
             <div className="w-12 h-[1px] bg-red-600" />
             <span className="text-xs font-mono tracking-[0.5em] text-red-500 uppercase">System Status: Tactical</span>
             <div className="w-12 h-[1px] bg-red-600" />
          </div>
          
          <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.8] uppercase mb-8">
            COSMIC<br/><span className="text-red-600">WATCH</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-gray-400 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase mb-12">
            Automated Neural-Weighted Risk Assessment // Planetary Defense Protocol Alpha-9
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-red-600 hover:bg-white hover:text-black text-white px-12 py-5 font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              Initialize Uplink
            </button>
            <button 
              onClick={scrollToAbout}
              className="bg-transparent border border-white/10 hover:border-red-600 text-white px-12 py-5 font-black uppercase text-xs tracking-widest transition-all"
            >
              View Mission Parameters
            </button>
          </div>
        </motion.div>
      </section>

      {/* 🛰️ 2. CORE FEATURES (STORYTELLING) */}
      <section id="core-features" className="py-32 px-10 bg-[#040404] relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-5xl font-black uppercase tracking-tighter italic">Core <span className="text-red-600">Capabilities</span></h2>
            <div className="w-24 h-1 bg-red-600 mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* FEATURE 01: REAL TIME RADAR */}
            <FeatureBlock 
              number="01"
              title="Real-Time Neural Radar"
              desc="Direct synchronization with NASA's NeoWs API. We process raw orbital vectors into human-readable tactical data every 60 seconds."
              asset={radarGif}
              isGif={true}
            />

            {/* FEATURE 02: 3D TRAJECTORY */}
            <FeatureBlock 
              number="02"
              title="Galactic Mapping"
              desc="Deep-space pathfinding and coordinate tracking. Our trajectory engine maps the void to prevent unexpected close-approach events."
              asset={galaxyImg}
              isGif={false}
              reverse
            />

            {/* FEATURE 03: THE RISK ENGINE */}
            <FeatureBlock 
              number="03"
              title="Tactical Risk Protocol"
              desc="Proprietary algorithm weighting Velocity vs. Proximity vs. Diameter. Targets exceeding safety thresholds trigger immediate system alerts."
              asset={warningGif}
              isGif={true}
            />

            {/* FEATURE 04: THE VAULT */}
            <FeatureBlock 
              number="04"
              title="Secure Target Vault"
              desc="Archive high-threat targets to your local encrypted database. Persist intelligence across sessions via the Redux Nexus."
              asset={databaseGif}
              isGif={true}
              reverse
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-10 border-t border-white/5 text-center bg-black">
          <Zap size={30} className="mx-auto mb-6 text-red-600 animate-pulse" />
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em]">
            Cosmic Watch Tactical Terminal // 2026 // Sector Alpha-9
          </p>
      </footer>
    </div>
  );
};

const FeatureBlock = ({ number, title, desc, asset, reverse }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`flex flex-col gap-8 p-8 border border-white/5 bg-white/[0.01] hover:border-red-600/30 transition-all ${reverse ? 'lg:mt-20' : ''}`}
  >
    <div className="flex justify-between items-start">
      <span className="text-red-600 font-black text-2xl italic">/{number}</span>
      <div className="w-full h-48 bg-black overflow-hidden border border-white/10 group relative">
        <img 
          src={asset} 
          alt={title} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
        />
        {/* Overlay scanning effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-600/5 to-transparent h-full w-full opacity-0 group-hover:opacity-100 pointer-events-none animate-pulse" />
      </div>
    </div>
    <div>
      <h4 className="text-2xl font-black uppercase italic mb-4 tracking-tighter">{title}</h4>
      <p className="text-gray-400 text-sm leading-relaxed font-mono">{desc}</p>
    </div>
  </motion.div>
);

export default LandingPage;