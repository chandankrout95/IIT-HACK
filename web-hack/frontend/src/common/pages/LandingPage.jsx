import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Lock, Shield, Activity, Target } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate(); // 2. Initialize navigate

  const scrollToAbout = () => {
    document.getElementById('about-system').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#020202] text-white min-h-screen font-sans selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 1. MINIMAL NAV */}
      <nav className="flex justify-between items-center px-10 py-8 z-50 relative">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]" />
          <span className="text-2xl font-black tracking-tighter uppercase italic">Cosmic Watch</span>
        </div>
        {/* 3. Redirect to Login */}
        <button 
          onClick={() => navigate('/login')}
          className="group flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold uppercase border-b border-white/20 pb-1 hover:border-red-600 transition-all"
        >
          <Lock size={12} className="group-hover:text-red-500 transition-colors" /> Access Terminal
        </button>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative h-[85vh] flex flex-col justify-center items-center text-center px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-red-900/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] uppercase mb-8">
            PLANETARY<br/><span className="text-red-600">THREAT</span> INDEX
          </h1>
          <p className="max-w-2xl mx-auto text-gray-500 font-mono text-xs md:text-sm tracking-widest uppercase mb-12">
            Monitoring 32,000+ NEOs with sub-meter precision. 
            Automated neural-weighted risk assessment protocols.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button 
              onClick={() => navigate('/login')} // Redirect to Login
              className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-[0_10px_30px_rgba(220,38,38,0.2)]"
            >
              Initialize Radar
            </button>
            <button 
              onClick={scrollToAbout}
              className="bg-transparent border border-white/10 hover:bg-white/5 text-white px-12 py-5 font-black uppercase text-xs tracking-widest transition-all"
            >
              Read Protocols
            </button>
          </div>
        </motion.div>
      </section>

      {/* 3. ABOUT SECTION */}
      <section id="about-system" className="py-32 px-10 border-t border-white/5 bg-[#040404]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6 leading-none">
              Beyond Raw Data. <br/> <span className="text-red-600">Actionable Intelligence.</span>
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Converting complex orbital mechanics from NASA datasets into a clear, understandable Risk Score.
            </p>
            <ul className="space-y-4 text-sm font-mono text-gray-500 uppercase tracking-widest">
              <li className="flex gap-4 items-center"><span className="text-red-600">/01</span> Real-time NASA NeoWs Integration</li>
              <li className="flex gap-4 items-center"><span className="text-red-600">/02</span> Proprietary Danger Weighting</li>
              <li className="flex gap-4 items-center"><span className="text-red-600">/03</span> 3D Orbital Visualization</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
             <AboutCard icon={<Shield size={20}/>} title="Defense Ready" text="Designed for immediate identification of high-risk approachers." />
             <AboutCard icon={<Target size={20}/>} title="Precision Logic" text="Weights velocity, distance, and diameter for true threat analysis." />
             <AboutCard icon={<Activity size={20}/>} title="Live Stream" text="Updates every 10 minutes via automated Docker pipelines." />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-10 border-t border-white/5 text-center">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.5em]">
            Cosmic Watch System // 2026 // Sector Alpha-9
          </p>
      </footer>
    </div>
  );
};

const AboutCard = ({ icon, title, text }) => (
  <div className="p-6 border border-white/5 bg-white/[0.01] flex gap-6 items-start hover:border-red-900/30 transition-all">
    <div className="text-red-600 mt-1">{icon}</div>
    <div>
        <h4 className="font-bold uppercase text-xs tracking-widest mb-1">{title}</h4>
        <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
    </div>
  </div>
);

export default LandingPage;