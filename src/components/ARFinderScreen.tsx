import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/hooks/useCamera";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { calculateCelestialPosition, CalculatedPosition } from "@/lib/astroCalc";
import { TARGETS, TargetInfo } from "@/lib/planetData";
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

  // Toggle states
  const [isAllMode, setIsAllMode] = useState(planet.id === "all");
  const [isVRMode, setIsVRMode] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<TargetInfo>(
    planet.id === "all" ? TARGETS[0] : planet
  );

  useEffect(() => {
    startCam();
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Compute viewport bounds (split in half if VR mode)
  const viewportW = isVRMode ? dims.w / 2 : dims.w;
  const viewportH = dims.h;
  const cx = viewportW / 2;
  const cy = viewportH / 2;
  const margin = 35;

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

    if (rawX < margin || rawX > viewportW - margin || rawY < margin || rawY > viewportH - margin) {
      offScreen = true;
      edgeAngle = Math.atan2(rawY - cy, rawX - cx);
      dotX = Math.max(margin, Math.min(viewportW - margin, rawX));
      dotY = Math.max(margin, Math.min(viewportH - margin, rawY));
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

  const alignedTarget = renderedTargets.find(rt => rt.aligned);
  const activeRendered = renderedTargets.find(rt => rt.info.id === selectedTarget.id) || renderedTargets[0];
  const activeBody = activeRendered?.body || calculateCelestialPosition(lat, lng, selectedTarget);

  useEffect(() => {
    if (alignedTarget && !hasVibrated.current) {
      try { navigator.vibrate?.(200); } catch { }
      hasVibrated.current = true;
    }
    if (!alignedTarget) hasVibrated.current = false;
  }, [alignedTarget]);

  const needsMotionPermission = permissionState === "prompt" || permissionState === "denied";
  const isDesktop = permissionState === "unsupported" && !("ontouchstart" in window);

  // Single Eye AR Viewport Component
  const RenderEyeViewport = ({ eyeLabel }: { eyeLabel: string }) => (
    <div className="relative h-full w-full overflow-hidden border-r border-cyan-500/20 last:border-0 bg-black">
      {/* Reticle / Crosshair */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
        <div
          className={`pulse-dot h-6 w-6 rounded-full border-2 transition-all ${
            alignedTarget
              ? alignedTarget.info.name.includes("Kaaba")
                ? "border-amber-400 bg-amber-500/40 glow-ring scale-125"
                : "border-horizon-green bg-horizon-green/40 glow-green scale-125"
              : "border-primary/80 bg-primary/20"
          }`}
        />
      </div>

      {/* Compass Ring */}
      <div className="pointer-events-auto absolute left-1/2 top-3 -translate-x-1/2 z-30 scale-90">
        <CompassRing
          phoneAzimuth={orientation.camAzimuth}
          planetAzimuth={activeBody?.azimuth ?? 0}
        />
      </div>

      {/* Tilt Gauge */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-30 scale-90">
        <TiltGauge
          phoneTilt={orientation.camAltitude}
          planetAltitude={activeBody?.altitude ?? 0}
        />
      </div>

      {/* Eye Label */}
      {isVRMode && (
        <div className="absolute left-3 top-3 z-40 rounded-md bg-black/60 px-2 py-0.5 font-display text-[9px] text-cyan-400 border border-cyan-500/30">
          {eyeLabel} EYE
        </div>
      )}

      {/* Alignment Banner */}
      <AnimatePresence>
        {alignedTarget && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute left-1/2 -translate-x-1/2 z-30"
            style={{ top: cy - 50 }}
          >
            <div className="glass whitespace-nowrap rounded-xl px-3 py-1.5 text-center border border-amber-400/40 shadow-xl backdrop-blur-md">
              <span className="font-display text-xs font-bold text-amber-300 flex items-center gap-1">
                {alignedTarget.info.name.includes("Kaaba")
                  ? "🕋 QIBLA ALIGNED!"
                  : `${alignedTarget.info.emoji} ${alignedTarget.info.name.toUpperCase()} ALIGNED!`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Dots Layer */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {renderedTargets.map((rt) => {
          const isSelected = rt.info.id === selectedTarget.id;
          const isKaaba = rt.info.name.includes("Kaaba");

          return (
            <div
              key={rt.info.id}
              onClick={() => setSelectedTarget(rt.info)}
              className="pointer-events-auto absolute flex flex-col items-center cursor-pointer transition-all duration-100"
              style={{
                left: rt.dotX - 18,
                top: rt.dotY - 18,
                zIndex: isSelected ? 30 : 20,
              }}
            >
              {rt.offScreen ? (
                (!isAllMode || isSelected) && (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-body text-lg shadow-lg backdrop-blur-sm ${
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
                <>
                  <div
                    className={`rounded-full border-2 flex items-center justify-center text-base shadow-lg backdrop-blur-sm transition-transform ${
                      isSelected
                        ? "h-10 w-10 scale-110 ring-2 ring-primary"
                        : "h-8 w-8 hover:scale-105"
                    }`}
                    style={{
                      borderColor: isKaaba ? "hsl(48, 95%, 55%)" : rt.info.color,
                      backgroundColor: (isKaaba ? "hsl(48, 95%, 55%)" : rt.info.color) + (isSelected ? "55" : "33"),
                    }}
                  >
                    {rt.info.emoji}
                  </div>

                  <span
                    className={`mt-0.5 font-display text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded-full glass whitespace-nowrap shadow-md ${
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
    </div>
  );

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-space-black">
      {/* Background Camera Feed */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Camera permission error */}
      {camError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-8">
          <div className="glass rounded-2xl p-6 text-center max-w-sm">
            <p className="mb-2 font-display text-sm text-destructive">📷 Camera Access Required</p>
            <p className="font-body text-xs text-muted-foreground">
              Please allow camera access in your browser settings to view live AR tracking overlay.
            </p>
          </div>
        </div>
      )}

      {isDesktop && !isVRMode && (
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

      {/* Top Controls Action Bar */}
      <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsVRMode(!isVRMode)}
          className={`glass flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-xs font-bold transition-all shadow-lg backdrop-blur-md ${
            isVRMode
              ? "border-cyan-400 bg-cyan-500/30 text-cyan-200 shadow-cyan-500/20 ring-2 ring-cyan-400/50"
              : "border-border text-foreground hover:border-cyan-400/50"
          }`}
        >
          {isVRMode ? "🥽 EXIT VR MODE" : "🥽 VR Split-Screen"}
        </button>

        <button
          onClick={() => setIsAllMode(!isAllMode)}
          className={`glass flex items-center gap-1.5 rounded-xl px-3 py-2 font-display text-xs font-bold transition-all shadow-lg backdrop-blur-md ${
            isAllMode
              ? "border-purple-400 bg-purple-500/30 text-purple-200 shadow-purple-500/20"
              : "border-primary/40 text-primary hover:bg-primary/10"
          }`}
        >
          {isAllMode ? "🌌 ALL Targets Mode" : "👁️ Single Target"}
        </button>
      </div>

      {/* Main Viewport Container (Single or Dual VR Split-Screen) */}
      <div className="relative h-full w-full flex">
        {isVRMode ? (
          <>
            <RenderEyeViewport eyeLabel="LEFT" />
            <RenderEyeViewport eyeLabel="RIGHT" />
          </>
        ) : (
          <RenderEyeViewport eyeLabel="MAIN" />
        )}
      </div>

      {/* Info Panel for Active Selected Target (Hidden in VR mode for clean headset viewing) */}
      {!isVRMode && activeBody && (
        <InfoPanel
          body={activeBody}
          planet={selectedTarget}
          onBack={onBack}
        />
      )}
    </div>
  );
}
