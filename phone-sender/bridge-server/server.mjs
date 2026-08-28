import http from 'node:http';
import process from 'node:process';
import { WebSocketServer } from 'ws';

const host = process.env.HOST ?? '0.0.0.0';
const port = Number(process.env.PORT ?? 8787);
const rooms = new Map();

function send(socket, message) {
  if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
}

function roomPeers(roomId) {
  return rooms.get(roomId) ?? new Set();
}

function broadcast(roomId, message, except) {
  for (const peer of roomPeers(roomId)) {
    if (peer !== except) send(peer, message);
  }
}

function removePeer(socket) {
  const { roomId } = socket;
  if (!roomId || !rooms.has(roomId)) return;
  const peers = rooms.get(roomId);
  peers.delete(socket);
  broadcast(roomId, { type: 'peer-left', role: socket.role });
  if (peers.size === 0) rooms.delete(roomId);
}

const server = http.createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ ok: true, rooms: rooms.size }));
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify({ error: 'not-found' }));
});

const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

server.on('upgrade', (request, socket, head) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (requestUrl.pathname !== '/bridge') {
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (client) => {
    webSocketServer.emit('connection', client, request);
  });
});

webSocketServer.on('connection', (socket) => {
  socket.roomId = '';
  socket.role = '';
  socket.sessionId = '';

  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(socket, { type: 'error', message: 'Invalid JSON signal.' });
      return;
    }

    if (message.type === 'join') {
      if (!message.roomId || !message.role || !['sender', 'receiver'].includes(message.role)) {
        send(socket, { type: 'error', message: 'A roomId and sender/receiver role are required.' });
        return;
      }

      socket.roomId = String(message.roomId);
      socket.role = String(message.role);
      socket.sessionId = String(message.sessionId ?? '');
      const peers = roomPeers(socket.roomId);
      if (socket.role === 'sender' && [...peers].some((peer) => peer.role === 'sender')) {
        send(socket, { type: 'error', message: 'This room already has a sender.' });
        socket.close(1008, 'sender-exists');
        return;
      }
      peers.add(socket);
      rooms.set(socket.roomId, peers);
      send(socket, { type: 'joined', roomId: socket.roomId, role: socket.role });
      broadcast(socket.roomId, { type: 'peer-joined', role: socket.role }, socket);
      if (socket.role === 'sender') broadcast(socket.roomId, { type: 'sender-ready' }, socket);
      if (socket.role === 'receiver') broadcast(socket.roomId, { type: 'receiver-ready' }, socket);
      return;
    }

    if (!socket.roomId) {
      send(socket, { type: 'error', message: 'Join a room before sending signals.' });
      return;
    }

    if (['offer', 'answer', 'candidate', 'request-offer'].includes(message.type)) {
      broadcast(socket.roomId, { ...message, from: socket.role }, socket);
      return;
    }

    if (message.type === 'leave') {
      removePeer(socket);
      socket.roomId = '';
      socket.close(1000, 'left');
    }
  });

  socket.on('close', () => removePeer(socket));
  socket.on('error', () => removePeer(socket));
});

server.listen(port, host, () => {
  console.log(`Phone Screen Bridge listening on ws://${host}:${port}/bridge`);
  console.log(`Health check: http://127.0.0.1:${port}/health`);
});
