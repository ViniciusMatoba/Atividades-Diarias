# GeekDaily — Plano de Produto e Tecnologia

> **Status:** Rascunho inicial (Fase 2 da primeira missão)
> **Última atualização:** 2026-07-23
> **Nome do produto:** GeekDaily *(provisório — ver Premissas)*
> **Repositório:** `https://github.com/ViniciusMatoba/Atividades-Diarias.git`

> ⚠️ **Atualização de arquitetura (backend):** o backend foi definido como
> **Firebase** — **Firestore** (dados, NoSQL) + **Firebase Auth** (e-mail/senha),
> substituindo a proposta inicial de Postgres/Prisma/Auth.js. A autoridade do
> servidor é mantida via **Admin SDK** em Server Actions do Next.js. As seções
> **§8 (modelo de dados)** e **§12 (autenticação)** já refletem o Firebase; a
> lógica pura dos jogos/pontuação não foi afetada.

---

## 1. Resumo do produto

GeekDaily é um web app de **microgames diários** de cultura geek: mapas/países, Pokémon, anime, filmes/séries e games. A proposta é uma **experiência diária de ~5–10 minutos** (a "Jornada Diária" com 5 jogos curtos), com um **Modo Infinito** para continuar jogando com conteúdo aleatório.

Todos os usuários recebem **o mesmo desafio do dia** (conteúdo determinado no servidor, identificado pela data). O app registra pontuação, streak, nível, conquistas e estatísticas por jogo. Visual colorido, moderno, mobile-first — sem mascote, sem narrativa, sem tom infantil.

---

## 2. Premissas

Decisões de produto ainda não definidas pelo briefing — resolvidas com a opção mais simples e registradas aqui:

| # | Premissa | Decisão adotada | Reversível? |
|---|----------|-----------------|-------------|
| P1 | Nome do produto | **GeekDaily** (provisório). Fácil de trocar: fica em variável de tema/config. | Sim |
| P2 | Fuso da virada diária | `America/Sao_Paulo` (UTC-3), configurável via env. Virada às 00:00 local. | Sim |
| P3 | Idioma da UI | Português (pt-BR) no MVP; textos isolados para i18n futuro. | Sim |
| P4 | Autenticação | E-mail + senha (credentials). Arquitetura pronta para OAuth social depois. | Sim |
| P5 | Semana do ranking semanal | Segunda 00:00 → domingo 23:59:59 (America/Sao_Paulo), padrão ISO. | Sim |
| P6 | "Concluir a jornada" p/ streak | ≥ 3 dos 5 jogos concluídos no dia. | Sim |
| P7 | Pontuação oficial | Primeira submissão de cada jogo do dia. Repetições não sobrescrevem. | Sim |
| P8 | Estrelas | 0–399 → 1★, 400–749 → 2★, 750–1000 → 3★ (função central configurável). | Sim |
| P9 | Conteúdo protegido (IP) | Só dados textuais/placeholder no MVP. Sem imagens/áudio protegidos no repo. | Sim |
| P10 | Deploy alvo | Vercel (Next.js) + Postgres gerenciado (Neon/Supabase/Vercel Postgres). | Sim |
| P11 | Geração do desafio diário | Determinística por seed = hash(data). Persistida no banco na 1ª requisição do dia. | Sim |

---

## 3. Escopo do MVP

**Dentro do MVP:**

- Autenticação e-mail/senha (registro, login, logout, sessão).
- Jornada Diária: 5 jogos em cards, ordem livre, status por jogo.
- **1 jogo totalmente funcional como referência arquitetural: País Misterioso.**
- Os outros 4 jogos: contratos definidos + stubs/mock de UI (não jogáveis ainda).
- Modo Infinito: estrutura pronta; jogável para País Misterioso.
- Pontuação oficial validada no servidor (máx 1000/jogo, 5000/dia).
- Streak diária (≥3 jogos) com fuso America/Sao_Paulo.
- Perfil com estatísticas (algumas com dados reais, outras preparadas).
- Ranking diário e semanal (estrutura + consulta; UI inicial).
- Sistema de conquistas baseado em eventos (motor + 2–3 conquistas ativas).
- Design system básico (tokens, botões, cards, estrelas, progresso, feedback).
- Testes de lógica: pontuação, estrelas, streak, regras do País Misterioso.

**Telas do MVP:** login, cadastro, home, jornada diária, seleção de jogos (modo infinito), perfil, ranking, resultado diário.

