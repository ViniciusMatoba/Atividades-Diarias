# Como adicionar um novo jogo

A arquitetura é **plugável**: um jogo é um módulo que implementa o contrato
`GameModule` (`src/games/core/types.ts`). A lógica é pura (roda no servidor,
testável sem React) e a UI é separada. Adicionar um jogo **não exige** mexer na
Server Action, na persistência nem no ranking.

Use `mystery-country` e `who-came-first` como referências.

## Passos

### 1. Crie a pasta `src/games/<seuJogo>/`

```
src/games/<seuJogo>/
  data/           # conteúdo textual desacoplado (substituível por API depois)
  scoring.ts      # fórmula de pontuação (0..1000), isolada da UI
  scoring.test.ts
  index.ts        # o módulo (implementa GameModule)
  index.test.ts   # testes de lógica/determinismo/regras
  ui/<Seu>Game.tsx# componente client (só renderiza + chama submitGuess)
```

### 2. Implemente o contrato `GameModule<Challenge, Public, State, Guess>` em `index.ts`

Métodos obrigatórios:

| Método | Responsabilidade | Regra |
|--------|------------------|-------|
| `meta` | id, nome, descrição, ícone (lucide), tema, ordem | id ∈ `GameId` |
| `generateChallenge(seed)` | monta o desafio **determinístico** | mesma seed → mesmo desafio |
| `initialState(challenge)` | estado inicial da partida | serializável |
| `parseState(raw)` | valida o estado vindo do cliente (Zod) | lança se inválido |
| `parseGuess(raw)` | valida o palpite (Zod) | lança se inválido |
| `applyGuess(challenge, state, guess)` | aplica 1 jogada; **não muta** o estado | define `finished`/`solved` |
| `score(challenge, state)` | pontuação final `∈ [0,1000]` | isolada da UI |
| `toPublic(challenge, state)` | visão enviada ao cliente | **nunca** revela a resposta antes de `finished` |
| `toResult(challenge, state)` | resumo p/ persistir | — |

> ⚠️ **Segurança:** a resposta secreta fica só no `Challenge` (servidor).
> `toPublic` só pode revelá-la quando `state.finished` for `true`.
> Determinismo: use os helpers de `src/games/core/seed.ts` (`hashSeed`, `makeRng`).

### 3. Registre no `registry` (1 linha)

Em `src/games/core/registry.ts`:

```ts
import { seuJogo } from "../seuJogo";
const modules = {
  "mystery-country": mysteryCountry,
  "who-came-first": whoCameFirst,
  "seu-jogo": seuJogo,   // <— aqui
};
```

E use `seuJogo.meta` no `GAME_CATALOG` (em vez de duplicar os metadados).
Se for um `GameId` novo, adicione-o ao union em `src/games/core/types.ts`.

### 4. Crie a UI em `ui/<Seu>Game.tsx` (client)

O componente **não contém regra de negócio** — só renderiza o estado e chama a
Server Action genérica:

```ts
import { submitGuess } from "@/server/actions/game";
// ...
const res = await submitGuess({
  gameId: "seu-jogo",
  dateKey,
  state,            // estado atual (validado por parseState no servidor)
  guess,            // palpite (validado por parseGuess no servidor)
  mode,             // "daily" | "infinite"
  ...(idToken ? { idToken } : {}),
});
```

A `submitGuess` cuida sozinha de: rederivar o desafio, validar, aplicar,
pontuar e — no modo diário, ao terminar — gravar o **resultado oficial**
idempotente + agregados de ranking + streak + XP. Chame `refresh()` do
`useAuthCtx` quando `res.recordedOfficial` for `true`.

### 5. Conecte na página de partida

Em `src/app/play/[gameId]/page.tsx`, adicione um ramo que monta o desafio no
**servidor** e passa só o `toPublic` para o componente client (veja
`WhoCameFirstReference`).

### 6. Escreva testes

Cubra: determinismo de `generateChallenge`, imutabilidade de `applyGuess`,
pontuação (perfeito/pior caso/parcial), `finished`/`solved`, e que `toPublic`
não vaza a resposta antes do fim. Rode `npm run test`.

## Checklist

- [ ] `data/` textual, sem material protegido (IP) — placeholders/factuais
- [ ] `generateChallenge` determinístico + teste
- [ ] `toPublic` não vaza resposta antes de `finished` + teste
- [ ] `score` isolado + testes de borda
- [ ] registrado no `registry` e no catálogo
- [ ] UI client só chama `submitGuess`
- [ ] ramo na página `play/[gameId]`
- [ ] `npm run typecheck && npm run lint && npm run test` verdes
