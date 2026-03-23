export interface PlanetInfo {
  name: string;
  emoji: string;
  fact: string;
  distance: string; // average distance from Earth
  color: string; // hsl color for the dot
  /** Extended detail fields */
  diameter: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  moons: number;
  surfaceTemp: string;
  type: string;
  description: string;
}

export const PLANETS: PlanetInfo[] = [
  {
    name: "Sun",
    emoji: "☀️",
    fact: "Light takes 8 minutes to reach Earth from the Sun",
    distance: "149.6M km",
    color: "hsl(45, 100%, 66%)",
    diameter: "1,392,700 km",
    orbitalPeriod: "N/A (center of solar system)",
    rotationPeriod: "~25 days (equator)",
    moons: 0,
    surfaceTemp: "5,500°C (surface) / 15M°C (core)",
    type: "G-type main-sequence star",
    description:
      "The Sun is the star at the center of our solar system. It contains 99.86% of the solar system's total mass and is by far the most important energy source for life on Earth. Its gravity holds all the planets in their orbits.",
  },
  {
    name: "Moon",
    emoji: "🌙",
    fact: "The only celestial body humans have walked on",
    distance: "384,400 km",
    color: "hsl(210, 15%, 80%)",
    diameter: "3,474 km",
    orbitalPeriod: "27.3 days",
    rotationPeriod: "27.3 days (tidally locked)",
    moons: 0,
    surfaceTemp: "-173°C to 127°C",
    type: "Natural satellite",
    description:
      "Earth's only natural satellite, the Moon is the fifth-largest moon in the solar system. It is thought to have formed ~4.5 billion years ago from debris after a Mars-sized body collided with Earth. It stabilises our planet's axial tilt.",
  },
  {
    name: "Mercury",
    emoji: "🪨",
    fact: "A year on Mercury is just 88 Earth days",
    distance: "77M km",
    color: "hsl(30, 30%, 55%)",
    diameter: "4,879 km",
    orbitalPeriod: "88 days",
    rotationPeriod: "59 days",
    moons: 0,
    surfaceTemp: "-180°C to 430°C",
    type: "Terrestrial planet",
    description:
      "Mercury is the smallest planet and closest to the Sun. Despite being closest to the Sun, it is not the hottest planet — that honour goes to Venus. Its surface is heavily cratered, resembling Earth's Moon.",
  },
  {
    name: "Venus",
    emoji: "🌟",
    fact: "Venus spins backwards compared to most planets",
    distance: "261M km",
    color: "hsl(40, 80%, 70%)",
    diameter: "12,104 km",
    orbitalPeriod: "225 days",
    rotationPeriod: "243 days (retrograde)",
    moons: 0,
    surfaceTemp: "465°C (average)",
    type: "Terrestrial planet",
    description:
      "Venus is the hottest planet in our solar system due to its thick atmosphere of CO₂ which creates a runaway greenhouse effect. It rotates backwards relative to most other planets, so the Sun rises in the west on Venus.",
  },
  {
    name: "Mars",
    emoji: "🔴",
    fact: "Home to Olympus Mons, the tallest volcano in the solar system",
    distance: "225M km",
    color: "hsl(10, 70%, 50%)",
    diameter: "6,779 km",
    orbitalPeriod: "687 days",
    rotationPeriod: "24h 37m",
    moons: 2,
    surfaceTemp: "-87°C to -5°C",
    type: "Terrestrial planet",
    description:
      "Mars is home to the solar system's highest volcano (Olympus Mons) and longest canyon (Valles Marineris). Evidence suggests Mars once had liquid water on its surface. It has two small moons, Phobos and Deimos.",
  },
  {
    name: "Jupiter",
    emoji: "🟠",
    fact: "Jupiter's Great Red Spot is a storm bigger than Earth",
    distance: "778M km",
    color: "hsl(25, 60%, 55%)",
    diameter: "139,820 km",
    orbitalPeriod: "11.9 years",
    rotationPeriod: "9h 56m",
    moons: 95,
    surfaceTemp: "-108°C (cloud tops)",
    type: "Gas giant",
    description:
      "Jupiter is the largest planet in our solar system — more than twice as massive as all other planets combined. The Great Red Spot is a persistent anticyclonic storm that has lasted over 350 years. Its moon Europa may harbor a subsurface ocean.",
  },
  {
    name: "Saturn",
    emoji: "🪐",
    fact: "Saturn's rings are made mostly of ice and rock",
    distance: "1.4B km",
    color: "hsl(45, 50%, 60%)",
    diameter: "116,460 km",
    orbitalPeriod: "29.5 years",
    rotationPeriod: "10h 42m",
    moons: 146,
    surfaceTemp: "-138°C (cloud tops)",
    type: "Gas giant",
    description:
      "Saturn is famous for its stunning ring system, composed mostly of ice particles and rocky debris. It is the least dense planet — it would float in water! Its moon Titan is the only moon in the solar system with a thick atmosphere.",
  },
  {
    name: "Uranus",
    emoji: "🔵",
    fact: "Uranus rotates on its side like a rolling ball",
    distance: "2.9B km",
    color: "hsl(185, 60%, 60%)",
    diameter: "50,724 km",
    orbitalPeriod: "84 years",
    rotationPeriod: "17h 14m (retrograde)",
    moons: 28,
    surfaceTemp: "-195°C (cloud tops)",
    type: "Ice giant",
    description:
      "Uranus has an extreme axial tilt of 98°, meaning it essentially rolls around the Sun on its side. This causes extreme seasonal variations. It emits almost no internal heat, making it the coldest planetary atmosphere in the solar system.",
  },
  {
    name: "Neptune",
    emoji: "💙",
    fact: "Neptune has the strongest winds in the solar system",
    distance: "4.5B km",
    color: "hsl(220, 70%, 55%)",
    diameter: "49,244 km",
    orbitalPeriod: "165 years",
    rotationPeriod: "16h 6m",
    moons: 16,
    surfaceTemp: "-201°C (cloud tops)",
    type: "Ice giant",
    description:
      "Neptune is the furthest planet from the Sun and the windiest, with supersonic winds reaching 2,100 km/h. It was the first planet discovered through mathematical prediction rather than observation. Its largest moon, Triton, orbits in retrograde.",
  },
];

export function getPlanetInfo(name: string): PlanetInfo {
  return PLANETS.find(p => p.name.toLowerCase() === name.toLowerCase()) || PLANETS[0];
}