---

## 4. Fora do MVP

- Os 4 jogos restantes totalmente jogáveis (Pin do Mundo, PokéGuess, Geek Connections, Quem Veio Primeiro) — apenas contratos/mocks agora.
- Login social (Google/Discord/Apple).
- Ranking entre amigos.
- Gerações de Pokémon além da 1ª (Kanto/151).
- Variações do Pin do Mundo (capitais, cidades, estados, monumentos).
- Acesso/replay de desafios de dias passados (arquitetura permite; UI depois).
- Avatares customizados, loja, cosméticos.
- Notificações push / e-mails transacionais.
- App nativo / PWA offline avançado.
- Internacionalização completa.

---

## 5. Jornadas do usuário

**5.1 Novo usuário**
1. Abre GeekDaily → landing/home com CTA.
2. Cadastra (e-mail + senha) → perfil criado.
3. É levado à Jornada Diária → vê 5 cards (todos "não iniciado").
4. Escolhe um jogo → joga → vê resultado + estrelas → volta à jornada.
5. Ao concluir ≥3 jogos → streak conta; ao concluir os 5 → pontuação diária consolidada.

**5.2 Usuário recorrente**
1. Login → Home mostra saudação, streak, progresso do dia, pontuação do dia.
2. Continua jogos pendentes ou revê concluídos (sem alterar pontuação oficial).
3. Terminou a jornada → entra no Modo Infinito (escolhe tipo de jogo, joga rodadas avulsas).
4. Consulta Perfil (nível, XP, streaks, estatísticas) e Ranking (diário/semanal).

**5.3 Replay / abandono**
- Replay de jogo concluído: joga, vê pontuação da rodada, mas a **oficial não muda**.
- Abandono no meio: sessão fica "em andamento"; pode retomar (estado serializado) enquanto for o mesmo dia.

---

## 6. Mapa inicial de telas

```
/                       → Home (dashboard do dia)  [auth]
/login                  → Login
/signup                 → Cadastro
/journey                → Jornada Diária (5 cards)  [auth]
/journey/result         → Resultado diário consolidado  [auth]
/play/[gameId]          → Partida (diária) de um jogo  [auth]
/infinite               → Seleção de jogos (modo infinito)  [auth]
/infinite/[gameId]      → Partida infinita  [auth]
/profile                → Perfil e progressão  [auth]
/ranking                → Ranking (diário | semanal)  [auth]
```

Fluxo: `Home → Journey → Play → (resultado inline) → Journey → … → Result`. Modo Infinito é ramo paralelo a partir de Home/Journey.

---

## 7. Arquitetura

### 7.1 Visão geral

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js (App Router) — TypeScript estrito                   │
│                                                              │
│  app/            → rotas, layouts, telas (Server + Client)   │
│  components/     → UI pura (design system) + widgets         │
│  features/       → orquestração por domínio (journey, auth…) │
│  games/          → MÓDULOS DE JOGO (1 pasta por jogo)        │
│    core/         → contratos (GameModule<...>), registry     │
│    mysteryCountry/  scoring/ rules/ data/ ui/ index.ts       │
│  lib/            → scoring, streak, stars, xp, daily-seed…   │
│    firebase/     → client (web) + admin (servidor) + auth    │
│  server/         → casos de uso + acesso a dados (Firestore) │
│    actions/      → Server Actions (mutations)                │
│    repo/         → acesso a dados Firestore (Admin SDK)      │
│  content/        → fontes de conteúdo desacopladas (adapters)│
│                                                              │
│  Firestore (Admin SDK)   Firebase Auth (e-mail/senha)   Zod  │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Princípios

- **Regras de negócio fora dos componentes.** UI só renderiza e dispara ações; toda pontuação/validação/streak vive em `lib/` e `server/`.
- **Módulos de jogo plugáveis.** Adicionar um jogo = criar `games/<id>/` implementando o contrato + registrar no `registry`. Nenhuma outra parte do app muda.
- **Servidor é a autoridade.** Resposta correta, pontuação oficial, conclusão, streak, ranking e conquistas são calculados/validados no servidor. O cliente nunca envia a pontuação final "pronta".
- **Conteúdo desacoplado.** Jogos recebem dados via *content adapters*; a fonte (JSON local, API pública) pode trocar sem mexer na lógica.
- **Separação clara de camadas:** interface | lógica de jogo | persistência | auth | geração de desafio | pontuação | ranking | conquistas | conteúdo.

