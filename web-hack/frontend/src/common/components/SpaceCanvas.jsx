import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Stars } from '@react-three/drei';

const InteractivePlanet = () => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    // Rotation logic
    meshRef.current.rotation.x += 0.001;
    meshRef.current.rotation.y += 0.005;
    
    // Mouse interaction: Make the planet "follow" the mouse slightly
    const x = (state.mouse.x * Math.PI) / 10;
    const y = (state.mouse.y * Math.PI) / 10;
    meshRef.current.position.set(x, y, 0);
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere 
        ref={meshRef} 
        args={[1, 64, 64]} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#ff0000" : "#444"}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

export const SpaceCanvas = () => (
  <div className="absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 0, 3] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff0000" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <InteractivePlanet />
    </Canvas>
  </div>
);