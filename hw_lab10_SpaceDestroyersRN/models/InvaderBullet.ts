import { Bullet } from './Bullet';
import { Constants } from './Constants';

export class InvaderBullet extends Bullet {
  constructor(x: number, y: number) {
    const { speed, width, height, color } = Constants.InvaderBullet;
    super(x, y, speed, width, height, color);
  }
}
