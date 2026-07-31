import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TARGETS, TargetInfo, ALL_TARGETS_INFO } from "@/lib/planetData";
import Planet3DViewer from "./Planet3DViewer";
import Footer from "./Footer";

interface Props {
  onSelect: (target: TargetInfo) => void;
  onBack: () => void;
}

export default function PlanetSelectScreen({ onSelect, onBack }: Props) {
  const [filter, setFilter] = useState<"all" | "qibla" | "solar" | "star" | "constellation" | "deepspace" | "comet" | "satellite" | "landmark">("all");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Custom coordinate target state
  const [customName, setCustomName] = useState("");
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);

  // 3D Preview Modal Target
  const [preview3DTarget, setPreview3DTarget] = useState<TargetInfo | null>(null);

  // Filter and Search logic
  const filteredTargets = TARGETS.filter((t) => {
    const matchesFilter = filter === "all" || t.category === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.fact.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
  });

  const handleCreateCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (!customName.trim() || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Please enter a valid target name and coordinates (Lat: -90 to 90, Lng: -180 to 180)");
      return;
    }

    const customTarget: TargetInfo = {
      id: `custom-${Date.now()}`,
      name: customName,
      emoji: "📍",
      fact: `Custom target location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
      distance: "Calculated Live",
      color: "hsl(160, 90%, 50%)",
      category: "landmark",
      categoryLabel: "Custom Geodetic Target",
      coords: { lat, lng },
      diameter: "User Defined",
      orbitalPeriod: "N/A",
      rotationPeriod: "N/A",
      moons: 0,
      surfaceTemp: "N/A",
      type: "Custom Location",
      description: `Custom target defined by user coordinates at Latitude ${lat}° and Longitude ${lng}°.`
    };

    setShowCustomModal(false);
    onSelect(customTarget);
  };

  return (
    <div className="starfield min-h-screen">
      <div className="relative z-10 flex min-h-screen flex-col px-4 pb-12 pt-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground hover:border-primary/50"
            >
              ←
            </button>
            <div>
              <h1 className="font-display text-2xl font-bold text-primary text-glow flex items-center gap-2">
                🌐 AR Target Hub A-Z
              </h1>
              <p className="font-body text-xs text-muted-foreground">
                Universal AR Directory: Sacred Qibla, Solar Planets, Stars, Constellations, Nebulae, Comets & Satellites
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onSelect(ALL_TARGETS_INFO)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-4 py-2.5 font-display text-xs font-bold text-white shadow-xl shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 border border-purple-400/40"
            >
              🌌 ALL TARGETS MODE (A-Z)
            </button>
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 font-display text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              ➕ Custom GPS
            </button>
          </div>
        </div>

        {/* All Targets Featured Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950/60 p-5 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-400/40 text-3xl shadow-inner">
              🌌
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-base font-bold text-purple-300">
                  ALL-IN-ONE SIMULTANEOUS AR MODE
                </h2>
                <span className="rounded-full bg-purple-500/30 px-2 py-0.5 font-display text-[9px] font-bold text-purple-200 border border-purple-400/30">
                  FEATURED
                </span>
              </div>
              <p className="font-body text-xs text-purple-100/80 leading-relaxed">
                View <strong>ALL 35+ targets (Planets, Stars, Constellations, Nebulae, Satellites & Landmarks) simultaneously</strong> in your AR camera sky feed!
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelect(ALL_TARGETS_INFO)}
            className="w-full sm:w-auto shrink-0 rounded-2xl bg-purple-500 hover:bg-purple-400 px-6 py-3 font-display text-xs font-bold text-slate-950 shadow-lg shadow-purple-500/40 transition-all active:scale-95"
          >
            Launch All Targets ➔
          </button>
        </motion.div>

        {/* Search & Sort Controls Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search A-Z targets (e.g. Kaaba, Mars, Orion, Andromeda, JWST, Comet Halley)..."
              className="w-full rounded-2xl border border-border/50 bg-background/60 backdrop-blur-md pl-10 pr-4 py-3 font-body text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="glass flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 font-display text-xs font-semibold text-foreground hover:border-primary/40"
          >
            <span>Sort:</span>
            <span className="text-primary">{sortAsc ? "A ➔ Z" : "Z ➔ A"}</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "✨ All Targets (A-Z)" },
            { id: "qibla", label: "🕋 Sacred & Qibla" },
            { id: "solar", label: "🪐 Solar System" },
            { id: "star", label: "☀️ Stars" },
            { id: "constellation", label: "🌌 Constellations" },
            { id: "deepspace", label: "🌀 Deep Space & Nebulae" },
            { id: "comet", label: "☄️ Comets" },
            { id: "satellite", label: "🛰️ Satellites & Telescopes" },
            { id: "landmark", label: "🏙️ World Landmarks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 font-display text-xs font-semibold transition-all ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                  : "glass text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Targets Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTargets.map((target, i) => {
            const isQibla = target.category === "qibla";
            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className={`glass flex flex-col justify-between rounded-2xl p-5 text-left transition-all border group ${
                  isQibla
                    ? "border-amber-500/40 bg-amber-950/20 hover:border-amber-400 hover:shadow-amber-500/10 shadow-lg"
                    : "border-border/40 hover:border-primary/50 hover:shadow-primary/10 shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-4xl">{target.emoji}</span>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider glass"
                      style={{ color: target.color }}
                    >
                      {target.categoryLabel}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-foreground mb-1 flex items-center gap-1.5">
                    {target.name}
                    {isQibla && <span className="text-amber-400 text-xs">🕋</span>}
                  </h3>

                  <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                    {target.fact}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/30 font-body text-xs gap-2">
                  <button
                    onClick={() => setPreview3DTarget(target)}
                    className="rounded-lg bg-secondary/40 hover:bg-secondary border border-border/40 px-3 py-1.5 text-[11px] font-display font-medium text-foreground transition-all flex items-center gap-1 hover:border-primary/40"
                  >
                    🪐 3D View
                  </button>

                  <button
                    onClick={() => onSelect(target)}
                    className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg px-3.5 py-1.5"
                  >
                    Track AR ➔
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredTargets.length === 0 && (
          <div className="glass rounded-2xl p-12 text-center my-8">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-display text-base font-semibold text-foreground mb-1">No Targets Found</p>
            <p className="font-body text-xs text-muted-foreground mb-4">
              No matching target for "{search}". Try searching another name or add a custom coordinate target!
            </p>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="rounded-xl bg-primary/20 border border-primary/40 px-4 py-2 font-display text-xs text-primary"
            >
              Reset Search Filter
            </button>
          </div>
        )}
      </div>

      {/* 3D WebGL Preview Modal */}
      <AnimatePresence>
        {preview3DTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setPreview3DTarget(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-lg rounded-3xl p-6 border border-primary/40 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{preview3DTarget.emoji}</span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-foreground">{preview3DTarget.name}</h2>
                    <p className="font-body text-xs text-muted-foreground">{preview3DTarget.categoryLabel}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreview3DTarget(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <Planet3DViewer target={preview3DTarget} className="h-64 w-full" />
              </div>

              <p className="font-body text-xs text-muted-foreground leading-relaxed mb-5">
                {preview3DTarget.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPreview3DTarget(null)}
                  className="flex-1 rounded-xl border border-border py-3 font-display text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const t = preview3DTarget;
                    setPreview3DTarget(null);
                    onSelect(t);
                  }}
                  className="flex-1 rounded-xl bg-primary hover:bg-primary/90 py-3 font-display text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all"
                >
                  Launch Live AR Tracking ➔
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Target Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong w-full max-w-md rounded-3xl p-6 border border-emerald-500/30 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-emerald-400 flex items-center gap-2">
                  📍 Create Custom AR Target
                </h2>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateCustomTarget} className="space-y-4 font-body text-xs">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Target Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. My Home, Hometown City, Custom Landmark"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold font-mono">Latitude (-90 to 90)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 31.5204"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold font-mono">Longitude (-180 to 180)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 74.3587"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    className="w-full rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-foreground outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 rounded-xl border border-border py-3 font-display font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 py-3 font-display font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    Track in AR ➔
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
