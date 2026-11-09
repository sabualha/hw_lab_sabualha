import { EmojiSearchStatus, emojiObjects } from '../models/Emoji';

// seconds per round
export const ROUND_DURATION = 10;

export type GameState = {
  currentLevel: number;
  timeRemaining: number;
  emojiStatus: EmojiSearchStatus;
  showNext: boolean;
};

// start at the first emoji with full time
export const initialGameState: GameState = {
  currentLevel: 0,
  timeRemaining: ROUND_DURATION,
  emojiStatus: EmojiSearchStatus.Searching,
  showNext: false,
};

export type GameAction =
  | { type: 'tick' }
  | { type: 'foundEmoji' }
  | { type: 'nextEmoji' }
  | { type: 'restart' };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'tick':
      // Ticks are ignored unless we're actively searching.
      if (state.emojiStatus !== EmojiSearchStatus.Searching) return state;
      if (state.timeRemaining > 1) {
        return { ...state, timeRemaining: state.timeRemaining - 1 };
      }
      // ran out of time
      return {
        ...state,
        timeRemaining: 0,
        emojiStatus: EmojiSearchStatus.NotFound,
        showNext: true,
      };

    case 'foundEmoji':
      // Only "found" while we're actively searching; ignore late callbacks.
      if (state.emojiStatus !== EmojiSearchStatus.Searching) return state;
      return { ...state, emojiStatus: EmojiSearchStatus.Found, showNext: true };

    case 'nextEmoji':
      // last emoji done -> game over
      if (state.currentLevel >= emojiObjects.length - 1) {
        return { ...state, emojiStatus: EmojiSearchStatus.GameOver };
      }
      return {
        ...state,
        currentLevel: state.currentLevel + 1,
        timeRemaining: ROUND_DURATION,
        emojiStatus: EmojiSearchStatus.Searching,
        showNext: false,
      };

    case 'restart':
      // back to the start
      return initialGameState;
  }
}
