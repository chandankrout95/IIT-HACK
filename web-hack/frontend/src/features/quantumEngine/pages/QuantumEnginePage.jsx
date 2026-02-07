import React, { useState, useEffect } from "react";
import { Activity, ShieldAlert, Cpu, Orbit, Zap } from "lucide-react";
import axios from "axios";
import { calculateRiskScore, getStatus } from "../../../utils/riskEngine";

const QuantumEnginePage = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [analyzedData, setAnalyzedData] = useState([]);

  useEffect(() => {
    const fetchSavedAsteroids = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/v1/asteroids/get-watch",
          { withCredentials: true },
        );

        const asteroids = res.data.data || [];
        console.log(asteroids);

        // Simulate "Quantum Computation"
        const timer = setTimeout(() => {
          const results = asteroids.map((item) => {
            // Ensure we are calculating based on the wrapper object
            const score = calculateRiskScore(item);

            return {
              ...item,
              calculatedScore: score,
            };
          });
          setAnalyzedData(results);
          setIsProcessing(false);
        }, 2000);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error("FETCH_ASTEROIDS_FAIL:", err.message);
        setIsProcessing(false);
      }
    };

    fetchSavedAsteroids();
  }, []);

  const avgThreat = analyzedData.length
    ? (
        analyzedData.reduce((acc, curr) => acc + curr.calculatedScore, 0) /
        analyzedData.length
      ).toFixed(1)
    : 0;

  return (
    <div className="absolute inset-0 bg-[#020202] text-[#e0e0e0] font-mono p-12 overflow-y-auto">
      {/* ⚛️ HEADER SECTION */}
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <Cpu size={20} className="animate-spin-slow" />
            <span className="text-[10px] uppercase tracking-[0.5em]">
              Quantum Processor Active
            </span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            Risk <span className="text-cyan-500">Analysis</span> Engine
          </h1>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-gray-500 uppercase mb-1">
            Global Threat Index
          </p>
          <div className="text-4xl font-black text-white">
            {isProcessing ? "---" : `${avgThreat}%`}
          </div>
        </div>
      </div>

      {isProcessing ? (
        <div className="h-96 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Orbit size={64} className="text-cyan-500 animate-spin" />
            <Zap
              size={24}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse"
            />
          </div>
          <span className="text-xs uppercase tracking-[0.4em] text-cyan-500 animate-pulse">
            Decrypting Orbital Trajectories...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 📊 LEFT COLUMN: LIVE FEED */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Activity size={14} /> Neural Link Stream
            </h3>

            {analyzedData.length === 0 ? (
              <div className="text-gray-600 text-[10px] uppercase tracking-widest border border-dashed border-white/10 p-10 text-center">
                No Telemetry Data Found In Vault
              </div>
            ) : (
              analyzedData.map((item) => {
                const status = getStatus(item.calculatedScore);
                return (
                  <div
                    key={item.neoReferenceId}
                    className="bg-white/5 border-l-4 border-white/10 p-5 hover:bg-white/10 hover:border-cyan-500 transition-all group"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[8px] bg-white/10 px-1 text-gray-400">
                            UID: {item.neoReferenceId}
                          </span>
                          {item.data?.isHazardous && (
                            <span className="text-[8px] bg-red-600 px-1 text-black font-bold">
                              HAZARD
                            </span>
                          )}
                        </div>
                        <h4 className="text-xl font-bold uppercase italic text-white group-hover:text-cyan-400 transition-colors">
                          {/* ✅ Updated to item.data.name */}
                          {item.data?.name || "Unknown Designation"}
                        </h4>
                        <p className="text-[9px] text-gray-500 mt-1 uppercase">
                          Velocity: {item.data?.velocity} km/s | Size:{" "}
                          {item.data?.realSizeMeters}m
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 border ${status.border} ${status.color} uppercase`}
                        >
                          {status.label}
                        </span>
                        <p
                          className={`text-2xl font-black mt-1 ${status.color}`}
                        >
                          {item.calculatedScore}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-black/50 mt-4 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${item.calculatedScore > 70 ? "bg-red-500" : "bg-cyan-500"}`}
                        style={{ width: `${item.calculatedScore}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 🛡️ RIGHT COLUMN: ENGINE STATS */}
          <div className="space-y-6">
            <div className="bg-cyan-950/10 border border-cyan-500/30 p-6 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-cyan-500/20">
                <Zap size={10} className="text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold uppercase mb-4 flex items-center gap-2 text-cyan-400">
                <ShieldAlert size={16} /> Defense Protocol
              </h3>
              <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-tight">
                Current Global Risk is{" "}
                <span
                  className={avgThreat > 50 ? "text-red-500" : "text-green-500"}
                >
                  {avgThreat}%
                </span>
                . The system suggests
                <span className="text-white mx-1">
                  {avgThreat > 50
                    ? "IMMEDIATE INTERCEPT SIMULATION"
                    : "STANDARD PASSIVE SURVEILLANCE"}
                </span>
                for all active watchlist nodes.
              </p>
              <button className="w-full mt-6 py-3 bg-cyan-600 text-black text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all active:scale-95">
                Generate Orbital Report
              </button>
            </div>

            <div className="bg-black/40 border border-white/5 p-6">
              <h3 className="text-xs font-bold uppercase mb-6 text-gray-500 border-b border-white/5 pb-2">
                System Diagnostics
              </h3>
              <div className="space-y-5">
                <ResourceBar
                  label="Quantum Core Load"
                  value="84%"
                  color="bg-cyan-500"
                />
                <ResourceBar
                  label="Neural Sync"
                  value="92%"
                  color="bg-purple-500"
                />
                <ResourceBar
                  label="Satellite Uplink"
                  value="99%"
                  color="bg-green-500"
                />
                <ResourceBar
                  label="Watchlist Capacity"
                  value={`${((analyzedData.length / 100) * 100).toFixed(0)}%`}
                  color="bg-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ResourceBar = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-[8px] uppercase mb-1.5 tracking-tighter">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-bold">{value}</span>
    </div>
    <div className="w-full h-[3px] bg-white/5 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-1000`}
        style={{ width: value }}
      />
    </div>
  </div>
);

export default QuantumEnginePage;