### 7.3 Fluxo de uma partida diária (seguro)

```
1. Cliente pede jogar gameId do dia → Server Action `startSession`.
2. Servidor garante o DailyChallenge do dia (cria se 1ª req: seed = hash(data)).
3. Servidor cria/retoma GameSession (idempotente por user+challenge+game).
4. Cliente joga; a cada palpite chama `submitGuess` (Server Action):
     - servidor valida payload (Zod), aplica regra do jogo, atualiza estado.
5. Ao concluir → servidor calcula pontuação (lib/scoring do módulo),
   grava GameSession, e se for a 1ª conclusão grava OfficialDailyResult.
6. Servidor reavalia streak, XP/nível e dispara motor de conquistas.
7. Cliente recebe só o resultado (pontos, estrelas, feedback) — nunca a resposta antecipada.
```

---

## 8. Modelo de dados (Firestore)

Firestore é NoSQL orientado a documentos. As "entidades" do briefing viram
**coleções/documentos**; relações 1–N viram **subcoleções** ou referências por id.
A identidade do usuário é gerenciada pelo **Firebase Auth** (`uid`).

| Coleção / caminho | Papel | Chave / notas |
|-------------------|-------|---------------|
| `profiles/{uid}` | Perfil + progresso agregado | doc por `uid`. Inclui username, avatar, xp, level, currentStreak, longestStreak, lastCompletedKey, totalScore, gamesCompleted (**UserStreak/UserExperience viram campos aqui**) |
| `games/{gameId}` | Catálogo estático de jogos | id = GameId |
| `dailyChallenges/{dateKey}` | Desafio de uma data | id = `YYYY-MM-DD` |
| `dailyChallenges/{dateKey}/games/{gameId}` | Conteúdo/seed do jogo naquele dia | guarda `seed`, `payload` público e a **resposta secreta** (nunca exposta ao cliente por rules) |
| `gameSessions/{uid}/plays/{sessionId}` | Uma partida (diária/infinita) | estado serializado, tentativas, score, início/fim, modo |
| `officialResults/{uid_dateKey_gameId}` | 1ª pontuação oficial | **id determinístico → idempotência** (equivale ao `unique(user, dailyGameChallenge)`) |
| `dailyScores/{dateKey}/users/{uid}` | Agregado p/ **ranking diário** | `{ total, username }` atualizado em transação |
| `weeklyScores/{weekKey}/users/{uid}` | Agregado p/ **ranking semanal** | idem, chave ISO da semana |
| `achievements/{achievementId}` | Catálogo de conquistas | — |
| `userAchievements/{uid}/unlocked/{achievementId}` | Conquista desbloqueada | `{ unlockedAt }`; unicidade pelo id |

**Decisões de modelagem:**
- **Idempotência do resultado oficial:** id do doc = `uid_dateKey_gameId`. A gravação
  usa **transação** (`recordOfficialResult` em `src/server/repo/firestore.ts`): se o
  doc existe, não faz nada; senão cria e incrementa os agregados de ranking + streak.
- **Ranking pré-agregado:** em vez de varrer `officialResults` a cada leitura,
  mantemos `dailyScores`/`weeklyScores` somados na escrita — leitura de ranking é O(1) + `orderBy(total)`.
- **Streak/XP como campos do `profiles`** (sempre lidos juntos; evita coleções 1–1 desnecessárias).
- **Segurança:** o cliente **não escreve** em `officialResults`, `dailyScores`,
  `weeklyScores`, `dailyChallenges`, `profiles` — só o **Admin SDK** (servidor). Ver `firestore.rules`.

> Coleções de "sessão" do Firebase Auth (tokens) são gerenciadas pelo próprio
> serviço; não há tabela de sessão manual.

---

## 9. Sistema de módulos de jogos

Cada jogo é um **módulo autocontido** que implementa um contrato TypeScript. Contrato central (`games/core/types.ts`):

```ts
interface GameModule<Challenge, State, Guess, Result> {
  meta: GameMeta;                              // id, nome, descrição, ícone, tema
  generateChallenge(seed: string): Challenge;  // determinístico p/ o dia
  initialState(challenge: Challenge): State;    // estado inicial da partida
  applyGuess(ctx): { state; feedback; finished };// aplica 1 tentativa (server)
  isSolved(state): boolean;
  score(state, challenge): number;              // 0..1000, isolado da UI
  toResult(state, challenge): Result;           // resumo p/ persistir/exibir
  // UI é acoplada por registro separado (client), não no contrato de lógica.
}
```

