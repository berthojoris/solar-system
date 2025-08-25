'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { PlanetData } from '@/data/planetData';

interface CelestialBodyProps {
  planetData: PlanetData;
  onClick?: (planetData: PlanetData) => void;
  isSelected?: boolean;
}

const CelestialBody = React.memo(({ planetData, onClick, isSelected }: CelestialBodyProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

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
  });

  // Handle click events
  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      if (onClick) {
        onClick(planetData);
      }
    },
    [onClick, planetData]
  );

  // Handle hover effects
  const handlePointerOver = useCallback(() => {
    document.body.style.cursor = 'pointer';
  }, []);

  const handlePointerOut = useCallback(() => {
    document.body.style.cursor = 'default';
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh
        ref={meshRef}
        scale={[planetData.scale, planetData.scale, planetData.scale]}
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