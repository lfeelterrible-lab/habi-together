import Foundation

struct BridgeConfig: Codable, Equatable {
    let roomId: String
    let sessionId: String
    let signalingURL: URL
}

enum BridgeConfigStore {
    static let appGroup = "group.com.example.phonesender"
    private static let key = "phone-screen-bridge.config"

    static func save(_ config: BridgeConfig) {
        guard let data = try? JSONEncoder().encode(config) else { return }
        UserDefaults(suiteName: appGroup)?.set(data, forKey: key)
    }

    static func load() -> BridgeConfig? {
        guard
            let data = UserDefaults(suiteName: appGroup)?.data(forKey: key),
            let config = try? JSONDecoder().decode(BridgeConfig.self, from: data)
        else { return nil }
        return config
    }
}
