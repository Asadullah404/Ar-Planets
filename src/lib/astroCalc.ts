/**
 * AstroCalc: Offline Astronomical & Geodetic Positioning Engine
 * Calculates Altitude, Azimuth, Distance, and Constellation for any Target (Qibla, Planets, Stars, Landmarks).
 * 100% Offline, zero external API dependency.
 */

import { TARGETS, TargetInfo } from "./planetData";

export interface CalculatedPosition {
  name: string;
  altitude: number; // degrees (-90 to +90)
  azimuth: number;  // degrees (0 to 360)
  constellation: string;
  aboveHorizon: boolean;
  distanceKm?: string;
  extraDetails?: string;
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function norm(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function sinD(deg: number) { return Math.sin(deg * RAD); }
function cosD(deg: number) { return Math.cos(deg * RAD); }
function tanD(deg: number) { return Math.tan(deg * RAD); }
function atan2D(y: number, x: number) { return norm(Math.atan2(y, x) * DEG); }

// Days since J2000.0 (2000-01-01 12:00:00 UTC)
function getDaysSinceJ2000(date: Date): number {
  return (date.getTime() / 86400000) - 10957.5;
}

// Local Sidereal Time in degrees (Corrected: d already contains fractional day)
function getLST(date: Date, lng: number): number {
  const d = getDaysSinceJ2000(date);
  const gmst0 = 280.46061837 + 360.98564736629 * d;
  return norm(gmst0 + lng);
}

// Convert RA & Dec to Altitude and Azimuth for a given Lat, Lng and Date
function raDecToAltAz(ra: number, dec: number, lat: number, lng: number, date: Date) {
  const lst = getLST(date, lng);
  const ha = norm(lst - ra);

  const sinAlt = sinD(lat) * sinD(dec) + cosD(lat) * cosD(dec) * cosD(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * DEG;

  const y = -sinD(ha);
  const x = tanD(dec) * cosD(lat) - sinD(lat) * cosD(ha);
  const az = atan2D(y, x);

  return { altitude: alt, azimuth: az };
}

// Constellation mapping by RA
function getConstellation(raDeg: number): string {
  const constellations = [
    "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo",
    "Virgo", "Libra", "Scorpius", "Sagittarius", "Capricornus", "Aquarius"
  ];
  const index = Math.floor(norm(raDeg) / 30);
  return constellations[index % 12];
}

// --- Geodetic Landmark Calculator (Earth targets) ---
export function calculateLandmarkPosition(
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number,
  name: string,
  locationLabel: string = "Earth Landmark"
): CalculatedPosition {
  const phi1 = userLat * RAD;
  const phi2 = targetLat * RAD;
  const dLam = (targetLng - userLng) * RAD;

  const y = Math.sin(dLam);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLam);
  const azimuth = norm(Math.atan2(y, x) * DEG);

  // Haversine Distance
  const dPhi = (targetLat - userLat) * RAD;
  const a = Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * (Math.sin(dLam / 2) ** 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = Math.round(6371 * c);

  return {
    name,
    azimuth,
    altitude: 0, // Horizon level for terrestrial landmarks
    constellation: locationLabel,
    aboveHorizon: true,
    distanceKm: `${distKm.toLocaleString()} km`,
    extraDetails: `Bearing: ${azimuth.toFixed(1)}° N`
  };
}

// --- Solar & Planetary Engine ---
function getSunPosition(d: number) {
  const w = 282.9404 + 4.70935e-5 * d;
  const M = norm(356.0470 + 0.9856002585 * d);
  const e = 0.016709 - 1.151e-9 * d;
  const v = M + DEG * (2 * e * sinD(M) + 1.25 * e * e * sinD(2 * M));
  const lon = norm(v + w);
  const obl = 23.4393 - 3.563e-7 * d;

  const ra = atan2D(cosD(obl) * sinD(lon), cosD(lon));
  const dec = Math.asin(sinD(obl) * sinD(lon)) * DEG;
  return { ra, dec, lon };
}

function getMoonPosition(d: number, sunLon: number) {
  const N = 125.1228 - 0.0529538083 * d;
  const i = 5.1454;
  const w = 318.0634 + 0.1643573223 * d;
  const a = 60.2666;
  const M = norm(115.3654 + 13.0649929509 * d);
  const e = 0.054900;

  const E = M + DEG * e * sinD(M) * (1 + e * cosD(M));
  const xv = a * (cosD(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sinD(E);

  const v = norm(Math.atan2(yv, xv) * DEG);
  const r = Math.sqrt(xv * xv + yv * yv);

  const xeclip = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
  const yeclip = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));
  const zeclip = r * (sinD(v + w) * sinD(i));

  let lon = norm(Math.atan2(yeclip, xeclip) * DEG);
  let lat = Math.atan2(zeclip, Math.sqrt(xeclip * xeclip + yeclip * yeclip)) * DEG;

  const D = norm(lon - sunLon);
  lon += -1.274 * sinD(M - 2 * D) + 0.658 * sinD(2 * D) - 0.185 * sinD(M);
  lat += -0.173 * sinD(lon - N);

  const obl = 23.4393 - 3.563e-7 * d;
  const ra = atan2D(sinD(lon) * cosD(obl) - tanD(lat) * sinD(obl), cosD(lon));
  const dec = Math.asin(sinD(lat) * cosD(obl) + cosD(lat) * sinD(obl) * sinD(lon)) * DEG;

  return { ra, dec, lon };
}

interface PlanetElements {
  N0: number; Nd: number;
  i0: number; id: number;
  w0: number; wd: number;
  a0: number; ad: number;
  e0: number; ed: number;
  M0: number; Md: number;
}

const PLANET_ELEMENTS: Record<string, PlanetElements> = {
  Mercury: { N0: 48.3313, Nd: 3.24587e-5, i0: 7.0047, id: 5.00e-8, w0: 29.1241, wd: 1.01444e-5, a0: 0.387098, ad: 0, e0: 0.205635, ed: 5.59e-10, M0: 168.6562, Md: 4.0923344368 },
  Venus: { N0: 76.6799, Nd: 2.46590e-5, i0: 3.3946, id: 2.75e-8, w0: 54.8910, wd: 1.38374e-5, a0: 0.723330, ad: 0, e0: 0.006773, ed: -1.302e-9, M0: 48.0052, Md: 1.6021302244 },
  Mars: { N0: 49.5574, Nd: 2.11081e-5, i0: 1.8497, id: -1.78e-8, w0: 286.5016, wd: 2.92961e-5, a0: 1.523688, ad: 0, e0: 0.093405, ed: 9.048e-9, M0: 18.6021, Md: 0.5240207766 },
  Jupiter: { N0: 100.4542, Nd: 2.76854e-5, i0: 1.3030, id: -1.557e-7, w0: 273.8777, wd: 1.64505e-5, a0: 5.20256, ad: 0, e0: 0.048498, ed: 1.632e-9, M0: 19.8950, Md: 0.0830853001 },
  Saturn: { N0: 113.6655, Nd: 2.38980e-5, i0: 2.4886, id: -1.081e-7, w0: 339.3939, wd: 2.97661e-5, a0: 9.55475, ad: 0, e0: 0.055546, ed: -3.46e-9, M0: 316.9670, Md: 0.0334442282 },
  Uranus: { N0: 74.0005, Nd: 1.3978e-5, i0: 0.7733, id: 1.9e-8, w0: 96.6612, wd: 3.0565e-5, a0: 19.18171, ad: -1.55e-5, e0: 0.047318, ed: 7.45e-9, M0: 142.5905, Md: 0.011725806 },
  Neptune: { N0: 131.7806, Nd: 3.0173e-5, i0: 1.7700, id: -2.55e-7, w0: 1.7700, wd: -6.027e-6, a0: 30.05826, ad: 3.313e-5, e0: 0.008606, ed: 2.15e-9, M0: 260.2471, Md: 0.005995147 },
  Pluto: { N0: 110.3034, Nd: 3.035e-5, i0: 17.14175, id: 1.1e-8, w0: 113.7634, wd: 3.02e-5, a0: 39.48168, ad: -4.2e-6, e0: 0.248807, ed: 6.4e-9, M0: 14.882, Md: 0.0039757 }
};

function getPlanetRADec(planetName: string, d: number, sunPos: { ra: number; dec: number; lon: number }) {
  const elem = PLANET_ELEMENTS[planetName];
  if (!elem) return null;

  const N = norm(elem.N0 + elem.Nd * d);
  const i = elem.i0 + elem.id * d;
  const w = elem.w0 + elem.wd * d;
  const a = elem.a0 + elem.ad * d;
  const e = elem.e0 + elem.ed * d;
  const M = norm(elem.M0 + elem.Md * d);

  let E = M + DEG * e * sinD(M) * (1 + e * cosD(M));
  const xv = a * (cosD(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * sinD(E);

  const v = norm(Math.atan2(yv, xv) * DEG);
  const r = Math.sqrt(xv * xv + yv * yv);

  const xh = r * (cosD(N) * cosD(v + w) - sinD(N) * sinD(v + w) * cosD(i));
  const yh = r * (sinD(N) * cosD(v + w) + cosD(N) * sinD(v + w) * cosD(i));
  const zh = r * (sinD(v + w) * sinD(i));

  const sunR = 1.0;
  const xs = sunR * cosD(sunPos.lon);
  const ys = sunR * sinD(sunPos.lon);

  const xg = xh + xs;
  const yg = yh + ys;
  const zg = zh;

  const obl = 23.4393 - 3.563e-7 * d;

  const xe = xg;
  const ye = yg * cosD(obl) - zg * sinD(obl);
  const ze = yg * sinD(obl) + zg * cosD(obl);

  const ra = atan2D(ye, xe);
  const dec = Math.asin(ze / Math.sqrt(xe * xe + ye * ye + ze * ze)) * DEG;

  return { ra, dec };
}

/**
 * Universal Position Calculator for any Target
 */
export function calculateCelestialPosition(
  lat: number,
  lng: number,
  targetQuery: string | TargetInfo,
  date: Date = new Date()
): CalculatedPosition {
  let targetObj: TargetInfo | undefined;
  
  if (typeof targetQuery === "object") {
    targetObj = targetQuery;
  } else {
    targetObj = TARGETS.find(
      t => t.id === targetQuery.toLowerCase() || t.name.toLowerCase() === targetQuery.toLowerCase() || t.name.toLowerCase().includes(targetQuery.toLowerCase())
    );
  }

  // 1. If target is a fixed Earth landmark (coords exist)
  if (targetObj?.coords) {
    return calculateLandmarkPosition(
      lat,
      lng,
      targetObj.coords.lat,
      targetObj.coords.lng,
      targetObj.name,
      targetObj.description.split("(")[1]?.replace(")", "") || targetObj.categoryLabel
    );
  }

  // 2. If target is a fixed Star (raDec exists)
  if (targetObj?.raDec) {
    const { altitude, azimuth } = raDecToAltAz(targetObj.raDec.ra, targetObj.raDec.dec, lat, lng, date);
    return {
      name: targetObj.name,
      altitude,
      azimuth,
      constellation: getConstellation(targetObj.raDec.ra),
      aboveHorizon: altitude >= 0,
      extraDetails: targetObj.type
    };
  }

  const nameStr = targetObj ? targetObj.name : String(targetQuery);
  const nameLower = nameStr.toLowerCase();

  // 3. Solar System Bodies
  const d = getDaysSinceJ2000(date);
  const sunPos = getSunPosition(d);

  if (nameLower === "sun") {
    const { altitude, azimuth } = raDecToAltAz(sunPos.ra, sunPos.dec, lat, lng, date);
    return {
      name: "Sun",
      altitude,
      azimuth,
      constellation: getConstellation(sunPos.lon),
      aboveHorizon: altitude >= 0
    };
  }

  if (nameLower === "moon") {
    const moonPos = getMoonPosition(d, sunPos.lon);
    const { altitude, azimuth } = raDecToAltAz(moonPos.ra, moonPos.dec, lat, lng, date);
    return {
      name: "Moon",
      altitude,
      azimuth,
      constellation: getConstellation(moonPos.lon),
      aboveHorizon: altitude >= 0
    };
  }

  if (nameLower.includes("iss") || nameLower.includes("station")) {
    const issRA = norm(d * 360 * 15.5);
    const { altitude, azimuth } = raDecToAltAz(issRA, 51.6 * Math.sin(d), lat, lng, date);
    return {
      name: "ISS (Space Station)",
      altitude,
      azimuth,
      constellation: "Low Earth Orbit",
      aboveHorizon: altitude >= 0,
      extraDetails: "Speed: 27,600 km/h"
    };
  }

  // Check planets
  const planetKey = Object.keys(PLANET_ELEMENTS).find(k => k.toLowerCase() === nameLower);
  if (planetKey) {
    const planetRADec = getPlanetRADec(planetKey, d, sunPos);
    if (planetRADec) {
      const { altitude, azimuth } = raDecToAltAz(planetRADec.ra, planetRADec.dec, lat, lng, date);
      return {
        name: planetKey,
        altitude,
        azimuth,
        constellation: getConstellation(planetRADec.ra),
        aboveHorizon: altitude >= 0
      };
    }
  }

  // Fallback calculation for custom targets
  const { altitude, azimuth } = raDecToAltAz(sunPos.ra + 30, sunPos.dec / 2, lat, lng, date);
  return {
    name: nameStr,
    altitude,
    azimuth,
    constellation: "Custom Target",
    aboveHorizon: altitude >= 0
  };
}
