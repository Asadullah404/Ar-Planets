import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/hooks/useCamera";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { calculateCelestialPosition, CalculatedPosition } from "@/lib/astroCalc";
import { TARGETS, TargetInfo, getPlanetInfo } from "@/lib/planetData";
import CompassRing from "./CompassRing";
import TiltGauge from "./TiltGauge";
import InfoPanel from "./InfoPanel";

const SCALE = 6;

interface Props {
  lat: number;
  lng: number;
  planet: TargetInfo;
  onBack: () => void;
}

interface RenderedTarget {
  info: TargetInfo;
  body: CalculatedPosition;
  dotX: number;
  dotY: number;
  offScreen: boolean;
  edgeAngle: number;
  aligned: boolean;
}

export default function ARFinderScreen({ lat, lng, planet, onBack }: Props) {
  const { videoRef, error: camError, start: startCam } = useCamera();
  const { orientation, permissionState, requestPermission } = useDeviceOrientation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const hasVibrated = useRef(false);

  // Toggle for All Targets Mode vs Single Target Mode
  const [isAllMode, setIsAllMode] = useState(planet.id === "all");
  const [selectedTarget, setSelectedTarget] = useState<TargetInfo>(
    planet.id === "all" ? TARGETS[0] : planet
  );

  useEffect(() => {
    startCam();
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const cx = dims.w / 2;
  const cy = dims.h / 2;
  const margin = 40;

  // Active targets list to calculate
  const activeTargetsList: TargetInfo[] = isAllMode ? TARGETS : [selectedTarget];

  // Calculate live position for active targets
  const renderedTargets: RenderedTarget[] = activeTargetsList.map((t) => {
    const body = calculateCelestialPosition(lat, lng, t);

    let azDiff = body.azimuth - orientation.camAzimuth;
    if (azDiff > 180) azDiff -= 360;
    if (azDiff < -180) azDiff += 360;

    const altDiff = body.altitude - orientation.camAltitude;

    const rawX = cx + azDiff * SCALE;
    const rawY = cy - altDiff * SCALE;

    let offScreen = false;
    let edgeAngle = 0;
    let dotX = rawX;
    let dotY = rawY;

    if (rawX < margin || rawX > dims.w - margin || rawY < margin || rawY > dims.h - margin) {
      offScreen = true;
      edgeAngle = Math.atan2(rawY - cy, rawX - cx);
      dotX = Math.max(margin, Math.min(dims.w - margin, rawX));
      dotY = Math.max(margin, Math.min(dims.h - margin, rawY));
    }

    const dist = Math.sqrt((dotX - cx) ** 2 + (dotY - cy) ** 2);
    const aligned = dist < 35 && !offScreen;

    return {
      info: t,
      body,
      dotX,
      dotY,
      offScreen,
      edgeAngle,
      aligned
    };
  });

  // Find the primary aligned target (if any)
  const alignedTarget = renderedTargets.find(rt => rt.aligned);

  // Active target for InfoPanel
  const activeRendered = renderedTargets.find(rt => rt.info.id === selectedTarget.id) || renderedTargets[0];
  const activeBody = activeRendered?.body || calculateCelestialPosition(lat, lng, selectedTarget);

  // Trigger vibration when aligned with any target
  useEffect(() => {
    if (alignedTarget && !hasVibrated.current) {
      try { navigator.vibrate?.(200); } catch { }
      hasVibrated.current = true;
    }
    if (!alignedTarget) hasVibrated.current = false;
  }, [alignedTarget]);

  const isQibla = selectedTarget.name.includes("Kaaba");
  const needsMotionPermission = permissionState === "prompt" || permissionState === "denied";
  const isDesktop = permissionState === "unsupported" && !("ontouchstart" in window);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-space-black">
      {/* Camera feed layer */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Camera permission error */}
      {camError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-8">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="mb-2 font-display text-sm text-destructive">📷 Camera Access Required</p>
            <p className="font-body text-xs text-muted-foreground">
              Please allow camera access in your browser settings to view live AR tracking overlay.
            </p>
          </div>
        </div>
      )}

      {isDesktop && (
        <div className="absolute inset-x-0 top-16 z-40 flex justify-center px-4 pointer-events-none">
          <div className="glass rounded-xl px-4 py-1.5 font-body text-[11px] text-secondary text-center">
            📱 Works best on mobile devices with camera & compass sensors
          </div>
        </div>
      )}

      {/* Motion sensor permission overlay */}
      {needsMotionPermission && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 p-6">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-6 text-center max-w-sm">
            <p className="mb-4 font-display text-base text-foreground">Compass & Sensor Access</p>
            <p className="mb-4 font-body text-xs text-muted-foreground">
              Required for live directional tracking toward {selectedTarget.name}.
            </p>
            <button
              onClick={requestPermission}
              className="rounded-xl bg-primary px-6 py-3 font-display text-xs font-semibold text-primary-foreground shadow-lg"
            >
              🧭 Enable Sensors
            </button>
          </motion.div>
        </div>
      )}

      {/* Mode Switcher Toggle Bar (Top Right) */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsAllMode(!isAllMode)}
          className={`glass flex items-center gap-2 rounded-xl px-3.5 py-2 font-display text-xs font-bold transition-all shadow-lg backdrop-blur-md ${
            isAllMode
              ? "border-purple-400 bg-purple-500/30 text-purple-200 shadow-purple-500/20"
              : "border-primary/40 text-primary hover:bg-primary/10"
          }`}
        >
          {isAllMode ? "🌌 ALL Mode Active (25+)" : "👁️ Single Target Mode"}
        </button>
      </div>

      {/* AR Viewport Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Compass Ring - Top Center */}
        <div className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2">
          <CompassRing
            phoneAzimuth={orientation.camAzimuth}
            planetAzimuth={activeBody?.azimuth ?? 0}
          />
        </div>

        {/* Tilt Gauge - Right Side */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <TiltGauge
            phoneTilt={orientation.camAltitude}
            planetAltitude={activeBody?.altitude ?? 0}
          />
        </div>

        {/* Center Crosshair Target Dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`pulse-dot h-7 w-7 rounded-full border-2 transition-all ${
              alignedTarget
                ? alignedTarget.info.name.includes("Kaaba")
                  ? "border-amber-400 bg-amber-500/40 glow-ring scale-125"
                  : "border-horizon-green bg-horizon-green/40 glow-green scale-125"
                : "border-primary/80 bg-primary/20"
            }`}
          />
        </div>

        {/* Alignment Notification Banner */}
        <AnimatePresence>
          {alignedTarget && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: cy - 60 }}
            >
              <div className="glass whitespace-nowrap rounded-xl px-4 py-2 text-center border border-amber-400/40 shadow-xl backdrop-blur-md">
                <span className="font-display text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  {alignedTarget.info.name.includes("Kaaba")
                    ? "🕋 KHANA KABA (QIBLA) DIRECTLY AHEAD!"
                    : `${alignedTarget.info.emoji} ${alignedTarget.info.name.toUpperCase()} IS ALIGNED!`}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Targets on Screen */}
        {renderedTargets.map((rt) => {
          const isSelected = rt.info.id === selectedTarget.id;
          const isKaaba = rt.info.name.includes("Kaaba");

          return (
            <div
              key={rt.info.id}
              onClick={() => setSelectedTarget(rt.info)}
              className="pointer-events-auto absolute flex flex-col items-center cursor-pointer transition-all duration-100 group"
              style={{
                left: rt.dotX - 20,
                top: rt.dotY - 20,
                zIndex: isSelected ? 30 : 20,
              }}
            >
              {rt.offScreen ? (
                // Offscreen directional arrow (show arrow for selected target or in single mode)
                (!isAllMode || isSelected) && (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-body text-xl shadow-lg backdrop-blur-sm ${
                      isKaaba
                        ? "border-amber-400/80 bg-amber-500/30 text-amber-300"
                        : "border-secondary/60 bg-secondary/20 text-foreground"
                    }`}
                    style={{ transform: `rotate(${rt.edgeAngle}rad)` }}
                  >
                    ➔
                  </div>
                )
              ) : (
                // Onscreen Target Dot
                <>
                  <div
                    className={`rounded-full border-2 flex items-center justify-center text-lg shadow-lg backdrop-blur-sm transition-transform ${
                      isSelected
                        ? "h-11 w-11 scale-115 ring-2 ring-primary"
                        : "h-9 w-9 hover:scale-110"
                    }`}
                    style={{
                      borderColor: isKaaba ? "hsl(48, 95%, 55%)" : rt.info.color,
                      backgroundColor: (isKaaba ? "hsl(48, 95%, 55%)" : rt.info.color) + (isSelected ? "55" : "33"),
                    }}
                  >
                    {rt.info.emoji}
                  </div>

                  <span
                    className={`mt-1 font-display text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full glass whitespace-nowrap shadow-md ${
                      isSelected ? "border border-primary/50 text-white" : "text-muted-foreground"
                    }`}
                    style={{ color: isSelected ? "#ffffff" : isKaaba ? "#fcd34d" : rt.info.color }}
                  >
                    {rt.info.name}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Panel for Active Selected Target */}
      {activeBody && (
        <InfoPanel
          body={activeBody}
          planet={selectedTarget}
          onBack={onBack}
        />
      )}
    </div>
  );
}
