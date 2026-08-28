import Foundation

final class SignalingClient: NSObject, URLSessionWebSocketDelegate {
    enum SignalError: Error {
        case notConnected
        case malformedMessage
    }

    var onMessage: (([String: Any]) -> Void)?
    var onStateChange: ((URLSessionTask.State) -> Void)?

    private let url: URL
    private var task: URLSessionWebSocketTask?
    private lazy var session: URLSession = URLSession(
        configuration: .default,
        delegate: self,
        delegateQueue: OperationQueue()
    )

    init(url: URL) {
        self.url = url
    }

    func connect() {
        task = session.webSocketTask(with: url)
        task?.resume()
        receive()
    }

    func close() {
        task?.cancel(with: .normalClosure, reason: nil)
        task = nil
    }

    func send(_ message: [String: Any]) throws {
        guard let task else { throw SignalError.notConnected }
        let data = try JSONSerialization.data(withJSONObject: message)
        task.send(.data(data)) { error in
            if let error { print("Phone Screen Bridge signaling send failed: \(error)") }
        }
    }

    private func receive() {
        task?.receive { [weak self] result in
            guard let self else { return }
            switch result {
            case .success(let message):
                let data: Data?
                switch message {
                case .data(let value): data = value
                case .string(let value): data = value.data(using: .utf8)
                @unknown default: data = nil
                }
                if let data,
                   let object = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    self.onMessage?(object)
                }
                self.receive()
            case .failure(let error):
                print("Phone Screen Bridge signaling receive failed: \(error)")
            }
        }
    }

    func urlSession(_ session: URLSession, webSocketTask: URLSessionWebSocketTask, didOpenWithProtocol protocol: String?) {
        onStateChange?(webSocketTask.state)
    }

    func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        onStateChange?(task.state)
        if let error { print("Phone Screen Bridge signaling closed: \(error)") }
    }
}
