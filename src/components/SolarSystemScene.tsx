'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import PlanetTooltip from './RoboticTooltip';
import OrbitSpeedSettings from './OrbitSpeedSettings';
import MeteorRain from './MeteorRain';
import { PLANET_DATA, PlanetData } from '@/data/planetData';

interface PlanetPosition {
  planetData: PlanetData;
  position: { x: number; y: number };
}

interface SolarSystemSceneProps {
  onPlanetSelect?: (planet: PlanetData | null) => void;
  selectedPlanet?: PlanetData | null;
  language?: 'id' | 'en';
}

// Loading fallback component
const LoadingFallback = () => (
  <mesh>
    <sphereGeometry args={[1, 16, 16]} />
    <meshBasicMaterial color="#444444" wireframe />
  </mesh>
);

// Lighting setup component
const Lighting = () => {
  return (
    <>
      {/* Ambient light for general soft lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />

      {/* Point light at the Sun's position for main illumination */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2}
        color="#FDB813"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
      />

      {/* Additional directional light for better visibility */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.3}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
};

// Main scene content component
const SceneContent = ({
  onPlanetSelect,
  selectedPlanet,
  language = 'id',
  onPlanetPositionUpdate,
  orbitSpeedMultiplier = 1,
  meteorRainEnabled = false,
  meteorRainIntensity = 1
}: SolarSystemSceneProps & {
  onPlanetPositionUpdate: (planetData: PlanetData, position: { x: number; y: number }) => void;
  orbitSpeedMultiplier?: number;
  meteorRainEnabled?: boolean;
  meteorRainIntensity?: number;
}) => {
  const handlePlanetClick = useCallback((planet: PlanetData) => {
    if (onPlanetSelect) {
      // Toggle selection - if same planet is clicked, deselect it
      if (selectedPlanet?.name === planet.name) {
        onPlanetSelect(null);
      } else {
        onPlanetSelect(planet);
      }
    }
  }, [onPlanetSelect, selectedPlanet]);

  return (
    <>
      <Lighting />

      {/* Environment for space-like backdrop */}
      <Environment preset="night" background={false} />

      {/* Starfield background */}
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={7}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Render all celestial bodies */}
      {PLANET_DATA.map((planetData) => (
        <Suspense key={planetData.name} fallback={<LoadingFallback />}>
          <CelestialBody
            planetData={planetData}
            onClick={handlePlanetClick}
            isSelected={selectedPlanet?.name === planetData.name}
            onPositionUpdate={onPlanetPositionUpdate}
            language={language}
            orbitSpeedMultiplier={orbitSpeedMultiplier}
          />
        </Suspense>
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.6}
        panSpeed={0.5}
        rotateSpeed={0.4}
        minDistance={5}
        maxDistance={200}
        maxPolarAngle={Math.PI}
        minPolarAngle={0}
        // Start with a good overview position
        target={[0, 0, 0]}
      />

      {/* Meteor Rain Effect */}
      <MeteorRain
        enabled={meteorRainEnabled}
        count={Math.floor(12 * meteorRainIntensity)} // Increased base count for better mobile visibility
        speed={0.8 + (meteorRainIntensity * 0.4)}
        intensity={meteorRainIntensity}
      />
    </>
  );
};

const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({
  onPlanetSelect,
  selectedPlanet,
  language = 'id'
}) => {
  const [planetPositions, setPlanetPositions] = useState<PlanetPosition[]>([]);

  // State for orbit speed control
  const [orbitSpeedMultiplier, setOrbitSpeedMultiplier] = useState<number>(1);

  // State for meteor rain effect
  const [meteorRainEnabled, setMeteorRainEnabled] = useState<boolean>(false);
  const [meteorRainIntensity, setMeteorRainIntensity] = useState<number>(1);

  const handlePlanetPositionUpdate = useCallback((planetData: PlanetData, position: { x: number; y: number }) => {
    setPlanetPositions(prev => {
      const existingIndex = prev.findIndex(p => p.planetData.name === planetData.name);
      const newPosition = { planetData, position };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newPosition;
        return updated;
      } else {
        return [...prev, newPosition];
      }
    });
  }, []);

  // Handle orbit speed change
  const handleOrbitSpeedChange = useCallback((multiplier: number) => {
    setOrbitSpeedMultiplier(multiplier);
  }, []);

  // Handle meteor rain toggle
  const handleMeteorRainToggle = useCallback((enabled: boolean) => {
    setMeteorRainEnabled(enabled);
  }, []);

  // Handle meteor rain intensity change
  const handleMeteorRainIntensityChange = useCallback((intensity: number) => {
    setMeteorRainIntensity(intensity);
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{
          position: [0, 20, 40],
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]} // Device pixel ratio for better performance
        performance={{
          min: 0.5, // Minimum target frame rate
          max: 1 // Maximum target frame rate
        }}
      >
        <color attach="background" args={['#000011']} />
        <fog attach="fog" args={['#000011', 100, 300]} />

        <SceneContent
          onPlanetSelect={onPlanetSelect}
          selectedPlanet={selectedPlanet}
          language={language}
          onPlanetPositionUpdate={handlePlanetPositionUpdate}
          orbitSpeedMultiplier={orbitSpeedMultiplier}
          meteorRainEnabled={meteorRainEnabled}
          meteorRainIntensity={meteorRainIntensity}
        />
      </Canvas>

      {/* Planet Tooltips - Always Visible */}
      {planetPositions.map(({ planetData, position }) => (
        <PlanetTooltip
          key={planetData.name}
          planetName={planetData.name}
          planetNameId={planetData.nameId}
          position={position}
          useIndonesian={language === 'id'}
        />
      ))}

      {/* Floating Orbit Speed Settings Menu */}
      <OrbitSpeedSettings
        orbitSpeedMultiplier={orbitSpeedMultiplier}
        onSpeedChange={handleOrbitSpeedChange}
        meteorRainEnabled={meteorRainEnabled}
        onMeteorRainToggle={handleMeteorRainToggle}
        meteorRainIntensity={meteorRainIntensity}
        onMeteorRainIntensityChange={handleMeteorRainIntensityChange}
        language={language}
      />
    </div>
  );
};

export default SolarSystemScene;