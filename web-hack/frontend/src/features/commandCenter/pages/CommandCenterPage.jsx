import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Radar, ShieldAlert, Zap, Globe, Orbit, Activity, Calendar, Search, RefreshCw } from 'lucide-react';
import { calculateRiskScore, getStatus } from "../../../utils/riskEngine";

const CommandCenterPage = () => {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNASAData = useCallback(async (date) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO`
      );
      
      const dailyData = res.data.near_earth_objects[date] || [];
      
      // Map data to include risk scores immediately
      const analyzed = dailyData.map(neo => ({
        ...neo,
        calculatedScore: calculateRiskScore(neo),
        status: getStatus(calculateRiskScore(neo))
      }));

      setAsteroids(analyzed);
    } catch (err) {
      console.error("NASA_UPLINK_ERROR:", err);
      setAsteroids([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNASAData(targetDate);
  }, [targetDate, fetchNASAData]);

  const filteredAsteroids = asteroids.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#020202] text-[#e0e0e0] font-mono p-8">
      {/* 📡 SYSTEM HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 mb-1">
            <Radar size={16} className="animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.4em]">Tactical Operations Center</span>
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic">
            Command <span className="text-cyan-600">Center</span>
          </h1>
        </div>

        {/* 🛠️ CONTROLS SECTION */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          {/* Date Input */}
          <div className="relative flex-1 lg:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={16} />
            <input 
              type="date" 
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-xs focus:border-cyan-500 outline-none transition-all w-full uppercase"
            />
          </div>

          {/* Search Input */}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME/ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 pl-10 pr-4 py-2 text-xs focus:border-cyan-500 outline-none transition-all w-full"
            />
          </div>

          <button 
            onClick={() => fetchNASAData(targetDate)}
            className="p-2 bg-cyan-600 hover:bg-white hover:text-black transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Orbit className="animate-spin text-cyan-600" size={64} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] animate-pulse text-cyan-500">Scanning Temporal Sector: {targetDate}</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
              Showing {filteredAsteroids.length} Objects for <span className="text-white">{targetDate}</span>
            </p>
          </div>

          {filteredAsteroids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAsteroids.map((neo) => (
                <AsteroidCard key={neo.id} neo={neo} />
              ))}
            </div>
          ) : (
            <div className="h-64 border border-dashed border-white/10 flex items-center justify-center">
              <p className="text-gray-600 uppercase tracking-[0.5em] text-xs">No Objects Detected in this Perimeter</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const AsteroidCard = ({ neo }) => {
  const isHazardous = neo.is_potentially_hazardous_asteroid;
  const velocity = parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString();
  const distance = parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString();
  const diameter = neo.estimated_diameter.meters.estimated_diameter_max.toFixed(2);
  const risk = neo.calculatedScore;
  const status = neo.status;

  return (
    <div className={`relative bg-white/5 border ${isHazardous ? 'border-red-900/50' : 'border-white/10'} p-5 group hover:bg-white/10 transition-all duration-300 overflow-hidden`}>
      {/* ⚠️ RISK HEADER */}
      <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black italic uppercase tracking-tighter ${status.bg} ${status.color} border-l border-b border-white/10 z-10`}>
        Risk: {risk}%
      </div>

      <div className="flex justify-between items-start mb-6 pt-4">
        <div>
          <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest block mb-1">ID: {neo.id}</span>
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
            {neo.name.replace('(', '').replace(')', '')}
          </h3>
        </div>
        {isHazardous && <ShieldAlert className="text-red-500 animate-pulse" size={18} />}
      </div>

      <div className="space-y-3 mb-6">
        <DataRow label="Velocity" value={`${velocity} km/h`} icon={<Zap size={10} className="text-yellow-500" />} />
        <DataRow label="Miss Distance" value={`${distance} km`} icon={<Activity size={10} className="text-cyan-500" />} />
        <DataRow label="Diameter" value={`${diameter} m`} icon={<Orbit size={10} className="text-purple-500" />} />
      </div>

      {/* Visual Risk Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
        <div 
          className={`h-full transition-all duration-1000 ${risk > 60 ? 'bg-red-500' : 'bg-cyan-500'}`} 
          style={{ width: `${risk}%` }} 
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-[8px] font-bold px-2 py-0.5 uppercase ${isHazardous ? 'bg-red-600 text-black' : 'bg-white/10 text-gray-400'}`}>
          {status.label}
        </span>
        <button className="text-[9px] uppercase font-black tracking-widest text-white/40 hover:text-cyan-400 flex items-center gap-1 transition-colors">
          Telemetry Details <ChevronRight size={12} />
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
    <div className="text-[11px] font-bold text-white">{value}</div>
  </div>
);

const ChevronRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default CommandCenterPage;