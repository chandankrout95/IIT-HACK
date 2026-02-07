import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, ShieldAlert, Zap, Globe, Orbit, Activity } from 'lucide-react';

const CommandCenterPage = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNASAData = async () => {
      try {
        setLoading(true);
        // Using DEMO_KEY - Replace with your own key from api.nasa.gov
        const today = new Date().toISOString().split('T')[0];
        const res = await axios.get(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO`
        );
        
        // Extracting objects from the current date key
        const dailyData = res.data.near_earth_objects[today];
        setAsteroids(dailyData);
      } catch (err) {
        console.error("NASA_UPLINK_ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNASAData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020202] text-[#e0e0e0] font-mono p-8">
      {/* 📡 SYSTEM HEADER */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 mb-1">
            <Radar size={16} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em]">Live Deep Space Feed</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Command <span className="text-cyan-600">Center</span>
          </h1>
        </div>
        
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Global Defense Status</p>
          <p className="text-green-500 font-bold text-sm tracking-widest uppercase">Nominal / Secure</p>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <Orbit className="animate-spin text-cyan-600" size={48} />
          <span className="text-xs uppercase tracking-[0.3em] animate-pulse">Establishing Satellite Link...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {asteroids.map((neo) => (
            <AsteroidCard key={neo.id} neo={neo} />
          ))}
        </div>
      )}
    </div>
  );
};

// 🛰️ TACTICAL CARD COMPONENT
const AsteroidCard = ({ neo }) => {
  const isHazardous = neo.is_potentially_hazardous_asteroid;
  const velocity = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString();
  const distance = parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString();
  const diameter = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(2);

  return (
    <div className={`relative bg-white/5 border ${isHazardous ? 'border-red-900/50' : 'border-white/10'} p-5 group hover:bg-white/10 transition-all duration-300 overflow-hidden`}>
      {/* Hazardous Glow Effect */}
      {isHazardous && <div className="absolute -top-10 -right-10 w-20 h-20 bg-red-600/20 blur-3xl" />}

      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Object Ref: {neo.id}</span>
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
            {neo.name.replace('(', '').replace(')', '')}
          </h3>
        </div>
        {isHazardous ? (
          <ShieldAlert className="text-red-500 animate-pulse" size={20} />
        ) : (
          <Globe className="text-cyan-800" size={20} />
        )}
      </div>

      <div className="space-y-3 mb-6">
        <DataRow label="Velocity" value={`${velocity} km/h`} icon={<Zap size={10} />} />
        <DataRow label="Earth Miss" value={`${distance} km`} icon={<Activity size={10} />} />
        <DataRow label="Est. Size" value={`${diameter} m`} icon={<Orbit size={10} />} />
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-between items-center">
        <span className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-tighter ${isHazardous ? 'bg-red-600 text-black' : 'bg-white/10 text-gray-400'}`}>
          {isHazardous ? 'Hazard Alert' : 'Tracking'}
        </span>
        <button className="text-[10px] uppercase font-black tracking-widest text-cyan-500 hover:text-white transition-colors">
          View Intel →
        </button>
      </div>
    </div>
  );
};

const DataRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-1">
    <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-wider">
      {icon} {label}
    </div>
    <div className="text-xs font-bold text-white">{value}</div>
  </div>
);

export default CommandCenterPage;