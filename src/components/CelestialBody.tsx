'use client';

import React, { useRef, useMemo, useCallback, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '@/data/planetData';
import { useRoboticAudio } from '@/hooks/useRoboticAudio';

interface CelestialBodyProps {
  planetData: PlanetData;
  onClick?: (planetData: PlanetData) => void;
  isSelected?: boolean;
  onPositionUpdate?: (planetData: PlanetData, position: { x: number; y: number }) => void;
  language?: 'id' | 'en';
}

const CelestialBody = React.memo(({
  planetData,
  onClick,
  isSelected,
  onPositionUpdate,
  language = 'id'
}: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Three.js hooks
  const { camera, gl } = useThree();

  // Audio hook
  const { playHoverSound, playPlanetSound } = useRoboticAudio({ volume: 0.2 });

  // Load texture - useLoader will handle errors internally and return null on failure
  const texture = useLoader(TextureLoader, planetData.textureUrl);

  // Create material with texture or fallback color
  const material = useMemo(() => {
    const baseProps = {
      transparent: planetData.type === 'sun' ? false : true,
      opacity: planetData.type === 'sun' ? 1 : 0.95,
    };

    if (texture) {
      return new THREE.MeshStandardMaterial({
        map: texture,
        ...baseProps,
        emissive: planetData.type === 'sun' ? planetData.color : undefined,
        emissiveIntensity: planetData.type === 'sun' ? 0.3 : 0,
      });
    } else {
      // Fallback to solid color if texture fails to load
      return new THREE.MeshStandardMaterial({
        color: planetData.color || '#ffffff',
        ...baseProps,
        emissive: planetData.type === 'sun' ? planetData.color : undefined,
        emissiveIntensity: planetData.type === 'sun' ? 0.3 : 0,
      });
    }
  }, [texture, planetData.color, planetData.type]);

  // Animation using useFrame hook
  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Rotate the planet on its axis
    if (meshRef.current && planetData.rotationSpeed > 0) {
      meshRef.current.rotation.y = elapsedTime * planetData.rotationSpeed * 0.5;
    }

    // Revolve around the sun (orbital motion)
    if (groupRef.current && planetData.distance > 0) {
      const angle = elapsedTime * planetData.orbitSpeed * 0.2;
      groupRef.current.position.x = Math.sin(angle) * planetData.distance;
      groupRef.current.position.z = Math.cos(angle) * planetData.distance;
    }

    // Update position for tooltip every frame
    if (meshRef.current && onPositionUpdate) {
      const screenPos = getScreenPosition();
      onPositionUpdate(planetData, screenPos);
    }
  });

  // Get planet name based on language
  const getPlanetName = useCallback((data: PlanetData, lang: 'id' | 'en') => {
    if (lang === 'id') {
      return data.nameId;
    }
    return data.name;
  }, []);

  // Convert 3D position to screen coordinates
  const getScreenPosition = useCallback(() => {
    if (!meshRef.current) return { x: 0, y: 0 };

    const vector = new THREE.Vector3();
    meshRef.current.getWorldPosition(vector);
    vector.project(camera);

    const widthHalf = gl.domElement.clientWidth / 2;
    const heightHalf = gl.domElement.clientHeight / 2;

    return {
      x: (vector.x * widthHalf) + widthHalf,
      y: -(vector.y * heightHalf) + heightHalf
    };
  }, [camera, gl]);

  // Handle click events
  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();

      // Play robotic sound specific to this planet
      const planetName = getPlanetName(planetData, language);
      playPlanetSound(planetName);

      if (onClick) {
        onClick(planetData);
      }
    },
    [onClick, planetData, playPlanetSound, getPlanetName, language]
  );

  // Handle hover effects
  const handlePointerOver = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setIsHovered(true);
    document.body.style.cursor = 'pointer';

    // Play hover sound
    playHoverSound();
  }, [playHoverSound]);

  const handlePointerOut = useCallback(() => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        scale={isHovered ? [planetData.scale * 1.05, planetData.scale * 1.05, planetData.scale * 1.05] : [planetData.scale, planetData.scale, planetData.scale]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        material={material}
      >
        <sphereGeometry args={[1, 64, 64]} />

        {/* Add a subtle glow effect for selected planets */}
        {isSelected && (
          <mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
              color={planetData.color || '#ffffff'}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Add hover glow effect */}
        {isHovered && (
          <mesh scale={[1.08, 1.08, 1.08]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
              color="#00ffff"
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Add special effects for the Sun */}
        {planetData.type === 'sun' && (
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
              color="#FDB813"
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </mesh>

      {/* Add orbit ring for planets (subtle visual guide) */}
      {planetData.distance > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <ringGeometry args={[planetData.distance - 0.1, planetData.distance + 0.1, 64]} />
          <meshBasicMaterial
            color="#444444"
            transparent
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
});

CelestialBody.displayName = 'CelestialBody';

export default CelestialBody;