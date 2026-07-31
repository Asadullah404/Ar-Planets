import { useEffect, useState, useCallback } from "react";
import { calculateCelestialPosition, CalculatedPosition } from "@/lib/astroCalc";

export interface CelestialBody {
  name: string;
  altitude: number;
  azimuth: number;
  constellation: string;
  aboveHorizon: boolean;
  distanceKm?: string;
  extraDetails?: string;
}

export function usePlanetPosition(lat: number, lng: number, planetName: string) {
  const [body, setBody] = useState<CelestialBody | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatePosition = useCallback(() => {
    try {
      const pos: CalculatedPosition = calculateCelestialPosition(lat, lng, planetName);
      setBody({
        name: pos.name,
        altitude: pos.altitude,
        azimuth: pos.azimuth,
        constellation: pos.constellation,
        aboveHorizon: pos.aboveHorizon,
        distanceKm: pos.distanceKm,
        extraDetails: pos.extraDetails,
      });
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to calculate position");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, planetName]);

  useEffect(() => {
    calculatePosition();
    // Update live position every second for real-time tracking
    const interval = setInterval(calculatePosition, 1000);
    return () => clearInterval(interval);
  }, [calculatePosition]);

  return { body, loading, error };
}
