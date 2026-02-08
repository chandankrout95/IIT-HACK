import { Html } from "@react-three/drei";

const PlanetLabel = ({ planet }) => {
  return (
    <Html 
  position={[0, planet.size + 0.8, 0]} 
  center 
  transform // 🛰️ This makes movement significantly smoother
  distanceFactor={10} // Note: 'transform' changes how distanceFactor feels, start small
>
      <div className="pointer-events-none select-none">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 whitespace-nowrap bg-black/60 px-2 py-0.5 rounded-sm border border-cyan-500/30 backdrop-blur-md shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            {planet.name}
          </span>
          {/* Tactical pointer line */}
          <div className="w-[1px] h-4 bg-gradient-to-t from-cyan-500/50 to-transparent" />
        </div>
      </div>
    </Html>
  );
};

export default PlanetLabel;