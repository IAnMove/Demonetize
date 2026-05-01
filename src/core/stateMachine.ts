export type GameState =
  | "boot"
  | "intro"
  | "title"
  | "playing"
  | "chapter-transition"
  | "between-waves"
  | "game-over"
  | "victory";

type Listener = (nextState: GameState, previousState: GameState) => void;

const VALID_TRANSITIONS: Record<GameState, GameState[]> = {
  boot: ["intro", "playing"],
  intro: ["title", "playing"],
  title: ["playing", "between-waves"],
  playing: ["chapter-transition", "between-waves", "game-over", "victory"],
  "chapter-transition": ["playing"],
  "between-waves": ["playing"],
  "game-over": ["playing", "between-waves", "title"],
  victory: ["playing", "between-waves", "title"]
};

export function canTransition(
  currentState: GameState,
  nextState: GameState
): boolean {
  return VALID_TRANSITIONS[currentState].includes(nextState);
}

export class GameStateMachine {
  private currentState: GameState;

  private listeners = new Set<Listener>();

  constructor(initialState: GameState) {
    this.currentState = initialState;
  }

  get value(): GameState {
    return this.currentState;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  transition(nextState: GameState): void {
    if (nextState === this.currentState) {
      return;
    }

    const previousState = this.currentState;

    if (import.meta.env?.DEV && !canTransition(previousState, nextState)) {
      console.warn(
        `[stateMachine] unexpected transition ${previousState} -> ${nextState}`
      );
    }

    this.currentState = nextState;

    for (const listener of this.listeners) {
      listener(nextState, previousState);
    }
  }
}
