import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LocationScreen from "@/components/LocationScreen";
import PlanetSelectScreen from "@/components/PlanetSelectScreen";
import ARFinderScreen from "@/components/ARFinderScreen";
import { PlanetInfo } from "@/lib/planetData";

type Screen = "location" | "select" | "ar";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("location");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [planet, setPlanet] = useState<PlanetInfo | null>(null);

  const handleLocation = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    setScreen("select");
  };

  const handlePlanetSelect = (p: PlanetInfo) => {
    setPlanet(p);
    setScreen("ar");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        {screen === "location" && (
          <motion.div
            key="location"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <LocationScreen onLocationSet={handleLocation} />
          </motion.div>
        )}
        {screen === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <PlanetSelectScreen
              onSelect={handlePlanetSelect}
              onBack={() => setScreen("location")}
            />
          </motion.div>
        )}
        {screen === "ar" && coords && planet && (
          <motion.div
            key="ar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ARFinderScreen
              lat={coords.lat}
              lng={coords.lng}
              planet={planet}
              onBack={() => setScreen("select")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
