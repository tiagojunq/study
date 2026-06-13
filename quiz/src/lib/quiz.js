import allQuestions from '../data/questions.json'

export const ALL_QUESTIONS = allQuestions

// Per-certification metadata. Everything that varies between exams lives
// here so the views can be cert-agnostic.
export const CERTS = {
  CTFL: {
    id: 'CTFL',
    label: 'ISTQB CTFL — Foundation Level',
    shortLabel: 'CTFL',
    description: 'Certificação base do ISTQB sobre fundamentos de teste de software.',
    chapters: [1, 2, 3, 4, 5, 6],
    chapterNames: {
      1: 'Cap. 1 – Fundamentos',
      2: 'Cap. 2 – Ciclo de vida',
      3: 'Cap. 3 – Testes estáticos',
      4: 'Cap. 4 – Técnicas',
      5: 'Cap. 5 – Gerenciamento',
      6: 'Cap. 6 – Ferramentas',
    },
    examQuestionWeights: { 1: 8, 2: 6, 3: 4, 4: 11, 5: 9, 6: 2 },
    examTotalPoints: 40,
    examTotalQuestions: 40,
    examPassPoints: 26,
    passThresholdLabel: '65% de acertos (26/40 na prova oficial)',
    defaultDurationMinutes: 60,
    chapterTips: {
      1: 'Revise os 7 princípios do teste, a distinção entre defeito/falha/erro e os objetivos do teste de software.',
      2: 'Aprofunde como o teste se encaixa em cada modelo de SDLC (Ágil, Cascata), os níveis de teste (unitário → aceite) e os tipos de teste.',
      3: 'Foque nas diferenças entre walkthrough, revisão técnica e inspeção formal, e no que a análise estática encontra sem executar código.',
      4: 'Maior peso na prova (11/40). Domine EP, AVL, tabela de decisão e transição de estados (caixa-preta), além de cobertura de instrução e decisão (caixa-branca).',
      5: 'Estude planejamento e estimativa de testes, monitoramento, relatórios de progresso, gestão de defeitos e análise de riscos de produto e projeto.',
      6: 'Menor peso (2/40). Revise as categorias de ferramentas de teste e os benefícios e riscos da automação de testes.',
    },
    banks: {
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
      B_MAIN: { id: 'B_MAIN', label: 'Exame B (40 questões)', filter: (q) => q.exam === 'B' },
      C_MAIN: { id: 'C_MAIN', label: 'Simulado C – Extras (40 questões geradas)', filter: (q) => q.exam === 'C' },
      D_MAIN: { id: 'D_MAIN', label: 'Simulado D – Extras (100 questões geradas)', filter: (q) => q.exam === 'D' },
      ALL: { id: 'ALL', label: 'Banco completo', filter: () => true },
    },
  },
  CTAI: {
    id: 'CTAI',
    label: 'ISTQB CT-AI — AI Testing',
    shortLabel: 'CT-AI',
    description: 'Certificação ISTQB sobre teste de sistemas baseados em Inteligência Artificial.',
    chapters: [1, 2, 3, 4, 5, 6, 7],
    chapterNames: {
      1: 'Cap. 1 – Introdução à AI',
      2: 'Cap. 2 – Qualidade em sistemas AI',
      3: 'Cap. 3 – Machine Learning',
      4: 'Cap. 4 – Teste de sistemas AI',
      5: 'Cap. 5 – Teste de dados',
      6: 'Cap. 6 – Teste de modelos ML',
      7: 'Cap. 7 – Teste em desenvolvimento ML',
    },
    examQuestionWeights: { 1: 6, 2: 3, 3: 7, 4: 7, 5: 6, 6: 9, 7: 2 },
    examTotalPoints: 44,
    examTotalQuestions: 40,
    examPassPoints: 29,
    passThresholdLabel: '29 pontos de 44 (~65,9%) na prova oficial',
    defaultDurationMinutes: 60,
    chapterTips: {
      1: 'Revise AI estreita/geral/super AI, AI generativa, hardware (GPU/TPU/ASIC), frameworks de ML e regulamentações (Lei de AI da UE, Princípios da OCDE, ISO/IEC TR 29119-11).',
      2: 'Domine as características de qualidade específicas para AI da ISO/IEC 25059 (robustez, controlabilidade do usuário, adaptabilidade funcional, intervenibilidade) e segurança em sistemas AI.',
      3: 'Foco em fluxo de trabalho de ML, formas de aprendizado (supervisionado, não supervisionado, reforço), preparação e divisão de dados (treinamento/validação/teste), métricas (precisão, recall, F1, matriz de confusão) e redes neurais.',
      4: 'Estude sistemas bloqueados vs adaptativos, abordagens estatísticas em testes, oráculos para AI, teste de AI generativa, red teaming, níveis de teste para ML e testes baseados em risco.',
      5: 'Foque em riscos e mitigações dos dados de entrada: teste de viés, pipeline, representatividade, restrições de conjuntos de dados e correção de rótulos.',
      6: 'Maior peso na prova oficial (9/40). Domine teste de modelos: performance funcional, teste contraditório, metamórfico, teste de desvio, overfitting/underfitting, A/B e back-to-back.',
      7: 'Menor peso (2/40). Revise riscos no desenvolvimento de ML e implantação de sistemas de machine learning.',
    },
    banks: {
      A_MAIN: {
        id: 'A_MAIN',
        label: 'Exame A (40 questões oficiais)',
        filter: (q) => q.exam === 'A' && !q.isAppendix,
      },
      A_FULL: {
        id: 'A_FULL',
        label: 'Exame A + Apêndice (43 questões)',
        filter: (q) => q.exam === 'A',
      },
      ALL: { id: 'ALL', label: 'Banco completo', filter: () => true },
    },
  },
}

export const DEFAULT_CERT = 'CTFL'

export function getCert(certId) {
  return CERTS[certId] || CERTS[DEFAULT_CERT]
}

export function getCertQuestions(certId) {
  return ALL_QUESTIONS.filter((q) => q.cert === certId)
}

export function getBankQuestions(certId, bankId) {
  const cert = getCert(certId)
  const bank = cert.banks[bankId] || cert.banks.A_MAIN
  return getCertQuestions(certId).filter(bank.filter)
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

// Build the prepared list of questions for the session, scoped by cert.
export function prepareQuestions({ cert, bank = 'ALL', limit, shuffle = true, seed, chapters }) {
  let qs = getBankQuestions(cert, bank)
  if (chapters && chapters.length > 0) {
    const chSet = new Set(chapters)
    qs = qs.filter((q) => chSet.has(q.chapter))
  }
  if (shuffle) qs = shuffleSeeded(qs, seed)
  if (limit && limit > 0 && limit < qs.length) qs = qs.slice(0, limit)
  return qs
}

// Score returns the question's point value when the answer set exactly
// matches the correct set, otherwise 0. CTFL questions are all worth 1
// point; CT-AI questions may be worth 1 or 2.
export function scoreAnswer(question, answerLetters) {
  if (!answerLetters || answerLetters.length === 0) return 0
  const need = new Set(question.correct)
  const got = new Set(answerLetters)
  if (need.size !== got.size) return 0
  for (const l of need) if (!got.has(l)) return 0
  return question.points || 1
}

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export function chapterName(ch, certId = DEFAULT_CERT) {
  const cert = getCert(certId)
  return cert.chapterNames[ch] || `Cap. ${ch}`
}

export const MAX_PARTICIPANTS = 10
export const MAX_DURATION_SECONDS = 60 * 60 // 60 min
