import React from "react";
import { Sphere } from "@react-three/drei";

export const Sun = ({ onSelect }) => (
  <group 
    onClick={(e) => {
      e.stopPropagation();
      onSelect();
    }}
    onPointerOver={() => (document.body.style.cursor = "pointer")}
    onPointerOut={() => (document.body.style.cursor = "auto")}
  >
    {/* Surface */}
    <Sphere args={[2.2, 64, 64]}>
      <meshStandardMaterial emissive="#ffcc00" emissiveIntensity={2} color="#ffce00" />
    </Sphere>
    {/* Glow / Corona */}
    <Sphere args={[2.5, 32, 32]}>
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.1} />
    </Sphere>
    <pointLight intensity={15} distance={100} decay={1.5} color="#ffdf00" />
  </group>
);