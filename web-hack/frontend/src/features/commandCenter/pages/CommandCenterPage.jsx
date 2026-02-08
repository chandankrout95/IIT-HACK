import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Radar, Zap, Orbit, Activity, Calendar, Search, RefreshCw, ChevronRight } from 'lucide-react';
import { setAsteroids, setLoading, setTargetDate } from '../../../redux/slices/nasaSlice';
import { calculateRiskScore, getStatus } from "../../../utils/riskEngine";
import AsteroidGraphModal from '../components/AsteroidGraphModal';

const CommandCenterPage = () => {
  const dispatch = useDispatch();
  const { asteroids, loading, selectedDate } = useSelector((state) => state.nasa);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNeo, setSelectedNeo] = useState(null);

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
    fetchNASAData(selectedDate);
  }, [selectedDate, fetchNASAData]);

  const filteredAsteroids = asteroids.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#020202] text-[#e0e0e0] font-mono p-8">
      {/* 📡 HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-500 mb-1">
            <Radar size={18} className="animate-pulse" />
            <span className="text-[12px] uppercase tracking-[0.4em] font-bold">Tactical Operations Center</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Asteroid <span className="text-cyan-600">Calendar</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => dispatch(setTargetDate(e.target.value))}
            className="bg-white/5 border border-white/10 px-4 py-3 text-sm focus:border-cyan-500 outline-none uppercase font-bold text-white cursor-pointer"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME/ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 pl-10 pr-4 py-3 text-sm focus:border-cyan-500 outline-none font-bold"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAsteroids.map((neo) => (
            <AsteroidCard 
              key={neo.id} 
              neo={neo} 
              onOpenTelemetry={() => setSelectedNeo(neo)} 
            />
          ))}
        </div>
      )}

      {/* 📊 TELEMETRY MODAL - Rendered at root level of page for centering */}
      {selectedNeo && (
        <AsteroidGraphModal
          neo={selectedNeo} 
          onClose={() => setSelectedNeo(null)} 
        />
      )}
    </div>
  );
};

const AsteroidCard = ({ neo, onOpenTelemetry }) => {
  const isHazardous = neo.is_potentially_hazardous_asteroid;
  const status = neo.status;
  const risk = neo.calculatedScore;

  return (
    <div className={`relative bg-white/5 border ${isHazardous ? 'border-red-900/50 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'border-white/10'} p-5 group hover:bg-white/10 transition-all duration-300`}>
      <div className={`absolute top-0 right-0 px-4 py-1.5 text-[12px] font-black italic uppercase tracking-tighter ${status.bg} ${status.color} border-l border-b border-white/10 z-10`}>
        Risk: {risk}%
      </div>

      <div className="mb-6 pt-6 text-white">
        <span className="text-[11px] text-gray-500 uppercase font-bold tracking-widest block mb-1">Target ID: {neo.id}</span>
        <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-cyan-400 transition-colors truncate">
          {neo.name.replace('(', '').replace(')', '')}
        </h3>
      </div>

      <div className="space-y-2 mb-6 text-[13px]">
        <div className="flex justify-between border-b border-white/5 pb-1">
           <span className="text-gray-500 uppercase font-bold">Velocity</span>
           <span className="text-white font-bold">{parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour).toLocaleString()} KM/H</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-1">
           <span className="text-gray-500 uppercase font-bold">Proximity</span>
           <span className="text-white font-bold">{parseFloat(neo.close_approach_data[0].miss_distance.kilometers).toLocaleString()} KM</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-black px-3 py-1 uppercase ${isHazardous ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'}`}>
          {isHazardous ? 'Hazardous' : 'Secure'}
        </span>
        
        <button 
          onClick={onOpenTelemetry} 
          className="text-[11px] uppercase font-black tracking-[0.2em] text-cyan-500 hover:text-white flex items-center gap-2 transition-all group/btn"
        >
          Telemetry <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default CommandCenterPage;