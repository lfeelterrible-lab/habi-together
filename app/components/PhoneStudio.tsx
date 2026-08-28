'use client';

import { ContactShadows, Grid, OrbitControls, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import QRCode from 'qrcode';
import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import * as THREE from 'three';
import {
  createWaitingTextureCanvas,
  DemoPhoneStream,
  type DemoStreamStats,
} from '../lib/demoPhoneStream';
import {
  getDefaultSignalingUrl,
  LivePhoneBridge,
  type LiveBridgeStats,
  type LiveBridgeStatus,
} from '../lib/livePhoneBridge';

type StudioMode = 'live' | 'demo';

const EMPTY_STATS: LiveBridgeStats = {
  resolution: '—',
  fps: 0,
  latency: 0,
  state: 'new',
  packetsLost: 0,
};

const STATUS_COPY: Record<LiveBridgeStatus, string> = {
  idle: 'Waiting for iPhone...',
  waiting: 'Waiting for iPhone...',
  connecting: 'Connecting to iPhone...',
  connected: 'iPhone Connected',
  disconnected: 'Bridge disconnected',
  error: 'Connection needs attention',
};

function createCode(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

const noLocationSubscription = () => () => undefined;

function useBrowserHost() {
  return useSyncExternalStore(
    noLocationSubscription,
    () => window.location.hostname || '127.0.0.1',
    () => '',
  );
}

function PhoneModel({
  screenTexture,
  isConnected,
}: {
  screenTexture: THREE.Texture | null;
  isConnected: boolean;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    group.current.position.y = Math.sin(clock.elapsedTime * 0.78) * 0.035;
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.015, 3, delta);
  });

  return (
    <group ref={group} rotation={[0.03, -0.16, -0.015]}>
      <RoundedBox
        args={[3.56, 7.18, 0.34]}
        radius={0.5}
        smoothness={8}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#b9c7ba"
          metalness={0.78}
          roughness={0.2}
          clearcoat={1}
          clearcoatRoughness={0.12}
        />
      </RoundedBox>

      <mesh position={[0, 0, 0.196]} receiveShadow>
        <planeGeometry args={[3.2, 6.72]} />
        {screenTexture ? (
          <meshBasicMaterial map={screenTexture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#081310" />
        )}
      </mesh>

      <mesh position={[0, 0, 0.21]} scale={[1.02, 1.01, 1]}>
        <planeGeometry args={[3.2, 6.72]} />
        <meshBasicMaterial
          color={isConnected ? '#d3e7c8' : '#8caa92'}
          transparent
          opacity={isConnected ? 0.035 : 0.02}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <RoundedBox args={[1.15, 0.3, 0.11]} radius={0.14} smoothness={6} position={[0, 2.91, 0.23]}>
        <meshStandardMaterial color="#07100e" roughness={0.35} metalness={0.2} />
      </RoundedBox>

      <mesh position={[0, 2.9, 0.292]}>
        <boxGeometry args={[0.25, 0.035, 0.012]} />
        <meshBasicMaterial color="#1f3028" />
      </mesh>

      <mesh position={[-1.83, 1.32, 0.01]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.72, 0.08]} />
        <meshStandardMaterial color="#91a395" roughness={0.3} metalness={0.75} />
      </mesh>
      <mesh position={[-1.83, 0.58, 0.01]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.38, 0.08]} />
        <meshStandardMaterial color="#91a395" roughness={0.3} metalness={0.75} />
      </mesh>
      <mesh position={[-1.83, -0.01, 0.01]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.38, 0.08]} />
        <meshStandardMaterial color="#91a395" roughness={0.3} metalness={0.75} />
      </mesh>

      <mesh position={[1.83, 0.9, 0.01]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.12, 0.78, 0.08]} />
        <meshStandardMaterial color="#91a395" roughness={0.3} metalness={0.75} />
      </mesh>

      <mesh position={[0.89, -3.48, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.29, 0.035, 10, 32]} />
        <meshStandardMaterial color="#758b7d" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0.18, -3.48, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.085, 0.025, 10, 24]} />
        <meshStandardMaterial color="#758b7d" roughness={0.35} metalness={0.8} />
      </mesh>
    </group>
  );
}

