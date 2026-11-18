import { Bullet } from './Bullet';
import { Constants } from './Constants';

export class PlayerBullet extends Bullet {
  constructor(x: number, y: number) {
    const { speed, width, height, color } = Constants.Player.bullet;
    super(x, y, -speed, width, height, color);
  }
}
