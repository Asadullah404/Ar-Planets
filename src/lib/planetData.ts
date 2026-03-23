export interface PlanetInfo {
  name: string;
  emoji: string;
  fact: string;
  distance: string; // average distance from Earth
  color: string; // hsl color for the dot
}

export const PLANETS: PlanetInfo[] = [
  { name: "Sun", emoji: "☀️", fact: "Light takes 8 minutes to reach Earth from the Sun", distance: "149.6M km", color: "hsl(45, 100%, 66%)" },
  { name: "Moon", emoji: "🌙", fact: "The only celestial body humans have walked on", distance: "384,400 km", color: "hsl(210, 15%, 80%)" },
  { name: "Mercury", emoji: "🪨", fact: "A year on Mercury is just 88 Earth days", distance: "77M km", color: "hsl(30, 30%, 55%)" },
  { name: "Venus", emoji: "🌟", fact: "Venus spins backwards compared to most planets", distance: "261M km", color: "hsl(40, 80%, 70%)" },
  { name: "Mars", emoji: "🔴", fact: "Home to Olympus Mons, the tallest volcano in the solar system", distance: "225M km", color: "hsl(10, 70%, 50%)" },
  { name: "Jupiter", emoji: "🟠", fact: "Jupiter's Great Red Spot is a storm bigger than Earth", distance: "778M km", color: "hsl(25, 60%, 55%)" },
  { name: "Saturn", emoji: "🪐", fact: "Saturn's rings are made mostly of ice and rock", distance: "1.4B km", color: "hsl(45, 50%, 60%)" },
  { name: "Uranus", emoji: "🔵", fact: "Uranus rotates on its side like a rolling ball", distance: "2.9B km", color: "hsl(185, 60%, 60%)" },
  { name: "Neptune", emoji: "💙", fact: "Neptune has the strongest winds in the solar system", distance: "4.5B km", color: "hsl(220, 70%, 55%)" },
];

export function getPlanetInfo(name: string): PlanetInfo {
  return PLANETS.find(p => p.name.toLowerCase() === name.toLowerCase()) || PLANETS[0];
}
