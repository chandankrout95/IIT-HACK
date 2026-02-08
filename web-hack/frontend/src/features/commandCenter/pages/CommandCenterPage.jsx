import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Radar, ShieldAlert, Zap, Orbit, Activity, Calendar, Search, RefreshCw } from 'lucide-react';
import { setAsteroids, setLoading, setTargetDate } from '../../../redux/slices/nasaSlice';
import { calculateRiskScore, getStatus } from "../../../utils/riskEngine";

const CommandCenterPage = () => {
  const dispatch = useDispatch();
  
  // 🛰️ Connect to Global Intelligence State
  const { asteroids, loading, selectedDate } = useSelector((state) => state.nasa);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNASAData = useCallback(async (date) => {
    try {
      dispatch(setLoading(true));
      const res = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${date}&end_date=${date}&api_key=2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO`
      );
      
      const dailyData = res.data.near_earth_objects[date] || [];
      
      const analyzed = dailyData.map(neo => ({
        ...neo,
        calculatedScore: calculateRiskScore(neo),
        status: getStatus(calculateRiskScore(neo))
      }));

      dispatch(setAsteroids(analyzed));
    } catch (err) {
      console.error("NASA_UPLINK_ERROR:", err);
      dispatch(setAsteroids([]));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    // Only fetch if we don't already have data for this date in state
    fetchNASAData(selectedDate);
  }, [selectedDate, fetchNASAData]);

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
            <Radar size={18} className="animate-pulse" />
            <span className="text-[12px] uppercase tracking-[0.4em] font-bold">Tactical Operations Center</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Asteroid <span className="text-cyan-600">Calender</span>
          </h1>
        </div>

        {/* 🛠️ CONTROLS SECTION */}
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" size={18} />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => dispatch(setTargetDate(e.target.value))}
              className="bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all w-full uppercase font-bold"
            />
          </div>

          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME/ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all w-full font-bold"
            />
          </div>

          <button 
            onClick={() => fetchNASAData(selectedDate)}
            className="p-3 bg-cyan-600 hover:bg-white hover:text-black transition-colors"
          >
            <RefreshCw size={24} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-6">
          <Orbit className="animate-spin text-cyan-600" size={80} />
          <span className="text-sm uppercase tracking-[0.5em] animate-pulse text-cyan-500 font-black">Syncing Orbital Data...</span>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-[12px] text-gray-500 uppercase tracking-widest font-bold">
              Detected: <span className="text-white text-lg ml-2">{filteredAsteroids.length} Objects</span> in Sector <span className="text-cyan-500">{selectedDate}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAsteroids.map((neo) => (
              <AsteroidCard key={neo.id} neo={neo} />
            ))}
          </div>
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
    <div className={`relative bg-white/5 border ${isHazardous ? 'border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-white/10'} p-6 group hover:bg-white/10 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 px-4 py-1.5 text-[12px] font-black italic uppercase tracking-tighter ${status.bg} ${status.color} border-l border-b border-white/10 z-10`}>
        Risk: {risk}%
      </div>

      <div className="mb-6 pt-6">
        <span className="text-[11px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Target ID: {neo.id}</span>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
          {neo.name.replace('(', '').replace(')', '')}
        </h3>
      </div>

      <div className="space-y-4 mb-8">
        <DataRow label="Velocity" value={`${velocity} km/h`} icon={<Zap size={14} className="text-yellow-500" />} />
        <DataRow label="Miss Distance" value={`${distance} km`} icon={<Activity size={14} className="text-cyan-500" />} />
        <DataRow label="Diameter" value={`${diameter} m`} icon={<Orbit size={14} className="text-purple-500" />} />
      </div>

      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-6">
        <div className={`h-full transition-all duration-1000 ${risk > 60 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${risk}%` }} />
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-[11px] font-black px-3 py-1 uppercase rounded-sm ${isHazardous ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'}`}>
          {status.label}
        </span>
        <button className="text-[12px] uppercase font-black tracking-widest text-cyan-500 hover:text-white flex items-center gap-2 transition-colors">
          Telemetry <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

const DataRow = ({ label, value, icon }) => (
  <div className="flex items-center justify-between border-b border-white/5 pb-2">
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-[12px] text-gray-400 uppercase font-bold tracking-wider">{label}</span>
    </div>
    <span className="text-[14px] font-mono font-black text-white">{value}</span>
  </div>
);

const ChevronRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default CommandCenterPage;