
import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { CameraControls, Stars } from "@react-three/drei";
import {
  Sun as SunIcon,
  Globe,
  Maximize2,
  Loader2,
  Zap,
  ShieldAlert,
  Target,
  X,
  Calendar,
  Search, // Added Search icon
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import MovingPlanet from "../components/MovingPlanet";
import Asteroid from "../components/Asteroid";
import { Sun } from "../components/Sun";
import Galaxy from "../components/Galaxy";
import OrbitPath from "../components/OrbitPath";
import planetData from "../data/planets.json";
import TargetIntelPanel from "../components/TargetIntelPanel";
import PlanetLabel from "../components/PlanetLabel";

const OrbitalMapPage = () => {
  // --- STATE ---
  const [selectedObj, setSelectedObj] = useState(null);
  const [realTimeAsteroids, setRealTimeAsteroids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [showOnlyHazardous, setShowOnlyHazardous] = useState(false);

  // 🛰️ NEW SEARCH STATE
  const [searchId, setSearchId] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const controlsRef = useRef();
  const EARTH_ORBIT_RADIUS = 13;

  // --- DATA FETCHING (DATE-BASED) ---
  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        setIsLoading(true);
        const API_KEY = "2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO";
        const response = await axios.get(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${selectedDate}&end_date=${selectedDate}&api_key=${API_KEY}`,
        );

        const asteroidsOnDate =
          response.data.near_earth_objects[selectedDate] || [];
        const mappedAsteroids = asteroidsOnDate.map((neo, i) =>
          mapAsteroidData(neo, i, asteroidsOnDate.length),
        );
        setRealTimeAsteroids(mappedAsteroids);
      } catch (error) {
        console.error("NASA_UPLINK_FAILURE:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsteroids();
  }, [selectedDate]);

  // 🛰️ HELPER: MAP NASA DATA TO COMPONENT PROPS
  const mapAsteroidData = (neo, index, total) => {
    const approach = neo.close_approach_data[0];
    const missDistKm = Number(approach.miss_distance.kilometers);
    const velocity = Number(approach.relative_velocity.kilometers_per_second);

    const sceneRadius = (missDistKm / 1_000_000) * 0.7;
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * sceneRadius + EARTH_ORBIT_RADIUS;
    const z = Math.sin(angle) * sceneRadius;
    const y = velocity / 50 - 1;

    const avgMeters =
      (neo.estimated_diameter.meters.estimated_diameter_min +
        neo.estimated_diameter.meters.estimated_diameter_max) /
      2;

    return {
      id: neo.id,
      name: neo.name,
      position: [x, y, z],
      visualSize: Math.max(0.08, Math.log10(avgMeters) * 0.2),
      realSizeMeters: avgMeters.toFixed(2),
      velocity: velocity.toFixed(2),
      distToEarth: (missDistKm / 1_000_000).toFixed(2) + " MKM",
      isHazardous: neo.is_potentially_hazardous_asteroid,
      color: neo.is_potentially_hazardous_asteroid ? "#ff3333" : "#00ffcc",
      magnitude: neo.absolute_magnitude_h,
    };
  };

  // 🛰️ NEW: SEARCH BY ID HANDLER
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const input = searchId.trim();
    if (!input) return;

    try {
      setIsSearching(true);
      const API_KEY = "2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO";
      let finalId = input;

      // 🕵️ IF INPUT HAS LETTERS OR SPACES
      if (/[a-zA-Z\s]/.test(input)) {
        // 🛰️ STEP 1: Query JPL Horizons to resolve the name to an ID
        const lookupRes = await axios.get(
          `https://ssd-api.jpl.nasa.gov/horizons_lookup.api?sstr=${encodeURIComponent(input)}`,
        );

        // JPL returns 'result' array. If it's a partial match, 'count' will be > 0.
        if (
          lookupRes.data &&
          lookupRes.data.result &&
          lookupRes.data.result.length > 0
        ) {
          // We take the SPK-ID of the first match found
          finalId = lookupRes.data.result[0].spkid;
          console.log(`📡 Signal Resolved: ${input} -> SPK-ID: ${finalId}`);
        } else {
          throw new Error("NOT_FOUND");
        }
      }

      // 🛰️ STEP 2: Fetch the actual physical data from NeoWS using the ID
      const response = await axios.get(
        `https://api.nasa.gov/neo/rest/v1/neo/${finalId}?api_key=${API_KEY}`,
      );

      const neo = response.data;

      // 🛰️ STEP 3: Map the data for visualization
      // Note: If an asteroid is currently very far away, we force a
      // viewable position so the user can actually see the 3D model.
      const searchedAsteroid = mapAsteroidData(neo, 0, 1);

      // Aesthetic overrides for the search target
      searchedAsteroid.color = "#fbbf24"; // Target Gold
      searchedAsteroid.name = `[TARGET] ${neo.name}`;

      setRealTimeAsteroids([searchedAsteroid]);
      handleFocus(searchedAsteroid.position, searchedAsteroid);
    } catch (error) {
      console.error("SEARCH_ERROR:", error);
      alert(
        `IDENTIFICATION FAILURE: "${input}" is too vague or not in the NEO database. Try adding a number (e.g., 2009 SY5) or use a 7-digit SPK-ID.`,
      );
    } finally {
      setIsSearching(false);
    }
  };

  // --- HANDLERS ---
  const handleFocus = (pos, objData) => {
    setSelectedObj(objData);
    const zoomDist = objData.name === "The Sun" ? 15 : 3.5;
    controlsRef.current?.setLookAt(
      pos[0] + zoomDist,
      pos[1] + 1,
      pos[2] + zoomDist,
      pos[0],
      pos[1],
      pos[2],
      true,
    );
  };

  const filteredAsteroids = showOnlyHazardous
    ? realTimeAsteroids.filter((a) => a.isHazardous)
    : realTimeAsteroids;

  return (
    <div className="absolute inset-0 bg-[#020202] text-white font-mono overflow-hidden">
      {/* 📡 LEFT HUD: STATUS */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="bg-black/60 border-l-2 border-red-600 p-4 backdrop-blur-md">
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-gray-500">
            Global NEO Telemetry
          </h3>
          <p className="text-sm font-black italic tracking-tighter uppercase flex items-center gap-2">
            {isLoading || isSearching ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Target size={14} className="text-red-500" />
            )}
            {selectedObj ? selectedObj.name : "Scanning Earth Proximity..."}
          </p>
        </div>
      </div>

      {/* 🛰️ RIGHT HUD: FILTERS & SEARCH */}
      {!selectedObj ? (
        <div className="absolute top-8 right-8 z-20 flex flex-col gap-4 w-64">
          {/* 🛰️ SEARCH BOX */}
          <form
            onSubmit={handleSearch}
            className="bg-black/60 border border-white/10 p-3 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 mb-2">
              <Search size={12} className="text-yellow-500" />
              <span className="text-[9px] uppercase tracking-widest text-gray-400">
                Target ID Search
              </span>
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="e.g. 3542519"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="bg-white/5 border border-white/10 text-[10px] px-2 py-2 outline-none focus:border-yellow-500 w-full"
              />
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-500 text-black px-3 font-bold text-[10px] transition-colors"
              >
                {isSearching ? "..." : "GO"}
              </button>
            </div>
          </form>

          {/* Date Filter */}
          <div className="bg-black/60 border border-white/10 p-3 backdrop-blur-md flex flex-col gap-2">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-1">
              <Calendar size={12} className="text-cyan-400" />
              <span className="text-[9px] uppercase tracking-widest text-gray-400">
                Temporal Filter
              </span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white/5 border border-white/10 text-[10px] px-3 py-2 outline-none focus:border-cyan-400 transition-colors uppercase cursor-pointer"
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* Hazardous Toggle */}
          <div className="bg-black/60 border border-white/10 p-3 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert
                size={14}
                className={
                  showOnlyHazardous
                    ? "text-red-500 animate-pulse"
                    : "text-gray-500"
                }
              />
              <span className="text-[9px] uppercase tracking-widest text-gray-400">
                Hazardous
              </span>
            </div>
            <button
              onClick={() => setShowOnlyHazardous(!showOnlyHazardous)}
              className={`w-10 h-5 rounded-full relative transition-colors ${showOnlyHazardous ? "bg-red-600" : "bg-gray-800"}`}
            >
              <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showOnlyHazardous ? "left-6" : "left-1"}`}
              />
            </button>
          </div>
        </div>
      ) : null}

      {/* 📊 TARGET INTEL PANEL */}
      {selectedObj && (
        <TargetIntelPanel
          object={selectedObj}
          onClose={() => {
            setSelectedObj(null);
            controlsRef.current?.setLookAt(40, 30, 50, 0, 0, 0, true);
          }}
        />
      )}

      {/* 🎮 NAVIGATION FOOTER */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-3">
        <button
          onClick={() =>
            controlsRef.current?.setLookAt(0, 150, 200, 0, 0, 0, true)
          }
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[13px] uppercase font-bold tracking-widest flex items-center gap-2"
        >
          <Globe size={14} className="text-blue-400" /> Galaxy View
        </button>
        <button
          onClick={() => {
            setSelectedObj(null);
            controlsRef.current?.setLookAt(40, 30, 50, 0, 0, 0, true);
          }}
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[13px] uppercase font-bold tracking-widest flex items-center gap-2"
        >
          <Maximize2 size={14} className="text-yellow-500" /> Reset System
        </button>
      </div>

      {/* 🎨 ASTEROID LEGEND - BOTTOM RIGHT */}
      <div className="absolute bottom-8 right-8 z-20 bg-black/60 border border-white/10 p-3 backdrop-blur-md flex flex-col gap-3 w-48">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-1">
          <AlertCircle size={12} className="text-blue-400" />
          <span className="text-[12px] uppercase tracking-widest text-gray-400">
            Asteroid Guide
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-[12px] text-gray-300">Hazardous asteroids</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <span className="text-[12px] text-gray-300">Safe asteroids</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 italic border-t border-white/5 pt-2 mt-1">
          Click any asteroid to learn more
        </p>
      </div>

      {/* 🌌 3D SCENE */}
      <Canvas camera={{ position: [50, 40, 80], fov: 40 }}>
        <Suspense fallback={null}>
          <Galaxy />
          <Stars radius={800} depth={100} count={10000} factor={15} fade={false} />
          <ambientLight intensity={1.5} />
          <pointLight
            position={[0, 0, 0]}
            intensity={5}
            distance={100}
            decay={1}
            color="#ffffff"
          />
          <group>
            <Sun
              onSelect={() =>
                handleFocus([0, 0, 0], { name: "The Sun", size: 2.5 })
              }
            />
            {/* 🌍 Render Orbit Paths */}
            {planetData.map((planet) => (
              <OrbitPath key={`orbit-${planet.name}`} distance={planet.dist} color="#ffffff" opacity={0.4} />
            ))}
            {planetData.map((planet) => (
              <MovingPlanet
                key={planet.name}
                data={planet}
                onSelect={(pos) => handleFocus(pos, planet)}
              >
                {/* 🪐 Passing the label as a child ensures it inherits movement */}
                <PlanetLabel planet={planet} />
              </MovingPlanet>
            ))}
            {!isLoading &&
              filteredAsteroids.map((asteroid) => (
                <Asteroid
                  key={asteroid.id}
                  {...asteroid}
                  onSelect={(pos) => handleFocus(pos, asteroid)}
                />
              ))}
          </group>
          <CameraControls ref={controlsRef} makeDefault dampingFactor={0.05} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default OrbitalMapPage;