- **Lógica** (`generateChallenge`, `applyGuess`, `score`) roda no **servidor** e é testável isoladamente.
- **UI** (`ui/`) é registrada num `uiRegistry` client-side por `gameId`, mantendo a lógica livre de React.
- **Registry** (`games/core/registry.ts`) mapeia `gameId → GameModule`. Novos jogos: 1 pasta + 1 linha no registry.

---

## 10. Estratégia de desafio diário

- **Chave do dia:** data local (America/Sao_Paulo) no formato `YYYY-MM-DD`. Função `getDailyKey(now, tz)` central.
- **Seed determinística:** `seed = sha256(dailyKey + gameId)`. Cada jogo gera seu conteúdo a partir do seed → **todos os usuários veem o mesmo desafio**, e é reproduzível.
- **Persistência:** na 1ª requisição do dia, o servidor materializa `DailyChallenge` + `DailyGameChallenge` (guardando o payload e a resposta secreta). Requisições seguintes reusam.
- **Antifraude:** a resposta secreta nunca vai ao cliente; o cliente só recebe pistas/estado. Validação de palpite acontece no servidor.
- **Virada:** à meia-noite America/Sao_Paulo surge um novo `dailyKey`. Dias passados existem no banco (replay futuro), mas não recuperam streak nem alteram ranking passado.

---

## 11. Estratégia de pontuação

- **Central e configurável** em `lib/scoring.ts` + por-jogo em `games/<id>/scoring.ts`.
- Cada jogo: `score ∈ [0, 1000]`. Máx diário 5000.
- **Estrelas:** `lib/stars.ts` → `scoreToStars(score, thresholds)` com limiares configuráveis (default P8).
- **Oficial vs. rodada:** pontuação oficial = 1ª conclusão do jogo naquele dia (server grava `OfficialDailyResult` uma única vez). Replays/infinito geram `GameSession` mas **não** tocam a oficial.
- **XP/Nível:** `lib/xp.ts` → `levelFromXp(xp)` (curva configurável, ex.: `xp = base * level^1.5`). MVP: só nível geral da conta.
- Fórmulas específicas ficam **isoladas da UI** e cobertas por testes.

---

## 12. Estratégia de autenticação (Firebase Auth)

- **Firebase Auth** com **e-mail/senha**. O Firebase cuida do hash de senha e da
  sessão — não guardamos senha no nosso banco.
- **Cliente** (`src/lib/firebase/auth.ts`): `signUp`, `signIn`, `signOut`, `getIdToken`.
- **Servidor é a autoridade do perfil:** após o registro, o cliente envia o
  **ID token**; a Server Action `createProfile` **verifica o token** (Admin SDK) e
  materializa `profiles/{uid}`. Nenhuma escrita de perfil parte do browser.
- **Autorização de ações:** Server Actions sensíveis (ex.: gravar pontuação oficial)
  recebem o ID token, verificam via `verifyIdToken` e obtêm o `uid` de forma confiável.
- **Extensível:** adicionar Google/Discord = habilitar o provider no Console + botão; sem reescrever telas.
- **Modo demo:** sem credenciais no `.env`, login/cadastro seguem para a home e a
  persistência é pulada — o app roda para desenvolvimento de UI.
- Validação de entradas com **Zod**; regras do Firestore travam o acesso do cliente (§16).

---

## 13. Estratégia de testes

- **Vitest** para lógica pura (rápido, sem DOM): scoring, estrelas, XP, streak, `getDailyKey`, regras de cada jogo, geração determinística de desafio.
- **Testing Library** para componentes-chave (cards, estrelas, estados de loading/erro/vazio).
- **Testes de integração** dos Server Actions críticos (`submitGuess`, `startSession`, idempotência do `OfficialDailyResult`) com banco de teste (SQLite/Postgres efêmero) — planejado; no MVP focar unit + os de idempotência.
- Meta de cobertura inicial: **lógica de pontuação, streak e regras do 1º jogo 100% cobertas**.
- CI: `lint` + `typecheck` + `test` em cada push (GitHub Actions) — configurar na Fase 3/6.

---

