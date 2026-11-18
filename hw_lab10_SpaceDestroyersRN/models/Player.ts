import { Constants } from './Constants';
import type { Bounds } from './Bullet';

export class Player {
  id = 'player';
  width = Constants.Player.width;
  height = Constants.Player.height;
  x: number;
  y: number;
  velocityX = 0;
  isAlive = true;
  lastFireTime = 0;
  imageIndex: 1 | 2 = 1;
  private screenWidth: number;
  private screenHeight: number;

  constructor(screenWidth: number, screenHeight: number) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    this.x = (screenWidth - this.width) / 2;
    this.y = screenHeight - this.height - Constants.Player.bottomOffset;
  }

  setVelocity(accelerationX: number) {
    const raw = accelerationX * Constants.Input.tiltSensitivity;
    const cap = Constants.Input.maxSpeed / Constants.Game.fps;
    this.velocityX = Math.max(-cap, Math.min(cap, raw));
  }

  update() {
    this.x += this.velocityX;
    const rightBound = this.screenWidth - this.width - 20;
    this.x = Math.max(Constants.Layout.leftBound, Math.min(rightBound, this.x));
  }

  canFire(): boolean {
    const now = Date.now();
    if (now - this.lastFireTime > Constants.Player.fireCooldown) {
      this.lastFireTime = now;
      return true;
    }
    return false;
  }

  getBulletSpawnPosition() {
    return { x: this.x + this.width / 2, y: this.y };
  }

  toggleImage() { this.imageIndex = this.imageIndex === 1 ? 2 : 1; }

  getBounds(): Bounds {
    return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
  }

  kill()     { this.isAlive = false; }
  respawn() {
    this.x = (this.screenWidth - this.width) / 2;
    this.y = this.screenHeight - this.height - Constants.Player.bottomOffset;
    this.velocityX = 0;
    this.isAlive = true;
    this.imageIndex = 1;
  }
}
