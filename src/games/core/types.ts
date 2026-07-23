/**
 * Contratos centrais do sistema de módulos de jogo.
 *
 * Cada jogo é um módulo autocontido que implementa `GameModule`. A LÓGICA
 * (geração de desafio, aplicação de palpite, pontuação) é pura e roda no
 * servidor — sem React. A UI é registrada separadamente (ver ui-registry no
 * lado do cliente), mantendo regras de negócio fora dos componentes.
 *
 * Genéricos:
 *   TChallenge - dados do desafio (inclui a resposta secreta; nunca vai ao cliente cru)
 *   TPublic    - visão pública do desafio enviada ao cliente (sem a resposta)
 *   TState     - estado serializável da partida
 *   TGuess     - payload de um palpite (validado por Zod antes de aplicar)
 */

export type GameId =
  | "mystery-country"
  | "world-pin"
  | "poke-guess"
  | "geek-connections"
  | "who-came-first";

export type GameTheme = "geo" | "pokemon" | "anime" | "movies" | "geek";

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  /** Nome do ícone lucide-react (desacoplado do componente). */
  icon: string;
  theme: GameTheme;
  /** Ordem sugerida de exibição na jornada. */
  order: number;
}

/** Resultado da aplicação de um palpite. */
export interface GuessOutcome<TState> {
  state: TState;
  /** Feedback textual/estruturado para a UI (sem revelar a resposta antes do fim). */
  feedback: GuessFeedback;
  finished: boolean;
  solved: boolean;
}

export interface GuessFeedback {
  correct: boolean;
  message: string;
  /** Dados extras específicos do jogo (comparações, distância, etc.). */
  details?: Record<string, unknown>;
}

/** Resultado final de uma partida, pronto para persistir e exibir. */
export interface GameResult {
  score: number; // 0..1000
  solved: boolean;
  attempts: number;
  /** Resumo específico do jogo (ex.: país correto, distância). */
  summary: Record<string, unknown>;
}

/**
 * Contrato de lógica de um jogo. Implementações vivem em `games/<id>/index.ts`.
 */
export interface GameModule<TChallenge, TPublic, TState, TGuess> {
  meta: GameMeta;

  /** Gera o desafio de forma determinística a partir de uma seed (mesma seed → mesmo desafio). */
  generateChallenge(seed: string): TChallenge;

  /** Projeta o desafio para a visão pública enviada ao cliente (esconde a resposta). */
  toPublic(challenge: TChallenge, state: TState): TPublic;

  /** Estado inicial de uma nova partida. */
  initialState(challenge: TChallenge): TState;

  /** Valida e normaliza um palpite bruto (lançar em caso de payload inválido). */
  parseGuess(raw: unknown): TGuess;

  /** Aplica um palpite ao estado (servidor). Não muta o estado recebido. */
  applyGuess(challenge: TChallenge, state: TState, guess: TGuess): GuessOutcome<TState>;

  /** Calcula a pontuação final (0..1000). Isolado da UI. */
  score(challenge: TChallenge, state: TState): number;

  /** Monta o resultado final. */
  toResult(challenge: TChallenge, state: TState): GameResult;
}

/** Assinatura mínima usada pelo registry sem conhecer os genéricos concretos. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyGameModule = GameModule<any, any, any, any>;
