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
      setError("Geolocation not supported on this browser");
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
        setError("Location access denied. Please enter your coordinates manually below.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useManual = () => {
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (isNaN(la) || isNaN(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) {
      setError("Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)");
      return;
    }
    onLocationSet(la, ln);
  };

  return (
    <div className="starfield">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12"
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 text-6xl"
        >
          🌐
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-2 font-display text-3xl font-bold text-primary text-glow text-center"
        >
          AR Target Hub A-Z
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 max-w-sm text-center font-body text-sm text-muted-foreground"
        >
          Track Qibla (Kaaba), Planets, Stars, World Wonders & Custom Coordinates live in Augmented Reality
        </motion.p>

        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.95 }}
          onClick={useGPS}
          disabled={loading}
          className="mb-8 w-full max-w-xs rounded-2xl bg-primary px-6 py-4 font-display text-sm font-semibold text-primary-foreground glow-ring transition-all disabled:opacity-50 shadow-xl"
        >
          {loading ? "Locating Your Position..." : "📍 Use My Live GPS Location"}
        </motion.button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass w-full max-w-xs rounded-2xl p-6"
        >
          <p className="mb-4 text-center font-display text-xs uppercase tracking-widest text-muted-foreground">
            Or Enter Coordinates
          </p>
          <div className="mb-3">
            <label className="mb-1 block font-body text-xs text-muted-foreground">Latitude</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="e.g. 21.4225 or 40.7128"
              className="w-full rounded-lg bg-muted/60 px-4 py-3 font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-body text-xs text-muted-foreground">Longitude</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="e.g. 39.8262 or -74.0060"
              className="w-full rounded-lg bg-muted/60 px-4 py-3 font-body text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={useManual}
            className="w-full rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 font-display text-xs font-semibold text-primary transition-all hover:bg-primary/20"
          >
            Explore Hub Directory ➔
          </button>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-center font-body text-sm text-destructive max-w-xs"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
      <Footer />
    </div>
  );
}
