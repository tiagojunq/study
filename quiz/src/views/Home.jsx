import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { CERTS, getCertQuestions } from '../lib/quiz.js'

// Per-certification, which exam letters correspond to official sample exams
// published by ISTQB. Everything else (C, D, …) is generated.
const OFFICIAL_EXAMS_BY_CERT = {
  CTFL: new Set(['A', 'B']),
  CTAI: new Set(['A']),
}

function certStats(certId) {
  const qs = getCertQuestions(certId)
  const official = OFFICIAL_EXAMS_BY_CERT[certId] || new Set()
  const total = qs.length
  const off = qs.filter((q) => official.has(q.exam)).length
  return { total, official: off, generated: total - off }
}

export default function Home({ onStartSolo, onStartModerator, onStartParticipant }) {
  // cert-choice → choice (mode) → solo-name | group-choice | moderator-name | participant
  const [stage, setStage] = useState('cert-choice')
  const [cert, setCert] = useState(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  // Stats memoized per cert; safe to compute for both certs.
  const stats = useMemo(
    () => ({ CTFL: certStats('CTFL'), CTAI: certStats('CTAI') }),
    []
  )

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sala = params.get('sala')
    if (sala) {
      setCode(sala.toUpperCase())
      // Participants don't need to pick a cert - they join whichever
      // session the moderator created. Skip straight to the form.
      setCert('CTFL')
      setStage('participant')
    }
  }, [])

  const trimmedName = name.trim()
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  const certInfo = cert ? CERTS[cert] : null
  const certStat = cert ? stats[cert] : null

  return (
    <div className="app">
      <header className="header">
        <h1>
          Simulador BSTQB
          {certInfo && stage !== 'cert-choice' && (
            <span className="muted" style={{ fontSize: '0.85rem', fontWeight: 'normal' }}>
              {' • '}{certInfo.shortLabel}
            </span>
          )}
        </h1>
        <ThemeToggle />
      </header>
      <div className="container">
        <div className="panel" style={{ textAlign: 'center' }}>
          <img
            src="/study/quiz/voce-tem-brio.png"
            alt="Você tem Brio?"
            style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '0.75rem' }}
          />
          <h2 style={{ marginTop: 0 }}>Estuda que a vida muda!</h2>
          <p className="muted">
            Banco de simulados BSTQB (PT-BR) com suporte às certificações
            {' '}<strong>CTFL - Foundation Level</strong> e
            {' '}<strong>CT-AI - AI Testing</strong>.<br />
            Estude sozinho ou em grupo de até 10 pessoas via WebRTC P2P - sem servidor.
          </p>
          <ul className="muted" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
            <li><strong>Modo solo</strong>: configure e responda no seu ritmo, sem precisar de outros participantes.</li>
            <li><strong>Em grupo</strong>: o moderador cria a sala e controla o ritmo (libera questão, libera resposta); todos respondem em tempo real.</li>
            <li>Escolha entre <strong>simulado completo</strong> ou <strong>questões por capítulo</strong> para focar no que precisa estudar.</li>
            <li>Tempo configurável (até 60 minutos) ou <strong>sem limite de tempo</strong> para estudo livre.</li>
            <li>No final: ranking, análise por capítulo, dicas de estudo personalizadas e revisão das questões.</li>
          </ul>
        </div>

        {stage === 'cert-choice' && (
          <div className="panel">
            <h2>Para qual certificação você quer estudar?</h2>
            <div className="cert-cards">
              {['CTFL', 'CTAI'].map((id) => {
                const c = CERTS[id]
                const s = stats[id]
                return (
                  <button
                    key={id}
                    className="cert-card"
                    onClick={() => {
                      setCert(id)
                      setStage('choice')
                    }}
                  >
                    <span className="cert-card-title">{c.label}</span>
                    <span className="cert-card-desc">{c.description}</span>
                    <span className="cert-card-stats">
                      <strong>{s.total}</strong> questões
                      {s.official > 0 && s.generated > 0 && (
                        <> • {s.official} oficiais + {s.generated} geradas</>
                      )}
                      {s.generated === 0 && <> oficiais</>}
                    </span>
                  </button>
                )
              })}
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', marginTop: '0.6rem' }}>
              Se você foi convidado para uma sala, peça o código ao moderador - a
              certificação será definida por ele.
            </p>
          </div>
        )}

        {stage === 'choice' && (
          <div className="panel">
            <h2>
              Como deseja entrar?
              {certInfo && (
                <span className="muted" style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
                  {' '}- {certInfo.shortLabel} ({certStat?.total} questões)
                </span>
              )}
            </h2>
            <div className="row" style={{ marginTop: '0.5rem' }}>
              <button
                className="primary"
                onClick={() => setStage('solo-name')}
              >
                Modo solo
              </button>
              <button onClick={() => setStage('group-choice')}>
                Em grupo
              </button>
              <button className="ghost" onClick={() => setStage('cert-choice')}>
                Trocar certificação
              </button>
            </div>
          </div>
        )}

        {stage === 'solo-name' && (
          <div className="panel">
            <h2>Modo solo - {certInfo?.shortLabel}</h2>
            <label>
              Seu nome
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                maxLength={40}
              />
            </label>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="primary"
                disabled={!trimmedName}
                onClick={() => onStartSolo(trimmedName, cert)}
              >
                Começar
              </button>
              <button className="ghost" onClick={() => setStage('choice')}>Voltar</button>
            </div>
          </div>
        )}

        {stage === 'group-choice' && (
          <div className="panel">
            <h2>Em grupo - {certInfo?.shortLabel}</h2>
            <p className="muted">Você será o moderador da sala ou um participante?</p>
            <div className="row" style={{ marginTop: '0.5rem' }}>
              <button
                className="primary"
                onClick={() => setStage('moderator-name')}
              >
                Sou o moderador
              </button>
              <button onClick={() => setStage('participant')}>
                Sou participante
              </button>
              <button className="ghost" onClick={() => setStage('choice')}>Voltar</button>
            </div>
          </div>
        )}

        {stage === 'moderator-name' && (
          <div className="panel">
            <h2>Moderador - {certInfo?.shortLabel}</h2>
            <label>
              Seu nome (também aparece no ranking)
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                maxLength={40}
              />
            </label>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="primary"
                disabled={!trimmedName}
                onClick={() => onStartModerator(trimmedName, cert)}
              >
                Criar sala
              </button>
              <button className="ghost" onClick={() => setStage('group-choice')}>Voltar</button>
            </div>
          </div>
        )}

        {stage === 'participant' && (
          <div className="panel">
            <h2>Participante</h2>
            <p className="muted" style={{ fontSize: '0.88rem' }}>
              A certificação do simulado será a que o moderador escolheu ao criar a sala.
            </p>
            <div className="grid-2">
              <label>
                Seu nome
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  maxLength={40}
                  autoFocus
                />
              </label>
              <label>
                Código da sala
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ex.: A7K9PQ"
                  maxLength={8}
                />
              </label>
            </div>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="primary"
                disabled={!trimmedName || cleanCode.length < 4}
                onClick={() => onStartParticipant(cleanCode, trimmedName)}
              >
                Entrar na sala
              </button>
              <button className="ghost" onClick={() => setStage('group-choice')}>Voltar</button>
            </div>
          </div>
        )}
      </div>
      <footer>
        Construído sobre os exemplos oficiais BSTQB CTFL 4.0 e CT-AI 2.0 (PT-BR).
        As questões são propriedade do BSTQB®.
      </footer>
    </div>
  )
}
