# Phone Screen Bridge / iOS Sender

This is the iPhone half of Three.js Studio. It is a separate native project from the Windows Studio and is responsible for:

1. storing the QR pairing payload;
2. starting the ReplayKit Broadcast Upload Extension;
3. converting ReplayKit `CMSampleBuffer` frames into WebRTC video frames; and
4. sending the video track to the Studio over a low-latency peer connection.

There is no MP4 upload or playback in this path.

## Important Apple SDK note

Apple's current ReplayKit documentation marks `RPBroadcastController`, `RPBroadcastActivityViewController`, `RPBroadcastSampleHandler`, and `RPSystemBroadcastPickerView` as deprecated in the latest documentation snapshots. This repository keeps the Broadcast Upload Extension route because it is the established iPhone screen-broadcast boundary and is the route requested by the product brief. The capture boundary is isolated in `PhoneScreenBridge.swift` so it can be replaced with the supported ScreenCaptureKit capture surface when the deployment target and SDK require it.

Validate the final target against the iOS SDK used by the Xcode project. Do not ship the sender without testing the extension lifecycle on the target iOS version.

## Create the Xcode project

1. Create an iOS App target named `PhoneSender`.
2. Add a **Broadcast Upload Extension** target named `PhoneSenderBroadcastUpload`.
3. Add the shared Swift files in `ios/Shared/` to both targets.
4. Add `ios/PhoneSender/ContentView.swift` and `PhoneSenderApp.swift` to the app target.
5. Add `ios/BroadcastUploadExtension/SampleHandler.swift` to the extension target.
6. Set a shared App Group such as `group.com.example.phonesender` on both targets.
7. Put the extension bundle identifier in `BroadcastPickerView`'s `preferredExtension` value.
8. Add the `GoogleWebRTC` dependency using the provided `Podfile` or the equivalent Swift package/binary used by your project.

The sender UI saves the QR payload into the App Group. The broadcast extension reads the same room, session, and signaling URL when ReplayKit starts it.

## Local bridge server

```bash
cd bridge-server
npm install
npm run dev
```

The server listens on `0.0.0.0:8787` by default and exposes:

- `GET /health`
- WebSocket `ws://<PC-LAN-IP>:8787/bridge`

It forwards only JSON signaling messages inside a room. It does not receive or persist the media track.

## Pairing flow

The Studio QR payload is a deep-link-shaped URL:

```text
phonebridge://join?room=ROOM-XXXX&session=RX-XXXX&bridge=ws%3A%2F%2F192.168.1.20%3A8787%2Fbridge
```

The sender parses the three fields, stores them in the App Group, and opens the broadcast picker. The sender is the WebRTC offerer; the Studio is the recv-only answerer.

```text
receiver -> join(room, session)
sender   -> sender-ready
receiver -> request-offer
sender   -> offer
receiver -> answer
both     -> candidate
sender   -> video track
```

## Network and latency

- Keep the Windows PC and iPhone on the same Wi-Fi/LAN.
- The bridge uses no STUN/TURN servers by default, which keeps the LAN path short and avoids routing media through a third party.
- For a production or cross-network deployment, add an authenticated signaling service and a TURN server; do not expose this development relay directly to the public internet.
- Use the Studio telemetry panel to check the actual inbound resolution, FPS, packet loss, and round-trip estimate.
