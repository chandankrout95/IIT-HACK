import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity, Zap, Orbit } from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const AsteroidGraphModal = ({ neo, onClose }) => {
  // Prevent scrolling on the background when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!neo) return null;

  // Generate tactical trajectory data
  const generateTrajectoryData = () => {
    const data = [];
    const baseDist = parseFloat(neo.close_approach_data[0].miss_distance.kilometers);
    const velocity = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour);
    
    for (let i = -10; i <= 10; i++) {
      data.push({
        time: i === 0 ? "INTERCEPT" : `${i}h`,
        distance: Math.abs(baseDist + (i * (velocity / 5))), 
        velocity: velocity + (Math.random() * 500)
      });
    }
    return data;
  };

  const data = generateTrajectoryData();

  const modalContent = (
    /* 🛰️ WRAPPER: Fixed inset-0 and z-[9999] ensures it covers the Sidebar */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
      
      {/* 🌑 BACKDROP CLICKS */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
        onClick={onClose} 
      />

      {/* 📊 MODAL CONTAINER */}
      <div className="relative bg-[#050505] border border-cyan-500/40 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(6,182,212,0.2)] p-6 md:p-10 z-10">
        
        {/* CLOSE CONTROL */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors p-2"
        >
          <X size={28} />
        </button>

        {/* HEADER */}
        <div className="mb-8 border-l-4 border-cyan-500 pl-6">
          <div className="flex items-center gap-2 text-cyan-500 mb-1">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-cyan-400">Telemetry Analysis Uplink</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
            {neo.name.replace('(', '').replace(')', '')} 
            <span className="text-gray-700 ml-4 text-lg font-normal block md:inline">// ID: {neo.id}</span>
          </h2>
        </div>

        {/* GRAPH AREA */}
        <div className="h-[300px] md:h-[400px] w-full bg-white/5 border border-white/5 p-4 mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#444" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                fontFamily="monospace"
              />
              <YAxis hide domain={['dataMin - 500000', 'dataMax + 500000']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#000', 
                  border: '1px solid #0891b2', 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  color: '#fff' 
                }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area 
                type="monotone" 
                dataKey="distance" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorDist)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat 
            label="Proximity" 
            value={parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString() + ' KM'} 
            icon={<Orbit size={14} className="text-cyan-500" />}
          />
          <QuickStat 
            label="Rel Velocity" 
            value={parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString() + ' KM/H'} 
            icon={<Zap size={14} className="text-yellow-500" />}
          />
          <QuickStat 
            label="Est Diameter" 
            value={neo.estimated_diameter.meters.estimated_diameter_max.toFixed(2) + ' M'} 
          />
          <QuickStat 
             label="Hazard Status" 
             value={neo.is_potentially_hazardous_asteroid ? 'HAZARDOUS' : 'SECURE'} 
             color={neo.is_potentially_hazardous_asteroid ? 'text-red-500' : 'text-green-500'} 
          />
        </div>
      </div>
    </div>
  );

  // 🛰️ Teleport this component to the document body to escape the Sidebar's layout
  return createPortal(modalContent, document.body);
};

const QuickStat = ({ label, value, color = "text-white", icon }) => (
  <div className="bg-white/5 p-4 border border-white/5 hover:border-cyan-500/30 transition-all group">
    <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1 font-bold group-hover:text-cyan-500 transition-colors">
      {label}
    </p>
    <div className={`text-sm font-black font-mono flex items-center gap-2 ${color}`}>
      {icon} {value}
    </div>
  </div>
);

export default AsteroidGraphModal;