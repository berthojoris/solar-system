'use client';

import React, { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import CelestialBody from './CelestialBody';
import { PLANET_DATA, PlanetData } from '@/data/planetData';

interface SolarSystemSceneProps {
  onPlanetSelect?: (planet: PlanetData | null) => void;
  selectedPlanet?: PlanetData | null;
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
const SceneContent = ({ onPlanetSelect, selectedPlanet }: SolarSystemSceneProps) => {
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
    </>
  );
};

const SolarSystemScene: React.FC<SolarSystemSceneProps> = ({
  onPlanetSelect,
  selectedPlanet
}) => {
  return (
    <div className="w-full h-full">
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
        />
      </Canvas>
    </div>
  );
};

export default SolarSystemScene;