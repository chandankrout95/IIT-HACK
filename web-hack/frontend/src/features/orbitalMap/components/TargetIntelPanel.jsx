
import {
  ShieldAlert,
  X,
  Bookmark,
  CheckCircle2,
  Cpu,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToWatchlist } from "../../../redux/slices/asteroidSlice";
import axios from "axios";

// 🛰️ Dynamic API detection
const API = window.location.hostname === "localhost" 
  ? "http://localhost:5000/api/v1" 
  : `${window.location.origin}/api/v1`; // Automatically uses your Render URL

const TargetIntelPanel = ({ object, onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // 🛰️ Planet AI State
  const [aiDescription, setAiDescription] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const watchlist = useSelector((state) => state.asteroid?.watchlist || []);
  const saved = watchlist.some((item) => item.neoReferenceId === object?.id);

  const isAsteroid = !!object.realSizeMeters;

  // 🛰️ EFFECT: Fetch AI Intel for Planets
  useEffect(() => {
    const fetchPlanetIntel = async () => {
      if (!object || isAsteroid) return; // Only for planets

      try {
        setIsAiLoading(true);
        setAiDescription(""); // Reset old description

        const response = await axios.post(
          `${API}/planet/describe`,
          { planetName: object.name || "earth" }, // The Body
          { withCredentials: true }, // The Config
        );

        if (response.data.success) {
          setAiDescription(response.data.description);
        }
      } catch (err) {
        console.error("AI_INTEL_UPLINK_ERROR:", err);
        setAiDescription(
          "Signal lost. Could not retrieve planetary intelligence brief.",
        );
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchPlanetIntel();
  }, [object?.name, isAsteroid]);

  if (!object) return null;

  const saveAsteroid = async () => {
    if (saved || loading) return;
    try {
      setLoading(true);
      const payload = {
        neoReferenceId: object.id,
        data: {
          ...object,
          riskScore: object.isHazardous ? 85 : 30,
          scannedAt: new Date().toISOString(),
        },
      };
      await axios.post(`${API}/asteroids/watch`, payload, {
        withCredentials: true,
      });
      dispatch(
        addToWatchlist({
          neoReferenceId: payload.neoReferenceId,
          ...payload.data,
        }),
      );
    } catch (err) {
      console.error("SAVE_FAIL:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-8 right-8 z-20 w-80 bg-black/95 border border-white/10 p-6 backdrop-blur-2xl animate-in fade-in slide-in-from-right duration-500 shadow-2xl ring-1 ring-white/5">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
      >
        <X size={18} />
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[8px] text-cyan-500 uppercase tracking-[0.3em] font-bold">
            {isAsteroid ? "NEO Target Intel" : "Planetary Scan"}
          </p>
          <h4 className="text-xl font-black italic text-white uppercase tracking-tighter">
            {object.name}
          </h4>
        </div>
        {object.isHazardous && (
          <ShieldAlert className="text-red-500 animate-pulse" size={24} />
        )}
      </div>

      <div className="space-y-4">
        {isAsteroid ? (
          <>
            <Stat
              label="Avg Diameter"
              value={`${object.realSizeMeters} m`}
              color="text-green-400"
            />
            <Stat
              label="Velocity"
              value={`${object.velocity} km/s`}
              color="text-blue-400"
            />
            <Stat
              label="Earth Miss Dist"
              value={object.distToEarth}
              color="text-yellow-500"
            />
            <Stat label="Abs Magnitude" value={`${object.magnitude} H`} />
          </>
        ) : (
          /* 🛰️ AI DESCRIPTION SECTION FOR PLANETS */
          <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <Cpu size={12} className={isAiLoading ? "animate-spin" : ""} />
              <span className="text-[12px] uppercase font-bold tracking-widest">
                AI Intelligence Brief
              </span>
            </div>

            {isAiLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-gray-600" />
                <span className="text-[13px] text-gray-500 italic">
                  Processing OpenRouter signal...
                </span>
              </div>
            ) : (
              <p className="text-[14px] text-gray-300 leading-relaxed font-serif italic">
                "{aiDescription}"
              </p>
            )}

            {/* Aesthetic Tech Lines */}
            <div className="absolute top-0 right-0 w-8 h-[1px] bg-cyan-500/50"></div>
            <div className="absolute top-0 right-0 w-[1px] h-8 bg-cyan-500/50"></div>
          </div>
        )}
      </div>

      {isAsteroid && (
        <button
          onClick={saveAsteroid}
          disabled={saved || loading}
          className={`w-full mt-6 py-3 border text-[13px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all
            ${
              saved
                ? "bg-green-600/20 border-green-500 text-green-400 cursor-default"
                : loading
                  ? "bg-yellow-600/20 border-yellow-500 text-yellow-400"
                  : "bg-white/5 border-white/20 text-white hover:bg-white/10 active:scale-95"
            }`}
        >
          {saved ? <CheckCircle2 size={14} /> : <Bookmark size={14} />}
          {loading
            ? "Transmitting..."
            : saved
              ? "Archived in Vault"
              : "Save to Vault"}
        </button>
      )}
    </div>
  );
};

const Stat = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between border-b border-white/5 pb-2">
    <span className="text-[12px] text-gray-500 uppercase">{label}</span>
    <span className={`text-sm font-bold ${color}`}>{value}</span>
  </div>
);

export default TargetIntelPanel;