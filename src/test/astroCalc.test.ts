import { describe, it, expect } from "vitest";
import { calculateCelestialPosition } from "../lib/astroCalc";
import { TARGETS, ALL_TARGETS_INFO } from "../lib/planetData";

describe("AstroCalc Engine & Target Directory", () => {
  it("contains all expected target categories", () => {
    expect(TARGETS.length).toBeGreaterThan(30);
    const categories = new Set(TARGETS.map(t => t.category));
    expect(categories.has("qibla")).toBe(true);
    expect(categories.has("solar")).toBe(true);
    expect(categories.has("star")).toBe(true);
    expect(categories.has("constellation")).toBe(true);
    expect(categories.has("deepspace")).toBe(true);
    expect(categories.has("comet")).toBe(true);
    expect(categories.has("satellite")).toBe(true);
    expect(categories.has("landmark")).toBe(true);
  });

  it("calculates celestial positions correctly for new targets", () => {
    const lat = 21.4225;
    const lng = 39.8262; // Mecca coordinates

    const kaabaPos = calculateCelestialPosition(lat, lng, "kaaba");
    expect(kaabaPos.azimuth).toBeDefined();
    expect(kaabaPos.aboveHorizon).toBe(true);

    const orionPos = calculateCelestialPosition(lat, lng, "orion-constellation");
    expect(orionPos.azimuth).toBeGreaterThanOrEqual(0);
    expect(orionPos.azimuth).toBeLessThanOrEqual(360);

    const andromedaPos = calculateCelestialPosition(lat, lng, "andromeda-galaxy");
    expect(andromedaPos.name).toBe("Andromeda Galaxy (M31)");

    const jwstPos = calculateCelestialPosition(lat, lng, "jwst");
    expect(jwstPos.name).toBe("James Webb Telescope (JWST)");

    const halleyPos = calculateCelestialPosition(lat, lng, "halleys-comet");
    expect(halleyPos.name).toBe("Halley's Comet (1P/Halley)");
  });

  it("handles All Targets mode info object", () => {
    expect(ALL_TARGETS_INFO.id).toBe("all");
    expect(ALL_TARGETS_INFO.categoryLabel).toBe("All-in-One Mode");
  });
});
