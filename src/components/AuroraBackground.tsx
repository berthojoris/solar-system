'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AuroraBackgroundProps {
  enabled?: boolean;
  intensity?: number;
  speed?: number;
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  enabled = false,
  intensity = 1,
  speed = 1
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRefs = useRef<THREE.ShaderMaterial[]>([]);

  // Photorealistic Aurora Shader Material
  const auroraShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        resolution: { value: new THREE.Vector2(3840, 2160) } // 4K resolution
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        uniform vec2 resolution;

        varying vec2 vUv;
        varying vec3 vWorldPosition;

        // High-quality noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        // Fractal Brownian Motion for complex patterns
        float fbm(vec3 p, int octaves) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;

          for (int i = 0; i < 8; i++) {
            if (i >= octaves) break;
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          return value;
        }

        // Aurora ribbon generation
        float auroraRibbon(vec2 uv, float ribbonId, float timeOffset) {
          float loopTime = mod(time * 0.08333 + timeOffset, 12.0); // 12-second loop

          // Ribbon base curve
          float ribbonY = 0.3 + sin(uv.x * 3.14159 + ribbonId * 2.0 + loopTime * 0.5) * 0.2;
          ribbonY += sin(uv.x * 6.28318 + ribbonId * 1.5 + loopTime * 0.3) * 0.1;

          // Vertical waves
          float verticalWave = sin(loopTime * 0.7 + uv.x * 2.0 + ribbonId) * 0.05;
          ribbonY += verticalWave;

          // Distance from ribbon center
          float dist = abs(uv.y - ribbonY);

          // Ribbon thickness with noise variation
          float thickness = 0.05 + fbm(vec3(uv.x * 8.0, ribbonY * 6.0, loopTime * 0.5), 3) * 0.02;

          // Ribbon falloff
          float ribbon = 1.0 - smoothstep(0.0, thickness, dist);

          // Flowing motion along ribbon
          float flow = fbm(vec3(uv.x * 4.0 - loopTime * 0.8, uv.y * 3.0, loopTime * 0.2), 4);
          ribbon *= (0.7 + 0.3 * flow);

          return ribbon;
        }

        void main() {
          vec2 uv = vUv;
          float loopTime = mod(time * 0.08333, 12.0); // 60fps 12-second seamless loop

          // Full-sky coverage
          vec2 skyUv = (uv - 0.5) * 2.0;

          // Multiple ribbon layers for depth
          float aurora1 = auroraRibbon(skyUv, 1.0, 0.0);
          float aurora2 = auroraRibbon(skyUv + vec2(0.3, 0.1), 2.0, 2.0);
          float aurora3 = auroraRibbon(skyUv + vec2(-0.2, 0.05), 3.0, 4.0);
          float aurora4 = auroraRibbon(skyUv + vec2(0.1, -0.08), 4.0, 6.0);

          // Combine ribbons
          float combinedAurora = max(max(aurora1, aurora2), max(aurora3, aurora4));

          // Corona flares (occasional bright bursts)
          float flareTime = mod(loopTime + skyUv.x * 2.0, 8.0);
          float flare = 0.0;
          if (flareTime < 1.0) {
            float flareBurst = sin(flareTime * 3.14159) * exp(-flareTime * 2.0);
            flare = flareBurst * fbm(vec3(skyUv * 3.0, loopTime), 2) * 0.8;
          }
          combinedAurora += flare;

          // Photorealistic color gradients
          vec3 luminousGreen = vec3(0.1, 0.9, 0.3); // Bright aurora green
          vec3 electricBlue = vec3(0.2, 0.6, 1.0);  // Electric blue
          vec3 vividPurple = vec3(0.7, 0.2, 1.0);   // Vivid purple
          vec3 cosmicTeal = vec3(0.0, 0.8, 0.7);    // Cosmic teal

          // Color mixing based on height and flow
          float colorMix1 = sin(loopTime * 0.4 + skyUv.x * 2.0) * 0.5 + 0.5;
          float colorMix2 = sin(loopTime * 0.6 + skyUv.y * 1.5) * 0.5 + 0.5;
          float heightFactor = (skyUv.y + 1.0) * 0.5;

          vec3 color1 = mix(luminousGreen, electricBlue, colorMix1);
          vec3 color2 = mix(vividPurple, cosmicTeal, colorMix2);
          vec3 auroraColor = mix(color1, color2, heightFactor);

          // HDR-style brightness and shimmer
          float shimmer = 0.9 + 0.1 * sin(loopTime * 4.0 + skyUv.x * 8.0 + skyUv.y * 6.0);
          float hdrBrightness = 1.2 + 0.3 * fbm(vec3(skyUv * 2.0, loopTime * 0.3), 3);

          // Pulsing effect (gentle breathing)
          float pulse = 0.8 + 0.2 * sin(loopTime * 0.5);

          // Final aurora intensity with all effects
          float finalIntensity = combinedAurora * shimmer * hdrBrightness * pulse * intensity;
          finalIntensity = clamp(finalIntensity, 0.0, 2.0); // HDR clamp

          // Horizon fade for natural look
          float horizonFade = smoothstep(-1.0, 0.5, skyUv.y);
          finalIntensity *= horizonFade;

          gl_FragColor = vec4(auroraColor, finalIntensity * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false
    });
  }, [intensity]);

  // Update shader uniforms at 60fps
  useFrame((state, delta) => {
    if (enabled && materialRefs.current.length > 0) {
      materialRefs.current.forEach((material) => {
        if (material && material.uniforms) {
          material.uniforms.time.value += delta * speed;
          material.uniforms.intensity.value = intensity;
        }
      });
    }
  });

  // Initialize material references
  useEffect(() => {
    if (groupRef.current) {
      materialRefs.current = [];
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          materialRefs.current.push(child.material);
        }
      });
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <group ref={groupRef}>
      {/* Full-sky aurora dome */}
      <mesh position={[0, 0, -300]} rotation={[0, 0, 0]} scale={[800, 400, 1]}>
        <planeGeometry args={[1, 1, 64, 32]} />
        <primitive object={auroraShader} />
      </mesh>

      {/* Foreground aurora curtains */}
      <mesh position={[0, 30, -250]} rotation={[0.1, 0, 0]} scale={[600, 200, 1]}>
        <planeGeometry args={[1, 1, 32, 16]} />
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            intensity: { value: intensity * 0.7 }
          }}
          vertexShader={`
            varying vec2 vUv;
            uniform float time;

            void main() {
              vUv = uv;
              vec3 pos = position;
              // Gentle curtain wave
              pos.z += sin(time * 0.3 + position.x * 0.5) * 2.0;
              pos.y += sin(time * 0.4 + position.x * 0.3) * 1.0;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform float intensity;
            varying vec2 vUv;

            float fbm(vec2 p) {
              float value = 0.0;
              float amplitude = 0.5;
              for (int i = 0; i < 4; i++) {
                value += amplitude * sin(p.x * pow(2.0, float(i)) + time * 0.5);
                amplitude *= 0.5;
              }
              return value * 0.5 + 0.5;
            }

            void main() {
              vec2 uv = vUv - 0.5;
              float loopTime = mod(time * 0.08333, 12.0);

              // Ribbon curtain
              float curtain = fbm(vec2(uv.x * 4.0, loopTime * 0.5));
              float fade = smoothstep(-0.3, 0.4, uv.y) * smoothstep(0.6, 0.2, uv.y);
              fade *= 1.0 - abs(uv.x) * 1.2;

              vec3 color = mix(vec3(0.1, 0.8, 0.4), vec3(0.3, 0.4, 1.0), curtain);
              float alpha = curtain * fade * intensity * 0.6;

              gl_FragColor = vec4(color, alpha);
            }
          `}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Background aurora glow */}
      <mesh position={[0, 50, -350]} scale={[1000, 300, 1]}>
        <planeGeometry args={[1, 1, 16, 8]} />
        <shaderMaterial
          uniforms={{
            time: { value: 0 },
            intensity: { value: intensity * 0.3 }
          }}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float time;
            uniform float intensity;
            varying vec2 vUv;

            void main() {
              vec2 uv = vUv - 0.5;
              float loopTime = mod(time * 0.08333, 12.0);

              // Distant glow
              float glow = exp(-length(uv) * 1.5);
              float pulse = 0.8 + 0.2 * sin(loopTime * 0.3);

              vec3 color = mix(vec3(0.0, 0.6, 0.8), vec3(0.4, 0.2, 0.9), pulse);
              float alpha = glow * intensity * pulse * 0.2;

              gl_FragColor = vec4(color, alpha);
            }
          `}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default AuroraBackground;