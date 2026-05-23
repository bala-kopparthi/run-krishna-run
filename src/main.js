// Entry point — wires up Phaser with our scenes.
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import GameOverScene from './scenes/GameOverScene.js';

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

// Boot the game. ES modules execute after DOMContentLoaded, so the
// #game-root element is guaranteed to exist by now — no need to wait
// for the `load` event (which may have already fired by the time this
// module finishes downloading).
function boot() {
  console.log('[Run Krishna Run] booting Phaser…');
  // eslint-disable-next-line no-new
  new Phaser.Game(config);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
