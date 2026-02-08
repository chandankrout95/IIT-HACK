
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";

const OrbitPath = ({ distance, color = "#ffffff", opacity = 0.3 }) => {
  const points = useMemo(() => {
    const segments = 256;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push([
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance,
      ]);
    }
    return pts;
  }, [distance]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
      dashed={false}
    />
  );
};

export default OrbitPath;