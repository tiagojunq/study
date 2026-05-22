import { chapterName } from '../lib/quiz.js'

const PASS_THRESHOLD = 0.65

// Official ISTQB CTFL v4.0 chapter weights (questions out of 40)
const EXAM_WEIGHTS = { 1: 8, 2: 6, 3: 4, 4: 11, 5: 9, 6: 2 }

const CHAPTER_TIPS = {
  1: 'Revise os 7 princípios do teste, a distinção entre defeito/falha/erro e os objetivos do teste de software.',
  2: 'Aprofunde como o teste se encaixa em cada modelo de SDLC (Ágil, Cascata), os níveis de teste (unitário → aceite) e os tipos de teste.',
  3: 'Foque nas diferenças entre walkthrough, revisão técnica e inspeção formal, e no que a análise estática encontra sem executar código.',
  4: 'Maior peso na prova (11/40). Domine EP, AVL, tabela de decisão e transição de estados (caixa-preta), além de cobertura de instrução e decisão (caixa-branca).',
  5: 'Estude planejamento e estimativa de testes, monitoramento, relatórios de progresso, gestão de defeitos e análise de riscos de produto e projeto.',
  6: 'Menor peso (2/40). Revise as categorias de ferramentas de teste e os benefícios e riscos da automação de testes.',
}

function overallMessage(pct) {
  if (pct >= 90)
    return 'Desempenho excelente! Você domina o conteúdo e está muito bem preparado(a) para a prova real.'
  if (pct >= 80)
    return 'Muito bom resultado! Ainda há espaço para afinar alguns tópicos e consolidar a aprovação com folga.'
  if (pct >= 65)
    return 'Aprovado(a)! A base está sólida — reforce os capítulos indicados para não correr risco na prova oficial.'
  if (pct >= 50)
    return 'Quase lá — resultado abaixo do corte (65%), mas com bom potencial de recuperação. Foco nos capítulos prioritários fará a diferença.'
  return 'Resultado abaixo do esperado. Um plano de estudos estruturado pelos capítulos mais pesados vai mudar o cenário.'
}

function Insights({ p, chapters, chapterTotals, totalQuestions }) {
  if (!chapters.length || !totalQuestions) return null

  const pct = totalQuestions > 0 ? (p.score / totalQuestions) * 100 : 0

  const chData = chapters.map((ch) => {
    const correct = p.chapterCorrect?.[ch] || 0
    const total = chapterTotals[ch] || 0
    const hitPct = total > 0 ? (correct / total) * 100 : 0
    return { ch, hitPct, total, examWeight: EXAM_WEIGHTS[ch] || 0 }
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
                {chapterName(d.ch)}{' '}
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
                  <strong>{chapterName(d.ch)}</strong>{' '}
                  <span className="muted">
                    ({d.hitPct.toFixed(0)}% • {d.examWeight} questões na prova oficial)
                  </span>
                </span>
                {CHAPTER_TIPS[d.ch] && (
                  <span className="insights-tip">{CHAPTER_TIPS[d.ch]}</span>
                )}
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
          <div key={p.id} className={`performance-card ${isMe ? 'me' : ''}`}>
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
              totalQuestions={totalQuestions}
            />
          </div>
        )
      })}
      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Critério de aprovação ISTQB CTFL v4.0: 65% de acertos (26/40 na prova oficial).
      </p>
    </div>
  )
}
