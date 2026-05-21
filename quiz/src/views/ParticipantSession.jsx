import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '../lib/peer.js'
import { formatTime, chapterName, scoreAnswer } from '../lib/quiz.js'
import QuestionDisplay from '../components/QuestionDisplay.jsx'
import Ranking from '../components/Ranking.jsx'

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
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

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

  const me = useMemo(() => {
    if (!state || !myConnId) return null
    return state.participants.find((p) => p.id === myConnId) || null
  }, [state, myConnId])

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
  if (status === 'connecting' || !state) {
    return (
      <div className="app">
        <header className="header">
          <h1>Participante • {name}</h1>
          <button className="ghost" onClick={onExit}>Sair</button>
        </header>
        <div className="container">
          <div className="banner info">
            <span className="spinner" /> Conectando à sala <strong>{roomCode}</strong>…
          </div>
          {status === 'error' && (
            <div className="banner danger">
              Erro ao conectar ({errorMsg}). Verifique se o código está correto e
              se o moderador já abriu a sala.
            </div>
          )}
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="app">
        <header className="header"><h1>Participante</h1></header>
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
        <header className="header"><h1>Participante</h1></header>
        <div className="container">
          <div className="banner warn">
            A conexão com o moderador foi encerrada.
          </div>
          {state.phase === 'finished' ? (
            <div className="panel">
              <h2>Ranking final</h2>
              <Ranking
                participants={state.participants}
                totalQuestions={state.totalQuestions}
                myId={myConnId}
              />
            </div>
          ) : null}
          <button className="ghost" onClick={onExit}>Voltar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          Participante • {name}
          {me && (
            <span className="score-pill" style={{ marginLeft: '0.75rem' }}>
              <strong>{me.score}</strong> pts
            </span>
          )}
        </h1>
        <div className="meta">
          {startedAt && (
            <span className={timerClass}>
              ⏱ {formatTime(elapsedSeconds)} / {formatTime(durationLimitSeconds)}
            </span>
          )}
          <button className="ghost" onClick={onExit}>Sair</button>
        </div>
      </header>

      <div className="container">
        {phase === 'lobby' && (
          <div className="panel">
            <h2>Sala {roomCode}</h2>
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
                  <span className="tag">{chapterName(q.chapter)}</span>{' '}
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
                  {iAnswered ? (
                    <p>
                      Sua resposta:{' '}
                      <strong>
                        {(draft.length > 0 ? draft : []).join(', ').toUpperCase() || '—'}
                      </strong>{' '}
                      —{' '}
                      {scoreAnswer(q, draft) === 1 ? (
                        <span style={{ color: 'var(--ok)' }}>✓ Acertou (+1)</span>
                      ) : (
                        <span style={{ color: 'var(--danger)' }}>✗ Errou (0)</span>
                      )}
                    </p>
                  ) : (
                    <p className="muted">Você não respondeu a esta questão.</p>
                  )}
                </>
              )}
            </div>
          </>
        )}

        {phase === 'finished' && (
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
            <div className="divider" />
            <button className="ghost" onClick={onExit}>Voltar ao início</button>
          </div>
        )}
      </div>
    </div>
  )
}
