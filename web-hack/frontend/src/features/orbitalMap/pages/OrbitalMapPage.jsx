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
  X, // Added X icon from lucide-react
} from "lucide-react";
import axios from "axios";
import MovingPlanet from "../components/MovingPlanet";
import Asteroid from "../components/Asteroid";
import { Sun } from "../components/Sun";
import Galaxy from "../components/Galaxy";
import planetData from "../data/planets.json";
import TargetIntelPanel from "../components/TargetIntelPanel";

const OrbitalMapPage = () => {
  const [selectedObj, setSelectedObj] = useState(null);
  const [realTimeAsteroids, setRealTimeAsteroids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const controlsRef = useRef();

  const EARTH_ORBIT_RADIUS = 13;

  useEffect(() => {
    const fetchAsteroids = async () => {
      try {
        setIsLoading(true);
        const API_KEY = "2wG2FKo4fVeIjsi5OzPYyFNyqXw7hxLhcdddvSjO";
        const today = new Date().toISOString().split("T")[0];

        const response = await axios.get(
          `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`,
        );

        const asteroidsToday = response.data.near_earth_objects[today];

    const mappedAsteroids = asteroidsToday.map((neo, i) => {
  const approach = neo.close_approach_data[0];

  const missDistKm = Number(approach.miss_distance.kilometers);
  const velocity = Number(approach.relative_velocity.kilometers_per_second);

  // Convert to AU-like scene scale
  const sceneRadius = (missDistKm / 1_000_000) * 0.7;

  // Orbit distribution (angle only for visibility)
  const angle = (i / asteroidsToday.length) * Math.PI * 2;
  const height = (velocity / 50) - 1; // velocity gives vertical offset

  const x = Math.cos(angle) * sceneRadius + EARTH_ORBIT_RADIUS;
  const z = Math.sin(angle) * sceneRadius;
  const y = height;

  const minM = neo.estimated_diameter.meters.estimated_diameter_min;
  const maxM = neo.estimated_diameter.meters.estimated_diameter_max;
  const avgMeters = (minM + maxM) / 2;

  return {
    id: neo.id,
    name: neo.name,
    position: [x, y, z],

    visualSize: Math.max(0.08, Math.log10(avgMeters) * 0.2),
    realSizeMeters: avgMeters.toFixed(2),

    velocity: velocity.toFixed(2),
    distToEarth: (missDistKm / 1_000_000).toFixed(2) + "M KM",

    isHazardous: neo.is_potentially_hazardous_asteroid,
    color: neo.is_potentially_hazardous_asteroid ? "#ff3333" : "#00ffcc",
    magnitude: neo.absolute_magnitude_h,
  };
});


        setRealTimeAsteroids(mappedAsteroids);
      } catch (error) {
        console.error("NASA_UPLINK_FAILURE:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAsteroids();
  }, []);

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

  return (
    <div className="absolute inset-0 bg-[#020202] text-white font-mono overflow-hidden">
      {/* 📡 TOP HUD */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="bg-black/60 border-l-2 border-red-600 p-4 backdrop-blur-md">
          <h3 className="text-[9px] uppercase tracking-[0.4em] text-gray-500">
            Global NEO Telemetry
          </h3>
          <p className="text-sm font-black italic tracking-tighter uppercase flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              <Target size={14} className="text-red-500" />
            )}
            {selectedObj ? selectedObj.name : "Scanning Earth Proximity..."}
          </p>
        </div>
      </div>

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
      {/* 🎮 NAVIGATION */}
      <div className="absolute bottom-8 left-8 z-20 flex gap-3">
        <button
          onClick={() =>
            controlsRef.current?.setLookAt(0, 150, 200, 0, 0, 0, true)
          }
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm flex items-center gap-2"
        >
          <Globe size={14} className="text-blue-400" /> Galaxy View
        </button>
        <button
          onClick={() => {
            setSelectedObj(null);
            controlsRef.current?.setLookAt(40, 30, 50, 0, 0, 0, true);
          }}
          className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] uppercase font-bold tracking-widest backdrop-blur-sm flex items-center gap-2"
        >
          <Maximize2 size={14} className="text-yellow-500" /> Reset System
        </button>
      </div>

      <Canvas camera={{ position: [50, 40, 80], fov: 40 }}>
        <Suspense fallback={null}>
          <Galaxy />
          <Stars radius={500} depth={50} count={3000} factor={4} fade />
          {/* 💡 BOOSTED LIGHTING */}
          <ambientLight intensity={1.5} /> {/* Increased from 0.5 to 1.5 */}
          <pointLight
            position={[0, 0, 0]}
            intensity={5}
            distance={100}
            decay={1}
            color="#ffffff"
          />
          <pointLight position={[10, 10, 10]} intensity={1} color="#4444ff" />{" "}
          {/* Soft blue fill light */}
          <group>
            <Sun
              onSelect={() =>
                handleFocus([0, 0, 0], { name: "The Sun", size: 2.5 })
              }
            />
            {planetData.map((planet) => (
              <group key={planet.name}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry
                    args={[planet.dist - 0.01, planet.dist + 0.01, 128]}
                  />
                  <meshBasicMaterial color="white" opacity={0.05} transparent />
                </mesh>
                <MovingPlanet
                  data={planet}
                  onSelect={(pos) => handleFocus(pos, planet)}
                />
              </group>
            ))}
            {!isLoading &&
              realTimeAsteroids.map((asteroid) => (
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
