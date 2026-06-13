import { chapterName, getCert, DEFAULT_CERT } from '../lib/quiz.js'

function overallMessage(pct) {
  if (pct >= 90)
    return 'Desempenho excelente! Você domina o conteúdo e está muito bem preparado(a) para a prova real.'
  if (pct >= 80)
    return 'Muito bom resultado! Ainda há espaço para afinar alguns tópicos e consolidar a aprovação com folga.'
  if (pct >= 65)
    return 'Aprovado(a)! A base está sólida — reforce os capítulos indicados para não correr risco na prova oficial.'
  if (pct >= 50)
    return 'Quase lá — resultado abaixo do corte, mas com bom potencial de recuperação. Foco nos capítulos prioritários fará a diferença.'
  return 'Resultado abaixo do esperado. Um plano de estudos estruturado pelos capítulos mais pesados vai mudar o cenário.'
}

function Insights({ p, chapters, chapterTotals, totalPoints, certInfo }) {
  if (!chapters.length || !totalPoints) return null

  const pct = totalPoints > 0 ? (p.score / totalPoints) * 100 : 0
  const tips = certInfo.chapterTips || {}
  const weights = certInfo.examQuestionWeights || {}

  const chData = chapters.map((ch) => {
    const correct = p.chapterCorrect?.[ch] || 0
    const total = chapterTotals[ch] || 0
    const hitPct = total > 0 ? (correct / total) * 100 : 0
    return { ch, hitPct, total, examWeight: weights[ch] || 0 }
  })

  const strong = chData.filter((d) => d.hitPct >= 75 && d.total > 0)
  const weak = chData
    .filter((d) => d.hitPct < 65 && d.total > 0)
    .sort((a, b) => b.examWeight - a.examWeight)

  return (
    <div className="insights">
      <p className="insights-summary">{overallMessage(pct)}</p>

      {strong.length > 0 && (
        <div className="insights-block">
          <span className="insights-label insights-strong">Pontos fortes</span>
          <ul className="insights-list">
            {strong.map((d) => (
              <li key={d.ch}>
                {chapterName(d.ch, certInfo.id)}{' '}
                <span className="muted">({d.hitPct.toFixed(0)}%)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weak.length === 0 && strong.length > 0 && (
        <p className="insights-ok">Ótimo equilíbrio! Nenhum capítulo abaixo do corte de 65%.</p>
      )}

      {weak.length > 0 && (
        <div className="insights-block">
          <span className="insights-label insights-weak">Priorize o estudo</span>
          <ul className="insights-list insights-tips">
            {weak.map((d) => (
              <li key={d.ch}>
                <span>
                  <strong>{chapterName(d.ch, certInfo.id)}</strong>{' '}
                  <span className="muted">
                    ({d.hitPct.toFixed(0)}% • {d.examWeight} questões na prova oficial)
                  </span>
                </span>
                {tips[d.ch] && <span className="insights-tip">{tips[d.ch]}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function PerformanceBreakdown({
  participants,
  chapterTotals,
  totalQuestions,
  totalPoints,
  myId,
  solo = false,
  cert = DEFAULT_CERT,
}) {
  const certInfo = getCert(cert)
  const points = totalPoints || totalQuestions
  const passPct = (certInfo.examPassPoints / certInfo.examTotalPoints) * 100

  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.name.localeCompare(b.name)
  })

  const chapters = Object.keys(chapterTotals || {})
    .map(Number)
    .sort((a, b) => a - b)

  if (chapters.length === 0 || points === 0) return null

  return (
    <div className="performance-breakdown">
      {sorted.map((p) => {
        const pct = (p.score / points) * 100
        const passed = pct >= passPct
        const isMe = p.id === myId
        return (
          <div key={p.id} className={`performance-card ${isMe ? 'me' : ''}`}>
            <div className="performance-header">
              <div className="performance-name">
                <strong>{p.name}</strong>
                {!solo && isMe ? ' (você)' : ''}
                {!solo && p.role === 'moderator' ? ' • moderador' : ''}
              </div>
              <div className="performance-result">
                <span className={`pass-badge ${passed ? 'pass' : 'fail'}`}>
                  {passed ? '✓ Aprovado' : '✗ Reprovado'}
                </span>
                <span className="performance-score">
                  {p.score}/{points} pts • {pct.toFixed(1)}%
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
                      <td>{chapterName(ch, certInfo.id)}</td>
                      <td>{correct}/{total}</td>
                      <td className="muted">{chPct.toFixed(0)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="insights-divider" />
            <Insights
              p={p}
              chapters={chapters}
              chapterTotals={chapterTotals}
              totalPoints={points}
              certInfo={certInfo}
            />
          </div>
        )
      })}
      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Critério de aprovação ISTQB {certInfo.shortLabel}: {certInfo.passThresholdLabel}.
      </p>
    </div>
  )
}
