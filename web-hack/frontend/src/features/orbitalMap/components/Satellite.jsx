import React from 'react'
import { 
  OrbitControls, 
  Stars, 
  Float, 
  Sphere, 
  Html, 
  useTexture 
} from "@react-three/drei";
import { Activity, Radio, Shield } from "lucide-react";


const Satellite = ({ radius, speed, color, name, offset = 0 }) => (
  <group rotation={[offset, offset, 0]}>
    <Float speed={speed} rotationIntensity={2}>
      <mesh position={[radius, 0, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
        <Html distanceFactor={10}>
          <div className="flex flex-col items-center select-none pointer-events-none">
            <div className="px-2 py-0.5 bg-black/90 border border-white/10 text-[7px] font-mono text-white uppercase tracking-tighter backdrop-blur-sm">
              {name}
            </div>
            <div className="w-[1px] h-2 bg-gradient-to-b from-white/40 to-transparent" />
          </div>
        </Html>
      </mesh>
    </Float>
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius, radius + 0.003, 128]} />
      <meshBasicMaterial color={color} opacity={0.1} transparent />
    </mesh>
  </group>
);

export default Satellite