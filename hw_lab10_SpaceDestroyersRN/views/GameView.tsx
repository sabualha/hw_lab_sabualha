import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, ImageSourcePropType } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Constants } from '../models/Constants';
import GameStateManager from '../models/GameStateManager';
import { Player } from '../models/Player';
import { Invader } from '../models/Invader';
import { PlayerBullet } from '../models/PlayerBullet';
import { InvaderBullet } from '../models/InvaderBullet';
import { findCollisions, firstCollision } from '../viewModels/collision';
import { initSound, playLaser } from '../viewModels/sound';
import type { RootStackParamList } from '../types';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
type NavProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const invaderImages: Record<1 | 2 | 3, ImageSourcePropType> = {
  1: require('../assets/images/invader1.png'),
  2: require('../assets/images/invader2.png'),
  3: require('../assets/images/invader3.png'),
};
const playerImages: Record<1 | 2, ImageSourcePropType> = {
  1: require('../assets/images/player1.png'),
  2: require('../assets/images/player2.png'),
};

export default function GameView() {
  const navigation = useNavigation<NavProp>();
  const gsm = GameStateManager.instance;

  // Mutable game state lives in refs so mutations don't trigger renders.
  const playerRef = useRef<Player>(new Player(SCREEN_W, SCREEN_H));
  const invadersRef = useRef<Invader[]>(seedInvaders(gsm.currentLevel));
  const playerBulletsRef = useRef<PlayerBullet[]>([]);
  const invaderBulletsRef = useRef<InvaderBullet[]>([]);
  const invaderSpeedRef = useRef(Constants.Invader.initialSpeed);
  const accelXRef = useRef(0);
  const endedRef = useRef(false); // set when we leave this screen so the loops stop

  // Lightweight HUD state -- these do drive re-renders. Note the
  // explicit `<number>` type annotations: without them, TypeScript
  // infers the state type from the initial value, and because
  // `Constants.Player.startingLives` is `3` (a literal type thanks to
  // `as const` on Constants), `useState(gsm.lives)` would end up typed
  // as `useState<3>`, which then refuses `setLives(2)`. The annotation
  // widens the type back to `number` so we can set it to anything.
  const [score, setScore] = useState<number>(gsm.score);
  const [lives, setLives] = useState<number>(gsm.lives);
  const [, forceRender] = useState(0);
  const tick = () => forceRender((n) => n + 1);

  // Accelerometer input.
  useEffect(() => {
    Accelerometer.setUpdateInterval(Constants.Input.accelerometerInterval);
    const sub = Accelerometer.addListener(({ x }) => { accelXRef.current = x; });
    return () => sub.remove();
  }, []);

  // Sound.
  useEffect(() => { initSound(); }, []);

  // Game loop + invader firing.
  useEffect(() => {
    const gameLoop = setInterval(update, 1000 / Constants.Game.fps);
    const fireLoop = setInterval(fireInvaderBullet, Constants.Invader.fireInterval);
    return () => { clearInterval(gameLoop); clearInterval(fireLoop); };
  }, []);

  function update() {
    if (endedRef.current) return;
    const player = playerRef.current;
    player.setVelocity(accelXRef.current);
    player.update();

    // Move invaders and reverse+drop on edge hit.
    let bumped = false;
    for (const inv of invadersRef.current) {
      inv.move(invaderSpeedRef.current, 0);
      if (inv.isAtEdge(Constants.Layout.leftBound, SCREEN_W - 20)) bumped = true;
    }
    if (bumped) {
      invaderSpeedRef.current *= -1;
      for (const inv of invadersRef.current) inv.move(0, Constants.Invader.dropDistance);
    }

    for (const b of playerBulletsRef.current) b.update();
    for (const b of invaderBulletsRef.current) b.update();

    // Player bullets vs invaders.
    for (const hit of findCollisions(playerBulletsRef.current, invadersRef.current)) {
      hit.a.shouldRemove = true;
      hit.b.shouldRemove = true;
      gsm.addScore(10);
    }

    // Invader bullets vs player, and direct invader collision.
    if (player.isAlive) {
      if (firstCollision(player, invaderBulletsRef.current) || firstCollision(player, invadersRef.current)) {
        onPlayerHit();
      }
    }

    // Prune removed / off-screen entities.
    playerBulletsRef.current = playerBulletsRef.current.filter((b) => !b.shouldRemove && !b.isOffScreen(SCREEN_H));
    invaderBulletsRef.current = invaderBulletsRef.current.filter((b) => !b.shouldRemove && !b.isOffScreen(SCREEN_H));
    invadersRef.current = invadersRef.current.filter((i) => !i.shouldRemove);

    // Level complete when the grid is empty.
    if (invadersRef.current.length === 0) {
      onLevelComplete();
      return;
    }

    // Push updates to the HUD if they changed.
    if (gsm.score !== score) setScore(gsm.score);
    tick();
  }

  function onPlayerHit() {
    playerRef.current.kill();
    const remaining = gsm.loseLife();
    setLives(remaining);
    if (remaining <= 0) {
      gsm.resetGame();
      endedRef.current = true; navigation.popToTop();
    } else {
      setTimeout(() => { playerRef.current.respawn(); tick(); }, Constants.Player.respawnDelay);
    }
  }

  function onLevelComplete() {
    if (gsm.currentLevel < Constants.Game.maxLevels) {
      gsm.advanceToNextLevel();
      endedRef.current = true; navigation.replace('LevelComplete');
    } else {
      gsm.resetGame();
      endedRef.current = true; navigation.popToTop();
    }
  }

  function fireInvaderBullet() {
    if (endedRef.current) return;
    // Only the bottom-most invader in each column can fire (classic Space Invaders rule).
    const bottomByColumn = new Map<number, Invader>();
    for (const inv of invadersRef.current) {
      const cur = bottomByColumn.get(inv.column);
      if (!cur || inv.row > cur.row) bottomByColumn.set(inv.column, inv);
    }
    const candidates = Array.from(bottomByColumn.values());
    if (candidates.length === 0) return;
    const shooter = candidates[Math.floor(Math.random() * candidates.length)];
    const pos = shooter.getBulletSpawnPosition();
    invaderBulletsRef.current.push(new InvaderBullet(pos.x, pos.y));
    playLaser();
  }

  function handleTap() {
    const player = playerRef.current;
    if (!player.isAlive || !player.canFire()) return;
    const pos = player.getBulletSpawnPosition();
    playerBulletsRef.current.push(new PlayerBullet(pos.x, pos.y));
    player.toggleImage();
    playLaser();
  }

  return (
    <View style={styles.container} onTouchStart={handleTap}>
      <View style={styles.hud}>
        <Text style={styles.hudText}>Score: {score}</Text>
        <Text style={styles.hudText}>Level: {gsm.currentLevel}</Text>
        <Text style={styles.hudText}>Lives: {lives}</Text>
      </View>

      {playerRef.current.isAlive && (
        <Image
          source={playerImages[playerRef.current.imageIndex]}
          style={[styles.abs, { left: playerRef.current.x, top: playerRef.current.y,
                                width: playerRef.current.width, height: playerRef.current.height }]}
        />
      )}

      {invadersRef.current.map((inv) => (
        <Image key={inv.id} source={invaderImages[inv.imageType]}
               style={[styles.abs, { left: inv.x, top: inv.y, width: inv.width, height: inv.height }]} />
      ))}

      {playerBulletsRef.current.map((b) => (
        <View key={b.id} style={[styles.abs, { left: b.x, top: b.y, width: b.width, height: b.height, backgroundColor: b.color }]} />
      ))}
      {invaderBulletsRef.current.map((b) => (
        <View key={b.id} style={[styles.abs, { left: b.x, top: b.y, width: b.width, height: b.height, backgroundColor: b.color }]} />
      ))}
    </View>
  );
}

function seedInvaders(level: number): Invader[] {
  const invaders: Invader[] = [];
  const count = level * Constants.Invader.invadersPerLevelMultiplier + Constants.Invader.invadersPerLevelBase;
  for (let row = 0; row < Constants.Invader.rows; row++) {
    for (let col = 0; col < count; col++) {
      const invW = Constants.Invader.width;
      const xStart = (SCREEN_W - (count * invW + (count - 1) * Constants.Invader.horizontalSpacing)) / 2; // center the grid
      const x = xStart + (invW + Constants.Invader.horizontalSpacing) * col;
      const y = 80 + row * Constants.Invader.verticalSpacing;
      invaders.push(new Invader(row, col, x, y));
    }
  }
  return invaders;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hud: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 40, paddingBottom: 10 },
  hudText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  abs: { position: 'absolute' },
});
