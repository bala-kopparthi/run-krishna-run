// GameScene: the actual endless runner.
// 3-lane setup. Obstacles + coins spawn at the top and scroll down toward the
// player. The player stays in a fixed Y range, jumping or sliding to dodge.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import {
  playJump, playCoin, playCrash, playClick, playPowerUp, stopMusic
} from '../utils/soundGenerator.js';

const HIGH_SCORE_KEY = 'runKrishnaRun.highScore';

// Three lane X positions.
const LANES = [GAME_WIDTH / 2 - 110, GAME_WIDTH / 2, GAME_WIDTH / 2 + 110];
const PLAYER_BASE_Y = GAME_HEIGHT - 140;

export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    // ----- World layers -----
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky');

    // Scrolling road in the middle of the screen.
    this.roadBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 380, GAME_HEIGHT, 0x4e4e57);
    // Side strips (grass).
    this.add.rectangle(50, GAME_HEIGHT / 2, 100, GAME_HEIGHT, 0x6abf69);
    this.add.rectangle(GAME_WIDTH - 50, GAME_HEIGHT / 2, 100, GAME_HEIGHT, 0x6abf69);

    // Road lane dividers (tile sprites scroll downward).
    this.stripeLeft = this.add.tileSprite(GAME_WIDTH / 2 - 55, GAME_HEIGHT / 2, 6, GAME_HEIGHT, 'roadStripe');
    this.stripeRight = this.add.tileSprite(GAME_WIDTH / 2 + 55, GAME_HEIGHT / 2, 6, GAME_HEIGHT, 'roadStripe');

    // Decorative scenery groups (trees & buildings on the sides).
    this.scenery = this.add.group();
    this.spawnSceneryTimer = 0;

    // Clouds drifting across the sky.
    this.clouds = [];
    for (let i = 0; i < 3; i++) {
      const c = this.add.image(Phaser.Math.Between(0, GAME_WIDTH), Phaser.Math.Between(40, 200), 'cloud')
        .setScale(Phaser.Math.FloatBetween(0.7, 1.2))
        .setAlpha(0.9);
      this.clouds.push(c);
    }

    // ----- Player -----
    this.lane = 1;
    this.player = this.physics.add.sprite(LANES[1], PLAYER_BASE_Y, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(36, 60).setOffset(6, 10);
    this.isJumping = false;
    this.isDucking = false;

    // Little bounce while running.
    this.playerBobTween = this.tweens.add({
      targets: this.player,
      y: PLAYER_BASE_Y - 6,
      yoyo: true,
      repeat: -1,
      duration: 220,
      ease: 'Sine.easeInOut'
    });

    // ----- Groups -----
    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.powerups = this.physics.add.group();

    this.physics.add.overlap(this.player, this.coins, this.onCoin, null, this);
    this.physics.add.overlap(this.player, this.obstacles, this.onHit, null, this);
    this.physics.add.overlap(this.player, this.powerups, this.onPowerUp, null, this);

    // ----- HUD -----
    this.score = 0;
    this.coinsCollected = 0;
    this.speed = 260; // px/sec scroll speed
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.spawnInterval = 900; // ms

    this.scoreText = this.add.text(16, 14, 'Score: 0', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#1a237e',
      strokeThickness: 5
    });
    this.coinText = this.add.text(16, 44, '🪙 0', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '22px',
      color: '#fff59d',
      stroke: '#5d4037',
      strokeThickness: 5
    });
    this.speedText = this.add.text(GAME_WIDTH - 16, 14, 'Speed x1.0', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#1a237e',
      strokeThickness: 5
    }).setOrigin(1, 0);

    this.pauseBtn = this.add.text(GAME_WIDTH - 16, 44, '⏸', {
      fontSize: '28px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.pauseBtn.on('pointerdown', () => this.togglePause());

    // ----- Input -----
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-LEFT', () => this.moveLane(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.moveLane(1));
    this.input.keyboard.on('keydown-UP', () => this.jump());
    this.input.keyboard.on('keydown-DOWN', () => this.duck(true));
    this.input.keyboard.on('keyup-DOWN', () => this.duck(false));
    this.input.keyboard.on('keydown-P', () => this.togglePause());

    // Simple swipe support on touch screens.
    this.setupTouch();

    // Speed-up every 30 seconds.
    this.time.addEvent({ delay: 30000, loop: true, callback: () => this.speedUp() });

    // Power-up: roughly every 18s.
    this.time.addEvent({ delay: 18000, loop: true, callback: () => this.spawnPowerUp() });

    // Coin particle burst.
    this.coinParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: -120, max: 120 },
      lifespan: 350,
      scale: { start: 1, end: 0 },
      tint: [0xffeb3b, 0xfff59d, 0xffffff],
      emitting: false
    });

    // Magnet state.
    this.magnetUntil = 0;
    this.boostUntil = 0;

    this.gameOver = false;
  }

  // ----- Input helpers -----
  moveLane(dir) {
    if (this.gameOver || this.scene.isPaused()) return;
    const next = Phaser.Math.Clamp(this.lane + dir, 0, LANES.length - 1);
    if (next === this.lane) return;
    this.lane = next;
    this.tweens.add({
      targets: this.player,
      x: LANES[this.lane],
      duration: 120,
      ease: 'Quad.easeOut'
    });
  }
  jump() {
    if (this.gameOver || this.isJumping || this.isDucking) return;
    this.isJumping = true;
    playJump();
    this.playerBobTween.pause();
    const peak = PLAYER_BASE_Y - 140;
    this.tweens.add({
      targets: this.player,
      y: peak,
      duration: 280,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this.isJumping = false;
        this.player.y = PLAYER_BASE_Y;
        this.playerBobTween.resume();
      }
    });
    // Briefly shrink the body so the player clears low obstacles.
    this.player.body.setSize(36, 30).setOffset(6, 8);
    this.time.delayedCall(560, () => {
      if (!this.isDucking) this.player.body.setSize(36, 60).setOffset(6, 10);
    });
  }
  duck(on) {
    if (this.gameOver || this.isJumping) return;
    if (on && !this.isDucking) {
      this.isDucking = true;
      this.player.setTexture('playerDuck');
      this.player.body.setSize(48, 30).setOffset(4, 12);
      this.playerBobTween.pause();
      this.player.y = PLAYER_BASE_Y + 14;
    } else if (!on && this.isDucking) {
      this.isDucking = false;
      this.player.setTexture('player');
      this.player.body.setSize(36, 60).setOffset(6, 10);
      this.player.y = PLAYER_BASE_Y;
      this.playerBobTween.resume();
    }
  }

  setupTouch() {
    let startX = 0, startY = 0, startT = 0;
    this.input.on('pointerdown', p => { startX = p.x; startY = p.y; startT = p.event.timeStamp; });
    this.input.on('pointerup', p => {
      const dx = p.x - startX, dy = p.y - startY;
      const dt = p.event.timeStamp - startT;
      if (dt > 600) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) this.moveLane(1);
        else if (dx < -30) this.moveLane(-1);
      } else {
        if (dy < -30) this.jump();
        else if (dy > 30) { this.duck(true); this.time.delayedCall(500, () => this.duck(false)); }
      }
    });
  }

  togglePause() {
    if (this.gameOver) return;
    playClick();
    if (this.scene.isPaused()) {
      this.scene.resume();
      if (this.pauseOverlay) this.pauseOverlay.destroy();
      if (this.pauseLabel) this.pauseLabel.destroy();
    } else {
      this.pauseOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setDepth(10);
      this.pauseLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PAUSED\n(press P to resume)', {
        fontFamily: 'Comic Sans MS, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5).setDepth(11);
      this.scene.pause();
    }
  }

  // ----- Game tick -----
  update(_, delta) {
    if (this.gameOver) return;

    const dt = delta / 1000;
    const scrollSpeed = this.speed * (this.boostUntil > this.time.now ? 1.5 : 1);

    // Scroll the road stripes & clouds.
    this.stripeLeft.tilePositionY -= scrollSpeed * dt;
    this.stripeRight.tilePositionY -= scrollSpeed * dt;
    this.clouds.forEach(c => {
      c.x -= 20 * dt;
      if (c.x < -50) { c.x = GAME_WIDTH + 50; c.y = Phaser.Math.Between(40, 200); }
    });

    // Move obstacles & coins downward.
    this.obstacles.children.iterate(o => {
      if (!o) return;
      o.y += scrollSpeed * dt;
      if (o.y > GAME_HEIGHT + 60) o.destroy();
    });
    this.coins.children.iterate(c => {
      if (!c) return;
      // Magnet pulls coins toward player.
      if (this.magnetUntil > this.time.now) {
        const dx = this.player.x - c.x, dy = this.player.y - c.y;
        const d = Math.max(40, Math.hypot(dx, dy));
        c.x += (dx / d) * 320 * dt;
        c.y += (dy / d) * 320 * dt;
      } else {
        c.y += scrollSpeed * dt;
      }
      if (c.y > GAME_HEIGHT + 60) c.destroy();
    });
    this.powerups.children.iterate(p => {
      if (!p) return;
      p.y += scrollSpeed * dt;
      if (p.y > GAME_HEIGHT + 60) p.destroy();
    });

    // Move scenery (trees / buildings).
    this.scenery.children.iterate(s => {
      if (!s) return;
      s.y += scrollSpeed * dt * 0.95;
      if (s.y > GAME_HEIGHT + 80) s.destroy();
    });

    // Spawn timers.
    this.spawnTimer += delta;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRow();
    }
    this.spawnSceneryTimer += delta;
    if (this.spawnSceneryTimer >= 600) {
      this.spawnSceneryTimer = 0;
      this.spawnScenery();
    }

    // Score grows with distance.
    this.elapsed += delta;
    this.score = Math.floor(this.elapsed * 0.02 + this.coinsCollected * 10);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  // ----- Spawning -----
  spawnRow() {
    // Pick a lane to spawn an obstacle in.
    const obstacleLane = Phaser.Math.Between(0, 2);
    const type = Math.random() < 0.5 ? 'obstacleLow' : 'obstacleHigh';
    const obs = this.obstacles.create(LANES[obstacleLane], -60, type);
    obs.setData('type', type);
    obs.body.setAllowGravity(false);
    if (type === 'obstacleHigh') {
      // Overhead sign — sits higher; ducking avoids it.
      obs.setY(-60);
      obs.setData('isHigh', true);
      // Smaller hitbox at top so sliding works.
      obs.body.setSize(50, 20).setOffset(3, 0);
    } else {
      obs.body.setSize(50, 36).setOffset(3, 6);
    }

    // Add coins in the OTHER lanes.
    for (let l = 0; l < 3; l++) {
      if (l === obstacleLane) continue;
      if (Math.random() < 0.7) {
        // A small line of coins.
        const count = Phaser.Math.Between(1, 3);
        for (let i = 0; i < count; i++) {
          const c = this.coins.create(LANES[l], -60 - i * 40, 'coin');
          c.body.setAllowGravity(false);
          c.setData('spin', Math.random() * 0.1 + 0.05);
        }
      }
    }
  }
  spawnScenery() {
    // Place trees / buildings on the grass strips.
    const side = Math.random() < 0.5 ? 0 : 1;
    const x = side === 0 ? Phaser.Math.Between(10, 70) : Phaser.Math.Between(GAME_WIDTH - 70, GAME_WIDTH - 10);
    const tex = Math.random() < 0.6 ? 'tree' : 'building';
    const s = this.add.image(x, -60, tex).setDepth(-1);
    if (tex === 'building') s.setScale(0.8);
    this.scenery.add(s);
  }
  spawnPowerUp() {
    if (this.gameOver) return;
    const lane = Phaser.Math.Between(0, 2);
    const type = Math.random() < 0.5 ? 'magnet' : 'boost';
    const p = this.powerups.create(LANES[lane], -60, type);
    p.body.setAllowGravity(false);
    p.setData('type', type);
    this.tweens.add({ targets: p, scale: 1.2, yoyo: true, repeat: -1, duration: 400 });
  }

  // ----- Collisions -----
  onCoin(_player, coin) {
    coin.destroy();
    this.coinsCollected++;
    this.coinText.setText(`🪙 ${this.coinsCollected}`);
    this.coinParticles.emitParticleAt(coin.x, coin.y, 8);
    playCoin();
  }
  onHit(_player, obs) {
    // If ducking and obstacle is high — pass through.
    if (this.isDucking && obs.getData('isHigh')) return;
    // If jumping and obstacle is low — pass through.
    if (this.isJumping && !obs.getData('isHigh')) return;
    // If boost active, smash through.
    if (this.boostUntil > this.time.now) {
      obs.destroy();
      this.coinParticles.emitParticleAt(obs.x, obs.y, 12);
      return;
    }
    this.endGame();
  }
  onPowerUp(_player, p) {
    const type = p.getData('type');
    p.destroy();
    playPowerUp();
    if (type === 'magnet') {
      this.magnetUntil = this.time.now + 6000;
      this.flashHud('🧲 MAGNET!');
    } else {
      this.boostUntil = this.time.now + 5000;
      this.flashHud('⚡ BOOST!');
    }
  }
  flashHud(text) {
    const t = this.add.text(GAME_WIDTH / 2, 120, text, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '38px',
      color: '#ffeb3b',
      stroke: '#bf360c',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, y: 80, duration: 1200, onComplete: () => t.destroy() });
  }

  // ----- Difficulty -----
  speedUp() {
    if (this.gameOver) return;
    this.speed = Math.min(this.speed * 1.12, 700);
    this.spawnInterval = Math.max(450, this.spawnInterval * 0.92);
    const mult = (this.speed / 260).toFixed(1);
    this.speedText.setText(`Speed x${mult}`);
    this.flashHud('SPEED UP!');
  }

  // ----- End game -----
  endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    playCrash();
    stopMusic();
    this.cameras.main.shake(280, 0.01);
    this.player.setTint(0xff5252);

    // Persist high score.
    const prev = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    if (this.score > prev) localStorage.setItem(HIGH_SCORE_KEY, String(this.score));

    this.time.delayedCall(700, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        coins: this.coinsCollected,
        best: Math.max(prev, this.score)
      });
    });
  }
}