function PhoneScene({ screenTexture, isConnected }: { screenTexture: THREE.Texture | null; isConnected: boolean }) {
  return (
    <Canvas
      className="phone-canvas"
      dpr={[1, 1.7]}
      shadows
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 29, near: 0.1, far: 100, position: [0.35, 0.1, 12.4] }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x07100e, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.06;
      }}
    >
      <color attach="background" args={['#07100e']} />
      <fog attach="fog" args={['#07100e', 12, 26]} />
      <ambientLight intensity={1.25} color="#d7e6d0" />
      <hemisphereLight args={['#e1edd9', '#081310', 1.35]} />
      <directionalLight castShadow color="#f0d09a" intensity={3.2} position={[4.5, 7, 7]} />
      <directionalLight color="#9cbfc0" intensity={1.75} position={[-5, 1.5, -4]} />
      <pointLight color={isConnected ? '#d3edbe' : '#92b29a'} intensity={2.2} distance={9} position={[0, 0.5, 3.4]} />

      <Suspense fallback={null}>
        <PhoneModel screenTexture={screenTexture} isConnected={isConnected} />
        <ContactShadows
          position={[0, -3.75, 0.1]}
          opacity={0.42}
          scale={7}
          blur={2.7}
          far={5.5}
          color="#020706"
        />
      </Suspense>

      <Grid
        position={[0, -3.77, -0.2]}
        args={[24, 24]}
        cellSize={0.8}
        cellThickness={0.4}
        cellColor="#315047"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#66826f"
        fadeDistance={14}
        fadeStrength={1.15}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.22}
        minDistance={9.2}
        maxDistance={15.4}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.68}
        target={[0, 0, 0]}
      />
    </Canvas>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="stat-cell">
      <span>{label}</span>
      <strong className={accent ? 'is-accent' : ''}>{value}</strong>
    </div>
  );
}

function QrConnectModal({
  open,
  qrDataUrl,
  roomId,
  sessionId,
  bridgeAddress,
  onClose,
}: {
  open: boolean;
  qrDataUrl: string;
  roomId: string;
  sessionId: string;
  bridgeAddress: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="qr-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="qr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-kicker">SECURE PAIRING / 01</div>
        <div className="modal-heading-row">
          <div>
            <h2 id="qr-modal-title">Scan to connect iPhone</h2>
            <p>Open Phone Screen Bridge on your iPhone, then scan this room.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close QR dialog" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="qr-content">
          <div className="qr-frame">
            {qrDataUrl ? <img src={qrDataUrl} alt={`Connection QR code for room ${roomId}`} /> : <div className="qr-loading">Preparing QR…</div>}
            <div className="qr-corner qr-corner-tl" />
            <div className="qr-corner qr-corner-tr" />
            <div className="qr-corner qr-corner-bl" />
            <div className="qr-corner qr-corner-br" />
          </div>
          <div className="qr-fields">
            <div><span>Room ID</span><strong>{roomId}</strong></div>
            <div><span>Session</span><strong>{sessionId}</strong></div>
            <div><span>Local bridge</span><strong>{bridgeAddress}</strong></div>
          </div>
        </div>

        <div className="modal-footnote">
          <span className="status-dot" />
          <span>The QR payload is local-session metadata. Media stays peer-to-peer on your LAN.</span>
        </div>
      </section>
    </div>
  );
}

