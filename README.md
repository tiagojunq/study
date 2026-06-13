# Simulador BSTQB - CTFL & CT-AI

Aplicativo web (React + Vite) que oferece simulados das certificações **BSTQB CTFL - Foundation Level** e **BSTQB CT-AI - AI Testing**, em português, com modo individual ou em grupo (até 10 participantes simultâneos via WebRTC P2P, sem servidor de aplicação).

A produção fica em **<https://tiagojunq.github.io/study/quiz/>** e é publicada automaticamente pelo GitHub Pages a cada merge na `main`.

## Conteúdo do banco

| Banco | Fonte | Questões | Pontos |
|---|---|---:|---:|
| CTFL Set A (oficial) | Sample Exam A do BSTQB (PT-BR) | 40 + 26 apêndice | 40 |
| CTFL Set B (oficial) | Sample Exam B do BSTQB (PT-BR) | 40 | 40 |
| CTFL Set C (gerado) | Geradas no estilo da prova, distribuição oficial | 40 | 40 |
| CTFL Set D (gerado) | Geradas no estilo da prova, distribuição proporcional | 100 | 100 |
| CT-AI Set A (oficial) | Sample Exam A do BSTQB CT-AI v2.0 (PT-BR) | 40 + 3 apêndice | 44 |
| CT-AI Set B (gerado) | Geradas no estilo da prova, estrutura idêntica ao Set A | 40 | 44 |

Todas as questões seguem as regras do documento **ISTQB Exam Structures & Rules v1.2** + tabelas EST v1.15:

- formato múltipla escolha (1 ou 2 alternativas corretas);
- CTFL: 1 ponto por questão; CT-AI: 1 ponto (K2) ou 2 pontos (K3);
- distribuição por capítulo idêntica à da prova oficial;
- critério de aprovação 65%.

## Funcionalidades

- **Escolha da certificação** (CTFL ou CT-AI) como primeiro passo.
- **Modo solo**: configure e responda no seu ritmo.
- **Modo em grupo** (até 10 pessoas):
  - moderador cria a sala (código gerado automaticamente);
  - participantes entram com o código;
  - moderador controla o ritmo (libera questão, libera resposta, próxima);
  - conexão peer-to-peer via PeerJS (WebRTC).
- **Configuração do simulado**:
  - simulado completo OU questões por capítulo;
  - quantidade de questões (clampada ao disponível);
  - tempo limite até 60 min ou sem limite.
- **Durante a prova**:
  - identificação do capítulo e do número da questão;
  - badge "1 ponto" / "2 pontos" exibido apenas quando a sessão mistura valores;
  - matriz de confusão, diagramas e tabelas renderizadas em monoespaço.
- **Análise pós-prova**:
  - ranking (modo grupo) e/ou análise de desempenho;
  - tabela por capítulo com "Acertos", "Pontos" (quando há valores variados) e "%";
  - badge de "Aprovado/Reprovado" com base no critério oficial da cert;
  - dicas de estudo personalizadas por capítulo;
  - revisão das questões respondidas (consulta read-only).
- **Tema claro/escuro** persistente.

## Stack técnica

- **Frontend**: React 18, Vite 5
- **P2P / sala**: PeerJS (WebRTC) com broker público
- **Estilo**: CSS custom properties com tema claro/escuro
- **Deploy**: GitHub Actions → GitHub Pages

Tudo é client-side; não há backend nem banco de dados. As questões ficam embutidas no bundle (`quiz/src/data/questions.json`).

## Como rodar localmente

Pré-requisitos: Node 20+.

```bash
git clone https://github.com/tiagojunq/study.git
cd study/quiz
npm ci
npm run dev
```

O Vite abre em <http://localhost:5173/study/quiz/>. Para testar o modo em grupo, abra uma segunda aba/janela anônima na mesma URL e conecte com o código da sala.

## Como contribuir

A `main` é protegida (PR obrigatório, build verde, sem force push). Fluxo típico:

1. Trabalhe no branch `claude/quiz-system-multiplayer-zOqma` (ou crie outro).
2. Commits descritivos.
3. Abra um PR para `main`.
4. CI executa `npm run build` automaticamente.
5. Merge quando o check `build` passar.

## Estrutura do projeto

```
study/
├── .github/workflows/
│   ├── ci.yml        # build em todo PR
│   └── deploy.yml    # build + deploy no Pages após merge na main
├── quiz/
│   ├── public/       # imagens, diagramas
│   ├── src/
│   │   ├── components/   # QuestionDisplay, Ranking, PerformanceBreakdown, etc.
│   │   ├── views/        # Home, ModeratorSession, ParticipantSession
│   │   ├── lib/          # quiz.js (CERTS, bancos, scoring) e peer.js (P2P)
│   │   └── data/questions.json
│   └── package.json
└── README.md
```

## Aviso

As questões oficiais reproduzidas (Sample Exam A e B do CTFL, Sample Exam A do CT-AI) são propriedade do BSTQB®. Este projeto é exclusivamente para fins de estudo individual ou em grupo, sem finalidade comercial.
