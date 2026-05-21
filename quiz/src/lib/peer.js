import { Peer } from 'peerjs'

// Room ID prefix to namespace this app on the public PeerJS broker so we
// don't collide with random IDs other people may try.
const ROOM_PREFIX = 'istqb-sim-'

export function roomIdToPeerId(roomCode) {
  return ROOM_PREFIX + roomCode.toUpperCase()
}

export function newRoomCode() {
  // 6-character readable code, no ambiguous characters.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)]
  }
  return s
}

// Wrap Peer so the rest of the app talks in terms of "host" / "client".

export function createHost({ roomCode, onConnection, onError, onOpen }) {
  const peerId = roomIdToPeerId(roomCode)
  const peer = new Peer(peerId, { debug: 1 })
  const connections = new Map() // connId -> DataConnection

  peer.on('open', (id) => onOpen && onOpen(id))
  peer.on('error', (err) => onError && onError(err))

  peer.on('connection', (conn) => {
    conn.on('open', () => {
      connections.set(conn.connectionId, conn)
      onConnection && onConnection(conn)
    })
    conn.on('close', () => {
      connections.delete(conn.connectionId)
    })
    conn.on('error', () => {
      connections.delete(conn.connectionId)
    })
  })

  return {
    peer,
    connections,
    broadcast(message) {
      const payload = JSON.stringify(message)
      for (const conn of connections.values()) {
        if (conn.open) {
          try { conn.send(payload) } catch (e) { /* ignore */ }
        }
      }
    },
    send(connId, message) {
      const conn = connections.get(connId)
      if (conn && conn.open) {
        try { conn.send(JSON.stringify(message)) } catch (e) { /* ignore */ }
      }
    },
    destroy() {
      for (const c of connections.values()) {
        try { c.close() } catch (e) { /* ignore */ }
      }
      try { peer.destroy() } catch (e) { /* ignore */ }
    },
  }
}

export function createClient({ roomCode, onOpen, onData, onClose, onError }) {
  const targetId = roomIdToPeerId(roomCode)
  const peer = new Peer(undefined, { debug: 1 })
  let conn = null

  peer.on('open', () => {
    conn = peer.connect(targetId, { reliable: true })
    conn.on('open', () => onOpen && onOpen(conn))
    conn.on('data', (raw) => {
      let msg
      try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw } catch { msg = raw }
      onData && onData(msg)
    })
    conn.on('close', () => onClose && onClose())
    conn.on('error', (err) => onError && onError(err))
  })
  peer.on('error', (err) => onError && onError(err))

  return {
    peer,
    get conn() { return conn },
    send(message) {
      if (conn && conn.open) {
        try { conn.send(JSON.stringify(message)) } catch (e) { /* ignore */ }
      }
    },
    destroy() {
      try { if (conn) conn.close() } catch (e) { /* ignore */ }
      try { peer.destroy() } catch (e) { /* ignore */ }
    },
  }
}
