# GeekDaily 🎮

Web app de **microgames diários** de cultura geek (mapas/países, Pokémon, anime, filmes/séries, games).
Uma jornada diária de ~5–10 min com 5 microgames + modo infinito.

> **Status:** Fundação do MVP (Fases 1–5 da primeira missão). Ver [`PRODUCT_AND_TECH_PLAN.md`](./PRODUCT_AND_TECH_PLAN.md) e [`GAME_RULES.md`](./GAME_RULES.md).

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript estrito**
- **Tailwind CSS v4** (design tokens em `src/app/globals.css`)
- **Firebase**: **Firestore** (dados) + **Firebase Auth** (e-mail/senha)
  - Cliente via Web SDK (`src/lib/firebase/client.ts`)
  - Servidor via **Admin SDK** (`src/lib/firebase/admin.ts`) — autoridade das escritas
- **Zod** para validação de entradas
- **Vitest** para testes de lógica

> Repositório: `https://github.com/ViniciusMatoba/Atividades-Diarias.git`

## Arquitetura em 30 segundos

- Regras de negócio **fora** dos componentes: pontuação/estrelas/xp/streak em `src/lib/`.
- Cada jogo é um **módulo plugável** que implementa `GameModule` (`src/games/core/types.ts`).
  Adicionar um jogo = criar `src/games/<id>/` + 1 linha no `registry`.
- **Servidor é a autoridade**: desafio, validação de palpite e pontuação oficial no servidor;
  a resposta secreta nunca vai ao cliente. Gravação oficial **idempotente** via
  Admin SDK + Firestore transaction (`src/server/repo/firestore.ts`).
- **Firestore rules** (`firestore.rules`) travam o cliente: só o servidor escreve
  pontuação/streak/ranking/conquistas.
- Desafio diário **determinístico** por seed = `hash(data + jogo)` (`src/games/core/seed.ts`).

```
src/
  app/              # rotas e telas (App Router)
  components/       # design system (ui/) + widgets
  games/
    core/           # contratos (GameModule), registry, seed
    mysteryCountry/ # 1º jogo funcional (lógica + dados + UI + testes)
  lib/
    firebase/       # client.ts (web) + admin.ts (servidor) + auth.ts
    ...             # scoring, stars, xp, streak, dailyKey, achievements, validation
  server/
    actions/        # Server Actions (autoridade do servidor)
    repo/           # acesso a dados Firestore (Admin SDK)
firestore.rules · firebase.json · .firebaserc · scripts/seedFirestore.ts
```

## Como executar localmente

Pré-requisitos: Node 20+ e (para persistência real) um projeto Firebase.

```bash
npm install

# 1) Rodar o app com dados fictícios (SEM Firebase — modo demo):
npm run dev            # http://localhost:3000

# 2) Qualidade:
npm run test           # testes de lógica (Vitest)
npm run typecheck      # TypeScript estrito
npm run lint           # ESLint

# 3) Firebase (para auth + persistência reais):
cp .env.example .env   # preencher NEXT_PUBLIC_FIREBASE_* e FIREBASE_* (admin)
npm run seed           # popula catálogo de jogos e conquistas no Firestore
npx firebase deploy --only firestore:rules,firestore:indexes   # regras/índices
```

> **Config Firebase:** no Console → habilite Authentication (E-mail/senha) e
> crie o Firestore. As chaves do cliente ficam em `NEXT_PUBLIC_FIREBASE_*`; a
> service account (admin) em `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY`.

> As telas usam **dados fictícios** (`src/lib/mock.ts`) nesta fase. O jogo
> **País Misterioso** é jogável de verdade em `/play/mystery-country`, com a
> lógica validada no servidor.

## O que já funciona

- **Firebase ao vivo:** cadastro/login (Firebase Auth), perfil no Firestore,
  pontuação oficial idempotente, ranking agregado, streak e XP — validado E2E.
- **2 jogos jogáveis:** País Misterioso (pistas progressivas) e Quem Veio
  Primeiro? (ordenação cronológica), ambos via a Server Action genérica.
- Home, Jornada e Perfil lêem **dados reais** do usuário logado.
- Telas ainda em mock: Ranking e Resultado do dia.
- 67 testes: pontuação, estrelas, XP, streak, chave diária/semana (fuso), seed,
  conquistas e regras dos jogos.

## Adicionar um novo jogo

Veja **[docs/ADDING_A_GAME.md](./docs/ADDING_A_GAME.md)** — a arquitetura é
plugável (implementar `GameModule` + 1 linha no registry).

## Próximos passos

Ver o backlog em [`PRODUCT_AND_TECH_PLAN.md` §17](./PRODUCT_AND_TECH_PLAN.md).
