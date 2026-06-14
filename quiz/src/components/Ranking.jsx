import { getCert, DEFAULT_CERT } from '../lib/quiz.js'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Ranking({
  participants,
  totalQuestions,
  totalPoints,
  myId,
  solo = false,
  cert = DEFAULT_CERT,
}) {
  const denom = totalPoints || totalQuestions
  const certInfo = getCert(cert)
  const passPct =
    certInfo.examTotalPoints > 0
      ? (certInfo.examPassPoints / certInfo.examTotalPoints) * 100
      : 65

  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.answeredCount !== a.answeredCount) return b.answeredCount - a.answeredCount
    return a.name.localeCompare(b.name)
  })

  return (
    <ol className="ranking ranking-list">
      {sorted.map((p, i) => {
        const pct = denom > 0 ? (p.score / denom) * 100 : 0
        const passed = pct >= passPct
        const isMe = p.id === myId
        const medal = MEDALS[i] ?? `#${i + 1}`
        const posClass =
          i === 0 ? 'pos gold' : i === 1 ? 'pos silver' : i === 2 ? 'pos bronze' : 'pos'
        return (
          <li
            key={p.id}
            className={`ranking-row ${isMe ? 'me ranking-me' : ''}`}
          >
            <span className={`${posClass} rank-medal`}>{medal}</span>
            <span className="rank-name">
              {p.name}
              {!solo && isMe ? ' (você)' : ''}
              {!solo && p.role === 'moderator' ? ' • mod' : ''}
              {p.online === false ? ' • offline' : ''}
            </span>
            <span className={`pass-badge ${passed ? 'pass' : 'fail'}`}>
              {passed ? '✓ Aprovado' : '✗ Reprovado'}
            </span>
            <span className="score rank-score">{p.score}/{denom} pts</span>
            <span className="pct">{Math.round(pct)}%</span>
          </li>
        )
      })}
    </ol>
  )
}
