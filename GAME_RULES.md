# GeekDaily — Regras Preliminares dos Jogos

> **Status:** Rascunho (Fase 2). Regras sujeitas a ajuste durante a implementação.
> Todos os jogos: pontuação `∈ [0, 1000]`. Estrelas via função central (`0–399 → 1★`, `400–749 → 2★`, `750–1000 → 3★`).
> A **resposta correta e a pontuação oficial são sempre calculadas no servidor.**

---

## Convenções comuns

- **Desafio diário:** conteúdo determinado por `seed = hash(data + gameId)`. Todos veem o mesmo.
- **Pontuação oficial:** a **primeira** conclusão do jogo no dia. Replays não sobrescrevem.
- **Modo infinito:** conteúdo aleatório; não afeta pontuação oficial nem streak.
- **Feedback sem depender só de cor:** usar ícones/texto além de cor (acessibilidade).
- **Textos curtos durante a partida.**

---

## 3.1 Pin do Mundo *(MVP: contrato + mock; jogável em fase posterior)*

**Objetivo:** dado o **nome de um país**, clicar no mapa-múndi onde ele fica.

**Regras:**
- 1 rodada = 1 país (na jornada diária, 1 país do dia).
- O jogador dá **um clique** no mapa (lat/long).
- Pontuação baseada principalmente na **distância** entre o clique e o centroide correto.

**Pontuação (proposta):**
```
d = distância(clique, alvo) em km  (haversine)
score = round(1000 * max(0, 1 - d / D_max)),  D_max ≈ 5000 km
# opcional: bônus por rapidez, penalidade suave por país muito grande
```
- `d = 0` → 1000; `d ≥ D_max` → 0. Curva linear no MVP (trocável por exponencial).

**Estado:** `{ clickLatLng?, submitted, distanceKm? }`.
**Expansões futuras:** capitais, cidades, estados, monumentos, pontos turísticos.
**IP/Conteúdo:** usar mapa/base geográfica de fonte aberta; sem imagens protegidas.

---

## 3.2 País Misterioso ⭐ *(PRIMEIRO JOGO FUNCIONAL — referência arquitetural)*

**Objetivo:** descobrir o **país secreto** do dia com o mínimo de pistas e tentativas.

**Regras:**
- O país secreto é determinístico por dia.
- Pistas **progressivas**, reveladas uma a uma (ordem do mais difícil ao mais fácil):
  1. Continente
  2. População aproximada (faixa)
  3. Idioma oficial
  4. Países vizinhos (quantidade / nomes)
  5. Capital
  6. Silhueta (placeholder no MVP)
  7. Bandeira (placeholder/ícone genérico no MVP)
- O jogador pode **pedir a próxima pista** (custa pontos) ou **arriscar um palpite** (seleção/busca entre países).
- **Máximo de tentativas:** 6 palpites.
- Cada palpite errado revela automaticamente a próxima pista.

**Pontuação (proposta, `lib`/`games/mysteryCountry/scoring.ts`):**
```
BASE            = 1000
CUSTO_PISTA     = 80    # por pista revelada além da 1ª (a 1ª é grátis)
CUSTO_TENTATIVA = 60    # por palpite errado
score = clamp(BASE - pistasExtras*CUSTO_PISTA - errados*CUSTO_TENTATIVA, 0, 1000)
# acerto de primeira, com só a pista inicial → 1000 (3★)
```
- Não acertou em 6 tentativas → `score = 0` (1★), revela a resposta.

**Estado serializado:**
```ts
{ revealedClues: number;      // quantas pistas abertas (>=1)
  guesses: string[];          // países tentados (ids)
  finished: boolean;
  solved: boolean }
```

**Validação (servidor):** compara `guessCountryId` com a resposta secreta; nunca envia a resposta ao cliente antes do fim.

**Base de dados local (MVP):** ~30–40 países com `{ id, name, continent, capital, languages, neighbors[], populationBucket, region }`. Fonte textual desacoplada (substituível por API depois).

---

## 3.3 PokéGuess *(MVP: contrato + mock)*

**Objetivo:** descobrir o **Pokémon secreto** (1ª geração / 151 no MVP) por comparação de atributos.

**Regras:**
- A cada palpite, o sistema compara atributos do palpite vs. resposta e sinaliza cada um:
  - **igual** / **diferente** / **maior** / **menor** (para numéricos).
- Atributos: geração, tipo primário, tipo secundário, altura, peso, cor, estágio evolutivo, região.
- Sem limite rígido de palpites no MVP (ou limite generoso, ex.: 8); pontuação cai com o nº de tentativas.

**Pontuação (proposta):**
```
score = round(1000 * max(0, 1 - (tentativasAteAcerto - 1) / N)),  N ≈ 8
# acerto de primeira → 1000
```
**Conquista relacionada:** acertar na 1ª tentativa.
**Conteúdo/IP:** atributos **textuais** via PokéAPI (respeitando termos); **sem sprites/artes protegidas** — usar silhueta/ícone genérico. Arquitetura permite gerações futuras.

---

## 3.4 Geek Connections *(MVP: contrato + mock)*

**Objetivo:** dos **16 termos**, formar **4 grupos de 4** relacionados.

**Regras:**
- Grupos temáticos (Pokémon, anime, filmes, séries, personagens, games, consoles, franquias, poderes, itens, lugares fictícios).
- O jogador seleciona 4 termos e "confirma um grupo".
- **Máximo de erros:** 4 tentativas erradas → fim (estilo NYT Connections).
- Dificuldade opcional por cor/nível dos grupos.

**Pontuação (proposta):**
```
gruposCertos ∈ [0..4]
score = round( (gruposCertos/4) * 1000 * fatorErros )
fatorErros = max(0.4, 1 - errosCometidos*0.15)
# 4 grupos sem erro → 1000 (conquista: resolver sem erros)
```
**Estado:** `{ solvedGroups: string[][], mistakes: number, remaining: string[] }`.
**Conteúdo/IP:** apenas **termos textuais**; sem imagens.

---

## 3.5 Quem Veio Primeiro? *(MVP: contrato + mock)*

**Objetivo:** ordenar **4–5 itens** em ordem **cronológica** (mais antigo → mais recente).

**Regras:**
- Itens: filmes, séries, animes, mangás, games, consoles, gerações Pokémon, franquias, personagens, acontecimentos geek — cada um com uma **data/ano** de referência.
- O jogador arrasta/ordena os itens e confirma.
- Pontuação por **quão próxima** a ordem está da correta (não tudo-ou-nada).

**Pontuação (proposta):**
```
# usa distância de ordenação (nº de pares fora de ordem / máximo possível)
paresErrados = inversões(ordemJogador vs correta)
maxPares     = n*(n-1)/2
score = round(1000 * (1 - paresErrados/maxPares))
# ordem perfeita → 1000 (conquista: ordenar tudo certo)
```
**Estado:** `{ order: string[], submitted: boolean }`.
**Conteúdo/IP:** títulos/anos **textuais**; sem capas/pôsteres protegidos.

---

## Resumo de pontuação por jogo

| Jogo | Sinal principal | Máx | Conquista associada |
|------|-----------------|-----|---------------------|
| Pin do Mundo | distância do clique | 1000 | localização muito próxima |
| País Misterioso | pistas + tentativas | 1000 | (via jornada/streak) |
| PokéGuess | nº de tentativas | 1000 | acerto na 1ª tentativa |
| Geek Connections | grupos certos − erros | 1000 | resolver sem erros |
| Quem Veio Primeiro | inversões na ordem | 1000 | ordenar tudo certo |
