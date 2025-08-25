'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MeteorProps {
  position: [number, number, number];
  velocity: [number, number, number];
  size: number;
  color: string;
  trailLength: number;
}

interface MeteorRainProps {
  enabled?: boolean;
  count?: number;
  speed?: number;
  intensity?: number;
}

// Individual meteor component with glowing trail
const Meteor = ({ position, velocity, size, color, trailLength }: MeteorProps) => {
  const meteorRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.BufferGeometry>(null);
  const trailPositions = useRef<Float32Array>(new Float32Array(trailLength * 3));
  const trailOpacities = useRef<Float32Array>(new Float32Array(trailLength));
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(...position));
  const vel = useRef<THREE.Vector3>(new THREE.Vector3(...velocity));
  const life = useRef<number>(1.0);
  const trailIndex = useRef<number>(0);

  // Initialize trail positions
  useEffect(() => {
    for (let i = 0; i < trailLength; i++) {
      const idx = i * 3;
      trailPositions.current[idx] = position[0];
      trailPositions.current[idx + 1] = position[1];
      trailPositions.current[idx + 2] = position[2];
    }
  }, [position, trailLength]);

  useFrame((state, delta) => {
    if (!meteorRef.current || !trailRef.current) return;

    // Update meteor position
    currentPos.current.add(vel.current.clone().multiplyScalar(delta));
    meteorRef.current.position.copy(currentPos.current);

    // Decrease life over time
    life.current -= delta * 0.2;

    // Shift trail positions (create streaking effect)
    // Move all existing positions back one step
    for (let i = trailLength - 1; i > 0; i--) {
      const currentIdx = i * 3;
      const prevIdx = (i - 1) * 3;
      trailPositions.current[currentIdx] = trailPositions.current[prevIdx];
      trailPositions.current[currentIdx + 1] = trailPositions.current[prevIdx + 1];
      trailPositions.current[currentIdx + 2] = trailPositions.current[prevIdx + 2];
    }

    // Add current meteor position as the head of the trail
    trailPositions.current[0] = currentPos.current.x;
    trailPositions.current[1] = currentPos.current.y;
    trailPositions.current[2] = currentPos.current.z;

    // Update trail geometry to create visible line
    trailRef.current.setAttribute('position', new THREE.BufferAttribute(trailPositions.current, 3));
    trailRef.current.attributes.position.needsUpdate = true;

    // Reset meteor if it's too far or life is over
    if (life.current <= 0 || currentPos.current.length() > 400) {
      // Reset to random position above the scene
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 200;
      const height = 100 + Math.random() * 150;

      currentPos.current.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Diagonal velocity for falling star effect
      vel.current.set(
        (Math.random() - 0.5) * 40 - currentPos.current.x * 0.05,
        -50 - Math.random() * 40,
        (Math.random() - 0.5) * 40 - currentPos.current.z * 0.05
      );

      life.current = 1.0;

      // Initialize trail with current position
      for (let i = 0; i < trailLength; i++) {
        const idx = i * 3;
        trailPositions.current[idx] = currentPos.current.x;
        trailPositions.current[idx + 1] = currentPos.current.y;
        trailPositions.current[idx + 2] = currentPos.current.z;
      }
    }

    // Update meteor opacity based on life
    const meteorMesh = meteorRef.current.children[0] as THREE.Mesh;
    if (meteorMesh && meteorMesh.material) {
      (meteorMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, life.current);
    }
  });

  // Shader material for the falling star tail with proper gradient
  const trailMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float index;
        attribute float totalPoints;
        varying float vAlpha;

        void main() {
          // Calculate alpha based on position in trail (head = 1.0, tail = 0.0)
          vAlpha = 1.0 - (index / totalPoints);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 4.0 + vAlpha * 6.0;
        }
      `,
      fragmentShader: `
        varying float vAlpha;

        void main() {
          // Create circular point
          float dist = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);

          // Silver/white color
          vec3 color = vec3(1.0, 1.0, 1.0);
          gl_FragColor = vec4(color, alpha * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  return (
    <group ref={meteorRef}>
      {/* Meteor core - bright silver center */}
      <mesh>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={1.0}
          emissive="#ffffff"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Silver glow layer */}
      <mesh>
        <sphereGeometry args={[size * 1.8, 8, 8]} />
        <meshStandardMaterial
          color="#e0e0e0"
          transparent
          opacity={0.8}
          emissive="#e0e0e0"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Outer silver glow - atmospheric effect */}
      <mesh>
        <sphereGeometry args={[size * 3.5, 6, 6]} />
        <meshStandardMaterial
          color="#c0c0c0"
          transparent
          opacity={0.2}
          emissive="#c0c0c0"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Falling Star Trail */}
      <points>
        <bufferGeometry ref={trailRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[trailPositions.current, 3]}
          />
          <bufferAttribute
            attach="attributes-index"
            args={[new Float32Array(Array.from({length: trailLength}, (_, i) => i)), 1]}
          />
          <bufferAttribute
            attach="attributes-totalPoints"
            args={[new Float32Array(Array(trailLength).fill(trailLength)), 1]}
          />
        </bufferGeometry>
        <primitive object={trailMaterial} />
      </points>
    </group>
  );
};

const MeteorRain: React.FC<MeteorRainProps> = ({
  enabled = true,
  count = 8, // Reduced count for bigger, more impressive meteors
  speed = 1,
  intensity = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate meteor configurations
  const meteors = useMemo(() => {
    const meteorArray: MeteorProps[] = [];

    for (let i = 0; i < count; i++) {
      // Random starting position above and around the scene
      const angle = Math.random() * Math.PI * 2;
      const radius = 200 + Math.random() * 200;
      const height = 100 + Math.random() * 150;

      const startPos: [number, number, number] = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];

      // Velocity creating diagonal streaking motion like real falling stars
      const vel: [number, number, number] = [
        (Math.random() - 0.5) * 40 * speed - startPos[0] * 0.05, // More horizontal movement
        (-50 - Math.random() * 40) * speed, // Fast downward movement
        (Math.random() - 0.5) * 40 * speed - startPos[2] * 0.05 // More horizontal movement
      ];

      // Meteor properties
      const size = 0.4 + Math.random() * 0.6;
      const colors = ['#ffffff', '#f0f0f0', '#e8e8e8', '#f8f8f8', '#eeeeee'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const trailLength = 25; // Fixed length for consistent streaks

      meteorArray.push({
        position: startPos,
        velocity: vel,
        size,
        color,
        trailLength
      });
    }

    return meteorArray;
  }, [count, speed]);

  // Auto-hide when disabled
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.visible = enabled;
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <group ref={groupRef}>
      {meteors.map((meteor, index) => (
        <Meteor
          key={index}
          position={meteor.position}
          velocity={meteor.velocity}
          size={meteor.size}
          color={meteor.color}
          trailLength={meteor.trailLength}
        />
      ))}

      {/* Distant twinkling stars for atmosphere */}
      {Array.from({ length: Math.floor(count * 0.4) }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 150;
        const height = Math.random() * 300;

        return (
          <mesh
            key={`star-${i}`}
            position={[
              Math.cos(angle) * radius,
              height,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.05 + Math.random() * 0.08, 4, 4]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.3 + Math.random() * 0.4}
              emissive="#ffffff"
              emissiveIntensity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default MeteorRain;