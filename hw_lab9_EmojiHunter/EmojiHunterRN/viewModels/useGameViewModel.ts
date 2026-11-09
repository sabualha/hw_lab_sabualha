import { useEffect, useReducer, useState } from 'react';
import { EmojiSearchStatus } from '../models/Emoji';
import { gameReducer, initialGameState } from './gameReducer';

export function useGameViewModel() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  // model loading is tracked separately from the game state
  const [tensorLoaded, setTensorLoaded] = useState(false);

  // Countdown: only tick while we're actively searching and the ML model has finished loading.
  useEffect(() => {
    if (!tensorLoaded) return;
    if (state.emojiStatus !== EmojiSearchStatus.Searching) return;
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, [tensorLoaded, state.emojiStatus]);

  // expose state + actions to the view
  return {
    ...state,
    tensorLoaded,
    setTensorLoaded,
    foundEmoji: () => dispatch({ type: 'foundEmoji' }),
    startNext: () => dispatch({ type: 'nextEmoji' }),
    restart: () => dispatch({ type: 'restart' }),
  };
}
