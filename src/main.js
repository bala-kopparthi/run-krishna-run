// Entry point — wires up Phaser with our scenes.
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

// Logical game size — Phaser will scale this to fit the window.
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#87ceeb',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  // Pixel art crisp scaling for our generated graphics.
  render: { pixelArt: false, antialias: true },
  scene: [BootScene, MenuScene, GameScene, GameOverScene]
};

// Boot the game once the DOM is ready.
window.addEventListener('load', () => {
  // eslint-disable-next-line no-new
  new Phaser.Game(config);
});
