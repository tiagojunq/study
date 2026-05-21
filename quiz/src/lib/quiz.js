import allQuestions from '../data/questions.json'

export const ALL_QUESTIONS = allQuestions

export const BANKS = {
  A_MAIN: {
    id: 'A_MAIN',
    label: 'Exame A (40 questões oficiais)',
    filter: (q) => q.exam === 'A' && !q.isAppendix,
  },
  A_FULL: {
    id: 'A_FULL',
    label: 'Exame A + Apêndice (66 questões)',
    filter: (q) => q.exam === 'A',
  },
  B_MAIN: {
    id: 'B_MAIN',
    label: 'Exame B (40 questões)',
    filter: (q) => q.exam === 'B',
  },
  C_MAIN: {
    id: 'C_MAIN',
    label: 'Simulado C – Extras (40 questões geradas)',
    filter: (q) => q.exam === 'C',
  },
  ALL: {
    id: 'ALL',
    label: 'Banco completo (146 questões)',
    filter: () => true,
  },
}

export function getBankQuestions(bankId) {
  const bank = BANKS[bankId] || BANKS.A_MAIN
  return ALL_QUESTIONS.filter(bank.filter)
}

function seededRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

export function shuffleSeeded(array, seed) {
  const rand = seededRandom(seed)
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build the prepared list of questions for the session, applying limit.
// Question identity & content is fixed across all peers because the host
// broadcasts it, but we still seed shuffling to keep host-side selection
// deterministic and reproducible if needed.
export function prepareQuestions({ bank, limit, shuffle, seed }) {
  let qs = getBankQuestions(bank)
  if (shuffle) qs = shuffleSeeded(qs, seed)
  if (limit && limit > 0 && limit < qs.length) qs = qs.slice(0, limit)
  return qs
}

// Score a participant's answer. selectCount = number of letters that should
// be chosen. correct = array of letters. answer = array of letters chosen.
// Scoring rule: exact-match across the required letters earns 1 point.
export function scoreAnswer(question, answerLetters) {
  if (!answerLetters || answerLetters.length === 0) return 0
  const need = new Set(question.correct)
  const got = new Set(answerLetters)
  if (need.size !== got.size) return 0
  for (const l of need) if (!got.has(l)) return 0
  return 1
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function chapterName(ch) {
  const map = {
    1: 'Cap. 1 – Fundamentos',
    2: 'Cap. 2 – Ciclo de vida',
    3: 'Cap. 3 – Testes estáticos',
    4: 'Cap. 4 – Técnicas',
    5: 'Cap. 5 – Gerenciamento',
    6: 'Cap. 6 – Ferramentas',
  }
  return map[ch] || `Cap. ${ch}`
}

export const MAX_PARTICIPANTS = 10
export const MAX_DURATION_SECONDS = 60 * 60 // 60 min
