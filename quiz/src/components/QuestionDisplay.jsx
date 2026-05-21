import { chapterName } from '../lib/quiz.js'

export default function QuestionDisplay({
  question,
  selected,
  onToggle,
  locked,
  reveal,
}) {
  if (!question) return null
  const { stem, options, selectCount, correct } = question
  const correctSet = new Set(correct)
  const selSet = new Set(selected || [])

  const canPick = !locked && !reveal
  const points = question.points || 1

  return (
    <div>
      <div className="q-number">
        <strong>Questão {question.exam}-{question.number}</strong>
        {' • '}
        {chapterName(question.chapter)}
        {' • '}
        <span style={{ color: 'var(--accent)' }}>
          {points} {points === 1 ? 'ponto' : 'pontos'}
        </span>
        <span className="tag" style={{ marginLeft: '0.5rem' }}>
          {selectCount === 2 ? 'Selecione DUAS' : 'Selecione UMA'}
        </span>
      </div>
      <div className="stem">{stem}</div>
      <div className="options">
        {options.map((opt) => {
          const isSel = selSet.has(opt.letter)
          const isCorrect = reveal && correctSet.has(opt.letter)
          const isWrong = reveal && isSel && !correctSet.has(opt.letter)
          const cls = [
            'option',
            isSel && !reveal ? 'selected' : '',
            isCorrect ? 'correct' : '',
            isWrong ? 'wrong' : '',
            !canPick ? 'disabled' : '',
          ].filter(Boolean).join(' ')
          return (
            <div
              key={opt.letter}
              className={cls}
              onClick={() => canPick && onToggle(opt.letter)}
              role={canPick ? 'button' : undefined}
            >
              <span className="letter">{opt.letter}</span>
              <span className="option-text">{opt.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
