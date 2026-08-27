'use client';

import { ContactShadows, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { DepthOfField, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const CHARACTER_MODEL = '/models/my-character.glb';
const ACTION_LABELS = ['Idle', 'Walk', 'Attack'] as const;
type ActionLabel = (typeof ACTION_LABELS)[number];

function findAnimationName(label: ActionLabel, names: string[]) {
  const normalizedLabel = label.toLowerCase();
  return (
    names.find((name) => name.toLowerCase() === normalizedLabel) ??
    names.find((name) => name.toLowerCase().includes(normalizedLabel)) ??
    (label === 'Idle' ? names[0] : undefined)
  );
}

type CharacterModelProps = {
  activeAnimation: string | null;
  onAnimationNames: (names: string[]) => void;
};

function CharacterModel({ activeAnimation, onAnimationNames }: CharacterModelProps) {
  const { scene, animations } = useGLTF(CHARACTER_MODEL);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, group);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const center = bounds.getCenter(new THREE.Vector3());
    const height = bounds.getSize(new THREE.Vector3()).y;

    clone.position.sub(center);
    clone.scale.setScalar(height > 0 ? 4.7 / height : 1);
    clone.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    onAnimationNames(names);
  }, [names, onAnimationNames]);

  useEffect(() => {
    if (!activeAnimation) return;

    const nextAction = actions[activeAnimation];
    if (!nextAction) return;

    nextAction.reset().fadeIn(0.24).play();
    return () => {
      nextAction.fadeOut(0.2);
    };
  }, [actions, activeAnimation]);

  return (
    <group ref={group}>
      <primitive object={model} />
    </group>
  );
}

function ModelFallback() {
  return (
    <group>
      <mesh>
        <capsuleGeometry args={[0.74, 2.4, 8, 16]} />
        <meshStandardMaterial color="#557d8c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.8, 0]} scale={0.72}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#f0ede4" roughness={0.74} />
      </mesh>
    </group>
  );
}

export default function CharacterViewer() {
  const [animationNames, setAnimationNames] = useState<string[]>([]);
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const reportAnimations = useCallback((names: string[]) => {
    setAnimationNames((current) => {
      const unchanged = current.length === names.length && current.every((name, index) => name === names[index]);
      return unchanged ? current : names;
    });
  }, []);

  const resolvedAnimations = useMemo(
    () =>
      Object.fromEntries(
        ACTION_LABELS.map((label) => [label, findAnimationName(label, animationNames)]),
      ) as Record<ActionLabel, string | undefined>,
    [animationNames],
  );
  const activeAnimation =
    selectedAnimation && animationNames.includes(selectedAnimation)
      ? selectedAnimation
      : resolvedAnimations.Idle ?? animationNames[0] ?? null;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  return (
    <div className="character-viewer">
      <Canvas
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 32, near: 0.1, far: 100, position: [0, 0.04, 9.4] }}
        aria-label="可旋转、可缩放的 3D 角色模型"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
      >
        <ambientLight intensity={1.55} />
        <hemisphereLight args={["#e4ebe5", "#081110", 1.2]} />
        <directionalLight castShadow color="#f2d9af" intensity={2.35} position={[4, 7, 6]} />
        <directionalLight color="#84aeb6" intensity={1.35} position={[-4, 2, -3]} />

        <Suspense fallback={<ModelFallback />}>
          <CharacterModel activeAnimation={activeAnimation} onAnimationNames={reportAnimations} />
          <ContactShadows
            position={[0, -2.35, 0]}
            opacity={0.34}
            scale={3.8}
            blur={2.4}
            far={4.5}
            color="#07100f"
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.45}
          minDistance={5.8}
          maxDistance={13}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.82}
          target={[0, 0, 0]}
        />

        <EffectComposer multisampling={0}>
          <DepthOfField focusDistance={0.02} focalLength={0.018} bokehScale={0.85} height={480} />
        </EffectComposer>
      </Canvas>

      {animationNames.length > 0 && (
        <div className="character-viewer-controls" aria-label="角色动作切换">
          <span className="character-viewer-controls-label">动作</span>
          <div className="character-viewer-actions">
            {ACTION_LABELS.map((label) => {
              const animationName = resolvedAnimations[label];
              return (
                <button
                  key={label}
                  type="button"
                  className="character-viewer-action"
                  aria-pressed={activeAnimation === animationName}
                  disabled={!animationName}
                  title={animationName ? `播放 ${label} 动作` : `模型没有 ${label} 动作`}
                  onClick={() => animationName && setSelectedAnimation(animationName)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

useGLTF.preload(CHARACTER_MODEL);
