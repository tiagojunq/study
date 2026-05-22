import { chapterName } from '../lib/quiz.js'

// ISTQB CTFL v4.0 official pass mark: 26/40 = 65%.
const PASS_THRESHOLD = 0.65

export default function PerformanceBreakdown({
  participants,
  chapterTotals,
  totalQuestions,
  myId,
}) {
  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.name.localeCompare(b.name)
  })

  const chapters = Object.keys(chapterTotals || {})
    .map(Number)
    .sort((a, b) => a - b)

  if (chapters.length === 0 || totalQuestions === 0) return null

  return (
    <div className="performance-breakdown">
      {sorted.map((p) => {
        const pct = (p.score / totalQuestions) * 100
        const passed = pct >= PASS_THRESHOLD * 100
        const isMe = p.id === myId
        return (
          <div
            key={p.id}
            className={`performance-card ${isMe ? 'me' : ''}`}
          >
            <div className="performance-header">
              <div className="performance-name">
                <strong>{p.name}</strong>
                {isMe ? ' (você)' : ''}
                {p.role === 'moderator' ? ' • moderador' : ''}
              </div>
              <div className="performance-result">
                <span className={`pass-badge ${passed ? 'pass' : 'fail'}`}>
                  {passed ? '✓ Aprovado' : '✗ Reprovado'}
                </span>
                <span className="performance-score">
                  {p.score}/{totalQuestions} • {pct.toFixed(1)}%
                </span>
              </div>
            </div>
            <table className="chapter-table">
              <thead>
                <tr>
                  <th>Capítulo</th>
                  <th>Acertos</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((ch) => {
                  const correct = p.chapterCorrect?.[ch] || 0
                  const total = chapterTotals[ch]
                  const chPct = total > 0 ? (correct / total) * 100 : 0
                  return (
                    <tr key={ch}>
                      <td>{chapterName(ch)}</td>
                      <td>
                        {correct}/{total}
                      </td>
                      <td className="muted">{chPct.toFixed(0)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      })}
      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Critério de aprovação ISTQB CTFL v4.0: 65% de acertos (26/40 na prova oficial).
      </p>
    </div>
  )
}
