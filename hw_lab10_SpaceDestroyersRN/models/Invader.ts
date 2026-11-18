import { Constants } from './Constants';
import type { Bounds } from './Bullet';

export class Invader {
  id: string;
  row: number;
  column: number;
  x: number;
  y: number;
  width = Constants.Invader.width;
  height = Constants.Invader.height;
  imageType: 1 | 2 | 3;
  shouldRemove = false;

  constructor(row: number, column: number, x: number, y: number) {
    this.id = `invader_${row}_${column}`;
    this.row = row;
    this.column = column;
    this.x = x;
    this.y = y;
    const [min, max] = Constants.Invader.imageTypeRange;
    this.imageType = (Math.floor(Math.random() * (max - min + 1)) + min) as 1 | 2 | 3;
  }

  move(dx: number, dy = 0) {
    this.x += dx;
    this.y += dy;
  }

  isAtEdge(leftBound: number, rightBound: number): boolean {
    return this.x < leftBound || this.x + this.width > rightBound;
  }

  getBulletSpawnPosition() {
    return { x: this.x + this.width / 2, y: this.y + this.height };
  }

  getBounds(): Bounds {
    return { left: this.x, right: this.x + this.width, top: this.y, bottom: this.y + this.height };
  }
}
