import ReplayKit

final class SampleHandler: RPBroadcastSampleHandler {
    private let bridge = PhoneScreenBridge()

    override func broadcastStarted(withSetupInfo setupInfo: [String: NSObject]?) {
        bridge.start()
    }

    override func processSampleBuffer(_ sampleBuffer: CMSampleBuffer, with sampleBufferType: RPSampleBufferType) {
        guard sampleBufferType == .video else { return }
        bridge.push(sampleBuffer: sampleBuffer)
    }

    override func broadcastPaused() {}
    override func broadcastResumed() {}

    override func broadcastFinished() {
        bridge.stop()
    }
}
