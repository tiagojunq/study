import { useState } from 'react'
import Home from './views/Home.jsx'
import ModeratorSession from './views/ModeratorSession.jsx'
import ParticipantSession from './views/ParticipantSession.jsx'

export default function App() {
  const [route, setRoute] = useState({ kind: 'home' })

  const reset = () => setRoute({ kind: 'home' })

  if (route.kind === 'moderator') {
    return (
      <ModeratorSession
        key={route.key}
        moderatorName={route.name}
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
      onStartModerator={(name) =>
        setRoute({ kind: 'moderator', name, key: Date.now() })
      }
      onStartParticipant={(code, name) =>
        setRoute({ kind: 'participant', code, name, key: Date.now() })
      }
    />
  )
}
