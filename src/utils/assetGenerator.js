// Generates ALL game art programmatically using Phaser Graphics.
// This keeps the project tiny (no image downloads) and 100% royalty-free.
// Each function draws into an off-screen Graphics object, then
// `generateTexture` bakes it into a texture we can use as a sprite.

export function generateAllTextures(scene) {
  makeSky(scene);
  makeCloud(scene);
  makeTree(scene);
  makeBuilding(scene);
  makeRoadStripe(scene);
  makePlayer(scene);
  makePlayerDuck(scene);
  makeCoin(scene);
  makeObstacleLow(scene);
  makeObstacleHigh(scene);
  makeParticle(scene);
  makeButton(scene);
  makeMagnet(scene);
  makeBoost(scene);
}

// Soft pastel sky with a sun.
function makeSky(scene) {
  const w = 480, h = 720;
  const g = scene.add.graphics();
  // Gradient-ish bands (Phaser graphics don't do real gradients, so we fake it).
  const colors = [0x9ee0ff, 0xb6e6ff, 0xceecff, 0xe9d8ff, 0xffd1dc];
  const bandH = Math.ceil(h / colors.length);
  colors.forEach((c, i) => {
    g.fillStyle(c, 1);
    g.fillRect(0, i * bandH, w, bandH);
  });
  // Sun
  g.fillStyle(0xfff2a8, 1);
  g.fillCircle(380, 120, 50);
  g.fillStyle(0xffe066, 1);
  g.fillCircle(380, 120, 36);
  g.generateTexture('sky', w, h);
  g.destroy();
}

// Fluffy cloud.
function makeCloud(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(20, 24, 18);
  g.fillCircle(40, 18, 22);
  g.fillCircle(62, 24, 18);
  g.fillCircle(50, 32, 18);
  g.fillCircle(30, 32, 16);
  g.generateTexture('cloud', 84, 48);
  g.destroy();
}

// Cute tree.
function makeTree(scene) {
  const g = scene.add.graphics();
  // trunk
  g.fillStyle(0x8b5a2b, 1);
  g.fillRect(18, 36, 8, 24);
  // leaves
  g.fillStyle(0x4caf50, 1);
  g.fillCircle(22, 24, 22);
  g.fillStyle(0x66bb6a, 1);
  g.fillCircle(14, 18, 12);
  g.fillCircle(30, 18, 12);
  g.generateTexture('tree', 44, 60);
  g.destroy();
}

// Cartoon building.
function makeBuilding(scene) {
  const g = scene.add.graphics();
  const palette = [0xff6f91, 0xffc75f, 0x6cc4ff, 0xb39cd0];
  const color = palette[Math.floor(Math.random() * palette.length)];
  g.fillStyle(color, 1);
  g.fillRect(0, 10, 60, 110);
  // roof
  g.fillStyle(0x6d4c41, 1);
  g.fillTriangle(-4, 14, 30, -6, 64, 14);
  // windows
  g.fillStyle(0xfff59d, 1);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      g.fillRect(8 + c * 18, 28 + r * 22, 10, 12);
    }
  }
  g.generateTexture('building', 60, 120);
  g.destroy();
}

// White dashed road stripe.
function makeRoadStripe(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 6, 40);
  g.generateTexture('roadStripe', 6, 40);
  g.destroy();
}

// Player character — running pose (simple stylised kid).
function makePlayer(scene) {
  const g = scene.add.graphics();
  const w = 48, h = 72;
  // shadow
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(w / 2, h - 4, 34, 8);
  // legs
  g.fillStyle(0x3949ab, 1);
  g.fillRoundedRect(10, 44, 12, 22, 4);
  g.fillRoundedRect(26, 44, 12, 22, 4);
  // shoes
  g.fillStyle(0xef5350, 1);
  g.fillRoundedRect(8, 62, 16, 8, 3);
  g.fillRoundedRect(24, 62, 16, 8, 3);
  // body
  g.fillStyle(0xff7043, 1);
  g.fillRoundedRect(8, 22, 32, 28, 8);
  // arms
  g.fillStyle(0xffcc80, 1);
  g.fillRoundedRect(0, 24, 10, 18, 5);
  g.fillRoundedRect(38, 24, 10, 18, 5);
  // head
  g.fillStyle(0xffe0b2, 1);
  g.fillCircle(w / 2, 14, 12);
  // hair
  g.fillStyle(0x4e342e, 1);
  g.fillEllipse(w / 2, 8, 22, 10);
  // eyes
  g.fillStyle(0x000000, 1);
  g.fillCircle(20, 14, 1.6);
  g.fillCircle(28, 14, 1.6);
  // smile
  g.lineStyle(1.2, 0x000000, 1);
  g.beginPath();
  g.arc(24, 17, 3, 0, Math.PI, false);
  g.strokePath();
  g.generateTexture('player', w, h);
  g.destroy();
}

