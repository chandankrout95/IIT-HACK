import React from "react";
import { Html, Line, Dodecahedron } from "@react-three/drei";

const Asteroid = ({
  position,
  name,
  isHazardous,
  onSelect,
  visualSize,
  color,
}) => {
  return (
    <group position={position}>
      <Dodecahedron
        // args[0] is the radius of the asteroid
        args={[visualSize, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(position);
        }}
        // 👇 Change to pointer on hover
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        // 👇 Change back to default when leaving
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHazardous ? 1.2 : 0.2}
        />
      </Dodecahedron>

      {/* Line to Earth at [13, 0, 0]
      <Line
        points={[
          [0, 0, 0],
          [13 - position[0], -position[1], -position[2]],
        ]}
        color={isHazardous ? "red" : "white"}
        transparent
        opacity={0.1}
      /> */}
    </group>
  );
};

export default Asteroid;
