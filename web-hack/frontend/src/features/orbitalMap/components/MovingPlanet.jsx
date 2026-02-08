import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Ring } from "@react-three/drei";
import DetailedEarth from "./DetailedEarth";

const SECONDS_IN_DAY = 86400;

const MovingPlanet = ({ data, onSelect, children }) => { // 🛰️ Added children prop
  const groupRef = useRef();
  const planetRef = useRef();
  const TIME_SCALE = 1500; 

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * TIME_SCALE;

    // Revolution: Move the whole group
    const orbitPeriod = data.orbitDays * SECONDS_IN_DAY;
    const orbitAngle = (t / orbitPeriod) * Math.PI * 2;
    groupRef.current.position.x = Math.cos(orbitAngle) * data.dist;
    groupRef.current.position.z = Math.sin(orbitAngle) * data.dist;

    // Rotation: Only spin the planet mesh
    const rotationPeriod = SECONDS_IN_DAY * (data.rotationFactor || 1);
    const rotationAngle = (t / rotationPeriod) * Math.PI * 2;
    if (planetRef.current) planetRef.current.rotation.y = rotationAngle;
  });

  return (
    <group ref={groupRef}>
      <group 
        ref={planetRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(groupRef.current.position.toArray());
        }}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        {data.name === "Earth" ? (
          <DetailedEarth scale={data.size} />
        ) : (
          <Sphere args={[data.size, 32, 32]}>
            <meshStandardMaterial color={data.color} roughness={0.7} metalness={0.2} />
          </Sphere>
        )}
        
        {data.hasRings && (
          <Ring args={[data.size * 1.4, data.size * 2.2, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
            <meshStandardMaterial color={data.color} transparent opacity={0.5} side={2} />
          </Ring>
        )}
      </group>

      {/* 🛰️ Children (PlanetLabel) will be relative to the moving groupRef */}
      {children}
    </group>
  );
};

export default MovingPlanet;