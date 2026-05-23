// MenuScene: title + Play button + high score + mute toggle.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main.js';
import { playClick, startMusic, setMuted, isMuted } from '../utils/soundGenerator.js';

const HIGH_SCORE_KEY = 'sunnyRun.highScore';

export default class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky');

    // Title bubble.
    this.add.text(GAME_WIDTH / 2, 130, 'SUNNY RUN', {
      fontFamily: 'Comic Sans MS, Chalkboard SE, sans-serif',
      fontSize: '64px',
      color: '#ff4081',
      stroke: '#ffffff',
      strokeThickness: 8,
      shadow: { offsetX: 3, offsetY: 4, color: '#000', blur: 6, fill: true }
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 190, 'A tiny endless runner!', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '20px',
      color: '#1a237e'
    }).setOrigin(0.5);

    // Decorative cloud + character preview.
    this.add.image(110, 100, 'cloud').setScale(1.1);
    this.add.image(380, 220, 'cloud').setScale(0.9);
    const hero = this.add.image(GAME_WIDTH / 2, 340, 'player').setScale(2.2);
    this.tweens.add({ targets: hero, y: hero.y - 14, yoyo: true, repeat: -1, duration: 700, ease: 'Sine.easeInOut' });

    // High score.
    const high = Number(localStorage.getItem(HIGH_SCORE_KEY) || 0);
    this.add.text(GAME_WIDTH / 2, 440, `Best: ${high}`, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      stroke: '#1a237e',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Play button.
    this.makeButton(GAME_WIDTH / 2, 520, 'PLAY ▶', () => {
      startMusic();
      this.scene.start('GameScene');
    });

    // Controls help.
    this.add.text(GAME_WIDTH / 2, 610,
      '◀ ▶ to change lanes\n▲ to JUMP   ▼ to SLIDE\nP to pause   M to mute', {
        fontFamily: 'Comic Sans MS, sans-serif',
        fontSize: '18px',
        color: '#0d47a1',
        align: 'center'
      }).setOrigin(0.5);

    // Mute toggle (top-right).
    this.muteLabel = this.add.text(GAME_WIDTH - 16, 16, isMuted() ? '🔇' : '🔊', {
      fontSize: '28px'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.muteLabel.on('pointerdown', () => {
      setMuted(!isMuted());
      this.muteLabel.setText(isMuted() ? '🔇' : '🔊');
      playClick();
    });
    this.input.keyboard.on('keydown-M', () => {
      setMuted(!isMuted());
      this.muteLabel.setText(isMuted() ? '🔇' : '🔊');
    });

    // Allow ENTER / SPACE to start.
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
  }

  startGame() {
    playClick();
    startMusic();
    this.scene.start('GameScene');
  }

  makeButton(x, y, label, onClick) {
    const btn = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      stroke: '#bf360c',
      strokeThickness: 4
    }).setOrigin(0.5);
    btn.on('pointerover', () => btn.setScale(1.05));
    btn.on('pointerout', () => btn.setScale(1));
    btn.on('pointerdown', () => {
      playClick();
      btn.setScale(0.95);
      this.time.delayedCall(80, onClick);
    });
    return { btn, text };
  }
}
