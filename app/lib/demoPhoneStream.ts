export type DemoStreamStats = {
  resolution: string;
  fps: number;
  latency: number;
  state: string;
  packetsLost: number;
};

const WIDTH = 390;
const HEIGHT = 844;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function drawIcon(context: CanvasRenderingContext2D, x: number, y: number, color: string, glyph: string) {
  context.fillStyle = color;
  roundedRect(context, x, y, 58, 58, 17);
  context.fill();
  context.fillStyle = '#f8fbf4';
  context.font = '700 24px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(glyph, x + 29, y + 28);
}

function drawHome(context: CanvasRenderingContext2D, phase: number) {
  const background = context.createLinearGradient(0, 0, 0, HEIGHT);
  background.addColorStop(0, '#122e39');
  background.addColorStop(0.52, '#345451');
  background.addColorStop(1, '#101b20');
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = 'rgba(209, 231, 197, 0.14)';
  context.beginPath();
  context.arc(320, 250 + Math.sin(phase * 0.6) * 14, 170, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = 'rgba(242, 175, 88, 0.14)';
  context.beginPath();
  context.arc(35, 600 + Math.cos(phase * 0.4) * 20, 150, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#f7faf5';
  context.font = '600 15px Arial';
  context.textAlign = 'left';
  context.fillText('9:41', 24, 32);
  context.textAlign = 'right';
  context.fillText('▮▮▮  ᯤ  ▰', WIDTH - 22, 32);

  context.fillStyle = '#f7faf5';
  context.font = '500 30px Arial';
  context.textAlign = 'left';
  context.fillText('Tuesday, August 28', 24, 112);
  context.font = '700 46px Arial';
  context.fillText('9:41', 24, 164);

  const icons = [
    ['#d7a75f', '◎', 'Camera'],
    ['#4d9a98', '✦', 'Studio'],
    ['#7f9f85', '⌁', 'Notes'],
    ['#d36d56', '◉', 'Music'],
    ['#7193ae', '◌', 'Maps'],
    ['#ba805f', '◇', 'Photos'],
    ['#648c83', '⊙', 'Settings'],
    ['#9e8a63', '◍', 'Safari'],
  ] as const;

  icons.forEach(([color, glyph, label], index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    const x = 24 + column * 86;
    const y = 272 + row * 94;
    drawIcon(context, x, y, color, glyph);
    context.fillStyle = '#f5f8f1';
    context.font = '500 11px Arial';
    context.textAlign = 'center';
    context.fillText(label, x + 29, y + 75);
  });

  context.fillStyle = 'rgba(15, 24, 28, 0.5)';
  roundedRect(context, 18, 650, WIDTH - 36, 118, 30);
  context.fill();
  context.fillStyle = '#d9ead2';
  context.font = '600 15px Arial';
  context.textAlign = 'left';
  context.fillText('LIVE MIRROR', 36, 686);
  context.fillStyle = 'rgba(232, 244, 225, 0.68)';
  context.font = '400 13px Arial';
  context.fillText('Swipe, tap, and explore your phone', 36, 714);
  context.fillStyle = '#eab16c';
  context.font = '700 12px Arial';
  context.fillText('CONNECTED TO STUDIO  ›', 36, 744);

  context.fillStyle = 'rgba(247, 250, 245, 0.82)';
  context.font = '500 11px Arial';
  context.textAlign = 'center';
  context.fillText('⌂', 196, 806);
}

function drawSettings(context: CanvasRenderingContext2D, phase: number) {
  context.fillStyle = '#f4f5f0';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#17231f';
  context.textAlign = 'left';
  context.font = '700 32px Arial';
  context.fillText('Settings', 24, 116);
  context.fillStyle = '#81908a';
  context.font = '500 14px Arial';
  context.fillText('Your iPhone, in sync', 24, 144);

  const rows = [
    ['Airplane Mode', 'Off', '#c5d0c6'],
    ['Wi-Fi', 'Studio Network', '#7a9d92'],
    ['Bluetooth', 'On', '#7894ad'],
    ['Notifications', '2 apps', '#d8a36a'],
    ['General', '›', '#a8b6ae'],
  ] as const;
  rows.forEach(([label, value, color], index) => {
    const y = 206 + index * 83;
    context.fillStyle = '#ffffff';
    roundedRect(context, 18, y, WIDTH - 36, 62, 18);
    context.fill();
    context.fillStyle = color;
    roundedRect(context, 32, y + 13, 36, 36, 12);
    context.fill();
    context.fillStyle = '#24332d';
    context.font = '600 15px Arial';
    context.fillText(label, 84, y + 28);
    context.fillStyle = '#77817c';
    context.font = '500 13px Arial';
    context.textAlign = 'right';
    context.fillText(value, WIDTH - 34, y + 28);
    context.textAlign = 'left';
  });
  context.fillStyle = 'rgba(55, 105, 91, 0.12)';
  context.beginPath();
  context.arc(318, 710 + Math.sin(phase) * 10, 105, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#86968d';
  context.font = '500 11px Arial';
  context.textAlign = 'center';
  context.fillText('Swipe to return', WIDTH / 2, 806);
}

function drawBrowser(context: CanvasRenderingContext2D, phase: number) {
  context.fillStyle = '#f7f6f1';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = '#23342e';
  context.font = '700 29px Arial';
  context.textAlign = 'left';
  context.fillText('The Bridge Journal', 22, 115);
  context.fillStyle = '#c89b5c';
  context.fillRect(22, 138, 78, 4);
  context.fillStyle = '#8b9891';
  context.font = '500 12px Arial';
  context.fillText('A FIELD NOTE ON REAL-TIME SURFACES', 22, 174);

  const cards = [
    ['01', 'A signal should feel', 'immediate.'],
    ['02', 'A screen should stay', 'alive.'],
    ['03', 'A model can carry', 'memory.'],
  ] as const;
  cards.forEach(([number, title, accent], index) => {
    const y = 220 + index * 150 - ((phase * 18) % 24);
    context.fillStyle = '#e7ece4';
    roundedRect(context, 18, y, WIDTH - 36, 118, 20);
    context.fill();
    context.fillStyle = '#d09e5c';
    context.font = '700 13px Arial';
    context.fillText(number, 34, y + 28);
    context.fillStyle = '#26372f';
    context.font = '700 20px Arial';
    context.fillText(title, 34, y + 62);
    context.fillStyle = '#638576';
    context.font = '700 20px Arial';
    context.fillText(accent, 34, y + 87);
  });
  context.fillStyle = '#89958d';
  context.font = '500 11px Arial';
  context.textAlign = 'center';
  context.fillText('scrolling in demo mode', WIDTH / 2, 806);
}

export class DemoPhoneStream {
  readonly canvas: HTMLCanvasElement;

  readonly stream: MediaStream;

  private animationFrame = 0;

  private startTime = 0;

  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.canvas.height = HEIGHT;
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Unable to create demo phone canvas.');
    this.context = context;
    this.stream = this.canvas.captureStream(30);
  }

  start() {
    this.startTime = performance.now();
    const render = (now: number) => {
      const phase = (now - this.startTime) / 1000;
      const scene = Math.floor(phase / 7) % 3;
      if (scene === 0) drawHome(this.context, phase);
      if (scene === 1) drawSettings(this.context, phase);
      if (scene === 2) drawBrowser(this.context, phase);
      this.animationFrame = window.requestAnimationFrame(render);
    };
    this.animationFrame = window.requestAnimationFrame(render);
  }

  stop() {
    window.cancelAnimationFrame(this.animationFrame);
    this.stream.getTracks().forEach((track) => track.stop());
  }

  get stats(): DemoStreamStats {
    return {
      resolution: `${WIDTH} × ${HEIGHT}`,
      fps: 30,
      latency: 0,
      state: 'demo-stream',
      packetsLost: 0,
    };
  }
}

export function createWaitingTextureCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) return canvas;

  context.fillStyle = '#081310';
  context.fillRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = 'rgba(150, 190, 137, 0.12)';
  context.beginPath();
  context.arc(290, 200, 190, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#d9ead2';
  context.font = '700 12px Arial';
  context.letterSpacing = '2px';
  context.fillText('THREE.JS STUDIO', 30, 70);
  context.fillStyle = '#f4f6ef';
  context.font = '700 27px Arial';
  context.fillText('Waiting for', 30, 360);
  context.fillText('iPhone…', 30, 397);
  context.fillStyle = '#93b691';
  context.font = '500 14px Arial';
  context.fillText('Open LIVE PHONE and scan', 30, 446);
  context.fillText('the room QR to start mirroring.', 30, 469);
  context.fillStyle = '#d9ad6b';
  context.font = '700 11px Arial';
  context.fillText('LIVE MODE / WEBRTC RECEIVER', 30, 790);
  return canvas;
}
