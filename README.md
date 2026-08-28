# Three.js Studio / Live Phone

This repository is the Windows Studio side of a real-time iPhone screen mirror.
It is intentionally split into two surfaces:

```text
/studio        this repository: React + React Three Fiber receiver
/phone-sender  iOS app + ReplayKit broadcast extension + LAN signaling bridge
```

The Studio has two explicit source modes:

- **LIVE MODE** — receives an iPhone WebRTC video track and maps it to an `HTMLVideoElement`, then to `THREE.VideoTexture`, then to the 3D phone screen mesh.
- **DEMO MODE** — generates a local `canvas.captureStream(30)` phone UI so the rendering path can be tested without a phone. It does not upload or play an MP4.

## Run the Studio

```bash
pnpm install
pnpm dev
```

Open the printed local URL on Windows. The receiver creates a room and session ID in the browser. Click **QR Connect** to show the pairing payload.

## Run the LAN Phone Screen Bridge

The standalone bridge only relays WebRTC signaling messages. Media remains peer-to-peer after ICE negotiation.

```bash
cd phone-sender/bridge-server
npm install
npm run dev
```

Configure the Studio to use the bridge's LAN address before starting it:

```powershell
$env:NEXT_PUBLIC_PHONE_BRIDGE_URL = 'ws://192.168.1.20:8787/bridge'
pnpm dev
```

Use the Windows PC's LAN address, not `localhost`, when the iPhone is joining over Wi-Fi. The bridge intentionally has no public TURN service or account system; keep it on a trusted LAN or add authentication before exposing it.

## LIVE pipeline

```text
iPhone ReplayKit / Broadcast Upload Extension
  -> CMSampleBuffer
  -> RTCCVPixelBuffer
  -> WebRTC sender track
  -> LAN signaling + ICE
  -> RTCPeerConnection.ontrack
  -> HTMLVideoElement.srcObject
  -> THREE.VideoTexture
  -> Phone Screen Mesh
```

The receiver reports the inbound track's resolution, FPS, packet loss, connection state, and candidate-pair round-trip estimate in the right-hand telemetry panel.

## iOS sender setup

See [`phone-sender/README.md`](./phone-sender/README.md). The folder contains the shared Swift bridge code, a `GoogleWebRTC` CocoaPods reference, a ReplayKit `SampleHandler`, and the sender-side pairing screen. The actual Xcode project must be created with an app target and a Broadcast Upload Extension target because the extension's bundle and signing settings are application-specific.

Apple's current documentation marks several older ReplayKit live-broadcast controller classes as deprecated. The implementation keeps the Broadcast Upload Extension route requested for iPhone mirroring, isolates it behind `PhoneScreenBridge`, and documents the migration seam for SDKs where ScreenCaptureKit is the supported capture API.
