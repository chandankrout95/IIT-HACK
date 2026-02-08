import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setWatchlist, removeFromWatchlist } from "../../../redux/slices/asteroidSlice"; 
import { 
  ShieldAlert, Database, Activity, Clock, Trash2, 
  ChevronRight, AlertTriangle, X, Check, Orbit, Zap
} from "lucide-react";

const EMPTY_WATCHLIST = [];

const TelemetryVaultPage = () => {
  const dispatch = useDispatch();
  const asteroids = useSelector((state) => state.asteroid?.watchlist || EMPTY_WATCHLIST);
  
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const fetchSavedAsteroids = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:5000/api/v1/asteroids/get-watch",
        { withCredentials: true }
      );
      // Dispatching the array of objects containing { neoReferenceId, data, addedAt }
      dispatch(setWatchlist(res.data.data || []));
    } catch (err) {
      console.error("FETCH_FAIL:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAsteroids();
  }, [dispatch]);

  const handleDelete = async (neoReferenceId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/v1/asteroids/watch/${neoReferenceId}`,
        { withCredentials: true }
      );
      dispatch(removeFromWatchlist(neoReferenceId));
      setConfirmingDelete(null);
    } catch (err) {
      console.error("DELETE_FAIL:", err.response?.data || err.message);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#020202] text-[#e0e0e0] font-mono overflow-y-auto p-12">
      {/* 📡 HEADER */}
      <div className="mb-12 border-l-4 border-red-600 pl-6">
        <div className="flex items-center gap-3 text-red-500 mb-2">
          <Database size={18} />
          <span className="text-[10px] uppercase tracking-[0.5em]">Classified Archive</span>
        </div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
          Watched <span className="text-red-600">Vault</span>
        </h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Activity className="animate-pulse text-red-600" size={32} />
          <span className="text-[10px] uppercase tracking-[0.3em] animate-pulse text-gray-500">Accessing Nodes...</span>
        </div>
      ) : asteroids.length === 0 ? (
        <div className="border border-white/5 bg-white/5 p-20 text-center uppercase text-[10px] tracking-widest text-gray-500">
          Archive Empty
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {asteroids.map((item) => (
            <div key={item.neoReferenceId} className="group relative bg-black/40 border border-white/10 p-6 backdrop-blur-md overflow-hidden">
              
              {/* ⚠️ DELETE OVERLAY */}
              {confirmingDelete === item.neoReferenceId && (
                <div className="absolute inset-0 z-10 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
                  <AlertTriangle className="text-white mb-2 animate-bounce" size={32} />
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-4">Purge {item.data?.name}?</p>
                  <div className="flex gap-4 w-full max-w-[200px]">
                    <button onClick={() => handleDelete(item.neoReferenceId)} className="flex-1 bg-white text-black py-2 text-[10px] font-bold uppercase hover:bg-gray-200 transition-colors flex items-center justify-center gap-1">
                       Confirm
                    </button>
                    <button onClick={() => setConfirmingDelete(null)} className="flex-1 border border-white/20 py-2 text-[10px] font-bold uppercase hover:bg-white/10 transition-colors">
                       Abort
                    </button>
                  </div>
                </div>
              )}

              {/* 🛰️ CARD CONTENT (Using item.data) */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[8px] bg-red-600 px-1 text-black font-bold uppercase tracking-tighter">REF: {item.neoReferenceId}</span>
                  <h2 className="text-2xl font-black italic text-white uppercase group-hover:text-red-500 transition-colors">
                    {item.data?.name || "Unknown Object"}
                  </h2>
                </div>
                {item.data?.isHazardous && <ShieldAlert className="text-red-500 animate-pulse" size={24} />}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Accessing riskScore from item.data */}
                <StatBox 
                   label="Threat Score" 
                   value={`${item.data?.riskScore || 0}%`} 
                   color={item.data?.riskScore > 50 ? 'text-red-500' : 'text-cyan-500'} 
                   icon={<Zap size={12} />}
                />
                <StatBox 
                   label="Velocity" 
                   value={`${item.data?.velocity} km/s`} 
                   icon={<Orbit size={12} />}
                />
                <StatBox 
                   label="Log Date" 
                   value={item.addedAt ? new Date(item.addedAt).toLocaleDateString() : "N/A"} 
                   icon={<Clock size={12} />} 
                />
                <StatBox 
                   label="Diameter" 
                   value={`${item.data?.realSizeMeters}m`} 
                />
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-white/5 border border-white/10 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 flex items-center justify-center gap-2 transition-all">
                  <ChevronRight size={14} /> Analyze Trajectory
                </button>
                <button 
                  onClick={() => setConfirmingDelete(item.neoReferenceId)} 
                  className="px-4 bg-red-950/20 border border-red-900/30 text-red-600 py-2 hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📑 FOOTER */}
      <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] text-gray-600 uppercase tracking-[0.3em]">
        <span>Encrypted Records: {asteroids.length}</span>
        <span>Uplink Status: Secure</span>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-gray-300", icon }) => (
  <div className="bg-white/5 p-3 border border-white/5">
    <p className="text-[8px] text-gray-500 uppercase mb-1">{label}</p>
    <div className={`text-sm font-bold flex items-center gap-2 ${color}`}>
      {icon} {value}
    </div>
  </div>
);

export default TelemetryVaultPage;