import { useEffect, useMemo, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle.jsx'
import { ALL_QUESTIONS } from '../lib/quiz.js'

const OFFICIAL_EXAMS = new Set(['A', 'B'])

export default function Home({ onStartSolo, onStartModerator, onStartParticipant }) {
  const { total, official, generated } = useMemo(() => {
    const t = ALL_QUESTIONS.length
    const o = ALL_QUESTIONS.filter((q) => OFFICIAL_EXAMS.has(q.exam)).length
    return { total: t, official: o, generated: t - o }
  }, [])
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  // choice | solo-name | group-choice | moderator-name | participant
  const [mode, setMode] = useState('choice')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sala = params.get('sala')
    if (sala) {
      setCode(sala.toUpperCase())
      setMode('participant')
    }
  }, [])

  const trimmedName = name.trim()
  const cleanCode = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()

  return (
    <div className="app">
      <header className="header">
        <h1>Simulador de prova CTFL</h1>
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
            Banco de simulados ISTQB CTFL 4.0 (PT-BR) com <strong>{total} questões</strong>
            {' '}({official} oficiais + {generated} geradas pelo sistema).<br />
            Estude sozinho ou em grupo de até 10 pessoas via WebRTC P2P — sem servidor.
          </p>
          <ul className="muted" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
            <li><strong>Modo solo</strong>: configure e responda no seu ritmo, sem precisar de outros participantes.</li>
            <li><strong>Em grupo</strong>: o moderador cria a sala e controla o ritmo (libera questão, libera resposta); todos respondem em tempo real.</li>
            <li>Escolha entre <strong>simulado completo</strong> ou <strong>questões por capítulo</strong> para focar no que precisa estudar.</li>
            <li>Tempo configurável (até 60 minutos) ou <strong>sem limite de tempo</strong> para estudo livre.</li>
            <li>No final: ranking, análise por capítulo e dicas de estudo personalizadas.</li>
          </ul>
        </div>

        {mode === 'choice' && (
          <div className="panel">
            <h2>Como deseja entrar?</h2>
            <div className="row" style={{ marginTop: '0.5rem' }}>
              <button
                className="primary"
                onClick={() => setMode('solo-name')}
              >
                Somente eu
              </button>
              <button onClick={() => setMode('group-choice')}>
                Em grupo
              </button>
            </div>
          </div>
        )}

        {mode === 'solo-name' && (
          <div className="panel">
            <h2>Modo solo</h2>
            <label>
              Seu nome
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="ex.: Tiago"
                maxLength={40}
              />
            </label>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="primary"
                disabled={!trimmedName}
                onClick={() => onStartSolo(trimmedName)}
              >
                Começar
              </button>
              <button className="ghost" onClick={() => setMode('choice')}>Voltar</button>
            </div>
          </div>
        )}

        {mode === 'group-choice' && (
          <div className="panel">
            <h2>Em grupo</h2>
            <p className="muted">Você será o moderador da sala ou um participante?</p>
            <div className="row" style={{ marginTop: '0.5rem' }}>
              <button
                className="primary"
                onClick={() => setMode('moderator-name')}
              >
                Sou o moderador
              </button>
              <button onClick={() => setMode('participant')}>
                Sou participante
              </button>
              <button className="ghost" onClick={() => setMode('choice')}>Voltar</button>
            </div>
          </div>
        )}

        {mode === 'moderator-name' && (
          <div className="panel">
            <h2>Moderador</h2>
            <label>
              Seu nome (também aparece no ranking)
              <input
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="ex.: Tiago"
                maxLength={40}
              />
            </label>
            <div className="row" style={{ marginTop: '0.75rem' }}>
              <button
                className="primary"
                disabled={!trimmedName}
                onClick={() => onStartModerator(trimmedName)}
              >
                Criar sala
              </button>
              <button className="ghost" onClick={() => setMode('group-choice')}>Voltar</button>
            </div>
          </div>
        )}

        {mode === 'participant' && (
          <div className="panel">
            <h2>Participante</h2>
            <div className="grid-2">
              <label>
                Seu nome
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex.: Ana"
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
              <button className="ghost" onClick={() => setMode('group-choice')}>Voltar</button>
            </div>
          </div>
        )}
      </div>
      <footer>
        Construído sobre os exemplos oficiais ISTQB CTFL 4.0 (PT-BR). As
        questões são propriedade do ISTQB®.
      </footer>
    </div>
  )
}
