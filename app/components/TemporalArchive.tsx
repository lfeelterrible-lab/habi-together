'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

type TemporalUniforms = {
  uTime: { value: number };
  uMouse: { value: THREE.Vector2 };
  uSlice: { value: number };
  uDepth: { value: number };
  uIntensity: { value: number };
  uVelocity: { value: number };
  uBurst: { value: number };
  uTexture: { value: THREE.Texture | null };
};

type TemporalMesh = THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> & {
  userData: { baseDepth: number; index: number; phase: number };
};

const SLICE_COUNT = 60;
const IMAGE_URL = '/images/scene.jpg';
const VERTEX_SHADER_URL = '/shaders/temporal.vert.glsl';
const FRAGMENT_SHADER_URL = '/shaders/temporal.frag.glsl';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function depthForSlice(index: number) {
  if (index <= 9) return index * 0.065;
  if (index <= 29) return 0.585 + Math.pow((index - 9) / 20, 1.22) * 2.25;
  return 2.835 + Math.pow((index - 29) / 30, 1.34) * 7.5;
}

function frameLabel(frame: number) {
  return `${String(clamp(frame, 1, SLICE_COUNT)).padStart(2, '0')} / ${SLICE_COUNT}`;
}

export default function TemporalArchive() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let animationFrame = 0;
    let renderer: THREE.WebGLRenderer | undefined;
    let composer: EffectComposer | undefined;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let geometry: THREE.PlaneGeometry | undefined;
    let texture: THREE.Texture | undefined;
    const slices: TemporalMesh[] = [];
    let bloom: UnrealBloomPass | undefined;
    let removeResize: (() => void) | undefined;
    let removePointerMove: (() => void) | undefined;
    let removePointerDown: (() => void) | undefined;

    const mouse = new THREE.Vector2();
    const targetMouse = new THREE.Vector2();
    const pointerPrevious = new THREE.Vector2();
    const lookTarget = new THREE.Vector3(0, 0, 0);
    const clock = new THREE.Clock();
    const sceneGroup = new THREE.Group();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const frameReadout = document.getElementById('frame-readout');
    const depthReadout = document.getElementById('depth-readout');
    const stateReadout = document.getElementById('state-readout');

    const setLoading = (loading: boolean) => {
      document.documentElement.dataset.temporalLoaded = loading ? 'false' : 'true';
    };

    let pointerVelocity = 0;
    let burst = 0;
    let baseCameraZ = 9;

    const setPointerTarget = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const nextX = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const nextY = clamp(-(((event.clientY - rect.top) / rect.height) * 2 - 1), -1, 1);
      const deltaX = nextX - pointerPrevious.x;
      const deltaY = nextY - pointerPrevious.y;
      targetMouse.set(nextX, nextY);
      pointerPrevious.set(nextX, nextY);
      pointerVelocity = clamp(pointerVelocity + Math.hypot(deltaX, deltaY) * 2.8, 0, 1);
    };

    const triggerBurst = () => {
      burst = 1;
      if (stateReadout) stateReadout.textContent = 'BURST / 01.80 S';
    };

    const handlePointerMove = (event: PointerEvent) => setPointerTarget(event);
    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      setPointerTarget(event);
      triggerBurst();
    };

    const handleResize = () => {
      if (!renderer || !composer || !camera) return;
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.position.z = baseCameraZ;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.5 : 1.75));
      renderer.setSize(width, height, false);
      composer.setSize(width, height);
      if (bloom) bloom.resolution.set(width, height);
    };

    const loadText = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to load ${url}`);
      return response.text();
    };

    const animate = () => {
      if (disposed || !composer || !camera) return;
      animationFrame = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;

      mouse.lerp(targetMouse, 1 - Math.exp(-delta * 5.2));
      pointerVelocity = THREE.MathUtils.damp(pointerVelocity, 0, 2.8, delta);
      burst = THREE.MathUtils.damp(burst, 0, 2.55, delta);

      const breathing = reducedMotion ? 0 : Math.sin(elapsed * 0.48) * 0.5 + Math.sin(elapsed * 0.19) * 0.25;
      const timeFlow = reducedMotion ? 0 : Math.sin(elapsed * 0.16) * 0.18;
      const spacingInfluence = pointerVelocity * 1.35 + burst * 1.85;
      const depthStretch = 1 + spacingInfluence;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, mouse.x * 0.32, 3.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, mouse.y * 0.22, 3.2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, baseCameraZ - burst * 0.52 + breathing * 0.018, 3.2, delta);
      lookTarget.set(mouse.x * 0.12, mouse.y * 0.09, 0);
      camera.lookAt(lookTarget);

      sceneGroup.rotation.y = THREE.MathUtils.damp(sceneGroup.rotation.y, mouse.x * -0.035, 3.5, delta);
      sceneGroup.rotation.x = THREE.MathUtils.damp(sceneGroup.rotation.x, mouse.y * 0.025, 3.5, delta);

      let activeDepth = 0;
      for (const mesh of slices) {
        const { baseDepth, index, phase } = mesh.userData;
        const normalizedDepth = clamp(baseDepth / 10.4, 0, 1);
        const drift = reducedMotion ? 0 : Math.sin(elapsed * 0.22 + phase) * (0.012 + normalizedDepth * 0.045);
        const lateralEcho = Math.sin(phase + elapsed * 0.17) * normalizedDepth * 0.09 * (1 + pointerVelocity * 1.7);
        const verticalEcho = Math.cos(phase * 1.2 - elapsed * 0.14) * normalizedDepth * 0.045;
        const burstOffset = burst * (0.16 + normalizedDepth * 1.55);
        const z = -(baseDepth * depthStretch + drift + timeFlow * normalizedDepth * 0.7 + burstOffset);

        mesh.position.x = lateralEcho + mouse.x * normalizedDepth * 0.06;
        mesh.position.y = verticalEcho + mouse.y * normalizedDepth * 0.045;
        mesh.position.z = z;
        mesh.rotation.z = Math.sin(phase + elapsed * 0.1) * normalizedDepth * 0.004;
        const scale = 1 + normalizedDepth * (0.022 + pointerVelocity * 0.035 + burst * 0.07) + breathing * 0.0015;
        mesh.scale.set(scale, scale, 1);

        const uniforms = mesh.material.uniforms as TemporalUniforms;
        uniforms.uTime.value = elapsed;
        uniforms.uMouse.value.lerp(mouse, 1 - Math.exp(-delta * 7));
        uniforms.uIntensity.value = 0.9 + pointerVelocity * 0.3 + burst * 0.62;
        uniforms.uVelocity.value = pointerVelocity;
        uniforms.uBurst.value = burst;

        if (index === 0) activeDepth = Math.max(0, -z);
      }

      if (bloom) {
        bloom.strength = 0.37 + Math.max(0, breathing) * 0.028 + pointerVelocity * 0.1 + burst * 0.36;
        bloom.radius = 0.76 + burst * 0.1;
      }

      if (frameReadout) frameReadout.textContent = frameLabel(1);
      if (depthReadout) depthReadout.textContent = `${activeDepth.toFixed(2).padStart(5, '0')} M`;
      if (stateReadout && burst <= 0.01) stateReadout.textContent = pointerVelocity > 0.28 ? 'STRETCHING' : 'DRIFTING';

      composer.render();
    };

    const setup = async () => {
      try {
        setLoading(true);
        const [vertexShader, fragmentShader] = await Promise.all([
          loadText(VERTEX_SHADER_URL),
          loadText(FRAGMENT_SHADER_URL),
        ]);
        if (disposed) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        sceneGroup.position.set(0, 0, 0);
        scene.add(sceneGroup);

        camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
        camera.position.set(0, 0, baseCameraZ);
        camera.lookAt(lookTarget);

        renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.setSize(mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight, false);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.86;
        renderer.domElement.setAttribute('aria-label', 'Temporal slices of a rainy scene. Move or touch to explore, click to burst time.');
        mount.appendChild(renderer.domElement);

        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth, mount.clientHeight), 0.42, 0.78, 0.76);
        composer.addPass(bloom);

        texture = await new THREE.TextureLoader().loadAsync(IMAGE_URL);
        if (disposed) return;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

        const imageAspect = texture.image.width / texture.image.height;
        const planeHeight = 5.25;
        const planeWidth = planeHeight * imageAspect;
        geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 20);

        for (let index = SLICE_COUNT - 1; index >= 0; index -= 1) {
          const depth = depthForSlice(index);
          const uniforms: TemporalUniforms = {
            uTime: { value: 0 },
            uMouse: { value: new THREE.Vector2() },
            uSlice: { value: index },
            uDepth: { value: clamp(depth / 10.4, 0, 1) },
            uIntensity: { value: 0.9 },
            uVelocity: { value: 0 },
            uBurst: { value: 0 },
            uTexture: { value: texture },
          };
          const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
            depthTest: true,
            depthWrite: false,
            side: THREE.DoubleSide,
            blending: THREE.NormalBlending,
          });
          const mesh = new THREE.Mesh(geometry, material) as TemporalMesh;
          mesh.userData = { baseDepth: depth, index, phase: index * 0.37 };
          mesh.position.set(0, 0, -depth);
          mesh.renderOrder = SLICE_COUNT - index;
          sceneGroup.add(mesh);
          slices.push(mesh);
        }

        camera.aspect = (mount.clientWidth || window.innerWidth) / (mount.clientHeight || window.innerHeight);
        const heightRatio = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
        const containDistance = Math.max(planeHeight / (2 * heightRatio), planeWidth / (2 * heightRatio * camera.aspect));
        baseCameraZ = containDistance * 1.02;
        camera.position.z = baseCameraZ;
        camera.updateProjectionMatrix();
        handleResize();

        removeResize = () => window.removeEventListener('resize', handleResize);
        removePointerMove = () => mount.removeEventListener('pointermove', handlePointerMove);
        removePointerDown = () => mount.removeEventListener('pointerdown', handlePointerDown);
        window.addEventListener('resize', handleResize, { passive: true });
        mount.addEventListener('pointermove', handlePointerMove, { passive: true });
        mount.addEventListener('pointerdown', handlePointerDown, { passive: true });

        setLoading(false);
        animate();
      } catch (error) {
        console.error('Temporal Archive failed to initialize.', error);
        setLoading(false);
        if (stateReadout) stateReadout.textContent = 'SIGNAL LOST';
      }
    };

    setup();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      removeResize?.();
      removePointerMove?.();
      removePointerDown?.();
      slices.forEach((mesh) => mesh.material.dispose());
      geometry?.dispose();
      texture?.dispose();
      composer?.dispose();
      renderer?.dispose();
      if (renderer?.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="temporal-archive-canvas" />;
}
