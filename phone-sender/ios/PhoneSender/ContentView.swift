import ReplayKit
import SwiftUI
import UIKit

struct ContentView: View {
    @AppStorage("roomId") private var roomId = "ROOM-XXXX"
    @AppStorage("sessionId") private var sessionId = "RX-XXXX"
    @AppStorage("bridgeURL") private var bridgeURL = "ws://192.168.1.20:8787/bridge"

    var body: some View {
        NavigationStack {
            Form {
                Section("Pairing") {
                    TextField("Room ID", text: $roomId)
                        .textInputAutocapitalization(.characters)
                    TextField("Session ID", text: $sessionId)
                        .textInputAutocapitalization(.characters)
                    TextField("Bridge URL", text: $bridgeURL)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                }

                Section {
                    BroadcastPickerView(extensionBundleIdentifier: "com.example.phonesender.broadcast")
                        .frame(height: 52)
                    Text("Start Broadcast, choose PhoneSenderBroadcastUpload, then return to Studio.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Phone Screen Bridge")
            .onChange(of: roomId) { saveConfig() }
            .onChange(of: sessionId) { saveConfig() }
            .onChange(of: bridgeURL) { saveConfig() }
            .onAppear { saveConfig() }
            .onOpenURL { url in
                guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }
                if let value = components.queryItems?.first(where: { $0.name == "room" })?.value { roomId = value }
                if let value = components.queryItems?.first(where: { $0.name == "session" })?.value { sessionId = value }
                if let value = components.queryItems?.first(where: { $0.name == "bridge" })?.value { bridgeURL = value }
                saveConfig()
            }
        }
    }

    private func saveConfig() {
        guard let url = URL(string: bridgeURL) else { return }
        BridgeConfigStore.save(BridgeConfig(roomId: roomId, sessionId: sessionId, signalingURL: url))
    }
}

struct BroadcastPickerView: UIViewRepresentable {
    let extensionBundleIdentifier: String

    func makeUIView(context: Context) -> RPSystemBroadcastPickerView {
        let picker = RPSystemBroadcastPickerView(frame: .zero)
        picker.preferredExtension = extensionBundleIdentifier
        picker.showsMicrophoneButton = false
        return picker
    }

    func updateUIView(_ uiView: RPSystemBroadcastPickerView, context: Context) {}
}
