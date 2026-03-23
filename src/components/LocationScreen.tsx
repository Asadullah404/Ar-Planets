import { useState } from "react";
import { motion } from "framer-motion";
import Footer from "./Footer";

interface Props {
  onLocationSet: (lat: number, lng: number) => void;
}

export default function LocationScreen({ onLocationSet }: Props) {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onLocationSet(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        setLoading(false);
        setError("Location denied. Please enter coordinates manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useManual = () => {
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (isNaN(la) || isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setError("Enter valid coordinates (lat: -90 to 90, lng: -180 to 180)");
      return;
    }
    onLocationSet(la, ln);
  };

  return (
    <div className="starfield">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-6xl"
        >
          🌍
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-2 font-display text-3xl font-bold text-primary text-glow"
        >
          PlanetFinder AR
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-10 font-body text-muted-foreground"
        >
          Find planets in the sky around you
        </motion.p>

        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={useGPS}
          disabled={loading}
          className="mb-8 w-full max-w-xs rounded-xl bg-primary px-6 py-4 font-display text-sm font-semibold text-primary-foreground glow-ring transition-all disabled:opacity-50"
        >
          {loading ? "Locating..." : "📍 Use My Location"}
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass w-full max-w-xs rounded-2xl p-6"
        >
          <p className="mb-4 text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
            Or enter manually
          </p>
          <div className="mb-3">
            <label className="mb-1 block font-body text-xs text-muted-foreground">Latitude</label>
            <input
              type="number"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 40.7128"
              className="w-full rounded-lg bg-muted px-4 py-3 font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-body text-xs text-muted-foreground">Longitude</label>
            <input
              type="number"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. -74.0060"
              className="w-full rounded-lg bg-muted px-4 py-3 font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={useManual}
            className="w-full rounded-lg border border-primary/30 bg-transparent px-4 py-3 font-display text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Use These Coordinates
          </button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center font-body text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
      <Footer />
    </div>
  );
}
