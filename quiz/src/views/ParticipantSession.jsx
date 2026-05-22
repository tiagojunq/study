import { useEffect, useRef, useState } from 'react'
import { createClient } from '../lib/peer.js'
import { formatTime } from '../lib/quiz.js'
import QuestionDisplay from '../components/QuestionDisplay.jsx'
import Ranking from '../components/Ranking.jsx'
import PerformanceBreakdown from '../components/PerformanceBreakdown.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function ParticipantSession({ roomCode, name, onExit }) {
  const [status, setStatus] = useState('connecting') // connecting | open | rejected | closed | error
  const [errorMsg, setErrorMsg] = useState(null)
  const [state, setState] = useState(null)
  const [myConnId, setMyConnId] = useState(null)
  const [draft, setDraft] = useState([])
  const [submittedFor, setSubmittedFor] = useState(-1) // questionIndex
  const clientRef = useRef(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (state?.phase === 'finished') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [state?.phase])

  useEffect(() => {
    const client = createClient({
      roomCode,
      onOpen: (conn) => {
        setStatus('open')
        setMyConnId(conn.connectionId)
        // Send join immediately.
        conn.send(JSON.stringify({ type: 'join', name }))
      },
      onData: (msg) => {
        if (!msg) return
        if (msg.type === 'state') setState(msg.state)
        if (msg.type === 'rejected') {
          setStatus('rejected')
          setErrorMsg(msg.reason || 'Sala cheia')
        }
      },
      onClose: () => setStatus('closed'),
      onError: (err) => {
        console.error('peer client error', err)
        setStatus('error')
        setErrorMsg(err && err.type ? err.type : 'erro')
      },
    })
    clientRef.current = client
    return () => client.destroy()
  }, [roomCode, name])

  // Reset draft when the question advances.
  useEffect(() => {
    if (!state) return
    if (state.currentIndex !== submittedFor) setDraft([])
  }, [state?.currentIndex])

  // ---- Derived state -------------------------------------------------
  const q = state?.currentQuestion
  const phase = state?.phase
  const startedAt = state?.startedAt
  const durationLimitSeconds = state?.durationLimitSeconds || 0
  const elapsedSeconds = startedAt ? Math.floor((now - startedAt) / 1000) : 0
  const remaining = Math.max(0, durationLimitSeconds - elapsedSeconds)
  const timerClass =
    remaining <= 60 ? 'timer danger' : remaining <= 300 ? 'timer warn' : 'timer'

  const iAnswered =
    state && state.answeredIds && state.answeredIds.includes(myConnId)

  // ---- Actions -------------------------------------------------------
  const toggle = (letter) => {
    if (!q) return
    if (phase !== 'question' || iAnswered || submittedFor === state.currentIndex) return
    setDraft((prev) => {
      const has = prev.includes(letter)
      if (q.selectCount === 1) return has ? [] : [letter]
      if (has) return prev.filter((l) => l !== letter)
      if (prev.length >= q.selectCount) return [...prev.slice(1), letter]
      return [...prev, letter]
    })
  }

  const submit = () => {
    if (!q) return
    if (draft.length === 0) return
    if (q.selectCount === 2 && draft.length !== 2) return
    clientRef.current?.send({
      type: 'answer',
      questionIndex: state.currentIndex,
      letters: draft,
    })
    setSubmittedFor(state.currentIndex)
  }

  // ---- Status screens ------------------------------------------------
  if (status === 'error') {
    return (
      <div className="app">
        <header className="header">
          <h1>Participante • {name}</h1>
          <div className="meta">
            <ThemeToggle />
            <button className="ghost" onClick={onExit}>Sair</button>
          </div>
        </header>
        <div className="container">
          <div className="banner danger">
            <strong>Não consegui conectar na sala {roomCode}.</strong>
            <div style={{ marginTop: '0.5rem', fontWeight: 'normal' }}>
              {errorMsg === 'peer-unavailable' && (
                <>O código da sala não existe ou o moderador ainda não abriu a sala. Confira o código e tente de novo.</>
              )}
              {errorMsg === 'timeout' && (
                <>O canal P2P (WebRTC) não foi estabelecido em 20s. Isso costuma acontecer em redes corporativas ou Wi-Fi com firewall agressivo. Tente em outra rede (ex.: 4G/5G do celular) ou peça ao moderador para usar outra rede.</>
              )}
              {errorMsg === 'network' && (
                <>O navegador não conseguiu falar com o servidor de sinalização (PeerJS). Cheque sua conexão de internet.</>
              )}
              {errorMsg === 'browser-incompatible' && (
                <>Este navegador não suporta WebRTC. Use Chrome, Firefox, Edge ou Safari recente.</>
              )}
              {errorMsg && !['peer-unavailable','timeout','network','browser-incompatible'].includes(errorMsg) && (
                <>Detalhe técnico: <code>{errorMsg}</code></>
              )}
            </div>
          </div>
          <div className="row">
            <button className="primary" onClick={() => window.location.reload()}>
              Tentar novamente
            </button>
            <button className="ghost" onClick={onExit}>Voltar ao início</button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'connecting' || !state) {
    return (
      <div className="app">
        <header className="header">
          <h1>Participante • {name}</h1>
          <div className="meta">
            <ThemeToggle />
            <button className="ghost" onClick={onExit}>Sair</button>
          </div>
        </header>
        <div className="container">
          <div className="banner info">
            <span className="spinner" /> Conectando à sala <strong>{roomCode}</strong>…
          </div>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            A conexão é peer-to-peer via WebRTC. Em redes corporativas ou Wi-Fi
            público pode levar alguns segundos. Se demorar mais de 20s, mostro
            um erro com sugestões.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="app">
        <header className="header">
          <h1>Participante</h1>
          <ThemeToggle />
        </header>
        <div className="container">
          <div className="banner warn">
            Não foi possível entrar: sala cheia (máximo de 9 participantes além
            do moderador).
          </div>
          <button className="ghost" onClick={onExit}>Voltar</button>
        </div>
      </div>
    )
  }

  if (status === 'closed') {
    return (
      <div className="app">
        <header className="header">
          <h1>Participante</h1>
          <ThemeToggle />
        </header>
        <div className="container">
          <div className="banner warn">
            A conexão com o moderador foi encerrada.
          </div>
          {state.phase === 'finished' ? (
            <>
              <div className="panel">
                <h2>Ranking final</h2>
                <Ranking
                  participants={state.participants}
                  totalQuestions={state.totalQuestions}
                  myId={myConnId}
                />
              </div>
              <div className="panel">
                <h2>Análise por participante</h2>
                <PerformanceBreakdown
                  participants={state.participants}
                  chapterTotals={state.chapterTotals || {}}
                  totalQuestions={state.totalQuestions}
                  myId={myConnId}
                />
              </div>
            </>
          ) : null}
          <button className="ghost" onClick={onExit}>Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Participante • {name}</h1>
        <div className="meta">
          {startedAt && (
            <span className={timerClass}>
              ⏱ {formatTime(elapsedSeconds)} / {formatTime(durationLimitSeconds)}
            </span>
          )}
          <ThemeToggle />
          <button className="ghost" onClick={onExit}>Sair</button>
        </div>
      </header>

      <div className="container">
        {phase === 'lobby' && (
          <div className="panel">
            <h2>Sala {roomCode}</h2>
            <div style={{ textAlign: 'center', margin: '0.75rem 0' }}>
              <img
                src="/study/quiz/brio-esteja-com-voce.png"
                alt="Que o brio esteja com você"
                style={{ maxWidth: '220px', borderRadius: '8px' }}
              />
            </div>
            <p>
              Aguardando o moderador iniciar o simulado. Por enquanto, relaxe ☕.
            </p>
            <p className="muted">
              Participantes conectados:{' '}
              {state.participants.length}
            </p>
            <div className="participants">
              {state.participants.map((p) => (
                <span key={p.id} className="chip online">
                  <span className="dot" />
                  {p.name}{p.id === myConnId ? ' (você)' : ''}
                  {p.role === 'moderator' ? ' • mod' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {(phase === 'question' || phase === 'reveal') && q && (
          <>
            <div className="panel">
              <div className="spread">
                <div>
                  <span className="muted">
                    Questão {state.currentIndex + 1} de {state.totalQuestions}
                  </span>
                </div>
                {phase === 'question' && !iAnswered && submittedFor !== state.currentIndex && (
                  <button
                    className="primary"
                    onClick={submit}
                    disabled={
                      draft.length === 0 ||
                      (q.selectCount === 2 && draft.length !== 2)
                    }
                  >
                    Confirmar resposta
                  </button>
                )}
                {(iAnswered || submittedFor === state.currentIndex) && phase === 'question' && (
                  <span className="banner ok" style={{ margin: 0 }}>
                    ✓ Resposta enviada. Aguardando moderador…
                  </span>
                )}
              </div>
              <div className="divider" />
              <QuestionDisplay
                question={q}
                selected={draft}
                onToggle={toggle}
                locked={iAnswered || submittedFor === state.currentIndex}
                reveal={phase === 'reveal'}
              />
              {phase === 'reveal' && (
                <>
                  <div className="divider" />
                  <p className="muted">
                    Resposta correta:{' '}
                    <strong>{q.correct.join(', ').toUpperCase()}</strong>
                  </p>
                </>
              )}
            </div>
          </>
        )}

        {phase === 'finished' && (
          <>
            <div className="panel">
              <h2>Ranking final</h2>
              <p className="muted">
                {state.totalQuestions} questões • duração {formatTime(elapsedSeconds)}
              </p>
              <Ranking
                participants={state.participants}
                totalQuestions={state.totalQuestions}
                myId={myConnId}
              />
            </div>
            <div className="panel">
              <h2>Análise por participante</h2>
              <PerformanceBreakdown
                participants={state.participants}
                chapterTotals={state.chapterTotals || {}}
                totalQuestions={state.totalQuestions}
                myId={myConnId}
              />
              <div className="divider" />
              <button className="ghost" onClick={onExit}>Voltar ao início</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
