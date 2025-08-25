export interface PlanetData {
  name: string;
  description: string;
  facts: string[];
  textureUrl: string;
  scale: number;
  orbitSpeed: number;
  rotationSpeed: number;
  distance: number;
  color?: string; // fallback color if texture fails
  type: 'sun' | 'planet';
}

export const PLANET_DATA: PlanetData[] = [
  {
    name: "Sun",
    description: "The bright star at the center of our solar system!",
    facts: [
      "The Sun is a yellow dwarf star",
      "It contains 99.86% of the Solar System's mass",
      "Surface temperature is about 5,778 K (5,505 °C)",
      "It's about 4.6 billion years old"
    ],
    textureUrl: "/textures/sun.svg",
    scale: 3.0,
    orbitSpeed: 0,
    rotationSpeed: 0.5,
    distance: 0,
    color: "#FDB813",
    type: 'sun'
  },
  {
    name: "Mercury",
    description: "The smallest and fastest planet in our solar system!",
    facts: [
      "Closest planet to the Sun",
      "No atmosphere or moons",
      "A day on Mercury lasts 176 Earth days",
      "Surface temperatures range from -427°F to 800°F"
    ],
    textureUrl: "/textures/mercury.svg",
    scale: 0.4,
    orbitSpeed: 2.4,
    rotationSpeed: 0.8,
    distance: 8,
    color: "#8C7853",
    type: 'planet'
  },
  {
    name: "Venus",
    description: "The hottest planet with thick, toxic clouds!",
    facts: [
      "Second planet from the Sun",
      "Hottest planet in the solar system",
      "Rotates backwards compared to other planets",
      "A day on Venus is longer than its year"
    ],
    textureUrl: "/textures/venus.svg",
    scale: 0.9,
    orbitSpeed: 1.8,
    rotationSpeed: 0.6,
    distance: 12,
    color: "#FFC649",
    type: 'planet'
  },
  {
    name: "Earth",
    description: "Our beautiful home planet with life!",
    facts: [
      "Third planet from the Sun",
      "Only known planet with life",
      "Has one natural satellite, the Moon",
      "71% of the surface is covered by water"
    ],
    textureUrl: "/textures/earth.svg",
    scale: 1.0,
    orbitSpeed: 1.0,
    rotationSpeed: 1.0,
    distance: 16,
    color: "#6B93D6",
    type: 'planet'
  },
  {
    name: "Mars",
    description: "The red planet with the largest volcano in the solar system!",
    facts: [
      "Fourth planet from the Sun",
      "Known as the 'Red Planet'",
      "Has two small moons: Phobos and Deimos",
      "Home to the largest volcano: Olympus Mons"
    ],
    textureUrl: "/textures/mars.svg",
    scale: 0.7,
    orbitSpeed: 0.8,
    rotationSpeed: 0.9,
    distance: 20,
    color: "#CD5C5C",
    type: 'planet'
  },
  {
    name: "Jupiter",
    description: "The largest planet with a famous Great Red Spot!",
    facts: [
      "Fifth planet from the Sun",
      "Largest planet in the solar system",
      "Has 95 known moons including the four largest: Io, Europa, Ganymede, and Callisto",
      "The Great Red Spot is a giant storm larger than Earth"
    ],
    textureUrl: "/textures/jupiter.svg",
    scale: 2.5,
    orbitSpeed: 0.4,
    rotationSpeed: 1.5,
    distance: 28,
    color: "#D8CA9D",
    type: 'planet'
  },
  {
    name: "Saturn",
    description: "The ringed planet with spectacular ice rings!",
    facts: [
      "Sixth planet from the Sun",
      "Famous for its prominent ring system",
      "Has 146 known moons, including Titan",
      "Less dense than water - it would float!"
    ],
    textureUrl: "/textures/saturn.svg",
    scale: 2.2,
    orbitSpeed: 0.3,
    rotationSpeed: 1.3,
    distance: 36,
    color: "#FAD5A5",
    type: 'planet'
  },
  {
    name: "Uranus",
    description: "The tilted ice giant that rotates on its side!",
    facts: [
      "Seventh planet from the Sun",
      "Rotates on its side at 98-degree tilt",
      "Has faint rings and 27 known moons",
      "Coldest planetary atmosphere in the solar system"
    ],
    textureUrl: "/textures/uranus.svg",
    scale: 1.8,
    orbitSpeed: 0.2,
    rotationSpeed: 1.1,
    distance: 44,
    color: "#4FD0E3",
    type: 'planet'
  },
  {
    name: "Neptune",
    description: "The windiest planet with supersonic winds!",
    facts: [
      "Eighth and outermost planet from the Sun",
      "Windiest planet with speeds up to 2,100 km/h",
      "Has 16 known moons, including Triton",
      "Takes 165 Earth years to orbit the Sun"
    ],
    textureUrl: "/textures/neptune.svg",
    scale: 1.7,
    orbitSpeed: 0.15,
    rotationSpeed: 1.2,
    distance: 52,
    color: "#4B70DD",
    type: 'planet'
  }
];