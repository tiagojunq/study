export default function Ranking({
  participants,
  totalQuestions,
  totalPoints,
  myId,
  solo = false,
}) {
  // Scores are in points; if the host didn't broadcast totalPoints (older
  // sessions) fall back to question count.
  const denom = totalPoints || totalQuestions

  const sorted = [...participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.answeredCount !== a.answeredCount) return b.answeredCount - a.answeredCount
    return a.name.localeCompare(b.name)
  })

  const posClass = (i) => {
    if (i === 0) return 'pos gold'
    if (i === 1) return 'pos silver'
    if (i === 2) return 'pos bronze'
    return 'pos'
  }

  return (
    <ol className="ranking">
      {sorted.map((p, i) => {
        const pct = denom > 0 ? Math.round((p.score / denom) * 100) : 0
        return (
          <li key={p.id} className={p.id === myId ? 'me' : ''}>
            <span className={posClass(i)}>#{i + 1}</span>
            <span>
              {p.name}
              {!solo && p.id === myId ? ' (você)' : ''}
              {!solo && p.role === 'moderator' ? ' • moderador' : ''}
              {p.online === false ? ' • offline' : ''}
            </span>
            <span className="score">{p.score}/{denom} pts</span>
            <span className="pct">{pct}%</span>
          </li>
        )
      })}
    </ol>
  )
}
