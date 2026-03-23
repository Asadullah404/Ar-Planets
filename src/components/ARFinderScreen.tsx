import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCamera } from "@/hooks/useCamera";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { usePlanetPosition } from "@/hooks/usePlanetPosition";
import { PlanetInfo, getPlanetInfo } from "@/lib/planetData";
import CompassRing from "./CompassRing";
import TiltGauge from "./TiltGauge";
import InfoPanel from "./InfoPanel";

const SCALE = 6;

interface Props {
  lat: number;
  lng: number;
  planet: PlanetInfo;
  onBack: () => void;
}

export default function ARFinderScreen({ lat, lng, planet, onBack }: Props) {
  const { videoRef, error: camError, active: camActive, start: startCam } = useCamera();
  const { orientation, permissionState, requestPermission } = useDeviceOrientation();
  const { body, loading, error: apiError } = usePlanetPosition(lat, lng, planet.name);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: window.innerWidth, h: window.innerHeight });
  const hasVibrated = useRef(false);

  useEffect(() => {
    startCam();
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Calculate planet dot position
  const cx = dims.w / 2;
  const cy = dims.h / 2;
  let dotX = cx;
  let dotY = cy;
  let offScreen = false;
  let edgeAngle = 0;
  let aligned = false;

  if (body) {
    let azDiff = body.azimuth - orientation.alpha;
    if (azDiff > 180) azDiff -= 360;
    if (azDiff < -180) azDiff += 360;

    // DeviceOrientation beta is ~90° when the phone is held upright (portrait).
    // To make 0° altitude = straight ahead, we subtract 90 from beta.
    const effectiveTilt = orientation.beta - 90;
    const altDiff = body.altitude - effectiveTilt;

    const rawX = cx + azDiff * SCALE;
    const rawY = cy - altDiff * SCALE;

    const margin = 40;
    if (rawX < margin || rawX > dims.w - margin || rawY < margin || rawY > dims.h - margin) {
      offScreen = true;
      edgeAngle = Math.atan2(rawY - cy, rawX - cx);
      dotX = Math.max(margin, Math.min(dims.w - margin, rawX));
      dotY = Math.max(margin, Math.min(dims.h - margin, rawY));
    } else {
      dotX = rawX;
      dotY = rawY;
    }

    const dist = Math.sqrt((dotX - cx) ** 2 + (dotY - cy) ** 2);
    aligned = dist < 30 && !offScreen;

    if (aligned && !hasVibrated.current) {
      try { navigator.vibrate?.(200); } catch { }
      hasVibrated.current = true;
    }
    if (!aligned) hasVibrated.current = false;
  }

  const needsMotionPermission = permissionState === "prompt" || permissionState === "denied";
  const isDesktop = permissionState === "unsupported" && !("ontouchstart" in window);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-space-black">
      {/* Camera layer */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Fallback overlays */}
      {camError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 p-8">
          <div className="glass rounded-2xl p-6 text-center">
            <p className="mb-2 font-display text-sm text-destructive">📷 Camera Required</p>
            <p className="font-body text-xs text-muted-foreground">
              Please allow camera access to use the AR finder. Check your browser settings.
            </p>
          </div>
        </div>
      )}

      {isDesktop && (
        <div className="absolute inset-x-0 top-4 z-40 flex justify-center">
          <div className="glass rounded-xl px-4 py-2 font-body text-xs text-secondary">
            📱 This app works best on a mobile device with camera + gyroscope
          </div>
        </div>
      )}

      {/* Motion permission button */}
      {needsMotionPermission && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-6 text-center">
            <p className="mb-4 font-display text-sm text-foreground">Enable Motion Sensors</p>
            <p className="mb-4 font-body text-xs text-muted-foreground">
              Required for compass and tilt tracking
            </p>
            <button
              onClick={requestPermission}
              className="rounded-xl bg-primary px-6 py-3 font-display text-xs font-semibold text-primary-foreground"
            >
              🧭 Enable Sensors
            </button>
            {permissionState === "denied" && (
              <p className="mt-3 font-body text-xs text-destructive">
                Permission denied. Check browser settings.
              </p>
            )}
          </motion.div>
        </div>
      )}

      {/* AR Overlay */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {/* Compass Ring - top center */}
        <div className="pointer-events-auto absolute left-1/2 top-4 -translate-x-1/2">
          <CompassRing
            phoneAzimuth={orientation.alpha}
            planetAzimuth={body?.azimuth ?? 0}
          />
        </div>

        {/* Tilt Gauge - right side */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <TiltGauge
            phoneTilt={orientation.beta}
            planetAltitude={body?.altitude ?? 0}
          />
        </div>

        {/* Center target dot */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`pulse-dot h-5 w-5 rounded-full border-2 ${aligned
              ? "border-horizon-green bg-horizon-green/30 glow-green"
              : "border-primary bg-primary/20"
              }`}
          />
        </div>

        {/* Alignment label */}
        <AnimatePresence>
          {aligned && body && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: cy - 50 }}
            >
              <div className="glass whitespace-nowrap rounded-xl px-4 py-2 text-center">
                <span className="font-display text-sm font-bold text-horizon-green">
                  🔭 {body.name} is HERE!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planet dot */}
        {body && (
          <div
            className="absolute flex flex-col items-center transition-all duration-100"
            style={{
              left: dotX - 16,
              top: dotY - 16,
            }}
          >
            {offScreen ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-secondary/60 bg-secondary/20 font-body text-lg"
                style={{ transform: `rotate(${edgeAngle}rad)` }}
              >
                →
              </div>
            ) : (
              <>
                <div
                  className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm"
                  style={{
                    borderColor: planet.color,
                    backgroundColor: planet.color + "33",
                  }}
                >
                  {planet.emoji}
                </div>
                <span
                  className="mt-0.5 font-display text-[8px] font-bold tracking-wider"
                  style={{ color: planet.color }}
                >
                  {planet.name}
                </span>
              </>
            )}
          </div>
        )}

        {/* Below horizon notice */}
        {body && !body.aboveHorizon && (
          <div className="absolute left-1/2 top-36 -translate-x-1/2">
            <div className="glass rounded-lg px-3 py-1.5">
              <span className="font-body text-[10px] text-secondary">
                ⬇ Below horizon — showing direction
              </span>
            </div>
          </div>
        )}

        {/* API error */}
        {apiError && (
          <div className="absolute left-1/2 top-36 -translate-x-1/2">
            <div className="glass rounded-lg px-3 py-1.5">
              <span className="font-body text-[10px] text-destructive">
                ⚠ Live data unavailable
              </span>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && !body && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="glass rounded-xl px-4 py-3">
              <span className="font-display text-xs text-primary">Fetching position...</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      {body && <InfoPanel body={body} planet={planet} onBack={onBack} />}
    </div>
  );
}
