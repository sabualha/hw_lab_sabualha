import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

let laser: ReturnType<typeof createAudioPlayer> | null = null;

export async function initSound() {
  if (laser) return; // already loaded -- don't create a new player every level
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  laser = createAudioPlayer(require('../assets/sounds/laser.mp3'));
}

export function playLaser() {
  if (!laser) return;
  laser.seekTo(0);
  laser.play();
}
