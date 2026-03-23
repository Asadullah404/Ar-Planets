import { useEffect, useState, useCallback } from "react";

interface Orientation {
  alpha: number; // compass heading 0-360
  beta: number;  // front-back tilt -180 to 180
  gamma: number; // left-right tilt -90 to 90
}

export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<Orientation>({ alpha: 0, beta: 0, gamma: 0 });
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied" | "unsupported">("prompt");

  const handler = useCallback((e: DeviceOrientationEvent) => {
    setOrientation({
      alpha: e.alpha ?? 0,
      beta: e.beta ?? 0,
      gamma: e.gamma ?? 0,
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
