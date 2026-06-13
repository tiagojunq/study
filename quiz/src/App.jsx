import { useState } from 'react'
import Home from './views/Home.jsx'
import ModeratorSession from './views/ModeratorSession.jsx'
import ParticipantSession from './views/ParticipantSession.jsx'
import { DEFAULT_CERT } from './lib/quiz.js'

export default function App() {
  const [route, setRoute] = useState({ kind: 'home' })

  const reset = () => setRoute({ kind: 'home' })

  if (route.kind === 'moderator') {
    return (
      <ModeratorSession
        key={route.key}
        moderatorName={route.name}
        solo={route.solo === true}
        cert={route.cert || DEFAULT_CERT}
        onExit={reset}
      />
    )
  }
  if (route.kind === 'participant') {
    return (
      <ParticipantSession
        key={route.key}
        roomCode={route.code}
        name={route.name}
        onExit={reset}
      />
    )
  }

  return (
    <Home
      onStartSolo={(name, cert) =>
        setRoute({ kind: 'moderator', name, solo: true, cert, key: Date.now() })
      }
      onStartModerator={(name, cert) =>
        setRoute({ kind: 'moderator', name, solo: false, cert, key: Date.now() })
      }
      onStartParticipant={(code, name) =>
        setRoute({ kind: 'participant', code, name, key: Date.now() })
      }
    />
  )
}
