import AVFoundation
import CoreMedia
import WebRTC

final class WebRTCClient: NSObject {
    var onLocalDescription: ((RTCSessionDescription) -> Void)?
    var onLocalCandidate: ((RTCIceCandidate) -> Void)?
    var onConnectionState: ((RTCPeerConnectionState) -> Void)?

    private let factory: RTCPeerConnectionFactory
    private let videoSource: RTCVideoSource
    private let videoCapturer: RTCVideoCapturer
    private let peerConnection: RTCPeerConnection
    private let videoTrack: RTCVideoTrack

    init() {
        RTCInitializeSSL()
        let encoderFactory = RTCDefaultVideoEncoderFactory()
        let decoderFactory = RTCDefaultVideoDecoderFactory()
        factory = RTCPeerConnectionFactory(encoderFactory: encoderFactory, decoderFactory: decoderFactory)
        videoSource = factory.videoSource()
        videoCapturer = RTCVideoCapturer(delegate: videoSource)
        videoTrack = factory.videoTrack(with: videoSource, trackId: "phone-screen")

        let config = RTCConfiguration()
        config.sdpSemantics = .unifiedPlan
        config.bundlePolicy = .maxBundle
        config.iceServers = []
        let constraints = RTCMediaConstraints(
            mandatoryConstraints: nil,
            optionalConstraints: ["DtlsSrtpKeyAgreement": "true"]
        )
        guard let peerConnection = factory.peerConnection(with: config, constraints: constraints, delegate: nil) else {
            fatalError("Unable to create the iOS WebRTC peer connection.")
        }
        self.peerConnection = peerConnection
        super.init()
        peerConnection.delegate = self
        _ = peerConnection.add(videoTrack, streamIds: ["phone-screen-stream"])
    }

    func makeOffer() {
        let constraints = RTCMediaConstraints(
            mandatoryConstraints: ["OfferToReceiveVideo": "false"],
            optionalConstraints: nil
        )
        peerConnection.offer(for: constraints) { [weak self] description, error in
            guard let self, let description, error == nil else {
                if let error { print("WebRTC offer failed: \(error)") }
                return
            }
            self.peerConnection.setLocalDescription(description) { setError in
                if let setError { print("WebRTC local offer failed: \(setError)"); return }
                self.onLocalDescription?(description)
            }
        }
    }

    func setRemoteAnswer(_ answer: RTCSessionDescription) {
        peerConnection.setRemoteDescription(answer) { error in
            if let error { print("WebRTC answer failed: \(error)") }
        }
    }

    func addRemoteCandidate(_ candidate: RTCIceCandidate) {
        peerConnection.add(candidate) { error in
            if let error { print("WebRTC candidate failed: \(error)") }
        }
    }

    func push(sampleBuffer: CMSampleBuffer) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        let rtcBuffer = RTCCVPixelBuffer(pixelBuffer: pixelBuffer)
        let timestamp = Int64(CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sampleBuffer)) * 1_000_000_000)
        let frame = RTCVideoFrame(buffer: rtcBuffer, rotation: ._0, timeStampNs: timestamp)
        videoSource.capturer(videoCapturer, didCapture: frame)
    }
}

extension WebRTCClient: RTCPeerConnectionDelegate {
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {}
    func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) { onLocalCandidate?(candidate) }
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCPeerConnectionState) { onConnectionState?(stateChanged) }
}
