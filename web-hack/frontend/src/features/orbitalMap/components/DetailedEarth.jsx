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


const DetailedEarth = ({ scale }) => {
  const [colorMap, bumpMap, specularMap, cloudMap] = useTexture([
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg",
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png",
  ]);

  return (
    <group>
      {/* 1. Main Earth Body */}
      <Sphere args={[scale, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={0x666666}
          shininess={25}
          emissive="#112244"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* 2. Cloud Layer */}
      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={0}>
        <Sphere args={[scale * 1.015, 64, 64]}>
          <meshPhongMaterial
            map={cloudMap}
            transparent={true}
            opacity={0.4}
            emissive="#ffffff"
            emissiveIntensity={0.1}
            depthWrite={false}
          />
        </Sphere>
      </Float>

      {/* 3. Atmospheric Glow */}
      <Sphere args={[scale * 1.1, 64, 64]}>
        <meshBasicMaterial color="#4ea9ff" transparent opacity={0.1} side={2} />
      </Sphere>
    </group>
  );
};

export default DetailedEarth