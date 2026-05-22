import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALL_QUESTIONS,
  CHAPTERS,
  chapterName,
  prepareQuestions,
  scoreAnswer,
  formatTime,
  MAX_PARTICIPANTS,
  MAX_DURATION_SECONDS,
} from '../lib/quiz.js'
import { createHost, newRoomCode } from '../lib/peer.js'
import QuestionDisplay from '../components/QuestionDisplay.jsx'
import Ranking from '../components/Ranking.jsx'
import PerformanceBreakdown from '../components/PerformanceBreakdown.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const HOST_ID = 'host'

export default function ModeratorSession({ moderatorName, onExit, solo = false }) {
  const [roomCode] = useState(() => newRoomCode())
  const [peerStatus, setPeerStatus] = useState(solo ? 'open' : 'connecting') // connecting | open | error
  const [peerError, setPeerError] = useState(null)
  const hostRef = useRef(null)

  // Quiz config
  const [configMode, setConfigMode] = useState('exam') // 'exam' | 'chapter'
  const [selectedChapters, setSelectedChapters] = useState(new Set(CHAPTERS))
  const [limit, setLimit] = useState(40)
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [noTimeLimit, setNoTimeLimit] = useState(false)

  // Session state (host-owned)
  const [phase, setPhase] = useState('lobby') // lobby | question | reveal | finished
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [participants, setParticipants] = useState([
    {
      id: HOST_ID,
      name: moderatorName,
      online: true,
      role: 'moderator',
      score: 0,
      answeredCount: 0,
      chapterCorrect: {},
    },
  ])
  // Map of participantId -> array of letters answered for the current question.
  const [currentAnswers, setCurrentAnswers] = useState({})
  const [startedAt, setStartedAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [durationLimitSeconds, setDurationLimitSeconds] = useState(
    MAX_DURATION_SECONDS,
  )
  // How many questions per chapter in the current quiz (computed at start).
  const [chapterTotals, setChapterTotals] = useState({})

  // Local moderator's draft answer for current question (not yet committed).
  const [hostDraft, setHostDraft] = useState([])
  // Confirmation dialog when leaving (closes the room for everyone).
  const [confirmExit, setConfirmExit] = useState(false)

  // --- PeerJS setup ----------------------------------------------------
  useEffect(() => {
    if (solo) return
    const host = createHost({
      roomCode,
      onOpen: () => setPeerStatus('open'),
      onError: (err) => {
        console.error('PeerJS host error', err)
        setPeerStatus('error')
        setPeerError(err && err.type ? err.type : 'erro de rede')
      },
      onConnection: (conn) => {
        // Wire data handler for this client connection. The connection is
        // already in the host's `connections` map, so the next broadcast
        // (triggered when the client sends `join`) reaches it.
        conn.on('data', (raw) => {
          let msg
          try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw } catch { msg = raw }
          handleClientMessage(conn.connectionId, msg, conn)
        })
      },
    })
    hostRef.current = host
    return () => host.destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode])

  // Tick every second for the timer — stop when finished.
  useEffect(() => {
    if (phase === 'finished') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [phase])

  // Auto-finalize at the duration limit (skip when no time limit is set).
  useEffect(() => {
    if (!startedAt || phase === 'finished') return
    if (!durationLimitSeconds) return
    const elapsed = (now - startedAt) / 1000
    if (elapsed >= durationLimitSeconds) finalize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  // --- State broadcast helpers ----------------------------------------
  // Build a snapshot suitable for clients. Public state never includes
  // the moderator's draft answer.
  const buildSnapshot = (override = {}) => {
    const merged = {
      phase,
      currentIndex,
      currentQuestion:
        currentIndex >= 0 && currentIndex < questions.length
          ? questions[currentIndex]
          : null,
      participants,
      currentAnswers, // public reveals only after `reveal` phase, but
      // we send a sanitized view for the lobby UI badge ("answered")
      answeredIds: Object.keys(currentAnswers),
      totalQuestions: questions.length,
      chapterTotals,
      startedAt,
      durationLimitSeconds,
      revealCorrect:
        phase === 'reveal' && currentIndex >= 0
          ? questions[currentIndex]?.correct ?? null
          : null,
      ...override,
    }
    // strip server-only fields the clients don't need
    const { currentAnswers: _full, ...publicSnap } = merged
    return publicSnap
  }

  const broadcastState = (override) => {
    hostRef.current?.broadcast({ type: 'state', state: buildSnapshot(override) })
  }

  // Re-broadcast whenever phase / index / participants / answeredIds change.
  useEffect(() => {
    if (peerStatus !== 'open') return
    broadcastState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, currentIndex, participants, currentAnswers, questions, startedAt, chapterTotals])

  // --- Client message handler -----------------------------------------
  const handleClientMessage = (connId, msg, conn) => {
    if (!msg || typeof msg !== 'object') return
    if (msg.type === 'join') {
      const cleanName = String(msg.name || '').trim().slice(0, 40) || 'Convidado'
      setParticipants((prev) => {
        // Reject if room is full (excluding the moderator).
        const nonHost = prev.filter((p) => p.id !== HOST_ID)
        if (nonHost.length >= MAX_PARTICIPANTS - 1) {
          try { conn.send(JSON.stringify({ type: 'rejected', reason: 'full' })) } catch (e) {}
          return prev
        }
        if (prev.some((p) => p.id === connId)) {
          return prev.map((p) => (p.id === connId ? { ...p, online: true } : p))
        }
        return [
          ...prev,
          {
            id: connId,
            name: cleanName,
            online: true,
            role: 'participant',
            score: 0,
            answeredCount: 0,
            chapterCorrect: {},
          },
        ]
      })
    } else if (msg.type === 'answer') {
      // Accept only if it matches the current question and we're in `question` phase.
      if (phaseRef.current !== 'question') return
      if (msg.questionIndex !== currentIndexRef.current) return
      const letters = Array.isArray(msg.letters)
        ? msg.letters.filter((l) => typeof l === 'string')
        : []
      setCurrentAnswers((prev) => {
        if (prev[connId]) return prev // first answer wins; locked
        return { ...prev, [connId]: letters }
      })
    }
  }

  // We need refs for phase / currentIndex because handleClientMessage is
  // captured at mount time (closure over initial values).
  const phaseRef = useRef(phase)
  const currentIndexRef = useRef(currentIndex)
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  // --- Derived config helpers -----------------------------------------
  const chapterQCounts = useMemo(() => {
    const counts = {}
    ALL_QUESTIONS.forEach((q) => { counts[q.chapter] = (counts[q.chapter] || 0) + 1 })
    return counts
  }, [])

  const availableQCount = useMemo(() => {
    if (configMode === 'exam') return ALL_QUESTIONS.length
    if (selectedChapters.size === 0) return 0
    return ALL_QUESTIONS.filter((q) => selectedChapters.has(q.chapter)).length
  }, [configMode, selectedChapters])

  const toggleChapter = (ch) =>
    setSelectedChapters((prev) => {
      const next = new Set(prev)
      next.has(ch) ? next.delete(ch) : next.add(ch)
      return next
    })

  const clampLimitOnInput = (raw, max) => {
    if (raw === '') return ''
    const n = parseInt(raw, 10)
    if (isNaN(n)) return ''
    if (n < 1) return '1'
    if (n > max) return String(max)
    return String(n)
  }

  // Auto-clamp the limit when the available count shrinks (e.g. user
  // unchecks a chapter so fewer questions are available than the
  // currently typed limit).
  useEffect(() => {
    if (availableQCount <= 0) return
    const n = Number(limit)
    if (n > availableQCount) setLimit(String(availableQCount))
  }, [availableQCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- Moderator actions ----------------------------------------------
  const handleStart = () => {
    const seed = Math.floor(Math.random() * 1e9)
    let qs
    if (configMode === 'exam') {
      const limitNum = Math.max(1, Number(limit) || ALL_QUESTIONS.length)
      qs = prepareQuestions({ bank: 'ALL', limit: limitNum, shuffle: true, seed })
    } else {
      if (selectedChapters.size === 0) return
      const chapters = [...selectedChapters]
      const limitNum = Math.max(1, Number(limit) || availableQCount)
      qs = prepareQuestions({ bank: 'ALL', chapters, limit: limitNum, shuffle: true, seed })
    }
    if (qs.length === 0) return
    const dur = noTimeLimit
      ? 0
      : Math.max(
          60,
          Math.min(MAX_DURATION_SECONDS, Number(durationMinutes) * 60 || MAX_DURATION_SECONDS),
        )
    // Tally how many questions belong to each chapter in this run so clients
    // can render a chapter-by-chapter breakdown at the end.
    const totals = {}
    for (const q of qs) {
      totals[q.chapter] = (totals[q.chapter] || 0) + 1
    }
    setChapterTotals(totals)
    // Reset running scores in case the moderator re-starts a session.
    setParticipants((prev) =>
      prev.map((p) => ({ ...p, score: 0, answeredCount: 0, chapterCorrect: {} })),
    )
    setQuestions(qs)
    setDurationLimitSeconds(dur)
    setCurrentAnswers({})
    setHostDraft([])
    setCurrentIndex(0)
    setStartedAt(Date.now())
    setPhase('question')
  }

  const toggleHostDraft = (letter) => {
    const q = questions[currentIndex]
    if (!q) return
    setHostDraft((prev) => {
      const has = prev.includes(letter)
      if (q.selectCount === 1) {
        return has ? [] : [letter]
      }
      if (has) return prev.filter((l) => l !== letter)
      if (prev.length >= q.selectCount) {
        // replace oldest
        return [...prev.slice(1), letter]
      }
      return [...prev, letter]
    })
  }

  const handleReveal = () => {
    const q = questions[currentIndex]
    if (!q) return
    // Commit the moderator's draft answer if not already.
    const allAnswers = { ...currentAnswers }
    if (!allAnswers[HOST_ID]) {
      allAnswers[HOST_ID] = [...hostDraft]
    }
    // Score every participant for this question.
    setParticipants((prev) =>
      prev.map((p) => {
        const ans = allAnswers[p.id]
        if (!ans) return p
        const earned = scoreAnswer(q, ans)
        const chapterCorrect = { ...(p.chapterCorrect || {}) }
        if (earned > 0) {
          chapterCorrect[q.chapter] = (chapterCorrect[q.chapter] || 0) + 1
        }
        return {
          ...p,
          score: p.score + earned,
          answeredCount: p.answeredCount + 1,
          chapterCorrect,
        }
      }),
    )
    setCurrentAnswers(allAnswers)
    setPhase('reveal')
  }

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      finalize()
      return
    }
    setCurrentIndex((i) => i + 1)
    setCurrentAnswers({})
    setHostDraft([])
    setPhase('question')
  }

  const finalize = () => {
    // If we finalize mid-question, commit whatever answers have been
    // submitted so participants don't silently lose points.
    if (phase === 'question' && currentIndex >= 0 && currentIndex < questions.length) {
      const q = questions[currentIndex]
      const allAnswers = { ...currentAnswers }
      if (!allAnswers[HOST_ID] && hostDraft.length > 0) {
        allAnswers[HOST_ID] = [...hostDraft]
      }
      setParticipants((prev) =>
        prev.map((p) => {
          const ans = allAnswers[p.id]
          if (!ans) return p
          const earned = scoreAnswer(q, ans)
          const chapterCorrect = { ...(p.chapterCorrect || {}) }
          if (earned > 0) {
            chapterCorrect[q.chapter] = (chapterCorrect[q.chapter] || 0) + 1
          }
          return {
            ...p,
            score: p.score + earned,
            answeredCount: p.answeredCount + 1,
            chapterCorrect,
          }
        }),
      )
    }
    setPhase('finished')
  }

  // --- Derived UI ------------------------------------------------------
  const currentQuestion = currentIndex >= 0 ? questions[currentIndex] : null
  const elapsedSeconds = startedAt ? Math.floor((now - startedAt) / 1000) : 0
  const hasTimeLimit = durationLimitSeconds > 0
  const remaining = hasTimeLimit ? Math.max(0, durationLimitSeconds - elapsedSeconds) : Infinity
  const timerClass = !hasTimeLimit
    ? 'timer'
    : remaining <= 60
      ? 'timer danger'
      : remaining <= 300
        ? 'timer warn'
        : 'timer'

  const answeredIds = useMemo(() => new Set(Object.keys(currentAnswers)), [
    currentAnswers,
  ])

  const nonHostParticipants = participants.filter((p) => p.id !== HOST_ID)

  return (
    <div className="app">
      <header className="header">
        <h1>Simulador de prova CTFL</h1>
        <div className="meta">
          {startedAt && (
            <span className={timerClass}>
              ⏱ {formatTime(elapsedSeconds)}
              {hasTimeLimit ? ` / ${formatTime(durationLimitSeconds)}` : ' (sem limite)'}
            </span>
          )}
          <ThemeToggle />
          <button className="ghost" onClick={() => setConfirmExit(true)}>Sair</button>
        </div>
      </header>

      <ConfirmDialog
        open={confirmExit}
        title={solo ? 'Sair do simulado?' : 'Sair da sala?'}
        message={
          phase === 'finished'
            ? 'Você voltará para a tela inicial.'
            : solo
              ? 'Sair agora encerra o simulado e o progresso será perdido.'
              : 'Sair agora encerra a sala para todos os participantes e a sessão será perdida.'
        }
        confirmLabel="Sair"
        cancelLabel={solo ? 'Continuar' : 'Continuar na sala'}
        variant="danger"
        onConfirm={onExit}
        onCancel={() => setConfirmExit(false)}
      />

      <div className="container">
        {peerStatus === 'connecting' && (
          <div className="banner info">
            <span className="spinner" /> Conectando ao broker P2P…
          </div>
        )}
        {peerStatus === 'error' && (
          <div className="banner danger">
            Erro ao iniciar a sessão ({peerError}). Tente recarregar a página.
          </div>
        )}

        {phase === 'lobby' && (
          <>
            {!solo && (
              <div className="panel">
                <h2>Sala criada</h2>
                <p>Compartilhe o código com os participantes:</p>
                <div className="row" style={{ alignItems: 'center', marginTop: '0.5rem' }}>
                  <span className="room-code">{roomCode}</span>
                  <button
                    onClick={() => navigator.clipboard?.writeText(roomCode)}
                    className="ghost"
                  >Copiar código</button>
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href)
                      url.searchParams.set('sala', roomCode)
                      navigator.clipboard?.writeText(url.toString())
                    }}
                    className="ghost"
                  >Copiar link</button>
                </div>
                <p style={{ marginTop: '0.75rem' }}>
                  Limite de {MAX_PARTICIPANTS - 1} participantes (mais o moderador).
                </p>
              </div>
            )}

            {!solo && (
              <div className="panel">
                <h2>Participantes ({nonHostParticipants.length}/{MAX_PARTICIPANTS - 1})</h2>
                {nonHostParticipants.length === 0 ? (
                  <p className="muted">Aguardando participantes…</p>
                ) : (
                  <div className="participants">
                    {nonHostParticipants.map((p) => (
                      <span key={p.id} className={`chip ${p.online ? 'online' : ''}`}>
                        <span className="dot" /> {p.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="divider" />
                <p className="muted">Você como moderador: <strong>{moderatorName}</strong></p>
              </div>
            )}

            <div className="panel">
              <h2>Configuração do simulado</h2>

              <div className="mode-toggle">
                <button
                  className={`mode-btn${configMode === 'exam' ? ' active' : ''}`}
                  onClick={() => setConfigMode('exam')}
                >
                  Simulado da prova
                </button>
                <button
                  className={`mode-btn${configMode === 'chapter' ? ' active' : ''}`}
                  onClick={() => setConfigMode('chapter')}
                >
                  Questões por capítulo
                </button>
              </div>

              {configMode === 'exam' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <label>
                    Quantidade de questões
                    <input
                      type="number"
                      min={1}
                      max={ALL_QUESTIONS.length}
                      value={limit}
                      onChange={(e) => setLimit(clampLimitOnInput(e.target.value, ALL_QUESTIONS.length))}
                    />
                  </label>
                  <p className="muted" style={{ fontSize: '0.83rem', marginTop: '0.3rem' }}>
                    {ALL_QUESTIONS.length} questões disponíveis no banco completo.
                  </p>
                </div>
              )}

              {configMode === 'chapter' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p className="muted" style={{ fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                    Selecione um ou mais capítulos:
                  </p>
                  <div className="chapter-check-grid">
                    {CHAPTERS.map((ch) => (
                      <label key={ch} className="chapter-check-item">
                        <input
                          type="checkbox"
                          checked={selectedChapters.has(ch)}
                          onChange={() => toggleChapter(ch)}
                          style={{ width: 'auto' }}
                        />
                        <span>
                          {chapterName(ch)}
                          <span className="muted"> ({chapterQCounts[ch] || 0})</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  {selectedChapters.size === 0 && (
                    <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: 'var(--danger)' }}>
                      Selecione ao menos um capítulo.
                    </p>
                  )}
                  <label style={{ marginTop: '0.75rem' }}>
                    Quantidade de questões
                    <input
                      type="number"
                      min={1}
                      max={availableQCount || 1}
                      value={limit}
                      onChange={(e) => setLimit(clampLimitOnInput(e.target.value, availableQCount || 1))}
                    />
                  </label>
                  <p className="muted" style={{ fontSize: '0.83rem', marginTop: '0.3rem' }}>
                    {availableQCount} questões disponíveis para os capítulos selecionados.
                  </p>
                </div>
              )}

              <div className="grid-2" style={{ marginTop: '0.75rem' }}>
                <label>
                  Tempo limite (minutos, máx. 60)
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(clampLimitOnInput(e.target.value, 60))}
                    disabled={noTimeLimit}
                  />
                </label>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={noTimeLimit}
                    onChange={(e) => setNoTimeLimit(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  <span>Sem tempo limite</span>
                </label>
              </div>

              <div className="divider" />
              <div className="row">
                <button
                  className="primary"
                  onClick={handleStart}
                  disabled={peerStatus !== 'open' || (configMode === 'chapter' && selectedChapters.size === 0)}
                >
                  Iniciar simulado
                </button>
                {!solo && (
                  <span className="muted" style={{ alignSelf: 'center' }}>
                    Você pode iniciar mesmo com 0 participantes (modo solo).
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {(phase === 'question' || phase === 'reveal') && currentQuestion && (
          <>
            <div className="panel">
              <div className="spread">
                <div>
                  <span className="muted">
                    Questão {currentIndex + 1} de {questions.length}
                  </span>
                </div>
                <div className="row">
                  {phase === 'question' && (
                    <button className="primary" onClick={handleReveal}>
                      Mostrar resposta
                    </button>
                  )}
                  {phase === 'reveal' && (
                    <button className="primary" onClick={handleNext}>
                      {currentIndex + 1 >= questions.length
                        ? 'Encerrar e ver ranking'
                        : 'Próxima questão →'}
                    </button>
                  )}
                  <button className="ghost" onClick={finalize}>
                    Encerrar agora
                  </button>
                </div>
              </div>
              <div className="divider" />
              <QuestionDisplay
                question={currentQuestion}
                selected={
                  phase === 'reveal' ? currentAnswers[HOST_ID] || [] : hostDraft
                }
                onToggle={toggleHostDraft}
                locked={false}
                reveal={phase === 'reveal'}
              />
            </div>

            {!solo && (
              <div className="panel">
                <h2>
                  Quem respondeu ({answeredIds.size}/{participants.length})
                </h2>
                <div className="participants">
                  {participants.map((p) => {
                    const answered = p.id === HOST_ID
                      ? phase === 'reveal' || hostDraft.length > 0
                      : answeredIds.has(p.id)
                    return (
                      <span
                        key={p.id}
                        className={`chip ${answered ? 'answered' : p.online ? 'online' : ''}`}
                      >
                        <span className="dot" />
                        {p.name}{p.id === HOST_ID ? ' (você)' : ''}
                      </span>
                    )
                  })}
                </div>
                {phase === 'question' && (
                  <p className="muted" style={{ marginTop: '0.75rem' }}>
                    Marque sua resposta e clique em <strong>Mostrar resposta</strong> para revelar
                    o gabarito a todos.
                  </p>
                )}
                {phase === 'reveal' && (
                  <p className="muted" style={{ marginTop: '0.75rem' }}>
                    Resposta correta:{' '}
                    <strong>{currentQuestion.correct.join(', ').toUpperCase()}</strong>
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {phase === 'finished' && (
          <>
            {!solo && (
              <div className="panel">
                <h2>Ranking final</h2>
                <p className="muted">
                  {questions.length} questões • duração {formatTime(elapsedSeconds)}
                </p>
                <Ranking
                  participants={participants}
                  totalQuestions={questions.length}
                  myId={HOST_ID}
                  solo={solo}
                />
              </div>
            )}
            <div className="panel">
              <h2>{solo ? 'Análise de desempenho' : 'Análise por participante'}</h2>
              <PerformanceBreakdown
                participants={participants}
                chapterTotals={chapterTotals}
                totalQuestions={questions.length}
                myId={HOST_ID}
                solo={solo}
              />
            </div>
            <div className="row">
              <button className="primary" onClick={onExit}>
                Voltar ao início
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
