import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import { X, Database, Orbit, Loader2 } from "lucide-react";

const TelemetryModal = ({ isOpen, onClose, onSelect }) => {
  // 🛰️ Corrected to match your slice: state.asteroid.watchlist
  const { watchlist } = useSelector((state) => state.asteroid || { watchlist: [] });

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setIsSearching(true);
    try {
      const res = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/search?name=${search}&api_key=DEMO_KEY`
      );
      // NASA API returns data in near_earth_objects
      setResults(res.data.near_earth_objects || []);
    } catch (err) {
      console.error("SEARCH_ERROR", err);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#050505] border border-cyan-500/30 w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] font-mono"
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-cyan-950/20">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry Uplink</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white/5 flex gap-2">
          <input 
            type="text"
            placeholder="SCAN BY NAME (e.g. Apophis)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-black border border-white/10 px-3 py-2 text-xs text-cyan-400 outline-none focus:border-cyan-500 uppercase tracking-widest"
          />
          <button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="bg-cyan-600 px-4 py-2 text-[10px] font-bold text-black uppercase hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 size={12} className="animate-spin" /> : "Scan"}
          </button>
        </div>

        {/* List Area */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          <div className="flex justify-between items-center px-2 py-2">
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
              {results.length > 0 ? "Search Results" : "Tactical Watchlist"}
            </p>
            {results.length > 0 && (
                <button 
                  onClick={() => { setResults([]); setSearch(""); }}
                  className="text-[9px] text-cyan-500 hover:text-cyan-300 uppercase underline"
                >
                    Show Watchlist
                </button>
            )}
          </div>
          
          {/* Render List */}
          {(results.length > 0 ? results : watchlist).length > 0 ? (
            (results.length > 0 ? results : watchlist).map((neo) => (
              <div 
                // Using neoReferenceId from your slice, fallback to id for API results
                key={neo.neoReferenceId || neo.id} 
                onClick={() => onSelect(neo)}
                className="group flex items-center justify-between p-3 bg-white/5 border border-transparent hover:border-cyan-500/50 hover:bg-cyan-500/10 cursor-pointer transition-all rounded-sm"
              >
                <div className="flex items-center gap-3">
                  <Orbit size={14} className="text-gray-500 group-hover:text-cyan-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-tighter">
                      {neo.name}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">
                      REF: {neo.neoReferenceId || neo.id}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] text-cyan-600 font-black tracking-widest opacity-0 group-hover:opacity-100 italic transition-all">
                  LINK DATA +
                </span>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-2">
                <Orbit size={24} className="text-gray-800" />
                <p className="text-[10px] text-gray-700 uppercase italic tracking-widest">
                  No telemetry in local buffer
                </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TelemetryModal;