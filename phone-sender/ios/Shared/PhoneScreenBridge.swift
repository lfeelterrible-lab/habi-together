import CoreMedia
import Foundation
import WebRTC

final class PhoneScreenBridge {
    private var config: BridgeConfig?
    private var signaling: SignalingClient?
    private var webRTC: WebRTCClient?

    func start() {
        guard let config = BridgeConfigStore.load() else {
            print("Phone Screen Bridge has no QR pairing config.")
            return
        }
        self.config = config
        let signaling = SignalingClient(url: config.signalingURL)
        let webRTC = WebRTCClient()
        self.signaling = signaling
        self.webRTC = webRTC

        webRTC.onLocalDescription = { [weak self] description in
            self?.sendDescription(description)
        }
        webRTC.onLocalCandidate = { [weak self] candidate in
            self?.sendCandidate(candidate)
        }
        signaling.onMessage = { [weak self] message in
            self?.handle(message)
        }
        signaling.connect()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) {
            try? signaling.send([
                "type": "join",
                "roomId": config.roomId,
                "sessionId": config.sessionId,
                "role": "sender"
            ])
        }
    }

    func stop() {
        signaling?.close()
        signaling = nil
        webRTC = nil
    }

    func push(sampleBuffer: CMSampleBuffer) {
        webRTC?.push(sampleBuffer: sampleBuffer)
    }

    private func handle(_ message: [String: Any]) {
        guard let type = message["type"] as? String else { return }
        if type == "request-offer" || type == "receiver-ready" {
            webRTC?.makeOffer()
            return
        }
        if type == "answer", let answer = sessionDescription(from: message["answer"] as? [String: Any]) {
            webRTC?.setRemoteAnswer(answer)
            return
        }
        if type == "candidate", let candidate = iceCandidate(from: message["candidate"] as? [String: Any]) {
            webRTC?.addRemoteCandidate(candidate)
        }
    }

    private func sendDescription(_ description: RTCSessionDescription) {
        try? signaling?.send([
            "type": description.type == .offer ? "offer" : "answer",
            "offer": description.type == .offer ? ["type": "offer", "sdp": description.sdp] : NSNull(),
            "answer": description.type == .answer ? ["type": "answer", "sdp": description.sdp] : NSNull()
        ])
    }

    private func sendCandidate(_ candidate: RTCIceCandidate) {
        try? signaling?.send([
            "type": "candidate",
            "candidate": [
                "candidate": candidate.sdp,
                "sdpMid": candidate.sdpMid as Any,
                "sdpMLineIndex": candidate.sdpMLineIndex
            ]
        ])
    }

    private func sessionDescription(from value: [String: Any]?) -> RTCSessionDescription? {
        guard
            let value,
            let sdp = value["sdp"] as? String,
            let typeValue = value["type"] as? String,
            let type = RTCSessionDescription.type(for: typeValue)
        else { return nil }
        return RTCSessionDescription(type: type, sdp: sdp)
    }

    private func iceCandidate(from value: [String: Any]?) -> RTCIceCandidate? {
        guard
            let value,
            let candidate = value["candidate"] as? String,
            let sdpMid = value["sdpMid"] as? String,
            let index = value["sdpMLineIndex"] as? Int32
        else { return nil }
        return RTCIceCandidate(sdp: candidate, sdpMLineIndex: index, sdpMid: sdpMid)
    }
}
