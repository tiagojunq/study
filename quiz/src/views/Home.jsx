import { useEffect, useState } from 'react'
import ThemeToggle from '../components/ThemeToggle.jsx'

export default function Home({ onStartModerator, onStartParticipant }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [mode, setMode] = useState('choice') // choice | moderator-name | participant

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
          <h2 style={{ marginTop: 0 }}>Estuda que a vida muda, porra!</h2>
          <p className="muted">
            Banco de simulados ISTQB CTFL 4.0 (PT-BR) — questões oficiais + extras geradas.<br />
            Até 10 pessoas simultâneas via WebRTC P2P — sem servidor.
          </p>
          <ul className="muted" style={{ marginTop: '0.5rem', textAlign: 'left' }}>
            <li>O moderador cria a sala e controla o ritmo (libera questão, libera resposta).</li>
            <li>Todos respondem em tempo real. O ranking aparece ao final.</li>
            <li>Tempo limite máximo: 60 minutos.</li>
          </ul>
        </div>

        {mode === 'choice' && (
          <div className="panel">
            <h2>Como deseja entrar?</h2>
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
              <button className="ghost" onClick={() => setMode('choice')}>Voltar</button>
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
              <button className="ghost" onClick={() => setMode('choice')}>Voltar</button>
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
