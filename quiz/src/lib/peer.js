import { Peer } from 'peerjs'

// Room ID prefix to namespace this app on the public PeerJS broker so we
// don't collide with random IDs other people may try.
const ROOM_PREFIX = 'istqb-sim-'

// ICE servers used by both host and client. STUN-only NAT traversal fails on
// many corporate / mobile-carrier networks; the OpenRelay project + Cloudflare
// TURN entries are free public relays that cover those cases.
const ICE_SERVERS = [
  // STUN — discovers each peer's public IP/port.
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
  { urls: 'stun:stun.relay.metered.ca:80' },
  // TURN — relays through a server when direct P2P fails (corporate NATs,
  // mobile carrier NATs, etc.). All entries below are free public relays.
  // We include multiple providers/ports so at least one works across most
  // firewalls (some networks only allow outbound 443 TCP).
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turns:openrelay.metered.ca:443?transport=tcp',
    username: 'openrelayproject',
    credential: 'openrelayproject',
  },
  {
    urls: 'turn:freestun.net:3478',
    username: 'free',
    credential: 'free',
  },
  {
    urls: 'turns:freestun.net:5350',
    username: 'free',
    credential: 'free',
  },
]

const PEER_OPTIONS = {
  debug: 2,
  config: { iceServers: ICE_SERVERS, sdpSemantics: 'unified-plan' },
}

const CONNECT_TIMEOUT_MS = 20000

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

export function createHost({ roomCode, onConnection, onError, onOpen, onDisconnect }) {
  const peerId = roomIdToPeerId(roomCode)
  const peer = new Peer(peerId, PEER_OPTIONS)
  const connections = new Map() // connId -> DataConnection

  peer.on('open', (id) => {
    console.info('[host] peer open', id)
    onOpen && onOpen(id)
  })
  peer.on('error', (err) => {
    console.error('[host] peer error', err && err.type, err)
    onError && onError(err)
  })
  peer.on('disconnected', () => {
    console.warn('[host] disconnected from broker, attempting reconnect')
    try { peer.reconnect() } catch (e) { /* ignore */ }
  })

  peer.on('connection', (conn) => {
    console.info('[host] incoming connection from', conn.peer)
    conn.on('open', () => {
      console.info('[host] connection open', conn.connectionId)
      connections.set(conn.connectionId, conn)
      onConnection && onConnection(conn)
    })
    conn.on('close', () => {
      connections.delete(conn.connectionId)
      onDisconnect && onDisconnect(conn.connectionId)
    })
    conn.on('error', (err) => {
      console.warn('[host] conn error', err)
      connections.delete(conn.connectionId)
      onDisconnect && onDisconnect(conn.connectionId)
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
  const peer = new Peer(undefined, PEER_OPTIONS)
  let conn = null
  let opened = false
  let destroyed = false
  let timeoutId = null

  const fail = (reason, extra) => {
    if (opened || destroyed) return
    console.error('[client] connect failed:', reason, extra)
    onError && onError({ type: reason, extra })
  }

  peer.on('open', (id) => {
    console.info('[client] peer open', id, '→ connecting to', targetId)
    conn = peer.connect(targetId, { reliable: true })
    conn.on('open', () => {
      opened = true
      if (timeoutId) clearTimeout(timeoutId)
      console.info('[client] data channel open')
      onOpen && onOpen(conn)
    })
    conn.on('data', (raw) => {
      let msg
      try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw } catch { msg = raw }
      onData && onData(msg)
    })
    conn.on('close', () => {
      console.warn('[client] data channel closed')
      onClose && onClose()
    })
    conn.on('error', (err) => {
      console.warn('[client] conn error', err)
      fail('connection-error', err && err.message)
    })
  })

  peer.on('error', (err) => {
    console.error('[client] peer error', err && err.type, err)
    // peer-unavailable means the host's peer ID isn't registered yet (or the
    // host closed the tab). Surface it as a typed error so the UI can
    // suggest checking the code / asking the moderator.
    fail(err && err.type ? err.type : 'peer-error', err && err.message)
  })

  peer.on('disconnected', () => {
    console.warn('[client] disconnected from broker')
    try { peer.reconnect() } catch (e) { /* ignore */ }
  })

  timeoutId = setTimeout(() => {
    if (!opened && !destroyed) {
      fail('timeout',
        'Não foi possível estabelecer canal P2P em 20s. Provavelmente um' +
        ' firewall/NAT bloqueou a conexão WebRTC.')
    }
  }, CONNECT_TIMEOUT_MS)

  return {
    peer,
    get conn() { return conn },
    send(message) {
      if (conn && conn.open) {
        try { conn.send(JSON.stringify(message)) } catch (e) { /* ignore */ }
      }
    },
    destroy() {
      destroyed = true
      if (timeoutId) clearTimeout(timeoutId)
      try { if (conn) conn.close() } catch (e) { /* ignore */ }
      try { peer.destroy() } catch (e) { /* ignore */ }
    },
  }
}
