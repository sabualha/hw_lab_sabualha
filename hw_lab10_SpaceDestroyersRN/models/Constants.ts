export const Constants = {
  Game: {
    maxLevels: 3,
    fps: 60,
  },
  Invader: {
    rows: 4,
    initialSpeed: 2,
    invadersPerLevelBase: 4,
    invadersPerLevelMultiplier: 1,
    horizontalSpacing: 10,
    verticalSpacing: 60,
    dropDistance: 10,
    fireInterval: 1500,          // ms between invader shots
    width: 30,
    height: 30,
    imageTypeRange: [1, 3] as const,
  },
  Player: {
    startingLives: 3,
    width: 40,
    height: 40,
    bottomOffset: 50,
    fireCooldown: 500,           // ms between player shots
    respawnDelay: 1000,
    bullet: { speed: 5, width: 5, height: 20, color: '#00FF00' },
  },
  InvaderBullet: {
    speed: 3, width: 5, height: 20, color: '#FF0000',
  },
  Input: {
    accelerometerInterval: 100, // ms
    tiltSensitivity: 15,
    maxSpeed: 300,               // px/sec
  },
  Layout: {
    leftBound: 20,
    // rightBound is computed at runtime from Dimensions.get('window').width
  },
} as const;
