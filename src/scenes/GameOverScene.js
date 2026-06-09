// GameOverScene: shows the score and a big restart button.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { playClick, startMusic } from '../utils/soundGenerator.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) { this.data = data || { score: 0, coins: 0, best: 0, kidMode: false }; }

  create() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'sky');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.35);

    this.add.text(GAME_WIDTH / 2, 160, 'OH NO!', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '72px',
      color: '#ffffff',
      stroke: '#d50000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 230, 'You crashed 😅', {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '24px',
      color: '#fff59d'
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 320, `Score: ${this.data.score}`, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#1a237e',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 370, `🪙 Coins: ${this.data.coins}`, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '28px',
      color: '#fff59d',
      stroke: '#5d4037',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 420, `🏆 Best: ${this.data.best}`, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '28px',
      color: '#ffd54f',
      stroke: '#3e2723',
      strokeThickness: 5
    }).setOrigin(0.5);

    // PLAY AGAIN preserves kid mode. MAIN MENU clears it.
    this.makeButton(GAME_WIDTH / 2, 520, 'PLAY AGAIN ▶', () => {
      startMusic();
      this.scene.start('GameScene', { kidMode: this.data.kidMode });
    });
    this.makeButton(GAME_WIDTH / 2, 610, 'MAIN MENU', () => this.scene.start('MenuScene'));

    this.input.keyboard.once('keydown-SPACE', () => {
      startMusic();
      this.scene.start('GameScene', { kidMode: this.data.kidMode });
    });
    this.input.keyboard.once('keydown-ENTER', () => {
      startMusic();
      this.scene.start('GameScene', { kidMode: this.data.kidMode });
    });
  }

  makeButton(x, y, label, onClick) {
    const btn = this.add.image(x, y, 'button').setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Comic Sans MS, sans-serif',
      fontSize: '26px',
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
