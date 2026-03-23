import { useEffect, useState, useCallback } from "react";

interface Orientation {
  alpha: number; // raw compass heading 0-360
  beta: number;  // raw front-back tilt -180 to 180
  gamma: number; // raw left-right tilt -90 to 90
  camAltitude: number; // geometrically true elevation of the back camera (-90 to 90)
  camAzimuth: number;  // geometrically true compass heading of back camera (0-360)
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<Orientation>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    camAltitude: 0,
    camAzimuth: 0,
  });
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt");

  const handler = useCallback((e: DeviceOrientationEvent) => {
    const alphaAngles = e.alpha ?? 0;
    const betaAngles = e.beta ?? 0;
    const gammaAngles = e.gamma ?? 0;

    // Convert degrees to radians for 3D rotation matrix math
    const rad = Math.PI / 180;
    const a = alphaAngles * rad;
    const b = betaAngles * rad;
    const g = gammaAngles * rad;

    // Determine back camera (-Z) pointing vector in world coordinates
    // Using W3C standardized DeviceOrientation rotations (Z-alpha, X-beta, Y-gamma)
    const vx = -Math.cos(a) * Math.sin(g) - Math.sin(a) * Math.sin(b) * Math.cos(g);
    const vy = -Math.sin(a) * Math.sin(g) + Math.cos(a) * Math.sin(b) * Math.cos(g);
    const vz = -Math.cos(b) * Math.cos(g);

    // Calculate true altitude (-90 to +90 degrees)
    const alt = Math.asin(Math.max(-1, Math.min(1, vz))) / rad;

    // Calculate true azimuth (0 to 360 degrees)
    let az = Math.atan2(vx, vy) / rad;
    if (az < 0) az += 360;

    setOrientation({
      alpha: alphaAngles,
      beta: betaAngles,
      gamma: gammaAngles,
      camAltitude: alt,
      camAzimuth: az,
    });
  }, []);

  const requestPermission = async () => {
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === "function") {
      try {
        const result = await DOE.requestPermission();
        if (result === "granted") {
          setPermissionState("granted");
          window.addEventListener("deviceorientation", handler, true);
        } else {
          setPermissionState("denied");
        }
      } catch {
        setPermissionState("denied");
      }
    } else {
      // Android or desktop — no permission needed
      setPermissionState("granted");
      window.addEventListener("deviceorientation", handler, true);
    }
  };

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) {
      setPermissionState("unsupported");
      return;
    }
    // On non-iOS, just start listening
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission !== "function") {
      setPermissionState("granted");
      window.addEventListener("deviceorientation", handler, true);
    }
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [handler]);

  return { orientation, permissionState, requestPermission };
}