export default function PhoneStudio() {
  const [mode, setMode] = useState<StudioMode>('live');
  const [connectionStatus, setConnectionStatus] = useState<LiveBridgeStatus>('idle');
  const [statusDetail, setStatusDetail] = useState('Local bridge ready when you are.');
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const [stats, setStats] = useState<LiveBridgeStats | DemoStreamStats>(EMPTY_STATS);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const bridgeRef = useRef<LivePhoneBridge | null>(null);
  const roomId = useState(() => createCode('ROOM'))[0];
  const sessionId = useState(() => createCode('RX'))[0];
  const browserHost = useBrowserHost();
  const signalingUrl = getDefaultSignalingUrl(browserHost || undefined);
  const demoController = useMemo(() => {
    if (mode !== 'demo' || typeof document === 'undefined') return null;
    return new DemoPhoneStream();
  }, [mode]);

  const placeholderTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const texture = new THREE.CanvasTexture(createWaitingTextureCanvas());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const activeStream = mode === 'demo' ? demoController?.stream ?? null : liveStream;
  const displayedStats: LiveBridgeStats | DemoStreamStats = mode === 'demo'
    ? demoController?.stats ?? { resolution: '390 × 844', fps: 30, latency: 0, state: 'demo-stream', packetsLost: 0 }
    : stats;
  const isConnected = mode === 'demo' || connectionStatus === 'connected';
  const bridgeAddress = signalingUrl || (typeof window === 'undefined' ? 'local network bridge' : window.location.origin);
  const screenTexture = videoTexture ?? placeholderTexture;

  useEffect(() => {
    const bridge = new LivePhoneBridge({
      roomId,
      sessionId,
      signalingUrl,
      onStatus: (nextStatus, detail) => {
        setConnectionStatus(nextStatus);
        setStatusDetail(detail ?? STATUS_COPY[nextStatus]);
      },
      onStream: setLiveStream,
      onStats: setStats,
    });
    bridgeRef.current = bridge;
    return () => {
      bridge.destroy();
      bridgeRef.current = null;
    };
  }, [roomId, sessionId, signalingUrl]);

  useEffect(() => {
    if (!demoController) return undefined;
    demoController.start();
    return () => demoController.stop();
  }, [demoController]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (!activeStream) {
      video.pause();
      video.srcObject = null;
      return undefined;
    }

    video.srcObject = activeStream;
    video.muted = true;
    video.playsInline = true;
    void video.play().catch(() => undefined);

    return () => {
      video.pause();
      video.srcObject = null;
    };
  }, [activeStream]);

  useEffect(() => {
    if (!activeStream || !videoRef.current) return undefined;
    const texture = new THREE.VideoTexture(videoRef.current);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    setVideoTexture(texture);
    return () => {
      texture.dispose();
      setVideoTexture(null);
    };
  }, [activeStream]);

  useEffect(() => {
    return () => {
      placeholderTexture?.dispose();
    };
  }, [placeholderTexture]);

  useEffect(() => {
    if (!qrOpen) return;
    const payload = `phonebridge://join?room=${encodeURIComponent(roomId)}&session=${encodeURIComponent(sessionId)}&bridge=${encodeURIComponent(bridgeAddress)}`;
    void QRCode.toDataURL(payload, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#13211d', light: '#f3f5ed' },
    }).then(setQrDataUrl).catch(() => setQrDataUrl(''));
  }, [bridgeAddress, qrOpen, roomId, sessionId]);

  const connect = () => {
    if (connectionStatus === 'connected' && mode === 'live') {
      bridgeRef.current?.disconnect();
      return;
    }
    setMode('live');
    bridgeRef.current?.connect();
  };

  const reconnect = () => {
    setMode('live');
    bridgeRef.current?.disconnect();
    window.setTimeout(() => bridgeRef.current?.connect(), 180);
  };

  const showDemo = () => {
    if (connectionStatus === 'connected') bridgeRef.current?.disconnect();
    setMode('demo');
  };

  const showLive = () => {
    setMode('live');
    setStats(EMPTY_STATS);
    setStatusDetail('Local bridge ready when you are.');
  };

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div className="studio-brand">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="brand-kicker">THREE.JS</span>
            <strong>STUDIO</strong>
          </div>
        </div>

        <div className="sidebar-section-label">Workspace</div>
        <nav className="studio-nav" aria-label="Studio navigation">
          <a className="studio-nav-link is-active" href="#preview"><span className="nav-index">01</span><span>Phone preview</span></a>
          <a className="studio-nav-link" href="#bridge"><span className="nav-index">02</span><span>Bridge session</span></a>
          <a className="studio-nav-link" href="#notes"><span className="nav-index">03</span><span>Session notes</span></a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-section-label">Transport</div>
          <div className={`transport-chip ${mode === 'live' ? 'is-live' : 'is-demo'}`}>
            <span className="transport-dot" />
            <span>{mode === 'live' ? 'LIVE / WEBRTC' : 'DEMO / CANVAS STREAM'}</span>
          </div>
          <p className="sidebar-note">The 3D surface stays active while the screen source changes.</p>
          <div className="version-line"><span>BRIDGE BUILD</span><strong>0.3.1</strong></div>
        </div>
      </aside>

      <div className="studio-content">
        <header className="studio-topbar">
          <div className="breadcrumb"><span>LOCAL WORKSPACE</span><i>/</i><strong>PHONE SCREEN BRIDGE</strong></div>
          <div className="topbar-actions"><span className="secure-badge"><span className="secure-lock" /> PEER-TO-PEER</span><span className="topbar-time">SESSION {sessionId}</span></div>
        </header>

        <main className="studio-main" id="preview">
          <section className="preview-column">
            <div className="preview-heading">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" />SCREEN SURFACE / 01</div>
                <h1>Digital twin <em>in motion.</em></h1>
              </div>
              <div className="preview-id"><span>DEVICE</span><strong>IPHONE / PORTRAIT</strong></div>
            </div>

            <div className={`phone-stage ${isConnected ? 'is-connected' : ''}`}>
              <div className="stage-corner stage-corner-tl" />
              <div className="stage-corner stage-corner-tr" />
              <div className="stage-corner stage-corner-bl" />
              <div className="stage-corner stage-corner-br" />
              <div className="stage-axis stage-axis-y"><span>Y / 07.18</span></div>
              <div className="stage-axis stage-axis-x"><span>X / 03.56</span></div>
              <div className="stage-label stage-label-top"><span className="signal-dot" />{mode === 'live' ? 'LIVE SURFACE' : 'DEMO SURFACE'}<i>·</i><strong>{isConnected ? 'TRACKING' : 'STANDBY'}</strong></div>
              <PhoneScene screenTexture={screenTexture} isConnected={isConnected} />
              {!isConnected && <div className="phone-stage-empty"><span>WAITING FOR IPHONE</span><small>Click LIVE PHONE to open the bridge</small></div>}
              <div className="stage-label stage-label-bottom"><span>SCREEN MESH / VIDEO TEXTURE</span><strong>{displayedStats.resolution === '—' ? 'AWAITING SOURCE' : displayedStats.resolution}</strong></div>
            </div>

            <div className="preview-footer">
              <div className="orbit-hint"><span className="orbit-ring" />DRAG TO ORBIT <i>·</i> SCROLL TO ZOOM</div>
              <div className="render-badges"><span>WEBGL 2</span><span>R3F</span><span>THREE R180</span></div>
            </div>
          </section>

          <aside className="control-column" id="bridge">
            <div className="control-header">
              <div>
                <div className="eyebrow"><span className="eyebrow-line" />CONTROL PLANE</div>
                <h2>Live phone</h2>
              </div>
              <div className="control-header-actions">
                <button className="live-phone-button" type="button" onClick={connect} aria-pressed={mode === 'live' && isConnected}>
                  <span className="live-phone-button-dot" />LIVE PHONE
                </button>
                <span className={`panel-status-dot ${isConnected ? 'is-on' : ''}`} aria-label={isConnected ? 'Connected' : 'Not connected'} />
              </div>
            </div>

            <div className="mode-switch" role="tablist" aria-label="Screen source mode">
              <button type="button" className={mode === 'live' ? 'is-active' : ''} role="tab" aria-selected={mode === 'live'} onClick={showLive}>
                <span className="mode-number">01</span><span>LIVE MODE</span><small>IPHONE / WEBRTC</small>
              </button>
              <button type="button" className={mode === 'demo' ? 'is-active demo-tab' : ''} role="tab" aria-selected={mode === 'demo'} onClick={showDemo}>
                <span className="mode-number">02</span><span>DEMO MODE</span><small>CANVAS / FALLBACK</small>
              </button>
            </div>

            <div className={`connection-card ${isConnected ? 'is-connected' : ''}`}>
              <div className="connection-card-top"><span className="connection-label">SOURCE STATUS</span><span className="connection-time">{mode === 'demo' ? 'LOCAL' : 'LAN READY'}</span></div>
              <div className="connection-title-row"><span className="connection-pulse" /><h3>{mode === 'demo' ? 'Demo stream running' : STATUS_COPY[connectionStatus]}</h3></div>
              <p>{mode === 'demo' ? 'A generated MediaStream is mapped to the same screen mesh.' : statusDetail}</p>
              <div className="connection-actions">
                <button className="primary-action" type="button" onClick={connect} disabled={mode === 'demo'}>
                  <span className="button-spark" />{connectionStatus === 'connected' && mode === 'live' ? 'Disconnect' : 'Connect'}<span className="button-arrow">↗</span>
                </button>
                <button className="secondary-action" type="button" onClick={reconnect} disabled={mode === 'demo'}>Reconnect</button>
              </div>
              <button className="qr-action" type="button" onClick={() => setQrOpen(true)}><span className="qr-mini" />QR Connect<span>↗</span></button>
            </div>

            <div className="stats-card">
              <div className="section-title"><span>TELEMETRY</span><i /> <small>{mode === 'demo' ? 'SIMULATED' : 'LIVE READOUT'}</small></div>
              <div className="stats-grid">
                <Stat label="RESOLUTION" value={displayedStats.resolution} />
                <Stat label="FPS" value={displayedStats.fps ? `${displayedStats.fps}` : '—'} accent={isConnected} />
                <Stat label="LATENCY" value={displayedStats.latency ? `${displayedStats.latency} ms` : '—'} accent={displayedStats.latency > 0 && displayedStats.latency < 80} />
                <Stat label="CONNECTION" value={mode === 'demo' ? 'LOCAL' : displayedStats.state === 'new' ? 'IDLE' : displayedStats.state.toUpperCase()} />
              </div>
              <div className="packet-line"><span>PACKETS LOST</span><strong>{displayedStats.packetsLost}</strong><i className={displayedStats.packetsLost ? 'has-loss' : ''} /></div>
            </div>

            <div className="session-card">
              <div className="section-title"><span>PAIRING SESSION</span><i /></div>
              <div className="session-row"><span>ROOM ID</span><strong>{roomId}</strong><button type="button" aria-label="Open room QR" onClick={() => setQrOpen(true)}>QR</button></div>
              <div className="session-row"><span>BRIDGE</span><strong>{signalingUrl ? 'LOCAL RELAY' : 'NOT CONFIGURED'}</strong></div>
              <div className="session-row"><span>TRACK</span><strong>{isConnected ? 'SCREEN / VIDEO' : 'SCREEN / —'}</strong></div>
            </div>

            <div className="control-note" id="notes"><span className="note-mark">+</span><p>iPhone input stays on-device. Studio only receives the screen track; camera, lighting, and orbit remain independent.</p></div>
          </aside>
        </main>

        <footer className="studio-footer">
          <div className="footer-left"><span className="footer-led" />{mode === 'live' ? 'LIVE PIPELINE ARMED' : 'DEMO PIPELINE ACTIVE'}<i>·</i><span>VIDEO TEXTURE / 60 FPS TARGET</span></div>
          <div className="footer-right"><span>LOCAL ONLY</span><i>·</i><span>NO RECORDING</span><i>·</i><span>STUDIO / 01</span></div>
        </footer>
      </div>

      <video
        ref={videoRef}
        className="screen-source-video"
        playsInline
        muted
        aria-hidden="true"
      />

      <QrConnectModal
        open={qrOpen}
        qrDataUrl={qrDataUrl}
        roomId={roomId}
        sessionId={sessionId}
        bridgeAddress={bridgeAddress}
        onClose={() => setQrOpen(false)}
      />
    </div>
  );
}
