export default function Ranking({ participants, totalQuestions, myId, solo = false }) {
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
        const pct = totalQuestions > 0
          ? Math.round((p.score / totalQuestions) * 100)
          : 0
        return (
          <li key={p.id} className={p.id === myId ? 'me' : ''}>
            <span className={posClass(i)}>#{i + 1}</span>
            <span>
              {p.name}
              {!solo && p.id === myId ? ' (você)' : ''}
              {!solo && p.role === 'moderator' ? ' • moderador' : ''}
              {p.online === false ? ' • offline' : ''}
            </span>
            <span className="score">{p.score}/{totalQuestions} pts</span>
            <span className="pct">{pct}%</span>
          </li>
        )
      })}
    </ol>
  )
}
