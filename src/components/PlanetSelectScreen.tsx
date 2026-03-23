import { motion } from "framer-motion";
import { PLANETS, PlanetInfo } from "@/lib/planetData";
import Footer from "./Footer";

interface Props {
  onSelect: (planet: PlanetInfo) => void;
  onBack: () => void;
}

export default function PlanetSelectScreen({ onSelect, onBack }: Props) {
  return (
    <div className="starfield">
      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-8 pt-12">
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            ←
          </button>
          <h1 className="font-display text-xl font-bold text-primary text-glow">
            Select a Body
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PLANETS.map((planet, i) => (
            <motion.button
              key={planet.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(planet)}
              className="glass flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-all hover:border-primary/40 active:bg-primary/10"
            >
              <span className="text-4xl">{planet.emoji}</span>
              <span className="font-display text-sm font-semibold text-foreground">
                {planet.name}
              </span>
              <span className="font-body text-[10px] leading-tight text-muted-foreground">
                {planet.fact}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
