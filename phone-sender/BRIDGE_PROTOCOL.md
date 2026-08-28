# Phone Screen Bridge protocol

The bridge is a signaling relay, not a media server. It keeps an in-memory room map and forwards the following JSON messages to the other peer in the same room.

## Join

```json
{
  "type": "join",
  "roomId": "ROOM-AB12",
  "sessionId": "RX-CD34",
  "role": "sender"
}
```

`role` is either `sender` or `receiver`. A room accepts one sender and one or more receivers in the development relay. The Studio uses a single receiver.

## SDP and ICE

```json
{ "type": "request-offer" }
{ "type": "offer", "offer": { "type": "offer", "sdp": "..." } }
{ "type": "answer", "answer": { "type": "answer", "sdp": "..." } }
{
  "type": "candidate",
  "candidate": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

The iPhone is the offerer and publishes one video track. The Studio adds a recv-only video transceiver before joining and answers the offer. Both peers use an empty ICE server list for the local-network path.

## Security boundary

This development relay does not authenticate rooms and does not persist messages. Treat the room ID as a pairing hint, not a secret. For a shared or public deployment, add short-lived signed room tokens, origin checks, and an authenticated signaling service before allowing a device to join.
