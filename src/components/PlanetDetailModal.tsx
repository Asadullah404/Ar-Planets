import { motion, AnimatePresence } from "framer-motion";
import { CelestialBody } from "@/hooks/usePlanetPosition";
import { PlanetInfo } from "@/lib/planetData";

interface Props {
    body: CelestialBody;
    planet: PlanetInfo;
    onClose: () => void;
}

const Row = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/30 last:border-0">
        <span className="font-body text-xs text-muted-foreground shrink-0 w-36">{label}</span>
        <span className={`font-body text-xs font-semibold text-right ${accent ? "text-primary" : "text-foreground"}`}>
            {value}
        </span>
    </div>
);

export default function PlanetDetailModal({ body, planet, onClose }: Props) {
    const compassDir = (az: number) => {
        const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        return dirs[Math.round(az / 45) % 8];
    };

    const altDescription = (alt: number) => {
        if (alt >= 60) return "High in the sky";
        if (alt >= 30) return "Well above horizon";
        if (alt >= 10) return "Low above horizon";
        if (alt >= 0) return "Just above horizon";
        return "Below horizon";
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg rounded-t-3xl bg-background border border-border/40 shadow-2xl overflow-hidden"
                    style={{ maxHeight: "90vh" }}
                >
                    {/* Header */}
                    <div
                        className="px-5 pt-5 pb-4"
                        style={{ background: `linear-gradient(135deg, ${planet.color}22, transparent)` }}
                    >
                        <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-border/50" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{planet.emoji}</span>
                                <div>
                                    <h2 className="font-display text-xl font-bold text-foreground">{body.name}</h2>
                                    <span className="font-body text-xs text-muted-foreground">{planet.type}</span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(90vh - 120px)" }}>

                        {/* Description */}
                        <p className="mb-5 font-body text-sm leading-relaxed text-muted-foreground">
                            {planet.description}
                        </p>

                        {/* Live Sky Position */}
                        <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-primary">
                                🔭 Live Sky Position
                            </h3>
                            <Row label="Altitude" value={`${body.altitude.toFixed(2)}° — ${altDescription(body.altitude)}`} accent />
                            <Row label="Azimuth" value={`${body.azimuth.toFixed(2)}° ${compassDir(body.azimuth)}`} accent />
                            <Row label="Constellation" value={body.constellation} />
                            <Row
                                label="Visibility"
                                value={body.aboveHorizon ? "✓ Above horizon" : "✗ Below horizon"}
                                accent={body.aboveHorizon}
                            />
                        </div>

                        {/* Physical Details */}
                        <div className="mb-4 rounded-2xl border border-border/40 bg-muted/30 p-4">
                            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-foreground">
                                🪐 Physical Data
                            </h3>
                            <Row label="Type" value={planet.type} />
                            <Row label="Diameter" value={planet.diameter} />
                            <Row label="Avg. Distance from Earth" value={planet.distance} />
                            <Row label="Moons" value={planet.moons === 0 ? "None" : planet.moons.toString()} />
                            <Row label="Surface / Cloud Temp" value={planet.surfaceTemp} />
                        </div>

                        {/* Orbital Details */}
                        <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-foreground">
                                🔄 Orbital Data
                            </h3>
                            <Row label="Orbital Period" value={planet.orbitalPeriod} />
                            <Row label="Rotation Period" value={planet.rotationPeriod} />
                        </div>

                        {/* Fun fact */}
                        <div className="mt-4 rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3">
                            <span className="font-body text-xs text-secondary">💡 {planet.fact}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
