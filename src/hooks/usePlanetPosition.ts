import { useEffect, useState, useCallback } from "react";

export interface CelestialBody {
  name: string;
  altitude: number;
  azimuth: number;
  constellation: string;
  aboveHorizon: boolean;
}

export function usePlanetPosition(lat: number, lng: number, planetName: string) {
  const [body, setBody] = useState<CelestialBody | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosition = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.visibleplanets.dev/v3?latitude=${lat}&longitude=${lng}&showCoords=true`
      );
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      const bodies: any[] = data.data || data;
      const match = bodies.find(
        (b: any) => b.name.toLowerCase() === planetName.toLowerCase()
      );
      if (match) {
        setBody({
          name: match.name,
          altitude: match.altitude,
          azimuth: match.azimuth,
          constellation: match.constellation || "Unknown",
          aboveHorizon: match.aboveHorizon ?? match.altitude >= 0,
        });
        setError(null);
      } else {
        setError(`${planetName} not found in API response`);
      }
    } catch (e: any) {
      setError(e.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, planetName]);

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  return { body, loading, error };
}
