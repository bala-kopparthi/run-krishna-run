// BootScene: generates all textures, then jumps to the menu.
import Phaser from 'phaser';
import { generateAllTextures } from '../utils/assetGenerator.js';

export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  create() {
    generateAllTextures(this);
    this.scene.start('MenuScene');
  }
}