// Player ducking pose (squashed).
function makePlayerDuck(scene) {
  const g = scene.add.graphics();
  const w = 56, h = 44;
  g.fillStyle(0x000000, 0.18);
  g.fillEllipse(w / 2, h - 4, 40, 8);
  // body
  g.fillStyle(0xff7043, 1);
  g.fillRoundedRect(8, 16, 40, 22, 10);
  // head
  g.fillStyle(0xffe0b2, 1);
  g.fillCircle(14, 18, 11);
  g.fillStyle(0x4e342e, 1);
  g.fillEllipse(14, 13, 20, 8);
  g.fillStyle(0x000000, 1);
  g.fillCircle(18, 18, 1.4);
  // legs tucked
  g.fillStyle(0x3949ab, 1);
  g.fillRoundedRect(30, 32, 18, 10, 4);
  g.fillStyle(0xef5350, 1);
  g.fillRoundedRect(44, 34, 10, 8, 3);
  g.generateTexture('playerDuck', w, h);
  g.destroy();
}

// Shiny coin.
function makeCoin(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffc107, 1);
  g.fillCircle(16, 16, 14);
  g.fillStyle(0xfff176, 1);
  g.fillCircle(16, 16, 10);
  g.fillStyle(0xff8f00, 1);
  g.fillCircle(16, 16, 4);
  g.generateTexture('coin', 32, 32);
  g.destroy();
}

// Low obstacle — jump over (a small barrier).
function makeObstacleLow(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xd84315, 1);
  g.fillRoundedRect(0, 12, 56, 28, 6);
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 22, 56, 4);
  g.fillStyle(0xff7043, 1);
  g.fillRect(4, 26, 8, 6);
  g.fillRect(44, 26, 8, 6);
  g.generateTexture('obstacleLow', 56, 44);
  g.destroy();
}

// High obstacle — slide under (an overhead sign).
function makeObstacleHigh(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0x607d8b, 1);
  g.fillRect(2, 0, 4, 38);
  g.fillRect(50, 0, 4, 38);
  g.fillStyle(0x3f51b5, 1);
  g.fillRoundedRect(0, 0, 56, 18, 4);
  g.fillStyle(0xffffff, 1);
  g.fillRect(6, 6, 44, 6);
  g.generateTexture('obstacleHigh', 56, 38);
  g.destroy();
}

// Tiny particle for sparkle effects.
function makeParticle(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffffff, 1);
  g.fillCircle(4, 4, 4);
  g.generateTexture('particle', 8, 8);
  g.destroy();
}

// Button background.
function makeButton(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0x000000, 0.2);
  g.fillRoundedRect(4, 6, 220, 64, 16);
  g.fillStyle(0xff7043, 1);
  g.fillRoundedRect(0, 0, 220, 64, 16);
  g.lineStyle(4, 0xffffff, 1);
  g.strokeRoundedRect(0, 0, 220, 64, 16);
  g.generateTexture('button', 224, 70);
  g.destroy();
}

// Magnet power-up.
function makeMagnet(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xe53935, 1);
  g.fillRect(2, 2, 10, 22);
  g.fillRect(20, 2, 10, 22);
  g.fillStyle(0xfafafa, 1);
  g.fillRect(2, 18, 10, 6);
  g.fillRect(20, 18, 10, 6);
  g.fillStyle(0xe53935, 1);
  g.fillRect(2, 2, 28, 6);
  g.generateTexture('magnet', 32, 28);
  g.destroy();
}

// Boost power-up (lightning bolt-ish).
function makeBoost(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffeb3b, 1);
  g.fillTriangle(18, 0, 4, 20, 16, 20);
  g.fillTriangle(16, 16, 28, 36, 14, 22);
  g.generateTexture('boost', 32, 36);
  g.destroy();
}
