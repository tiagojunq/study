#!/usr/bin/env python3
"""Adds per-option explanations to all 146 questions in questions.json."""

import json

EXPLANATIONS = {
    "A-1": {
        "a": "Incorreta. Provar ausência de defeitos não é um objetivo válido; pelo 1º princípio ISTQB, testes revelam defeitos mas não provam sua ausência.",
        "b": "Incorreta. Garantir ausência de falhas em produção viola o 1º princípio: testes não provam ausência de defeitos.",
        "c": "Correta. Reduzir o nível de risco e aumentar a confiança na qualidade é um objetivo legítimo e realista do teste.",
        "d": "Incorreta. Verificar todas as combinações de entradas seria testes exaustivos, o que é impossível (2º princípio ISTQB).",
    },
    "A-2": {
        "a": "Correta. Testadores participando de diversas atividades do SDLC detectam defeitos nos artefatos cedo, contribuindo diretamente para o sucesso do projeto.",
        "b": "Incorreta. Testadores que evitam interagir com desenvolvedores reduzem a comunicação e aumentam o risco de falhas não detectadas.",
        "c": "Incorreta. Colaborar com usuários finais durante testes de integração não é a atividade que mais contribui para o sucesso; a participação ampla no SDLC é mais impactante.",
        "d": "Incorreta. Certificação não garante melhores casos de teste; habilidades práticas e conhecimento do domínio são mais determinantes.",
    },
    "A-3": {
        "a": "Correta. O princípio 'os testes se desgastam' (paradoxo do pesticida) explica que casos de teste inalterados por várias iterações perdem eficácia para encontrar novos defeitos.",
        "b": "Incorreta. A falácia da ausência de defeitos trata da ilusão de que software sem defeitos é necessariamente útil, não do desgaste dos testes.",
        "c": "Incorreta. O agrupamento de defeitos descreve que defeitos tendem a se concentrar em poucos módulos, não a ineficácia de testes repetidos.",
        "d": "Incorreta. Testes exaustivos são impossíveis refere-se à impossibilidade de testar todas as combinações, não ao desgaste de suítes existentes.",
    },
    "A-4": {
        "a": "Incorreta. Estimar duração em dias-pessoa é uma atividade de planejamento de testes, não de análise.",
        "b": "Correta. Decidir o que testar (ex.: divisão de pagamento entre usuários) é a essência da análise de testes, que identifica as condições de teste.",
        "c": "Incorreta. Derivar dados de teste usando BVA é uma atividade de projeto de testes, não de análise.",
        "d": "Incorreta. Analisar discrepâncias e reportar defeitos ocorre durante a execução dos testes.",
    },
    "A-5": {
        "a": "Incorreta. O número de defeitos históricos e o SDLC isolados não compõem os fatores de maior influência; o SDLC é relevante, mas defeitos históricos têm menor impacto direto.",
        "b": "Correta. O SDLC, os riscos identificados de produto e novos requisitos regulamentares (que impõem técnicas formais) são fatores de influência significativa na abordagem de teste.",
        "c": "Incorreta. O número de defeitos históricos e a configuração do ambiente têm influência menor; novos requisitos regulamentares são mais relevantes.",
        "d": "Incorreta. Apenas riscos e configuração do ambiente não cobrem todos os fatores mais relevantes; o SDLC e requisitos regulamentares também importam.",
    },
    "A-6": {
        "a": "Correta. Configurar ambientes de teste é uma responsabilidade central da função de teste.",
        "b": "Incorreta. Manter o backlog do produto é responsabilidade do Product Owner, não da função de teste.",
        "c": "Incorreta. Projetar soluções para novos requisitos é função dos desenvolvedores/analistas.",
        "d": "Incorreta. Criar o plano de testes é responsabilidade do gerente/líder de testes, mas não é das DUAS tarefas que mais pertencem à função técnica de teste. A questão pede as tarefas PRINCIPAIS.",
        "e": "Correta. Analisar a base de testes (requisitos, especificações) para identificar condições de teste é uma atividade primária da função de teste.",
    },
    "A-7": {
        "a": "Incorreta. Criar visão de produto e planejar/organizar o trabalho da equipe são habilidades de gestão/liderança, não as mais importantes para um testador.",
        "b": "Correta. Conhecimento da área (domínio), ser bom jogador de equipe e pensamento crítico são as habilidades mais importantes para um testador segundo o ISTQB.",
        "c": "Incorreta. Criar visão de produto não é uma habilidade tipicamente requerida de testadores; é mais associada a gerentes de produto.",
        "d": "Incorreta. Planejar e organizar o trabalho da equipe é uma habilidade gerencial, não a mais importante para um testador individual.",
    },
    "A-8": {
        "a": "Incorreta. Decisões sobre automação de testes não são responsabilidade de representantes de negócios.",
        "b": "Incorreta. Testadores não ajudam a definir estratégia de testes junto com representantes de negócios; a estratégia é definida pela liderança de testes.",
        "c": "Incorreta. Representantes comerciais fazem parte da abordagem de equipe completa (whole team approach) no ISTQB.",
        "d": "Correta. Na abordagem whole team, testadores auxiliam representantes de negócios a criar testes de aceite adequados às necessidades do negócio.",
    },
    "A-9": {
        "a": "Incorreta. A regra se aplica além dos modelos sequenciais; modelos iterativos e incrementais também têm atividades de teste correspondentes.",
        "b": "Incorreta. A regra não é restrita apenas a modelos iterativos.",
        "c": "Incorreta. A regra não é restrita apenas a modelos iterativos e incrementais.",
        "d": "Correta. Em todos os modelos de SDLC (sequencial, incremental e iterativo) cada atividade de desenvolvimento tem uma atividade de teste correspondente.",
    },
    "A-10": {
        "a": "Incorreta. O formato dado/quando/então é característico do BDD, não especificamente do ATDD.",
        "b": "Incorreta. Casos de teste orientados ao código de componentes são característicos do TDD, não do ATDD.",
        "c": "Correta. No ATDD, testes são criados a partir dos critérios de aceite para guiar o desenvolvimento do software relacionado.",
        "d": "Incorreta. Testes baseados no comportamento desejado com dado/quando/então descrevem o BDD, que é uma especialização do ATDD.",
    },
    "A-11": {
        "a": "Incorreta. Revisar requisitos antes de aprovação formal é um exemplo claro de shift-left: antecipar verificação para fases iniciais.",
        "b": "Incorreta. Escrever testes de componente antes do código é o TDD, que é um exemplo canônico de shift-left.",
        "c": "Incorreta. Executar testes de desempenho no nível de componente é shift-left: antecipa esse tipo de teste que normalmente ocorreria depois.",
        "d": "Correta. Escrever scripts de teste antes de configurar o gerenciamento de configuração não é shift-left; é uma má prática que inverte dependências necessárias.",
    },
    "A-12": {
        "a": "Incorreta. Seguir tendências ou satisfazer clientes não é o argumento correto para convencer um gestor sobre retrospectivas.",
        "b": "Incorreta. Retrospectivas não visam primariamente coletar feedback imediato de usuários finais sobre o produto.",
        "c": "Correta. Retrospectivas identificam fragilidades de processo que alimentam o programa de melhoria contínua, argumento concreto e convincente para gestores.",
        "d": "Incorreta. Os cinco valores mencionados são do Scrum em geral, não especificamente das retrospectivas, e não é o argumento mais persuasivo.",
    },
    "A-13": {
        "a": "Correta. Falhas de necessidade de negócio → aceite (D); comunicação entre componentes → integração de componentes (B); lógica no código → componentes (A); implementação de regras de negócio → sistema (C).",
        "b": "Incorreta. Falhas de lógica no código pertencem ao teste de componentes (A), não ao teste de sistema (C).",
        "c": "Incorreta. As correspondências estão invertidas; falhas na comunicação entre componentes pertencem ao teste de integração (B), não ao de componentes (A).",
        "d": "Incorreta. Falhas na implementação incorreta de regras de negócio pertencem ao teste de aceite (D), não ao sistema (C).",
    },
    "A-14": {
        "a": "Incorreta. As execuções 7 e 8 são novas execuções de testes aprovados anteriormente, logo são confirmação, não regressão; 4 é re-teste do defeito corrigido.",
        "b": "Correta. Teste de regressão verifica que código não alterado continua funcionando: TC1 passou na exec 1, então a exec 5 (TC2 rodado de novo após correção de TC1) e exec 7 (TC1 rodado novamente) são regressão.",
        "c": "Incorreta. Exec 6 é continuação do teste de TC3 que havia falhado, não regressão de código inalterado.",
        "d": "Incorreta. Execs 5 e 6 são re-testes de falhas conhecidas, não verificação de código inalterado.",
    },
    "A-15": {
        "a": "Correta. A afirmação diz que testes estáticos facilitam detectar defeitos em fases POSTERIORES, o que é falso; testes estáticos detectam defeitos nas fases INICIAIS, reduzindo o custo.",
        "b": "Incorreta. É verdade que corrigir defeitos encontrados estaticamente é menos caro do que em testes dinâmicos; portanto, é um benefício real.",
        "c": "Incorreta. Testes estáticos podem identificar defeitos de código (como código morto) não detectáveis dinamicamente; isso é um benefício real.",
        "d": "Incorreta. Detectar lacunas e inconsistências nos requisitos é um benefício real dos testes estáticos, especialmente revisões.",
    },
    "A-16": {
        "a": "Incorreta. Melhorar o processo para projetos futuros é um benefício de retrospectivas/lições aprendidas, não especificamente do feedback precoce.",
        "b": "Incorreta. Obrigar clientes a priorizar não é um benefício do feedback precoce; é uma consequência do gerenciamento ágil do backlog.",
        "c": "Incorreta. Medir qualidade das mudanças é uma métrica de monitoramento, não o benefício principal do feedback frequente e antecipado.",
        "d": "Correta. Feedback precoce e frequente ajuda a evitar mal-entendidos sobre requisitos, alinhando expectativas entre stakeholders e equipe de desenvolvimento.",
    },
    "A-17": {
        "a": "Incorreta. Revisão informal não exige escriba, preparação formal nem produção de relatório.",
        "b": "Correta. O walkthrough tem autor liderando a reunião, escriba, preparação individual, objetivo de avaliação de qualidade e produção de relatório.",
        "c": "Incorreta. Na análise técnica, a reunião é conduzida por um líder de revisão treinado, não pelo autor.",
        "d": "Incorreta. Na inspeção, a reunião é conduzida por um moderador externo ao autor, não pelo próprio autor.",
    },
    "A-18": {
        "a": "Incorreta. Dedicar tempo suficiente para revisão é um fator que contribui para avaliações bem-sucedidas.",
        "b": "Incorreta. Dividir projetos grandes em partes menores facilita as revisões e é uma boa prática.",
        "c": "Incorreta. Evitar comportamentos negativos (tédio, hostilidade) é essencial para um ambiente de revisão produtivo.",
        "d": "Correta. Esta afirmação está incompleta/incorreta: as falhas devem ser reconhecidas e tratadas objetivamente, mas dizer que falhas devem ser 'valorizadas' não é um fator de sucesso — o foco deve ser na melhoria do produto, não na valorização de defeitos.",
    },
    "A-19": {
        "a": "Incorreta. Casos de teste baseados em informações detalhadas do projeto descrevem técnicas estruturadas (caixa-preta ou branca), não experiência.",
        "b": "Incorreta. Itens testados na interface do código para medir cobertura descrevem técnicas caixa-branca, não baseadas em experiência.",
        "c": "Correta. As técnicas baseadas em experiência dependem fortemente do conhecimento e expertise do testador sobre o software e o domínio de negócios.",
        "d": "Incorreta. Identificar desvios em relação a requisitos é o objetivo geral de testes, não a característica específica de técnicas baseadas em experiência.",
    },
    "A-20": {
        "a": "Incorreta. A partição de equivalência não usa 2 ou 3 pontos; essa nomenclatura é específica da análise de valor limite (BVA).",
        "b": "Incorreta. BVA de 2 pontos testa os valores nos próprios limites (ex.: 0 e 100 para [0,100]), não o valor acima e abaixo.",
        "c": "Incorreta. BVA de 3 pontos inclui o valor limite, o valor imediatamente abaixo e o imediatamente acima de cada fronteira, não apenas um valor por partição.",
        "d": "Correta. Na BVA de 3 pontos, para cada limite são testados: o valor na fronteira, o imediatamente abaixo e o imediatamente acima.",
    },
    "A-21": {
        "a": "Correta. Com BVA de 2 valores, para 6 partições há 5 limites, cada um com 2 valores = 10 pontos de limite. Os TCs cobrem 50% (TC1=91, TC2=50, TC3=81, TC4=60, TC5=70, TC6=80 acertam 5 dos 10 valores limite).",
        "b": "Incorreta. 60% não corresponde ao cálculo correto dos pontos de limite de 2 valores cobertos pelos 6 casos de teste.",
        "c": "Incorreta. 33,3% não corresponde ao cálculo correto para BVA de 2 valores com esses casos de teste.",
        "d": "Incorreta. 100% não é alcançado; os TCs não cobrem todos os valores limite de BVA de 2 pontos para as 6 partições.",
    },
    "A-22": {
        "a": "Incorreta. R4 (membro, prazo cumprido, 15º aluguel) é uma situação possível: membro que cumpriu prazo faz sua 15ª locação e recebe desconto + camiseta.",
        "b": "Incorreta. R2 (membro, prazo não cumprido, não é 15º) é possível: membro perde desconto por atraso.",
        "c": "Incorreta. R6 (não-membro, prazo cumprido, não é 15º) é possível: qualquer pessoa pode alugar sem desconto.",
        "d": "Correta. R8 (não-membro, prazo não cumprido, 15º aluguel) é impossível: apenas membros acumulam locações para chegar ao 15º aluguel com direito à camiseta.",
    },
    "A-23": {
        "a": "Incorreta. 4 casos de teste seria excesso; com o diagrama descrito, 3 são suficientes para cobertura de transições válidas.",
        "b": "Incorreta. 2 casos de teste seriam insuficientes para cobrir todas as transições válidas do diagrama.",
        "c": "Incorreta. 7 casos de teste são mais do que o mínimo necessário para cobertura de transições válidas.",
        "d": "Correta. O número mínimo de casos de teste para cobrir todas as transições válidas do diagrama é 3, pois cada caso de teste pode cobrir múltiplas transições em sequência.",
    },
    "A-24": {
        "a": "Correta. 100% de cobertura de instruções significa que cada instrução (incluindo as defeituosas) foi executada ao menos uma vez, o que pode revelar defeitos.",
        "b": "Incorreta. Conjuntos com mais casos de teste podem executar instruções já cobertas; 100% de cobertura não exige mais casos.",
        "c": "Incorreta. Cobertura de instruções não implica cobertura de todos os caminhos; diferentes caminhos podem passar pelas mesmas instruções.",
        "d": "Incorreta. Cobertura de instruções não cobre combinações de valores de entrada; isso exigiria testes exaustivos, que são impossíveis.",
    },
    "A-25": {
        "a": "Incorreta. Na caixa-branca, toda a implementação (estrutura interna) é considerada; esta afirmação é verdadeira.",
        "b": "Incorreta. Métricas de cobertura de código ajudam a identificar testes adicionais; isso é verdadeiro para caixa-branca.",
        "c": "Incorreta. Técnicas caixa-branca podem ser usadas em análise estática de código, que é um tipo de teste estático; afirmação verdadeira.",
        "d": "Correta. Esta afirmação é falsa: testes caixa-branca verificam a estrutura interna do código, não lacunas de requisitos; lacunas de requisitos são detectadas por testes caixa-preta e revisões.",
    },
    "A-26": {
        "a": "Correta. A suposição de erro (error guessing) usa conhecimento e experiência com defeitos passados e erros típicos de desenvolvedores para antecipar onde defeitos provavelmente ocorrerão.",
        "b": "Incorreta. Error guessing não se baseia exclusivamente nos próprios erros do testador como desenvolvedor, mas em histórico amplo de defeitos conhecidos.",
        "c": "Incorreta. A técnica não requer imaginar ser o usuário; o foco é em defeitos no software, não em erros do usuário.",
        "d": "Incorreta. Error guessing não envolve reproduzir o desenvolvimento; envolve antecipar defeitos com base em experiência histórica.",
    },
    "A-27": {
        "a": "Incorreta. Testes baseados em listas de verificação exigem uma lista predefinida, que não está disponível quando a lista de requisitos ainda não foi compartilhada.",
        "b": "Incorreta. Adivinhação de erros (error guessing) requer conhecimento dos defeitos passados e é menos estruturada para apresentar resultados formais à gerência.",
        "c": "Correta. O teste exploratório é ideal quando o testador tem bom conhecimento do domínio, habilidades analíticas e há pressão de tempo com documentação incompleta.",
        "d": "Incorreta. Teste de ramificação é uma técnica caixa-branca que requer acesso ao código; não é adequada para essa situação de alto nível.",
    },
    "A-28": {
        "a": "Incorreta. Retrospectivas identificam melhorias de processo, não documentam critérios de aceite de histórias de usuário.",
        "b": "Correta. O formato dado/quando/então (BDD) é a forma recomendada para documentar critérios de aceite de forma clara, testável e compreensível por todos.",
        "c": "Incorreta. Comunicação verbal sem registro aumenta o risco de mal-entendidos; critérios de aceite devem ser documentados formalmente.",
        "d": "Incorreta. Documentar riscos em plano de testes é uma atividade de planejamento, não de documentação de critérios de aceite.",
    },
    "A-29": {
        "a": "Correta. Este teste verifica diretamente um critério de aceite da história (editor pode salvar após editar), sendo um exemplo legítimo de teste ATDD baseado nos critérios definidos.",
        "b": "Incorreta. O critério fala em reatribuir o papel de 'proprietário do conteúdo', não em fazer login como esse papel; este teste está fora do escopo.",
        "c": "Incorreta. Agendar publicação não faz parte dos critérios de aceite definidos para esta história de usuário.",
        "d": "Incorreta. Realocar editor para outro editor não corresponde a nenhum critério de aceite; o critério menciona reatribuir para 'proprietário do conteúdo'.",
    },
    "A-30": {
        "a": "Incorreta. A prioridade das histórias é responsabilidade do Product Owner, não dos testadores.",
        "b": "Incorreta. Testadores também contribuem com aspectos não funcionais, de segurança, usabilidade, etc.",
        "c": "Correta. Testadores agregam valor ao planejamento participando da identificação e avaliação detalhada dos riscos, informando decisões sobre o que e como testar.",
        "d": "Incorreta. Garantir lançamento de alta qualidade é um objetivo geral, não uma atividade específica de valor no planejamento de iteração.",
    },
    "A-31": {
        "a": "Incorreta. Preparação do ambiente de teste é um critério de ENTRADA, não de saída.",
        "b": "Incorreta. Capacidade de fazer login no objeto de teste é critério de entrada para início dos testes.",
        "c": "Correta. Atingir a densidade de defeitos estimada é um critério de saída válido; indica que o nível de qualidade esperado foi alcançado.",
        "d": "Incorreta. Traduzir requisitos para o formato dado/quando/então ocorre durante o design de testes, não é critério de saída.",
        "e": "Correta. Automatizar os testes de regressão é um critério de saída válido para fechar a fase de testes e garantir sustentabilidade futura.",
    },
    "A-32": {
        "a": "Incorreta. A estimativa de três pontos usa a fórmula (O + 4M + P) / 6 = (2 + 44 + 14) / 6 = 10, não 9.",
        "b": "Incorreta. 14 seria apenas a estimativa pessimista, não a estimativa final ponderada.",
        "c": "Incorreta. 11 seria apenas a estimativa mais provável, não a média ponderada.",
        "d": "Correta. Aplicando a fórmula de três pontos: (Otimista + 4×Mais provável + Pessimista) / 6 = (2 + 4×11 + 14) / 6 = 60/6 = 10 horas-pessoa.",
    },
    "A-33": {
        "a": "Incorreta. TC003 requer TC002, que requer TC001; por prioridade e dependência, a ordem seria TC001 → TC002 → TC003, mas TC003 tem prioridade 1.",
        "b": "Incorreta. TC005 tem prioridade 3 e depende de TC002; não seria o terceiro.",
        "c": "Incorreta. TC002 tem prioridade 2 e depende de TC001; seria o segundo a ser executado.",
        "d": "Incorreta. TC001 não tem dependências e tem prioridade mais alta entre os que não dependem de outros; seria o primeiro.",
    },
    "A-34": {
        "a": "Correta. Usabilidade → Q3 (negócio, análise crítica); componente → Q1 (tecnologia, suporte à equipe); funcional → Q2 (negócio, suporte); confiabilidade → Q4 (tecnologia, análise crítica).",
        "b": "Incorreta. Esta combinação coloca usabilidade em Q4 e testes funcionais em Q3, o que não corresponde à definição dos quadrantes ágeis.",
        "c": "Incorreta. Esta combinação coloca testes de componente em Q2 (negócio), mas testes de componente são voltados para tecnologia (Q1).",
        "d": "Incorreta. Esta combinação coloca testes funcionais em Q3 (análise crítica do negócio), mas testes funcionais são de suporte ao desenvolvimento (Q2).",
    },
    "A-35": {
        "a": "Incorreta. Aceite do risco significa não tomar nenhuma ação; aqui há ações concretas de teste sendo realizadas.",
        "b": "Incorreta. Plano de contingência é uma resposta para quando o risco se materializa; aqui as ações são preventivas.",
        "c": "Correta. Testes de eficiência de desempenho e testes alfa/beta são ações preventivas que reduzem a probabilidade ou impacto do risco, caracterizando mitigação.",
        "d": "Incorreta. Transferência de risco envolve repassar o risco a terceiros (ex.: seguro); os testes realizados internamente não transferem o risco.",
    },
    "A-36": {
        "a": "Incorreta. Critérios de aceite definem quando uma história está pronta, não mostram trabalho concluído vs. restante na iteração.",
        "b": "Incorreta. Relatório de defeitos lista defeitos encontrados, não o progresso geral do trabalho da iteração.",
        "c": "Incorreta. Relatório de conclusão de teste é produzido ao final do ciclo de testes, não monitora o andamento da iteração.",
        "d": "Correta. O gráfico de Burndown mostra o trabalho concluído e o restante ao longo do tempo na iteração, sendo a ferramenta ágil padrão para esse fim.",
    },
    "A-37": {
        "a": "Incorreta. Gestão de rastreabilidade relaciona artefatos entre si mas não controla versões.",
        "b": "Incorreta. Testes de manutenção verificam o software após mudanças, não controlam versões de artefatos.",
        "c": "Correta. O gerenciamento de configuração controla versões de todos os artefatos do projeto, incluindo scripts de teste, garantindo rastreabilidade e integridade.",
        "d": "Incorreta. Engenharia de requisitos lida com a elicitação e especificação de requisitos, não com versionamento de scripts.",
    },
    "A-38": {
        "a": "Incorreta. O relatório menciona 'de acordo com o caso de teste TC-1305' e o log está em anexo, logo resultados esperados e reais estão implicitamente referenciados.",
        "b": "Incorreta. O relatório menciona o estado (Rejeitado) e a referência ao requisito REQ-0012; estas informações estão presentes.",
        "c": "Correta. O ambiente de teste (SO, browser, versão do sistema) e o item de teste (versão específica do aplicativo) não estão mencionados, dificultando a reprodução pelo desenvolvedor.",
        "d": "Incorreta. A prioridade (alta) está explicitamente mencionada no relatório; a gravidade pode ser inferida.",
    },
    "A-39": {
        "a": "Incorreta. Ferramentas de monitoramento e controle acompanham métricas e progresso, não preparam dados de teste.",
        "b": "Incorreta. A análise de teste identifica condições de teste; ferramentas de dados suportam a fase seguinte.",
        "c": "Correta. Ferramentas de preparação de dados suportam o projeto e implementação de testes, criando os dados necessários para executar os casos de teste.",
        "d": "Incorreta. A conclusão do teste envolve relatórios e lições aprendidas, não preparação de dados.",
    },
    "A-40": {
        "a": "Incorreta. Automação de testes não introduz regressões em produção; ao contrário, ajuda a detectá-las antes da produção.",
        "b": "Correta. Um risco real da automação é não alocar esforço suficiente para manutenção dos scripts de teste quando o sistema evolui.",
        "c": "Incorreta. Confiabilidade em ferramentas de teste é uma preocupação na seleção, mas não é o principal risco potencial da execução automatizada.",
        "d": "Incorreta. Reduzir tempo alocado para testes manuais pode ser um efeito colateral, mas não é necessariamente um risco da automação; testes manuais e automatizados são complementares.",
    },
    # Appendix A questions
    "A-A1": {
        "a": "Correta. Depuração é a atividade de analisar e corrigir as causas de falhas, realizada normalmente pelos desenvolvedores.",
        "b": "Incorreta. Teste de software é a atividade de encontrar defeitos executando o sistema, não de corrigir suas causas.",
        "c": "Incorreta. Levantamento de requisitos ocorre no início do projeto para entender as necessidades, não corrige falhas.",
        "d": "Incorreta. Gestão de defeitos rastreia e administra defeitos reportados, mas não os analisa e corrige diretamente.",
    },
    "A-A2": {
        "a": "Incorreta. Testes e QA não significam a mesma coisa; teste é uma forma de controle de qualidade, enquanto QA engloba processos de garantia.",
        "b": "Incorreta. Os termos não são intercambiáveis; testes são um subconjunto das atividades de qualidade.",
        "c": "Incorreta. Esta afirmação inverte os conceitos: testes não são mais abrangentes que QA; QA é mais amplo e inclui testes.",
        "d": "Correta. QA foca em processos para prevenir defeitos; testes focam em demonstrar que o software está apto e detectar defeitos — são conceitos distintos.",
    },
    "A-A3": {
        "a": "Incorreta. A causa raiz seria a distração (o toque do telefone) que levou o programador a cometer o engano.",
        "b": "Incorreta. Uma falha é o comportamento incorreto observado durante a execução (o campo aceitar valores inválidos), não o código incorreto.",
        "c": "Incorreta. Um erro (engano humano) seria a distração/descuido do programador, não o limite codificado incorretamente.",
        "d": "Correta. O limite superior codificado incorretamente é o defeito (bug no código), resultado do engano humano do programador e causa potencial de falha futura.",
    },
    "A-A4": {
        "a": "Incorreta. Planejamento de testes produz o plano de testes (escopo, objetivos, cronograma), não cartas de sessão de teste exploratório.",
        "b": "Incorreta. Monitoramento e controle acompanham o progresso dos testes, não projetam artefatos de execução.",
        "c": "Incorreta. Análise de teste identifica condições de teste (o QUE testar), não os procedimentos e cartas de execução.",
        "d": "Correta. O projeto de teste define COMO testar, produzindo entre outros as cartas de sessão de teste exploratório com escopo, objetivos e duração.",
    },
    "A-A5": {
        "a": "Incorreta. Análise de impacto relaciona mudanças a artefatos afetados, mas não fornece diretamente informações sobre conclusão de testes.",
        "b": "Incorreta. Rastreabilidade entre casos de teste e resultados fornece métricas de progresso e cobertura, não nível de risco residual diretamente.",
        "c": "Correta. A rastreabilidade entre requisitos e casos de teste permite identificar quais testes precisam ser re-executados após uma mudança, selecionando os corretos para regressão.",
        "d": "Incorreta. Rastreabilidade entre base de testes, objetos e casos de teste auxilia na seleção de dados de teste, mas o exemplo mais direto de valor da rastreabilidade é a seleção para regressão.",
    },
    "A-A6": {
        "a": "Incorreta. Atribuir responsabilidade de qualidade apenas à equipe de testes é contrário ao princípio de qualidade como responsabilidade de toda a equipe.",
        "b": "Incorreta. Equipes externas podem ter suas próprias pressões e vieses; a independência não garante imunidade a pressões de prazo.",
        "c": "Incorreta. Restringir comunicação ao registro de defeitos prejudica a colaboração e a detecção precoce de problemas.",
        "d": "Correta. Testadores independentes questionam suposições implícitas e interpretações do desenvolvedor, evitando viés do autor e encontrando defeitos que o criador não veria.",
    },
    "A-A7": {
        "a": "Incorreta. Execução de teste dinâmico requer código compilado, o que não está disponível nas fases iniciais do modelo V.",
        "b": "Correta. Testes estáticos (revisões de requisitos, especificações) podem ser realizados nas fases iniciais do SDLC, antes mesmo do código existir.",
        "c": "Correta. Planejamento de testes pode e deve ser realizado desde as fases iniciais, mesmo antes da codificação começar.",
        "d": "Incorreta. Execução de testes de aceite ocorre nas fases finais, após o sistema estar implementado.",
        "e": "Incorreta. Testes de manutenção são realizados após a entrega do sistema em produção, não nas fases iniciais.",
    },
    "A-A8": {
        "a": "Incorreta. DevOps aumenta a automação e reduz a necessidade de testes manuais repetitivos (não aumenta); ii é falso.",
        "b": "Incorreta. Software executável constante (iii) é vantagem, mas configurar automação não é barato; v é falso.",
        "c": "Correta. DevOps oferece lançamentos mais rápidos (i) e disponibilidade constante de software executável (iii) como vantagens reais.",
        "d": "Incorreta. DevOps reduz testes manuais repetitivos (ii é falso), e configurar automação é caro (v é falso).",
    },
    "A-A9": {
        "a": "Incorreta. Os testes verificam um requisito de tempo de resposta (não funcional), não apenas requisitos de negócio funcionais.",
        "b": "Correta. Medir e verificar o tempo de processamento em relação a um limite é um teste não funcional de desempenho.",
        "c": "Incorreta. Interagir com interface do usuário não torna um teste funcional; o critério é se verifica função ou característica de qualidade.",
        "d": "Incorreta. Testes caixa-branca exigem acesso à estrutura interna do código; medir tempo via execução normal é caixa-preta.",
    },
    "A-A10": {
        "a": "Correta. Testes de manutenção são realizados quando um sistema sofre mudanças, incluindo desativação e migração de dados para outro sistema.",
        "b": "Incorreta. Testes de regressão verificam que mudanças não quebraram o que funcionava, mas migração de dados em desativação é um escopo de manutenção.",
        "c": "Incorreta. Testes de confiabilidade avaliam a capacidade do sistema de funcionar sem falhas, não a migração de dados.",
        "d": "Incorreta. Testes de integração verificam interfaces entre componentes; migração de dados em desativação é um cenário de manutenção.",
    },
    "A-A11": {
        "a": "Incorreta. Código executável de terceiros (iv) não pode ser revisado pela equipe interna da mesma forma; e inclui apenas i e iv.",
        "b": "Incorreta. Código executável de terceiros (iv) geralmente não pode ser submetido a revisão interna de texto.",
        "c": "Correta. Requisitos de negócio (i), cronograma (ii), orçamento de teste (iii) e histórias de usuário com critérios de aceite (v) são todos artefatos textuais revisáveis; código executável de terceiros (iv) não é.",
        "d": "Incorreta. Orçamento (iii), código de terceiros (iv) e histórias (v) — código executável de terceiros não pode ser revisado da mesma forma.",
    },
    "A-A12": {
        "a": "Incorreta. Identificar comportamentos externos anormais (i) e identificar falhas durante execução (iii) são características do teste dinâmico, não estático.",
        "b": "Incorreta. Identificar comportamentos externos (i) e falhas na execução (iii) pertencem ao teste dinâmico.",
        "c": "Incorreta. Padrões de codificação (ii) são detectáveis estaticamente, mas falhas na execução (iii) não são — isso é teste dinâmico.",
        "d": "Correta. Testes estáticos detectam: desvios de padrões de codificação (ii), objetivam identificar defeitos cedo (iv), e identificam falta de cobertura de requisitos de segurança (v).",
    },
    "A-A13": {
        "a": "Incorreta. Avaliações formais exigem múltiplas funções (autor, moderador, revisores, escriba); nunca apenas uma.",
        "b": "Correta. O processo de revisão formal possui diversas atividades: planejamento, início, revisão individual, comunicação/análise e correção/relatório.",
        "c": "Incorreta. A documentação é distribuída antes da reunião para que os revisores façam preparação individual.",
        "d": "Incorreta. Defeitos encontrados durante revisões são relatados formalmente; esse é um dos principais propósitos da revisão.",
    },
    "A-A14": {
        "a": "Incorreta. Assumir responsabilidade geral pela revisão é papel do líder de revisão, não da gestão.",
        "b": "Correta. A gestão decide o que deve ser revisto, fornecendo os recursos (tempo, pessoal) e estabelecendo as prioridades de revisão.",
        "c": "Incorreta. Garantir o bom funcionamento e moderar reuniões é papel do facilitador/moderador.",
        "d": "Incorreta. Registrar decisões e informações é responsabilidade do escriba.",
    },
    "A-A15": {
        "a": "Incorreta. BVA de 3 pontos para uma fronteira testa: valor abaixo, valor na fronteira e valor acima. Para T=12: testa 11, 12, 13. Para a fronteira superior/inferior existiria um único ponto de fronteira; 11, 12, 13 seria BVA de 3 pontos mas apenas para um lado.",
        "b": "Incorreta. BVA de 2 pontos testaria apenas 11 e 13 (valores adjacentes à fronteira), não o valor limite em si.",
        "c": "Correta. BVA de 3 pontos com uma única fronteira (T=12): testa 10 (abaixo de 11), 11 (abaixo do limite), 12 (no limite), 13 (acima do limite), 14 (acima de 13) — 5 valores para cobertura completa de 3 pontos em ambos os lados.",
        "d": "Incorreta. Omitir o valor 12 (o próprio limite) não seria uma cobertura de BVA de 3 pontos completa.",
    },
    "A-A16": {
        "a": "Incorreta. Ramos incondicionais sempre são executados, mas ainda precisam ser cobertos por casos de teste; não se atinge cobertura sem executar testes.",
        "b": "Incorreta. Exercitar apenas ramos incondicionais não garante 100% de cobertura; ramos condicionais (V/F) também precisam ser cobertos.",
        "c": "Incorreta. 100% de cobertura de instruções não implica 100% de cobertura de ramificações; uma instrução pode ser alcançada por apenas um dos ramos de uma decisão.",
        "d": "Correta. Com 100% de cobertura de ramificações, todos os resultados de decisão (verdadeiro e falso) em cada instrução de decisão são executados.",
    },
    "A-A17": {
        "a": "Incorreta. Teste caixa-preta é uma categoria mais ampla que inclui várias técnicas; a questão pede a técnica específica utilizada.",
        "b": "Incorreta. Teste exploratório é simultâneo (aprender, projetar e executar ao mesmo tempo); avaliar campos contra uma lista não é exploratório.",
        "c": "Correta. Avaliar telas e campos contra uma lista predefinida de boas práticas é exatamente o teste baseado em lista de verificação (checklist).",
        "d": "Incorreta. Error guessing baseia-se na intuição sobre prováveis defeitos, não em uma lista estruturada de boas práticas.",
    },
    "A-A18": {
        "a": "Incorreta. Histórias criadas por testadores e desenvolvedores e aprovadas por negócios não representa a abordagem colaborativa completa.",
        "b": "Correta. A abordagem colaborativa envolve representantes de negócios, desenvolvedores e testadores criando histórias em conjunto (as '3 perspectivas').",
        "c": "Incorreta. Criar histórias apenas por representantes de negócios e depois verificar não é colaborativo; perde o benefício do entendimento compartilhado.",
        "d": "Incorreta. INVEST (Independente, Negociável, Valiosa, Estimável, Pequena, Testável) descreve critérios de qualidade de uma história, não o processo colaborativo de criação.",
    },
    "A-A19": {
        "a": "Incorreta. Comunicação descreve como as informações são transmitidas no projeto, não a abordagem e os níveis de teste.",
        "b": "Incorreta. Registro de riscos lista os riscos identificados, não os níveis de teste e técnicas a serem utilizados.",
        "c": "Incorreta. Contexto do teste descreve o ambiente, as restrições e as partes interessadas, não os níveis e técnicas escolhidos.",
        "d": "Correta. A abordagem de teste descreve os níveis de teste a usar, as técnicas, os critérios de cobertura e os requisitos de conformidade.",
    },
    "A-A20": {
        "a": "Incorreta. Na terceira rodada, há maioria clara de votos em 13; a intervenção do Product Owner não é necessária.",
        "b": "Correta. Na rodada 3, o valor 13 obteve 5 dos 7 votos (maioria), e a regra estabelecida permite aceitar o valor com mais votos quando a variação é pequena.",
        "c": "Incorreta. Ainda há dois votos em 8, portanto não houve consenso total — mas a regra de maioria permite encerrar.",
        "d": "Incorreta. Remover o recurso não é necessário; a equipe tem uma regra de desempate que pode ser aplicada.",
    },
    "A-A21": {
        "a": "Correta. A pirâmide de testes enfatiza ter muito mais testes nos níveis mais baixos (componente/unidade) do que nos níveis mais altos (UI/sistema), reduzindo custo e aumentando a velocidade de feedback.",
        "b": "Incorreta. Na pirâmide, cada teste de nível baixo verifica uma parte pequena e específica da funcionalidade; testes de alto nível cobrem mais.",
        "c": "Incorreta. A pirâmide descreve a proporção de testes por nível, não a distribuição temporal ao longo do SDLC.",
        "d": "Incorreta. A pirâmide tem impacto direto na construção de testes automatizados, orientando onde concentrar o esforço de automação.",
    },
    "A-A22": {
        "a": "Incorreta. Alto impacto de risco não implica automaticamente alta probabilidade; esses dois fatores são avaliados independentemente.",
        "b": "Incorreta. Não há relação inversa automática entre impacto e probabilidade de risco.",
        "c": "Correta. No ISTQB, impacto e probabilidade do risco são fatores independentes; conhecer um não determina o outro.",
        "d": "Incorreta. A probabilidade é sempre necessária para calcular o nível total de risco (probabilidade × impacto) e definir respostas adequadas.",
    },
    "A-A23": {
        "a": "Correta. Realocação de testadores (i) afeta o processo/gestão do projeto; expectativas imprecisas dos stakeholders (iv) também são riscos de projeto — ambos são riscos de processo, não de produto.",
        "b": "Incorreta. Problemas de acessibilidade (v) são riscos de produto (falhas no software para usuários com deficiência).",
        "c": "Incorreta. Tempo de resposta excessivo (iii) é um risco de produto (falha de desempenho), não de projeto.",
        "d": "Incorreta. Não conformidade com padrões de segurança (ii) e problemas de acessibilidade (v) são riscos de produto.",
    },
    "A-A24": {
        "a": "Incorreta. Monitorar e reportar riscos é uma atividade de acompanhamento, não um exemplo de como a análise influencia cobertura e escopo dos testes.",
        "b": "Incorreta. Integrar o sistema a banco de dados de código aberto seria mitigação do risco em nível de desenvolvimento, não uma influência nos testes.",
        "c": "Incorreta. Calcular o risco residual total é análise quantitativa de riscos, não demonstra como influencia diretamente o escopo dos testes.",
        "d": "Correta. Riscos altos de desempenho levam a decidir realizar testes detalhados de eficiência cedo no SDLC — exemplo direto de como a análise influencia cobertura e escopo.",
    },
    "A-A25": {
        "a": "Correta. Número de defeitos encontrados durante os testes do sistema é uma métrica de qualidade do objeto de teste.",
        "b": "Incorreta. Esforço de projeto dividido por número de casos é uma métrica de produtividade/eficiência do processo de teste, não de qualidade do objeto.",
        "c": "Incorreta. Número de procedimentos executados é uma métrica de progresso/cobertura dos testes, não de qualidade do produto.",
        "d": "Correta. Número de defeitos por tamanho do produto (densidade de defeitos) é uma métrica padrão de qualidade do objeto de teste.",
        "e": "Incorreta. Tempo para reparar um defeito é uma métrica de eficiência do processo de correção, não de qualidade do produto em teste.",
    },
    "A-A26": {
        "a": "Incorreta. Obstáculos aos testes são relevantes para representantes comerciais, pois impactam os prazos de entrega.",
        "b": "Correta. Cobertura de ramificações é uma métrica técnica de caixa-branca que representantes de negócios normalmente não compreendem nem utilizam para decisões.",
        "c": "Incorreta. Progresso do teste é relevante para representantes comerciais acompanharem o andamento do projeto.",
        "d": "Incorreta. Novos riscos identificados são críticos para representantes comerciais tomarem decisões sobre lançamento e prioridades.",
    },
    # Exam B questions
    "B-1": {
        "a": "Incorreta. Testes dinâmicos não fazem o sistema falhar de maneiras irreproduziveis; o objetivo é encontrar falhas reais.",
        "b": "Incorreta. Testes estáticos identificam defeitos sem executar código, mas não são usados para 'identificar falhas' que exigem execução.",
        "c": "Incorreta. Análise estática não fornece evidências diretamente sobre elementos que 'não geram resultados' para clientes.",
        "d": "Correta. Revisões melhoram a qualidade das especificações de requisitos, reduzindo mal-entendidos e a necessidade de retrabalho em artefatos derivados.",
    },
    "B-2": {
        "a": "Incorreta. QC (controle de qualidade) não é realizado como parte dos testes; testes são realizados como parte do QC.",
        "b": "Correta. Testes são uma atividade de controle de qualidade (QC), que por sua vez é parte da garantia da qualidade (QA).",
        "c": "Incorreta. Testar e QC não são sinônimos; testes são uma das formas de implementar o controle de qualidade.",
        "d": "Incorreta. Embora verdadeira como conceito, esta opção é idêntica à opção b; a resposta correta é b.",
    },
    "B-3": {
        "a": "Incorreta. Cobrir todas as saídas possíveis seria testes exaustivos, o que o princípio afirma ser impossível.",
        "b": "Incorreta. Documentar e priorizar todas as variações também seria uma abordagem exaustiva.",
        "c": "Incorreta. Iniciar testes cedo refere-se ao princípio 'testes antecipados', não ao problema dos testes exaustivos.",
        "d": "Correta. Particionamento de equivalência e análise de valores limite são técnicas que permitem representar classes de entrada com um número reduzido de casos, tornando os testes práticos sem ser exaustivos.",
    },
    "B-4": {
        "a": "Correta. O projeto de teste define como testar, trabalhando com requisitos de dados de teste, condições de teste, requisitos de ambiente e casos de teste.",
        "b": "Incorreta. A execução de teste executa os casos já projetados e registra resultados, não os projeta.",
        "c": "Incorreta. A análise de teste identifica o que testar (condições de teste), não como testar.",
        "d": "Incorreta. A implementação de teste concretiza os casos em scripts executáveis, utilizando o que foi projetado.",
    },
    "B-5": {
        "a": "Incorreta. O nível de experiência do time de marketing não tem relação com a abordagem de testes do objeto.",
        "b": "Incorreta. Usuários saberem sobre o desenvolvimento não afeta diretamente como os testes são conduzidos.",
        "c": "Correta. A experiência dos membros da equipe de testes influencia diretamente as técnicas escolhidas, a profundidade da análise e a qualidade dos casos de teste.",
        "d": "Incorreta. A estrutura organizacional do usuário final não é um fator que impacte significativamente a abordagem de testes.",
    },
    "B-6": {
        "a": "Incorreta. Rastreabilidade entre riscos mitigados e casos aprovados fornece nível de risco residual, mas é menos direta que a relação entre requisitos e resultados.",
        "b": "Correta. A rastreabilidade entre requisitos de usuário e resultados de testes permite medir o progresso do projeto em relação aos objetivos de negócios, mostrando quais requisitos foram validados.",
        "c": "Incorreta. Rastrear testadores a casos que falharam é uma métrica de produtividade individual, não um valor da rastreabilidade para o projeto.",
        "d": "Incorreta. Rastreabilidade entre riscos e condições de teste serve para planejar cobertura de riscos, não para determinar quais riscos valem a pena testar — isso é análise de risco.",
    },
    "B-7": {
        "a": "Incorreta. Afinidade pessoal com desenvolvedores não é uma habilidade genérica de testes; é uma relação interpessoal.",
        "b": "Correta. Ser ex-piloto e usar esse conhecimento de domínio para compreender melhor os critérios de aceite é um exemplo de habilidade de domínio/negócio aplicada ao teste.",
        "c": "Incorreta. Usar experiência de programação para comunicar com analistas de negócios não é uma habilidade genérica de teste; é uma habilidade técnica.",
        "d": "Incorreta. Gerar casos de teste metodicamente antes de testes exploratórios é uma habilidade específica de teste (planejamento e projeto), não genérica.",
    },
    "B-8": {
        "a": "Incorreta. A abordagem de equipe completa não significa que qualquer membro pode assumir qualquer função arbitrariamente.",
        "b": "Incorreta. Uma única equipe não elimina a necessidade de especialistas; a whole team approach é sobre colaboração, não redução de equipe.",
        "c": "Incorreta. Integrar representantes de negócios com desenvolvedores descreve a composição da equipe, não a vantagem principal.",
        "d": "Correta. A sinergia gerada quando todos os membros se sentem responsáveis pela qualidade beneficia todo o projeto, melhorando comunicação e detecção precoce de problemas.",
    },
    "B-9": {
        "a": "Incorreta. Em desenvolvimento ágil, automação de sistema não substitui testes de regressão; a regressão é ainda mais necessária em ciclos rápidos.",
        "b": "Correta. Em modelos sequenciais (ex.: cascata), testes dinâmicos ficam restritos a fases posteriores do ciclo, após a codificação completa.",
        "c": "Incorreta. Em modelos iterativos, testes de componentes podem ser automatizados ou manuais dependendo da equipe.",
        "d": "Incorreta. Em modelos incrementais, tanto testes estáticos quanto dinâmicos ocorrem em cada incremento, não apenas um tipo por fase.",
    },
    "B-10": {
        "a": "Incorreta. Revisar produtos na próxima fase seria tarde demais; boa prática é revisar o mais cedo possível.",
        "b": "Correta. Revisar produtos de trabalho assim que versões preliminares estiverem disponíveis é uma boa prática aplicável a todos os SDLCs — representa o princípio de testes antecipados.",
        "c": "Incorreta. Revisar apenas antes da análise e projeto de testes ainda é tardio; deve-se revisar assim que disponível.",
        "d": "Incorreta. Revisar imediatamente após a publicação pode ser apropriado, mas 'assim que versões preliminares estiverem disponíveis' é mais antecipado e abrangente.",
    },
    "B-11": {
        "a": "Correta. TDD (Test-Driven Development) é uma abordagem de desenvolvimento orientada a testes, onde os testes são escritos antes do código de produção.",
        "b": "Incorreta. Desenvolvimento orientado pela cobertura não é uma abordagem reconhecida do ISTQB CTFL.",
        "c": "Incorreta. Desenvolvimento orientado pela qualidade é um conceito genérico, não uma técnica específica de TDD.",
        "d": "Incorreta. Desenvolvimento orientado a funcionalidades (Feature-Driven Development) é uma metodologia ágil diferente do TDD.",
    },
    "B-12": {
        "a": "Incorreta. Integração contínua não incentiva enviar código sem completar testes; ao contrário, exige que cada commit passe nos testes antes de ser integrado.",
        "b": "Correta. DevOps requer automação extensiva de testes de regressão para suportar lançamentos frequentes sem aumentar o risco de regressões.",
        "c": "Incorreta. DevOps não é sobre shift-right; envolve toda a equipe e shift-left (antecipação dos testes).",
        "d": "Incorreta. DevOps não elimina testes manuais completamente; testes manuais exploratórios e de aceite complementam a automação.",
    },
    "B-13": {
        "a": "Correta. Testes de segurança realizados por equipe independente num sistema completo (gestão de crédito) são típicos do nível de teste de sistema.",
        "b": "Incorreta. Testar a interface com um sistema bancário externo é teste de integração de sistemas (entre sistemas), não teste de sistema interno.",
        "c": "Incorreta. Teste beta por programadores de cursos é teste de aceite operacional, não teste de sistema.",
        "d": "Incorreta. Testar interações entre UI e banco de dados é teste de integração de componentes, não teste de sistema completo.",
    },
    "B-14": {
        "a": "Incorreta. O número de testes de regressão tende a crescer, mas os testes de confirmação não necessariamente diminuem; dependem da taxa de correção de defeitos.",
        "b": "Incorreta. Esta afirmação inverte os conceitos: testes de confirmação verificam correções; testes de regressão verificam que melhorias não quebraram o existente.",
        "c": "Incorreta. Testes de regressão verificam código inalterado após mudanças no sistema, não o ambiente operacional.",
        "d": "Correta. Testes de regressão focam em efeitos adversos em código não modificado causados por mudanças; testes de confirmação focam em verificar o código que foi corrigido.",
    },
    "B-15": {
        "a": "Incorreta. Falta de usabilidade da interface é detectável apenas em execução (teste dinâmico), não por análise estática.",
        "b": "Correta. Código morto (sem caminho que o alcance) é detectável por análise estática do fluxo de controle, mas não por testes dinâmicos, pois nunca será executado.",
        "c": "Incorreta. Tempos de resposta lentos só podem ser medidos executando o sistema com carga real (teste dinâmico).",
        "d": "Incorreta. Funcionalidades não implementadas são detectáveis tanto por revisão de requisitos vs. código (estático) quanto por execução que falha — não exclusivamente estático.",
    },
    "B-16": {
        "a": "Incorreta. Saber quais desenvolvedores são menos produtivos não é um benefício do feedback dos stakeholders.",
        "b": "Incorreta. Priorizar interações com stakeholders é uma atividade de gestão, não um benefício direto do feedback frequente.",
        "c": "Correta. Feedback frequente e antecipado dos stakeholders facilita a comunicação precoce de possíveis problemas de qualidade, permitindo ação antes que se tornem custosos.",
        "d": "Incorreta. Usuários finais compreenderem atrasos não é um benefício do feedback de qualidade; é consequência de boa comunicação geral.",
    },
    "B-17": {
        "a": "Incorreta. Esta combinação coloca 'características de qualidade' no início da revisão (B) e 'acesso ao documento' no planejamento (C), o que não está correto.",
        "b": "Incorreta. Esta combinação mistura as fases de forma incorreta.",
        "c": "Incorreta. Esta combinação coloca 'características de qualidade' no planejamento (C) mas 'anomalias identificadas' no início (B), o que está errado.",
        "d": "Correta. Planejamento (C) inclui selecionar características e critérios de saída (1); Início (B) distribui o acesso ao documento (2); Revisão individual (A) identifica anomalias (3); Comunicação/análise (D) discute as anomalias (4).",
    },
    "B-18": {
        "a": "Incorreta. Esta combinação atribui ao escriba o papel do facilitador (garantir funcionamento) e ao líder o papel do gerente.",
        "b": "Incorreta. Esta combinação atribui ao escriba funções do facilitador e confunde outros papéis.",
        "c": "Correta. Escriba (1) registra decisões e anomalias (B); Líder de revisão (2) tem responsabilidade geral e organiza (D); Facilitador (3) garante bom funcionamento das reuniões (A); Gerente (4) decide o que analisar e fornece recursos (C).",
        "d": "Incorreta. Esta combinação atribui ao líder de revisão o papel do facilitador.",
    },
    "B-19": {
        "a": "Incorreta. Em tabela de decisão, os casos derivam das especificações/lógica de negócio, não de instruções de decisão no código.",
        "b": "Incorreta. Error guessing não é técnica de ramificação; a descrição está incorreta para ambas as técnicas.",
        "c": "Incorreta. Esta opção inverte as definições: tabela de decisão usa fluxo de controle e ramificação usa especificação — mas está errado; é exatamente o oposto.",
        "d": "Correta. Tabela de decisão é caixa-preta (independe da implementação) e pode ser criada antes do código; testes de ramificação são caixa-branca e exigem o código implementado.",
    },
    "B-20": {
        "a": "Correta. Os valores 19, 20 e 30 cobrem três partições diferentes: sem desconto (19), desconto de 50% (20), e sem desconto novamente após a décima lavagem subsequente (30 = décima lavagem sem desconto especial).",
        "b": "Incorreta. Os valores 11, 12 e 20 cobrem: partição sem desconto (11, 12) duas vezes e partição de 50% (20) — apenas 2 partições distintas.",
        "c": "Incorreta. 1, 10, 50 cobrem: sem desconto (1), desconto de 10% (10), e 50 cai em uma lavagem sem desconto especial — apenas 2 partições interessantes.",
        "d": "Incorreta. 10, 29, 30, 31 cobre partições de 10% e 50%, mas com redundância e não otimiza a cobertura de 3 partições distintas.",
    },
    "B-21": {
        "a": "Incorreta. BVA de 2 valores testa exatamente os limites (6 e 12) e os valores imediatamente fora (5 e 13). Os valores 4, 5, 13, 14 incluem valores redundantes além dos necessários para adicionar à cobertura de 2 para 3 pontos.",
        "b": "Incorreta. 7 e 11 são valores do meio das partições, não valores de limite para BVA.",
        "c": "Incorreta. 1, 5, 13 inclui apenas alguns dos valores adicionais necessários para 3 pontos, mas faltam outros.",
        "d": "Correta. BVA de 3 pontos adiciona os valores adjacentes externos (1=2 abaixo do inf, 4=2 abaixo do inf, 14=2 acima do sup) mais valores internos adjacentes (7 e 11) aos já testados por BVA de 2 pontos.",
    },
    "B-22": {
        "a": "Incorreta. 40% seria cobrir apenas 2 das 5 regras; os casos de teste cobrem mais.",
        "b": "Correta. TC1 cobre Regra 4 (col 125-200, PA>140), TC2 cobre Regra 4 novamente, TC3 cobre Regra 1 (col≤124, PA>140→baixo), TC4 cobre Regra 1, TC5 cobre Regra 5 (col≥201). Portanto 3 regras distintas cobertas de 5 = 60%.",
        "c": "Incorreta. Para 80%, seriam necessários 4 das 5 regras cobertas; apenas 3 são cobertas.",
        "d": "Incorreta. Para 100%, todas as 5 regras precisariam ser cobertas; a Regra 2 e Regra 3 não são cobertas.",
    },
    "B-23": {
        "a": "Incorreta. Esta sequência (Add, Remove, Add, Add, Add) não cobre a transição de N=3 (cheio) tentando adicionar, faltando cobrir a transição de remoção de N=1.",
        "b": "Incorreta. Esta sequência tem um Add extra no início (N vai a 4 que é inválido), tornando-a incorreta.",
        "c": "Correta. Add(N=1), Add(N=2), Add(N=3), Remove(N=2), Remove(N=1) — cobre as 5 transições válidas do diagrama: 0→1, 1→2, 2→3, 3→2, 2→1.",
        "d": "Incorreta. Esta sequência não cobre a transição de N=2 para N=1 (a segunda remoção levaria para N=2→3 novamente, perdendo uma transição).",
    },
    "B-24": {
        "a": "Incorreta. Coberturas de instruções não se somam aritmeticamente; T1+T2 não pode ultrapassar 100%.",
        "b": "Correta. T1 executa 40% das instruções e T2 executa 65%; se houvesse zero sobreposição, o total seria 105% (impossível). Logo, pelo menos 5% das instruções foram executadas por ambos.",
        "c": "Incorreta. Instruções não executáveis são excluídas do denominador; os percentuais já consideram apenas instruções executáveis.",
        "d": "Incorreta. Cobertura de instruções não implica cobertura de ramificações; uma instrução pode ser alcançada por apenas um ramo.",
    },
    "B-25": {
        "a": "Incorreta. X como 'resultados de decisão exercidos' e Y como 'total de resultados de decisão' descreve cobertura de decisão, não de ramificação.",
        "b": "Incorreta. Considerar apenas ramificações condicionais excluiria ramificações incondicionais, que também devem ser contadas.",
        "c": "Correta. Cobertura de ramificação = (ramificações exercidas pelos casos de teste / total de ramificações no código) × 100%.",
        "d": "Incorreta. Usar 'resultados de decisão' no denominador confunde cobertura de ramificação com cobertura de decisão.",
    },
    "B-26": {
        "a": "Correta. Quando não há tempo suficiente para planejamento formal e testes estruturados, testes exploratórios permitem coletar resultados rapidamente com base na experiência.",
        "b": "Incorreta. Se a estratégia exige técnicas formais de caixa-preta, isso justifica usar essas técnicas, não testes exploratórios.",
        "c": "Incorreta. Especificação em linguagem formal processável por ferramenta justificaria automação de testes, não exploratórios.",
        "d": "Incorreta. Boas habilidades de programação em equipe ágil não justificam especificamente o uso de testes exploratórios.",
        "e": "Correta. Experiência na área de negócios e boas habilidades analíticas são os atributos que maximizam a eficácia dos testes exploratórios.",
    },
    "B-27": {
        "a": "Incorreta. 'O desenvolvedor cometeu um erro' é uma observação subjetiva sobre a causa, não um item verificável em uma lista de verificação.",
        "b": "Incorreta. 'Cobertura acima de 85%' é uma métrica de saída/critério de conclusão, não um item de checklist de testes.",
        "c": "Incorreta. 'O programa funciona corretamente' é vago demais para ser um item acionável de lista de verificação.",
        "d": "Correta. 'Mensagens de erro escritas em linguagem compreensível pelo usuário' é um item específico, verificável e alinhado com boas práticas de usabilidade — típico de checklist.",
    },
    "B-28": {
        "a": "Incorreta. Orientado a regras descreveria condições e ações em formato de regras IF-THEN, não usando dado/quando/então.",
        "b": "Correta. O formato Dado/Quando/Então (Given/When/Then) é o formato orientado a cenários do BDD, usado para descrever critérios de aceite de forma narrativa.",
        "c": "Incorreta. Orientado ao produto focaria em características e atributos do produto, não em cenários de uso.",
        "d": "Incorreta. Orientado a processos descreveria fluxos de trabalho e processos, não cenários de interação do usuário.",
    },
    "B-29": {
        "a": "Incorreta. Verificar o histórico de pedidos é diretamente relevante para a história ('visualizar meus pedidos anteriores').",
        "b": "Incorreta. Ver detalhes de um pedido individual é relevante para a história de acompanhar compras.",
        "c": "Incorreta. Ordenar o histórico em ordem crescente pode ser um critério de aceite derivado da necessidade de 'acompanhar compras'.",
        "d": "Correta. Registrar novo cliente não tem relação com a história de 'visualizar pedidos anteriores' de um cliente já cadastrado; este teste testa funcionalidade de cadastro, não de visualização de histórico.",
    },
    "B-30": {
        "a": "Correta. Para submeter código ao controle de versão (etapa 2), o critério de entrada mais adequado é que a análise estática não retornou avisos graves — garante qualidade mínima antes da integração.",
        "b": "Incorreta. A ausência de conflitos de merge é condição para que a operação de merge seja bem-sucedida, mas não é o critério de entrada para submeter o código.",
        "c": "Incorreta. Testes de componentes compilados e prontos seria um critério de entrada para a etapa 3 (executar testes de componentes), não para a etapa 2.",
        "d": "Incorreta. 80% de cobertura de instruções seria critério de saída dos testes de componentes (etapa 3), não de entrada para submeter código.",
    },
    "B-31": {
        "a": "Incorreta. $40.000 seria a proporção do projeto P1 (5%); não representa a média dos quatro projetos.",
        "b": "Correta. Proporções: P1=5%, P2≈10,8%, P3≈11,7%, P4=12%. Média≈9,875%≈10%. Para $800.000 × 10% = $80.000.",
        "c": "Incorreta. $81.250 resultaria de um cálculo ligeiramente diferente da proporção média.",
        "d": "Incorreta. $82.500 não corresponde ao cálculo correto da proporção média dos quatro projetos históricos.",
    },
    "B-32": {
        "a": "Incorreta. TC3 tem prioridade 3 e depende de TC4 que depende de TC1 e TC2; não seria o quarto.",
        "b": "Correta. A ordem por dependências e prioridades seria: TC6(p1)→TC4(p2, dep:BUSCAR)→TC2(p4, dep:BUSCAR)→TC1(p4). Considerando dependências lógicas, BUSCAR deve vir antes: TC1 ou TC2 primeiro. A ordem correta é TC6, TC4, TC2, TC1 — o quarto seria TC1.",
        "c": "Incorreta. TC7 tem prioridade 5 (mais baixa) e requer ADICIONAR antes; seria o último.",
        "d": "Incorreta. TC2 seria anterior a TC1 pelo mesmo nível de prioridade, mas ambos são BUSCAR; a posição exata depende da ordenação de empate.",
    },
    "B-33": {
        "a": "Incorreta. Testes de usabilidade são voltados para o negócio e análise crítica do produto (Q3), não para tecnologia.",
        "b": "Incorreta. Testes funcionais são voltados para o negócio e suporte ao desenvolvimento (Q2), não para tecnologia.",
        "c": "Incorreta. Testes de aceite do usuário são voltados para o negócio e análise crítica (Q3 ou Q4), não Q1.",
        "d": "Correta. Testes de integração de componentes são voltados para tecnologia (verificam interfaces técnicas) e apoiam a equipe de desenvolvimento — característicos do Q1.",
    },
    "B-34": {
        "a": "Incorreta. Esta combinação coloca BVA para loop ineficiente (deveria ser performance) e aceite para mudança de preferências do consumidor (deveria ser aceite, mas a atividade 'A' é aceite do risco).",
        "b": "Incorreta. Esta combinação coloca teste de performance para loop ineficiente (correto) mas BVA para alagamento (errado; alagamento = transferência de risco).",
        "c": "Correta. Loop ineficiente → teste de desempenho (B); preferências dos consumidores → aceite do risco (A, fora do controle); alagamento de servidores → transferência de risco/seguro (D); relatórios imprecisos por idade → BVA (C).",
        "d": "Incorreta. Esta combinação usa BVA para loop e performance para idade, quando deveria ser o contrário.",
    },
    "B-35": {
        "a": "Correta. MTTF (Mean Time To Failure) é uma métrica de qualidade do produto que mede a confiabilidade do sistema em operação real.",
        "b": "Incorreta. Número de defeitos encontrados é uma métrica de processo de teste, não de qualidade do produto em si.",
        "c": "Incorreta. Cobertura de requisitos é uma métrica de progresso dos testes (quantos requisitos foram cobertos), não de qualidade do produto.",
        "d": "Incorreta. Percentagem de detecção de defeitos é uma métrica da eficácia do processo de teste, não de qualidade do produto.",
    },
    "B-36": {
        "a": "Correta. Para uma equipe na América do Norte comunicando com cliente na Europa, reuniões presenciais são as menos eficazes por causa da distância geográfica e fuso horário.",
        "b": "Incorreta. Painéis (dashboards) são eficazes para equipes distribuídas, pois fornecem informações em tempo real sem necessidade de sincronização.",
        "c": "Incorreta. E-mail é eficaz para comunicação assíncrona entre equipes em fusos horários diferentes.",
        "d": "Incorreta. Videoconferência é eficaz para equipes distribuídas, aproximando-se da reunião presencial virtualmente.",
    },
    "B-37": {
        "a": "Correta. O gerenciamento de configuração rastreia versões de todos os artefatos; com o número da versão do ambiente, a ferramenta pode recuperar as versões exatas de todas as dependências (bibliotecas, stubs, drivers).",
        "b": "Incorreta. Gerenciamento de configuração não executa casos de teste nem calcula cobertura; isso é função de ferramentas de execução de testes.",
        "c": "Incorreta. Gerenciar datas de vencimento de licenças não é uma função típica de ferramentas de CM de software.",
        "d": "Incorreta. Gerar dados de teste a partir do número de versão do caso de teste não é uma função de gerenciamento de configuração.",
    },
    "B-38": {
        "a": "Incorreta. 'Não consegue ordenar vários conjuntos' é impreciso; TC2 (4 números) funcionou corretamente.",
        "b": "Correta. TC3 (7 números com duplicata: 3 7 3 7 1) e TC4/TC5 (com valores repetidos) falham, sugerindo que o sistema ignora duplicatas no processo de classificação.",
        "c": "Incorreta. TC4 e TC5 têm todos números negativos, mas TC3 tem mistura; o problema parece ser com duplicatas, não apenas negativos.",
        "d": "Incorreta. Os casos de teste têm dados válidos (duplicatas são entradas legítimas); o defeito está no sistema, não nos casos de teste.",
    },
    "B-39": {
        "a": "Incorreta. Acompanhamento de workflow de suporte é ferramenta DevOps (C), não estática; e avaliações de suporte são ferramentas estáticas (A).",
        "b": "Incorreta. Esta combinação coloca workflow de suporte em ferramentas de escalabilidade e facilitar comunicação em ferramentas DevOps.",
        "c": "Correta. Acompanhamento de workflow → DevOps (C); facilitar comunicação → colaboração (D); máquinas virtuais → escalabilidade/implantação (B); avaliações de suporte → estático (A).",
        "d": "Incorreta. Esta combinação coloca comunicação em DevOps e máquinas virtuais em análise estática, o que está errado.",
    },
    "B-40": {
        "a": "Correta. Ferramentas de automação calculam métricas de cobertura complexas (cobertura de código, de ramificação) que seriam impraticáveis de calcular manualmente.",
        "b": "Incorreta. A responsabilidade pelos testes permanece com a equipe de desenvolvimento/teste, não com o fornecedor da ferramenta.",
        "c": "Incorreta. A automação não elimina a necessidade de pensamento crítico; análise de resultados e interpretação continuam sendo humanas.",
        "d": "Incorreta. Ferramentas de automação executam testes, mas não geram casos de teste a partir da análise do código do programa (isso seria geração automática de testes, diferente).",
    },
    # Exam C questions
    "C-1": {
        "a": "Incorreta. Reduzir o nível de risco do produto é um objetivo de teste válido e realista.",
        "b": "Correta. 'Garantir que o software esteja completamente livre de defeitos' não é um objetivo válido; pelo 1º princípio ISTQB, testes não provam ausência de defeitos.",
        "c": "Incorreta. Fornecer informações para decisão de lançamento é um objetivo legítimo e importante do teste.",
        "d": "Incorreta. Verificar conformidade com requisitos contratuais ou legais é um objetivo válido, especialmente em domínios regulamentados.",
    },
    "C-2": {
        "a": "Correta. A sequência correta no ISTQB é: engano humano (error) → defeito no produto (defect) → falha durante execução (failure).",
        "b": "Incorreta. Esta sequência (failure → defect → error) está completamente invertida em relação à causalidade ISTQB.",
        "c": "Incorreta. O defeito resulta do engano, não o contrário; a ordem defect → error está invertida.",
        "d": "Incorreta. A falha é a manifestação do defeito durante execução, não um passo intermediário entre engano e defeito.",
    },
    "C-3": {
        "a": "Incorreta. 'Testes revelam presença de defeitos' é o 1º princípio, que trata da natureza dos resultados dos testes, não da eficácia de suítes inalteradas.",
        "b": "Incorreta. 'Testes exaustivos são impossíveis' é o 2º princípio, que trata da impossibilidade de testar todas as combinações.",
        "c": "Correta. O paradoxo do pesticida (5º princípio) afirma que repetir os mesmos testes eventualmente não encontrará novos defeitos, pois o software se adapta ou os defeitos restantes não são atingidos por esse conjunto.",
        "d": "Incorreta. Agrupamento de defeitos descreve que defeitos tendem a se concentrar em poucos módulos, não que testes repetidos perdem eficácia.",
    },
    "C-4": {
        "a": "Incorreta. A falácia não afirma que é impossível desenvolver sem defeitos; afirma que mesmo sem defeitos o sistema pode ser inútil.",
        "b": "Correta. A falácia da ausência de defeitos significa que encontrar e corrigir todos os defeitos não garante que o sistema seja útil ou atenda às necessidades reais do usuário.",
        "c": "Incorreta. A impossibilidade de provar ausência de defeitos é o 1º princípio, não a falácia da ausência.",
        "d": "Incorreta. Defeitos nem sempre causam falhas visíveis; há defeitos latentes que só manifestam em condições específicas.",
    },
    "C-5": {
        "a": "Incorreta. O planejamento define escopo, objetivos e abordagem dos testes, não analisa a base para identificar condições.",
        "b": "Correta. A análise de teste examina a base de teste (requisitos, especificações) para identificar as condições de teste — o 'o quê testar'.",
        "c": "Incorreta. O projeto de teste transforma condições de teste em casos de teste — o 'como testar'; ocorre após a análise.",
        "d": "Incorreta. A execução do teste executa os casos projetados e registra resultados; as condições já foram identificadas anteriormente.",
    },
    "C-6": {
        "a": "Incorreta. Monitoramento e controle acompanham o progresso durante os testes, não criam casos de teste.",
        "b": "Incorreta. A análise de teste identifica condições de teste, não cria os casos de teste detalhados nem especifica os dados.",
        "c": "Correta. O projeto de teste é a atividade onde casos de teste são criados e dados de teste especificados, baseando-se nas condições identificadas na análise.",
        "d": "Incorreta. A conclusão do teste produz relatórios finais e lições aprendidas; casos de teste não são criados nesta fase.",
    },
    "C-7": {
        "a": "Incorreta. Testadores independentes não necessariamente encontram mais defeitos; encontram defeitos diferentes devido à perspectiva distinta.",
        "b": "Correta. Testadores independentes evitam o viés do autor (que tende a não enxergar seus próprios erros) e trazem perspectiva diferente sobre o sistema.",
        "c": "Incorreta. Testadores independentes se beneficiam do conhecimento do domínio; não precisar conhecê-lo seria uma desvantagem.",
        "d": "Incorreta. Automação de casos de teste não é uma vantagem da independência; é uma questão de abordagem técnica.",
    },
    "C-8": {
        "a": "Incorreta. Programar em múltiplas linguagens é útil mas não é a habilidade fundamental definida pelo ISTQB para testadores.",
        "b": "Incorreta. Conhecimento exclusivo de ferramentas de automação é muito restrito; testadores precisam de habilidades mais abrangentes.",
        "c": "Correta. Pensamento crítico, curiosidade e atenção aos detalhes são habilidades fundamentais para um testador eficaz, conforme o ISTQB CTFL.",
        "d": "Incorreta. Trabalhar de forma isolada contradiz o princípio de whole team approach; colaboração é essencial para testadores.",
    },
    "C-9": {
        "a": "Incorreta. Projeto detalhado de componentes no modelo V corresponde ao nível de teste de componentes (unitário), não ao teste de aceitação.",
        "b": "Incorreta. Projeto de arquitetura do sistema corresponde ao teste de integração de sistema, não ao de aceitação.",
        "c": "Incorreta. Requisitos do sistema correspondem ao teste de sistema, não ao de aceitação.",
        "d": "Correta. No modelo V, os requisitos de negócio/necessidades do usuário (nível mais alto de especificação) correspondem diretamente ao teste de aceitação (nível mais alto de teste).",
    },
    "C-10": {
        "a": "Incorreta. O teste de componente verifica componentes individuais isoladamente, não a comunicação entre eles.",
        "b": "Correta. O teste de integração verifica se componentes individuais se comunicam corretamente entre si, detectando falhas nas interfaces.",
        "c": "Incorreta. O teste de sistema verifica o comportamento do sistema completo como um todo, não especificamente a comunicação entre componentes.",
        "d": "Incorreta. Teste de aceitação operacional verifica se o sistema está pronto para operação (instalação, recuperação), não a comunicação entre componentes.",
    },
    "C-11": {
        "a": "Incorreta. Teste de regressão é um tipo de teste pelo objetivo/propósito, podendo ser funcional ou não funcional.",
        "b": "Correta. Teste de usabilidade é um tipo de teste não funcional, pois avalia uma característica de qualidade (usabilidade) e não uma funcionalidade específica.",
        "c": "Incorreta. Teste de componente é um nível de teste (não um tipo funcional/não funcional); pode verificar aspectos funcionais ou não funcionais.",
        "d": "Incorreta. Teste de integração é um nível de teste, não um tipo funcional/não funcional; verifica interfaces que podem ser funcionais ou não.",
    },
    "C-12": {
        "a": "Correta. O re-teste (confirmação) verifica se um defeito específico foi corrigido; o teste de regressão verifica se a correção não introduziu novos defeitos em outras áreas do sistema.",
        "b": "Incorreta. Ambos podem ser manuais ou automatizados; a diferença não é quanto ao método de execução.",
        "c": "Incorreta. Ambos podem ser realizados por desenvolvedores ou testadores; a diferença não é quanto ao executor.",
        "d": "Incorreta. O re-teste foca no defeito corrigido, não no sistema completo; o teste de regressão pode cobrir áreas além do módulo corrigido.",
    },
    "C-13": {
        "a": "Incorreta. Realizar testes apenas ao final contradiz o princípio ágil de entrega contínua e feedback rápido.",
        "b": "Correta. Em métodos iterativos como Scrum, os testes são integrados em cada sprint/iteração, verificando as histórias de usuário entregues.",
        "c": "Incorreta. Em ciclos ágeis curtos, testes de regressão são ainda mais necessários para garantir que incrementos anteriores não foram quebrados.",
        "d": "Incorreta. Documentação de teste detalhada não é obrigatória em cada sprint; agilidade prioriza testes funcionais sobre documentação extensa.",
    },
    "C-14": {
        "a": "Incorreta. Teste de aceitação antes do lançamento é parte do ciclo normal de desenvolvimento, não de manutenção.",
        "b": "Correta. Verificar o comportamento do sistema após migração para novo sistema operacional é um típico cenário de teste de manutenção, que ocorre após uma mudança no ambiente.",
        "c": "Incorreta. Análise de requisitos no início do projeto é atividade de desenvolvimento, não de manutenção.",
        "d": "Incorreta. Revisão técnica do código durante desenvolvimento é teste estático no ciclo de desenvolvimento, não manutenção.",
    },
    "C-15": {
        "a": "Incorreta. Verificar comportamento durante execução real é o que os testes dinâmicos fazem, não os estáticos.",
        "b": "Correta. O benefício principal do teste estático é identificar defeitos antes da execução do código, quando o custo de correção é significativamente menor.",
        "c": "Incorreta. Defeitos de desempenho e carga exigem execução real do sistema; são melhor detectados por testes dinâmicos.",
        "d": "Incorreta. Testes estáticos exigem esforço humano para revisão; não necessariamente requerem menos esforço que os dinâmicos.",
    },
    "C-16": {
        "a": "Incorreta. Revisão informal tem processo menos definido e sem funções formais estabelecidas.",
        "b": "Incorreta. Walkthrough é conduzido pelo autor e tem objetivo principal de aprendizado/disseminação, não apenas detecção sistemática.",
        "c": "Incorreta. Revisão técnica foca em verificar conformidade técnica, mas tem menos formalidade que a inspeção.",
        "d": "Correta. A inspeção é o tipo mais formal de revisão, com funções bem definidas, moderador externo e processo sistemático focado em detecção de defeitos.",
    },
    "C-17": {
        "a": "Incorreta. Moderar a reunião é papel do facilitador, não do autor.",
        "b": "Correta. No walkthrough, o autor lidera a reunião, apresentando e guiando os revisores pelo produto de trabalho.",
        "c": "Incorreta. Registrar defeitos é papel do escriba, não do autor.",
        "d": "Incorreta. Tomar decisões sobre melhorias pode envolver vários papéis; o autor apresenta, não decide sozinho.",
    },
    "C-18": {
        "a": "Incorreta. Tempo de resposta lento sob carga é um defeito de desempenho detectável apenas executando o sistema com carga real (dinâmico).",
        "b": "Incorreta. Problemas de acessibilidade da interface exigem avaliação do comportamento do sistema em execução.",
        "c": "Correta. Variáveis declaradas mas nunca utilizadas (código morto) são detectáveis por análise estática do código sem executá-lo.",
        "d": "Incorreta. O sistema rejeitar entradas válidas é um defeito funcional detectável apenas executando o sistema.",
    },
    "C-19": {
        "a": "Correta. Para cobrir as três partições (inválido abaixo: <18, válido: 18-65, inválido acima: >65), os valores 17 (inválido abaixo), 40 (válido) e 66 (inválido acima) cobrem uma de cada partição.",
        "b": "Incorreta. Os valores 18 e 65 são os limites da partição válida, e 40 também é válido; nenhum cobre partições inválidas.",
        "c": "Incorreta. 0 e 18 estão em partições diferentes (inválido e válido), mas 65 é válido; falta a partição inválida acima.",
        "d": "Incorreta. 17 e 18 cobrem a partição inválida abaixo e o início da válida, mas 65 também é válido; falta a partição inválida acima.",
    },
    "C-20": {
        "a": "Incorreta. Os valores 9, 10, 50, 51 são para BVA de 2 pontos testando TODOS os limites (incluindo os externos); BVA de 2 pontos para os limites do intervalo válido são apenas 10 e 50.",
        "b": "Correta. Na BVA de 2 pontos, para cada limite do intervalo válido (10 e 50) testa-se apenas o valor no próprio limite; os valores de teste são 10 e 50.",
        "c": "Incorreta. 10, 30, 50 inclui um valor interno da partição (30); BVA de 2 pontos foca apenas nos valores limite.",
        "d": "Incorreta. 9, 11, 49, 51 são os valores adjacentes externos e internos, característicos de BVA de 3 pontos, não de 2 pontos.",
    },
    "C-21": {
        "a": "Incorreta. Com 2 valores (BVA de 2 pontos), apenas os limites são testados: 1 e 100.",
        "b": "Incorreta. Com 4 valores seria BVA de 2 pontos completo (1, 2, 99, 100) para dois limites.",
        "c": "Correta. BVA de 3 pontos para um intervalo [1,100] com dois limites: limite inferior → 0, 1, 2; limite superior → 99, 100, 101 = 6 valores de teste.",
        "d": "Incorreta. 8 valores seria mais do que o necessário para BVA de 3 pontos com dois limites.",
    },
    "C-22": {
        "a": "Incorreta. Partição de equivalência agrupa entradas em classes equivalentes, mas não é a melhor técnica para testar combinações de múltiplas condições.",
        "b": "Incorreta. Análise de valor limite foca em testar os limites de intervalos, não combinações de condições.",
        "c": "Correta. Teste de tabela de decisão é a técnica ideal para testar combinações de múltiplas condições com regras de negócio que geram resultados distintos.",
        "d": "Incorreta. Teste de caso de uso verifica fluxos de interação do usuário, não combinações sistemáticas de condições.",
    },
    "C-23": {
        "a": "Incorreta. 3 regras cobririam apenas uma combinação possível por condição, muito menos do que o máximo.",
        "b": "Incorreta. 6 é 2×3 (combinações de 3 condições em pares), não o total de combinações binárias.",
        "c": "Correta. Com 3 condições binárias, o número máximo de combinações é 2³ = 8 regras de decisão.",
        "d": "Incorreta. 12 seria 4×3 ou maior que 2³; não corresponde ao cálculo correto para 3 condições binárias.",
    },
    "C-24": {
        "a": "Incorreta. Sistemas batch processam dados em sequência, mas não necessariamente têm comportamento dependente de estado ou histórico de eventos.",
        "b": "Correta. Teste de transição de estado é mais adequado para sistemas cujo comportamento depende do estado atual e da sequência de eventos, como máquinas de estado, protocolos e sistemas de controle.",
        "c": "Incorreta. Sistemas com múltiplas condições independentes são melhor testados com tabelas de decisão ou partição de equivalência.",
        "d": "Incorreta. Sistemas sem interface com usuário podem ou não ter estados; a ausência de UI não determina a aplicabilidade do teste de transição.",
    },
    "C-25": {
        "a": "Incorreta. Executar todos os caminhos possíveis seria cobertura de caminhos (path coverage), muito mais completa que cobertura de instruções.",
        "b": "Correta. 100% de cobertura de instruções significa que cada instrução executável do código foi executada por pelo menos um caso de teste.",
        "c": "Incorreta. Avaliar cada decisão como V e F é cobertura de ramificações (branch coverage), mais forte que cobertura de instruções.",
        "d": "Incorreta. Testar todas as combinações de condições seria cobertura de condições múltiplas (MC/DC), muito mais completa.",
    },
    "C-26": {
        "a": "Incorreta. Cobertura de instruções verifica apenas que cada instrução foi executada, sem garantir que cada ramo foi testado.",
        "b": "Correta. Cobertura de decisões (branch/decision coverage) exige que cada desvio de fluxo de controle seja exercitado tanto como verdadeiro quanto como falso.",
        "c": "Incorreta. Cobertura de caminhos (path coverage) exige que todos os caminhos possíveis do fluxo sejam executados, o que é mais completo que cobertura de decisões.",
        "d": "Incorreta. Cobertura de condições verifica cada condição simples dentro de uma decisão composta, que é diferente de cobrir cada branch como V e F.",
    },
    "C-27": {
        "a": "Incorreta. Teste baseado em checklist usa uma lista predefinida de itens a verificar, não intuição sobre onde os defeitos ocorrerão.",
        "b": "Incorreta. Teste exploratório é simultâneo (aprender, projetar e executar), guiado por objetivos e oraculo, não especificamente focado em antecipar defeitos prováveis.",
        "c": "Correta. Suposição de erro (error guessing) usa intuição e conhecimento histórico de defeitos passados para antecipar onde é mais provável que ocorram defeitos.",
        "d": "Incorreta. Teste de transição de estado é uma técnica caixa-preta estruturada baseada em modelos de estados, não em experiência/intuição.",
    },
    "C-28": {
        "a": "Incorreta. Testes exploratórios podem usar documentação como base; a falta de documentação é uma situação onde são especialmente úteis, mas não uma restrição.",
        "b": "Incorreta. Testes exploratórios podem ser gerenciados através de cartas de sessão (session charters) com objetivos e duração definidos.",
        "c": "Correta. No teste exploratório, o testador simultaneamente aprende sobre o sistema, projeta os próximos passos e executa os testes, adaptando-se ao que descobre.",
        "d": "Incorreta. Testes exploratórios são eficazes para testadores com qualquer nível de experiência, especialmente quando combinados com bom conhecimento do domínio.",
    },
    "C-29": {
        "a": "Incorreta. Derivadas da estrutura interna do componente descreve técnicas caixa-branca, não caixa-preta.",
        "b": "Correta. Técnicas caixa-preta são baseadas na especificação do comportamento externo do sistema, sem considerar a estrutura interna.",
        "c": "Correta. Partição de equivalência é uma técnica de caixa-preta que divide entradas em classes equivalentes baseadas na especificação.",
        "d": "Incorreta. Cobertura de decisões é uma técnica caixa-branca que requer conhecimento do fluxo de controle interno do código.",
        "e": "Incorreta. Técnicas caixa-preta não requerem acesso ao código-fonte; baseiam-se apenas nas especificações externas.",
    },
    "C-30": {
        "a": "Incorreta. Executar casos de teste e registrar resultados é a atividade de execução de testes, não de planejamento.",
        "b": "Correta. Planejamento de teste inclui definir o escopo, a abordagem, os recursos necessários e o cronograma — atividades que estabelecem como os testes serão conduzidos.",
        "c": "Incorreta. Comparar resultados obtidos com esperados é parte da execução e avaliação dos testes.",
        "d": "Incorreta. Criar procedimentos de execução de teste pertence à implementação de testes, não ao planejamento.",
    },
    "C-31": {
        "a": "Incorreta. Caso de teste especifica entradas, condições e resultados esperados para um único cenário de teste.",
        "b": "Incorreta. Relatório de conclusão do teste documenta os resultados e lições aprendidas após o ciclo de testes.",
        "c": "Correta. O plano de teste é o documento que descreve o escopo, os objetivos, os riscos, a abordagem e os critérios de entrada e saída para uma atividade de teste.",
        "d": "Incorreta. Script de teste é um conjunto de instruções para execução automatizada ou manual de um caso de teste específico.",
    },
    "C-32": {
        "a": "Correta. Riscos de produto são possíveis falhas nas características do software; riscos de projeto são fatores que podem comprometer o sucesso do projeto (prazo, orçamento, recursos).",
        "b": "Incorreta. Ambos os tipos de risco são gerenciados por toda a equipe de projeto; não há divisão exclusiva por papel.",
        "c": "Incorreta. Riscos de produto podem ocorrer após a entrega (ex.: falhas em produção); riscos de projeto podem se materializar em qualquer fase do desenvolvimento.",
        "d": "Incorreta. A distinção entre riscos de produto e projeto é fundamental para o planejamento baseado em riscos no ISTQB.",
    },
    "C-33": {
        "a": "Incorreta. Testar todos os requisitos com a mesma prioridade seria ignorar os riscos; o teste baseado em risco prioriza as áreas mais críticas.",
        "b": "Correta. A análise de risco permite priorizar os esforços de teste nas áreas de maior risco, maximizando a detecção de defeitos críticos com os recursos disponíveis.",
        "c": "Incorreta. A análise de risco não garante que todos os defeitos serão encontrados; testes não podem provar ausência de defeitos.",
        "d": "Incorreta. A análise de risco pode indicar que testes de regressão são necessários em áreas de alto risco; não elimina essa necessidade.",
    },
    "C-34": {
        "a": "Incorreta. Número de desenvolvedores alocados não é uma métrica de progresso de testes; é uma métrica de recursos do projeto.",
        "b": "Correta. Percentual de casos de teste executados e número de defeitos por severidade são métricas diretamente úteis para monitorar o progresso e qualidade dos testes.",
        "c": "Incorreta. Complexidade ciclomática é uma métrica de código estático; não monitora o progresso da execução dos testes.",
        "d": "Incorreta. Total de linhas de código é uma métrica de tamanho do sistema, não de progresso dos testes.",
    },
    "C-35": {
        "a": "Incorreta. Listar todos os casos executados é função do log de execução, não do relatório de conclusão.",
        "b": "Correta. O relatório de conclusão de teste fornece um resumo das atividades realizadas, métricas de qualidade e informações para que stakeholders tomem decisões sobre lançamento ou continuidade.",
        "c": "Incorreta. Descrever requisitos funcionais testados é parte da documentação de cobertura, não o propósito principal do relatório de conclusão.",
        "d": "Incorreta. Documentar defeitos a corrigir na próxima versão é uma lista de pendências; o relatório de conclusão tem escopo mais amplo.",
    },
    "C-36": {
        "a": "Incorreta. Gerenciamento de configuração não automatiza execução de casos de teste; isso é feito por ferramentas de automação de testes.",
        "b": "Correta. O gerenciamento de configuração garante que os artefatos de teste (casos, scripts, dados) estejam relacionados e sincronizados com a versão correta do item em teste.",
        "c": "Incorreta. O gerenciamento de configuração suporta e facilita a rastreabilidade; não a elimina.",
        "d": "Incorreta. O gerenciamento de configuração é necessário em qualquer projeto de software, independentemente do número de testadores.",
    },
    "C-37": {
        "a": "Incorreta. As condições que definem quando os testes podem ser iniciados são os critérios de ENTRADA (entry criteria), não de saída.",
        "b": "Correta. Critérios de saída (exit criteria) definem as condições que devem ser satisfeitas para encerrar uma atividade de teste, como percentual de cobertura ou densidade de defeitos.",
        "c": "Incorreta. Critérios de saída são definidos durante o planejamento de testes, antes da execução, não apenas ao final do projeto.",
        "d": "Incorreta. Critérios de saída se aplicam a todos os níveis e fases de teste, não somente ao teste de aceitação.",
    },
    "C-38": {
        "a": "Incorreta. O código-fonte do sistema não é informação incluída no plano de teste; pertence ao repositório de desenvolvimento.",
        "b": "Correta. Escopo e objetivos do teste são elementos fundamentais de um plano de teste, definindo o que será e não será testado.",
        "c": "Incorreta. Resultados detalhados de casos de teste são registrados no log de execução, não no plano de teste.",
        "d": "Correta. Riscos assumidos e abordagem de teste são componentes essenciais do plano de teste, orientando as decisões de toda a equipe.",
        "e": "Incorreta. Lista de defeitos corrigidos pelo desenvolvedor pertence ao relatório de acompanhamento de defeitos, não ao plano de teste.",
    },
    "C-39": {
        "a": "Incorreta. A automação não elimina a necessidade de testadores; análise de resultados, manutenção de scripts e testes exploratórios continuam exigindo humanos.",
        "b": "Correta. A automação de regressão permite executar suítes grandes com maior frequência e velocidade, detectando quebras mais rapidamente e reduzindo o risco de regressão.",
        "c": "Incorreta. A automação não garante 100% de cobertura de código; os casos de teste automatizados cobrem apenas o que foi especificado.",
        "d": "Incorreta. A automação de regressão não reduz automaticamente o tempo de desenvolvimento de novas funcionalidades.",
    },
    "C-40": {
        "a": "Incorreta. O ROI da automação raramente é imediato; há um período de amortização do investimento inicial antes de se tornar rentável.",
        "b": "Incorreta. Ferramentas de automação não são igualmente adequadas para todos os tipos e níveis; por exemplo, testes exploratórios resistem bem à automação.",
        "c": "Correta. Introduzir automação requer investimento inicial significativo (ferramenta, treinamento, criação de scripts) e manutenção contínua quando o sistema evolui.",
        "d": "Incorreta. Scripts de automação precisam ser atualizados quando a interface ou comportamento do sistema muda; a automação não elimina essa necessidade.",
    },
}

def main():
    with open("/home/user/study/quiz/src/data/questions.json", "r", encoding="utf-8") as f:
        questions = json.load(f)

    missing = []
    for q in questions:
        qid = q["id"]
        if qid not in EXPLANATIONS:
            missing.append(qid)
        else:
            q["explanations"] = EXPLANATIONS[qid]

    if missing:
        print(f"WARNING: Missing explanations for: {missing}")
    else:
        print(f"All {len(questions)} questions have explanations.")

    # Verify all option letters are covered
    issues = []
    for q in questions:
        qid = q["id"]
        if "explanations" not in q:
            continue
        option_letters = {opt["letter"] for opt in q["options"]}
        explained_letters = set(q["explanations"].keys())
        if option_letters != explained_letters:
            issues.append(f"{qid}: options={option_letters}, explained={explained_letters}")

    if issues:
        print(f"OPTION MISMATCH ISSUES:")
        for issue in issues:
            print(f"  {issue}")
    else:
        print("All option letters match their explanations.")

    with open("/home/user/study/quiz/src/data/questions.json", "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)

    print("questions.json updated successfully.")

if __name__ == "__main__":
    main()
