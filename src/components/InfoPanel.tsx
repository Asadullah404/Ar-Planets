import { useState } from "react";
import { CelestialBody } from "@/hooks/usePlanetPosition";
import { PlanetInfo } from "@/lib/planetData";
import PlanetDetailModal from "./PlanetDetailModal";

interface Props {
  body: CelestialBody;
  planet: PlanetInfo;
  onBack: () => void;
}

export default function InfoPanel({ body, planet, onBack }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="glass-strong absolute inset-x-0 bottom-0 z-30 rounded-t-3xl px-5 pb-6 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{planet.emoji}</span>
            <span className="font-display text-lg font-bold text-foreground">{body.name}</span>
          </div>
          <button
            onClick={onBack}
            className="rounded-full border border-border px-3 py-1 font-display text-[10px] text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-body text-sm">
          <div>
            <span className="text-muted-foreground">Azimuth</span>
            <p className="font-semibold text-primary">{body.azimuth.toFixed(1)}°</p>
          </div>
          <div>
            <span className="text-muted-foreground">Altitude</span>
            <p className="font-semibold text-primary">{body.altitude.toFixed(1)}°</p>
          </div>
          <div>
            <span className="text-muted-foreground">Constellation</span>
            <p className="font-semibold text-foreground">{body.constellation}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Horizon</span>
            <p className={`font-semibold ${body.aboveHorizon ? "text-horizon-green" : "text-secondary"}`}>
              {body.aboveHorizon ? "Above ✓" : "Below ✗"}
            </p>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Avg. Distance</span>
            <p className="font-semibold text-foreground">{planet.distance}</p>
          </div>
        </div>

        {/* More Details button */}
        <button
          onClick={() => setShowDetails(true)}
          className="mt-4 w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 font-display text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
        >
          🔭 More Details
        </button>
      </div>

      {/* Detail modal */}
      {showDetails && (
        <PlanetDetailModal
          body={body}
          planet={planet}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}
