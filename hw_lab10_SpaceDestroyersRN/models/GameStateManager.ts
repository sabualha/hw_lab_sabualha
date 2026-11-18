import { Constants } from './Constants';

class GameStateManager {
  private static _instance: GameStateManager | null = null;

  private _currentLevel = 1;
  private _score = 0;
  private _lives = Constants.Player.startingLives;

  private constructor() {}

  static get instance(): GameStateManager {
    if (!this._instance) this._instance = new GameStateManager();
    return this._instance;
  }

  get currentLevel() { return this._currentLevel; }
  get score()        { return this._score; }
  get lives()        { return this._lives; }

  advanceToNextLevel() { this._currentLevel += 1; }
  resetLevel()         { this._currentLevel = 1; }
  isMaxLevelReached() { return this._currentLevel > Constants.Game.maxLevels; }

  addScore(points: number) { this._score += points; }
  loseLife(): number { this._lives -= 1; return this._lives; }

  resetGame() {
    this._currentLevel = 1;
    this._score = 0;
    this._lives = Constants.Player.startingLives;
  }
}

export default GameStateManager;
