export type LiveBridgeStatus =
  | 'idle'
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type LiveBridgeStats = {
  resolution: string;
  fps: number;
  latency: number;
  state: string;
  packetsLost: number;
};

type BridgeSignal =
  | { type: 'join'; roomId: string; sessionId: string; role: 'receiver' }
  | { type: 'leave'; roomId: string; sessionId: string; role: 'receiver' }
  | { type: 'candidate'; candidate: RTCIceCandidateInit }
  | { type: 'answer'; answer: RTCSessionDescriptionInit }
  | { type: 'request-offer' };

type IncomingSignal = {
  type: string;
  offer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  message?: string;
};

export type LivePhoneBridgeOptions = {
  roomId: string;
  sessionId: string;
  signalingUrl: string;
  onStatus?: (status: LiveBridgeStatus, detail?: string) => void;
  onStream?: (stream: MediaStream | null) => void;
  onStats?: (stats: LiveBridgeStats) => void;
};

const EMPTY_STATS: LiveBridgeStats = {
  resolution: '—',
  fps: 0,
  latency: 0,
  state: 'new',
  packetsLost: 0,
};

function canUseWebRTC() {
  return typeof window !== 'undefined' && 'RTCPeerConnection' in window;
}

export function getDefaultSignalingUrl(hostName?: string) {
  const configured = process.env.NEXT_PUBLIC_PHONE_BRIDGE_URL;
  if (configured) return configured;

  const host = hostName ?? (typeof window === 'undefined' ? '' : window.location.hostname);
  if (!host) return '';
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${host}:8787/bridge`;
}

export class LivePhoneBridge {
  private readonly options: LivePhoneBridgeOptions;

  private peerConnection: RTCPeerConnection | null = null;

  private socket: WebSocket | null = null;

  private statsTimer: number | null = null;

  private closedByUser = false;

  private pendingCandidates: RTCIceCandidateInit[] = [];

  constructor(options: LivePhoneBridgeOptions) {
    this.options = options;
  }

  get state() {
    return this.peerConnection?.connectionState ?? 'new';
  }

  async connect() {
    if (!canUseWebRTC()) {
      this.options.onStatus?.('error', 'WebRTC is not available in this browser.');
      return;
    }

    this.closedByUser = false;
    this.options.onStatus?.('connecting');
    this.disposePeerConnection();

    const peerConnection = new RTCPeerConnection({
      bundlePolicy: 'max-bundle',
      iceCandidatePoolSize: 1,
      iceServers: [],
    });
    this.peerConnection = peerConnection;

    peerConnection.addTransceiver('video', { direction: 'recvonly' });
    peerConnection.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      this.options.onStream?.(stream);
      this.options.onStatus?.('connected');
    };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.send({ type: 'candidate', candidate: event.candidate.toJSON() });
      }
    };
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === 'connected') this.options.onStatus?.('connected');
      if (state === 'connecting') this.options.onStatus?.('connecting');
      if (state === 'disconnected') this.options.onStatus?.('disconnected');
      if (state === 'failed') this.options.onStatus?.('error', 'WebRTC connection failed.');
      if (state === 'closed' && !this.closedByUser) this.options.onStatus?.('disconnected');
    };

    this.startStatsLoop();
    this.openSignalingSocket();
  }

  disconnect() {
    this.closedByUser = true;
    if (this.options.roomId && this.options.sessionId) {
      this.send({
        type: 'leave',
        roomId: this.options.roomId,
        sessionId: this.options.sessionId,
        role: 'receiver',
      });
    }
    this.stopStatsLoop();
    this.socket?.close();
    this.socket = null;
    this.options.onStream?.(null);
    this.disposePeerConnection();
    this.options.onStats?.(EMPTY_STATS);
    this.options.onStatus?.('disconnected');
  }

  destroy() {
    this.disconnect();
  }

  private openSignalingSocket() {
    const { signalingUrl, roomId, sessionId } = this.options;
    if (!signalingUrl) {
      this.options.onStatus?.('waiting', 'Set a bridge endpoint to receive an iPhone stream.');
      return;
    }

    try {
      const socket = new WebSocket(signalingUrl);
      this.socket = socket;
      socket.onopen = () => {
        this.send({ type: 'join', roomId, sessionId, role: 'receiver' });
        this.options.onStatus?.('waiting', 'Bridge ready. Waiting for iPhone...');
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as IncomingSignal;
          void this.handleSignal(message);
        } catch {
          this.options.onStatus?.('error', 'Bridge sent an unreadable signal.');
        }
      };
      socket.onerror = () => {
        if (!this.closedByUser) {
          this.options.onStatus?.('waiting', 'Waiting for the Phone Screen Bridge…');
        }
      };
      socket.onclose = () => {
        this.socket = null;
        if (!this.closedByUser && this.state !== 'connected') {
          this.options.onStatus?.('waiting', 'Bridge relay is offline. Start the local bridge to connect.');
        }
      };
    } catch {
      this.options.onStatus?.('waiting', 'Waiting for the Phone Screen Bridge…');
    }
  }

  private async handleSignal(message: IncomingSignal) {
    const peerConnection = this.peerConnection;
    if (!peerConnection) return;

    if (message.type === 'offer' && message.offer) {
      await peerConnection.setRemoteDescription(message.offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      this.send({ type: 'answer', answer });
      for (const candidate of this.pendingCandidates) {
        await peerConnection.addIceCandidate(candidate);
      }
      this.pendingCandidates = [];
      return;
    }

    if (message.type === 'candidate' && message.candidate) {
      if (peerConnection.remoteDescription) {
        await peerConnection.addIceCandidate(message.candidate);
      } else {
        this.pendingCandidates.push(message.candidate);
      }
      return;
    }

    if (message.type === 'sender-ready') {
      this.send({ type: 'request-offer' });
    }

    if (message.type === 'error') {
      this.options.onStatus?.('error', message.message ?? 'Phone Screen Bridge error.');
    }
  }

  private send(message: BridgeSignal) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private startStatsLoop() {
    this.stopStatsLoop();
    this.statsTimer = window.setInterval(() => {
      void this.readStats();
    }, 900);
  }

  private stopStatsLoop() {
    if (this.statsTimer !== null) window.clearInterval(this.statsTimer);
    this.statsTimer = null;
  }

  private async readStats() {
    const peerConnection = this.peerConnection;
    if (!peerConnection) return;

    const report = await peerConnection.getStats();
    let resolution = '—';
    let fps = 0;
    let packetsLost = 0;
    let latency = 0;

    report.forEach((raw) => {
      const stat = raw as RTCStats & {
        kind?: string;
        frameWidth?: number;
        frameHeight?: number;
        framesPerSecond?: number;
        packetsLost?: number;
        currentRoundTripTime?: number;
        state?: string;
      };
      if (stat.type === 'inbound-rtp' && stat.kind === 'video') {
        if (stat.frameWidth && stat.frameHeight) resolution = `${stat.frameWidth} × ${stat.frameHeight}`;
        if (stat.framesPerSecond) fps = Math.round(stat.framesPerSecond);
        if (stat.packetsLost) packetsLost = stat.packetsLost;
      }
      if (stat.type === 'candidate-pair' && stat.state === 'succeeded' && stat.currentRoundTripTime) {
        latency = Math.round(stat.currentRoundTripTime * 500);
      }
    });

    this.options.onStats?.({
      resolution,
      fps,
      latency,
      packetsLost,
      state: peerConnection.connectionState,
    });
  }

  private disposePeerConnection() {
    this.peerConnection?.getSenders().forEach((sender) => sender.track?.stop());
    this.peerConnection?.close();
    this.peerConnection = null;
    this.pendingCandidates = [];
  }
}
