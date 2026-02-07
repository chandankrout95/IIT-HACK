import { ShieldAlert, X, Bookmark, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // 🛰️ Added Redux hooks
import { addToWatchlist } from "../../../redux/slices/asteroidSlice"; // 🛰️ Import action
import axios from "axios";

const API = "http://localhost:5000/api/v1";

const TargetIntelPanel = ({ object, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // 🛰️ Select watchlist from Redux to check saved status locally
  const watchlist = useSelector((state) => state.asteroid?.watchlist || []);
  const saved = watchlist.some((item) => item.neoReferenceId === object?.id);

  if (!object) return null;

  const isAsteroid = !!object.realSizeMeters;

  const saveAsteroid = async () => {
    if (saved || loading) return;

    try {
      setLoading(true);
      
      const payload = {
        neoReferenceId: object.id,
        data: {
          ...object,
          riskScore: object.isHazardous ? 85 : 30,
          scannedAt: new Date().toISOString() 
        },
      };

      // 1. Save to Database
      await axios.post(`${API}/asteroids/watch`, payload, {
        withCredentials: true
      });

      // 2. 🛰️ Update Redux Store globally
      // We pass the same structure your slice expects
      dispatch(addToWatchlist({
        neoReferenceId: payload.neoReferenceId,
        ...payload.data
      }));

    } catch (err) {
      console.error("SAVE_FAIL:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-8 right-8 z-20 w-80 bg-black/90 border border-white/10 p-6 backdrop-blur-xl animate-in fade-in slide-in-from-right duration-500 shadow-2xl">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <X size={18} />
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Target Intel</p>
          <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">
            {object.name}
          </h4>
        </div>
        {object.isHazardous && <ShieldAlert className="text-red-500 animate-pulse" size={24} />}
      </div>

      <div className="space-y-4">
        {isAsteroid && (
          <>
            <Stat label="Avg Diameter" value={`${object.realSizeMeters} m`} color="text-green-400" />
            <Stat label="Velocity" value={`${object.velocity} km/s`} color="text-blue-400" />
            <Stat label="Earth Miss Dist" value={object.distToEarth} color="text-yellow-500" />
            <Stat label="Abs Magnitude" value={`${object.magnitude} H`} />
          </>
        )}
      </div>

      {isAsteroid && (
        <button
          onClick={saveAsteroid}
          disabled={saved || loading}
          className={`w-full mt-6 py-3 border text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${saved
                ? "bg-green-600/20 border-green-500 text-green-400 cursor-default"
                : loading
                ? "bg-yellow-600/20 border-yellow-500 text-yellow-400"
                : "bg-white/5 border-white/20 text-white hover:bg-white/10 active:scale-95"
            }`}
        >
          {saved ? <CheckCircle2 size={14} /> : <Bookmark size={14} />}
          {loading ? "Transmitting..." : saved ? "Archived in Vault" : "Save to Vault"}
        </button>
      )}
    </div>
  );
};

const Stat = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between border-b border-white/5 pb-2">
    <span className="text-[9px] text-gray-500 uppercase">{label}</span>
    <span className={`text-xs font-bold ${color}`}>{value}</span>
  </div>
);

export default TargetIntelPanel;