## 14. Riscos técnicos

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Fuso horário/virada diária incorreta | Streak e desafio errados | Função central `getDailyKey` com tz explícito + testes de borda (23:59/00:01). |
| Determinismo do desafio quebrar entre ambientes | Usuários veem desafios diferentes | Seed via hash estável; materializar no banco na 1ª req e sempre reusar. |
| Manipulação de pontuação pelo cliente | Ranking injusto | Toda validação/score no servidor; resposta secreta nunca enviada; idempotência. |
| Retomada de sessão inconsistente | Estado corrompido | Estado serializado versionado; validação Zod ao retomar; transações. |
| Acoplamento lógica↔UI dos jogos | Difícil escalar p/ N jogos | Contrato `GameModule` + registry; UI separada. |
| Custo/latência de Postgres em serverless | Timeouts | Connection pooling (Prisma Data Proxy/Neon serverless driver). |
| Envio duplicado de resultado | Pontuação dobrada | `unique(user, dailyGameChallenge)` + upsert idempotente. |

---

## 15. Riscos de conteúdo e propriedade intelectual

- **Pokémon, animes, filmes, séries e franquias são IP protegido.** No MVP tratamos como **protótipo de desenvolvimento**.
- **Não** incluir imagens, áudios, vídeos ou sprites protegidos no repositório.
- Usar **placeholders, dados textuais, ícones genéricos, silhuetas provisórias** e APIs públicas **quando os termos permitirem** (ex.: PokéAPI para atributos textuais; dados de países de fontes abertas).
- Fontes de conteúdo **desacopladas** (content adapters) → substituíveis por dados licenciados depois.
- Antes de qualquer uso comercial: revisão jurídica de licenças/uso de marcas. Registrado como risco aberto.

---

## 16. Segurança e integridade

- **Nunca confiar no cliente** para: resposta correta, pontuação oficial, conclusão, streak, ranking, conquistas.
- **Idempotência:** doc `officialResults/{uid_dateKey_gameId}` único; gravação em transação (não duplica).
- **Firestore rules:** cliente não escreve pontuação/streak/ranking/conquistas/desafio — só o Admin SDK (`firestore.rules`).
- **Autorização:** Server Actions verificam o **ID token** (Admin) antes de gravar em nome do usuário.
- **Validação de payloads:** Zod em toda entrada de Server Action.
- **Rate limiting:** Firebase Auth já limita tentativas de login; para o submit, limitador por uid/IP (App Check/Upstash) fica p/ Fase 6.
- **Partidas abandonadas:** ficam "em andamento"; expiram na virada do dia; não contam pontuação.
- **Segredos** fora do repo (`.env` git-ignored; `.env.example` com placeholders).

---

## 17. Backlog dividido em fases

**Fase 3 — Fundação** ✅
- [x] Scaffold Next.js + TS estrito + Tailwind + ESLint/Prettier.
- [x] Contratos centrais (`games/core`), registry, libs (scoring/stars/xp/streak/daily-seed).
- [x] `.env.example`; dados fictícios; estados de loading/erro/vazio; README de execução.

**Fase 4 — Interface inicial (mock)** ✅
- [x] Design system (tokens, botões, cards, estrelas, progresso, feedback).
- [x] Telas: login, cadastro, home, jornada, seleção (infinito), perfil, ranking, resultado.

**Fase 5 — Primeiro jogo (País Misterioso)** ✅
- [x] Base local de países; geração determinística; pistas progressivas; palpites; score.
- [x] Resultado oficial idempotente, replay sem sobrescrever; testes; integração à jornada.

**Fase 5.5 — Backend Firebase** ✅ *(pivô)*
- [x] Firestore rules + índices; Admin/Client SDK; Firebase Auth (e-mail/senha); seed do Firestore.
- [x] Persistência idempotente da pontuação oficial + agregados de ranking + streak (transação).
- [ ] Preencher credenciais no `.env` e validar ao vivo (aguardando config do usuário).

**Fase 6 — Endurecimento**
- [ ] Materializar `dailyChallenges` no Firestore; sessões persistidas; motor de conquistas gravando; App Check/rate limit; CI; deploy.

**Fase 7+ — Expansão**
- [ ] Demais 4 jogos; login social; ranking de amigos; gerações Pokémon; variações Pin do Mundo.

---

## 18. Como executar (resumo — detalhes no README)

```bash
npm install
npm run dev                 # http://localhost:3000 (modo demo, sem Firebase)

# Para auth + persistência reais:
cp .env.example .env        # preencher NEXT_PUBLIC_FIREBASE_* e FIREBASE_* (admin)
npm run seed                # popula jogos e conquistas no Firestore
npm run test                # testes de lógica
```
