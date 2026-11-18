import GameStateManager from '../models/GameStateManager';
import { Constants } from '../models/Constants';

describe('GameStateManager', () => {
  beforeEach(() => {
    GameStateManager.instance.resetGame();
  });

  test('starts at level 1 with full lives and zero score', () => {
    expect(GameStateManager.instance.currentLevel).toBe(1);
    expect(GameStateManager.instance.lives).toBe(Constants.Player.startingLives);
    expect(GameStateManager.instance.score).toBe(0);
  });

  test('advanceToNextLevel increments currentLevel', () => {
    GameStateManager.instance.advanceToNextLevel();
    expect(GameStateManager.instance.currentLevel).toBe(2);
  });

  test('resetLevel returns to 1', () => {
    GameStateManager.instance.advanceToNextLevel();
    GameStateManager.instance.advanceToNextLevel();
    GameStateManager.instance.resetLevel();
    expect(GameStateManager.instance.currentLevel).toBe(1);
  });

  test('isMaxLevelReached respects Constants.Game.maxLevels', () => {
    for (let i = 1; i <= Constants.Game.maxLevels; i++) {
      expect(GameStateManager.instance.isMaxLevelReached()).toBe(false);
      GameStateManager.instance.advanceToNextLevel();
    }
    expect(GameStateManager.instance.isMaxLevelReached()).toBe(true);
  });

  test('loseLife decrements and returns the new count', () => {
    const before = GameStateManager.instance.lives;
    const after = GameStateManager.instance.loseLife();
    expect(after).toBe(before - 1);
    expect(GameStateManager.instance.lives).toBe(before - 1);
  });

  test('addScore accumulates', () => {
    GameStateManager.instance.addScore(10);
    GameStateManager.instance.addScore(25);
    expect(GameStateManager.instance.score).toBe(35);
  });

  test('resetGame restores everything', () => {
    GameStateManager.instance.advanceToNextLevel();
    GameStateManager.instance.addScore(500);
    GameStateManager.instance.loseLife();
    GameStateManager.instance.resetGame();
    expect(GameStateManager.instance.currentLevel).toBe(1);
    expect(GameStateManager.instance.score).toBe(0);
    expect(GameStateManager.instance.lives).toBe(Constants.Player.startingLives);
  });
});
