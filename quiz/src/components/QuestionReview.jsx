import { useState } from 'react'
import QuestionDisplay from './QuestionDisplay.jsx'

// Post-quiz review: a grid of question chips (correct / wrong / unanswered)
// that opens a read-only view of the question with the user's answer and
// the explanation of every alternative. `items` has one entry per question:
// { question, myAnswer: letters|null, status: 'correct'|'wrong'|'unanswered',
//   reviewable: bool }
export default function QuestionReview({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  const open = openIndex !== null ? items[openIndex] : null

  if (open) {
    return (
      <div>
        <div className="spread" style={{ marginBottom: '0.75rem' }}>
          <span className="muted">
            Questão {openIndex + 1} de {items.length} (somente consulta)
          </span>
          <button className="ghost" onClick={() => setOpenIndex(null)}>
            ← Voltar à análise
          </button>
        </div>
        <QuestionDisplay
          question={open.question}
          selected={open.myAnswer || []}
          onToggle={() => {}}
          locked={true}
          reveal={true}
        />
        <div className="divider" />
        <p className="muted">
          {open.myAnswer && open.myAnswer.length > 0 ? (
            <>Sua resposta: <strong>{[...open.myAnswer].sort().join(', ').toUpperCase()}</strong>{' • '}</>
          ) : (
            <>Você não respondeu esta questão. </>
          )}
          Resposta correta:{' '}
          <strong>{open.question.correct.join(', ').toUpperCase()}</strong>
        </p>
      </div>
    )
  }

  const counts = items.reduce(
    (acc, it) => {
      acc[it.status] += 1
      return acc
    },
    { correct: 0, wrong: 0, unanswered: 0 },
  )

  return (
    <div>
      <p className="muted" style={{ marginBottom: '0.6rem' }}>
        <span className="review-legend correct">✓ {counts.correct} certas</span>
        {' '}
        <span className="review-legend wrong">✗ {counts.wrong} erradas</span>
        {counts.unanswered > 0 && (
          <>
            {' '}
            <span className="review-legend blank">− {counts.unanswered} sem resposta</span>
          </>
        )}
      </p>
      <div className="review-grid">
        {items.map((it, i) => {
          const cls = [
            'review-chip',
            it.status === 'correct' ? 'correct' : '',
            it.status === 'wrong' ? 'wrong' : '',
            it.status === 'unanswered' ? 'blank' : '',
            !it.reviewable ? 'locked' : '',
          ].filter(Boolean).join(' ')
          return (
            <button
              key={i}
              className={cls}
              disabled={!it.reviewable}
              onClick={() => it.reviewable && setOpenIndex(i)}
              title={
                it.reviewable
                  ? `Ver questão ${i + 1}`
                  : 'Disponível apenas para questões que você respondeu'
              }
            >
              {i + 1}
            </button>
          )
        })}
      </div>
      <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.6rem' }}>
        Clique no número de uma questão para rever sua resposta e a
        justificativa de cada alternativa.
      </p>
    </div>
  )
}
