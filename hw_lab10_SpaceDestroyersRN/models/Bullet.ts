export type Bounds = { left: number; right: number; top: number; bottom: number };

export class Bullet {
  id: string;
  x: number;
  y: number;
  speed: number;            // positive = downward, negative = upward
  width: number;
  height: number;
  color: string;
  shouldRemove = false;

  constructor(x: number, y: number, speed: number, width: number, height: number, color: string) {
    this.id = `bullet_${Date.now()}_${Math.random()}`;
    this.x = x - width / 2;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  update() { this.y += this.speed; }

  isOffScreen(screenHeight: number): boolean {
    return this.y < -this.height || this.y > screenHeight + this.height;
  }

  getBounds(): Bounds {
    return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
  }
}
