# 🏃 KD Krishna — A Tiny Endless Runner

A colorful, kid-friendly endless runner game inspired by **Subway Surfers**, built
with **Phaser 3** + **Vite**. It runs entirely in your browser — no backend, no
sign-up, no downloads of art or music. All graphics and sounds are generated at
runtime, so the whole game weighs almost nothing.

> Designed to feel like *"a tiny Subway Surfers clone made for a 7-year-old kid"*.

---

## ✨ Features

- 🏃 Endless runner with 3 lanes (left / center / right)
- ⬆️ **Jump** over low obstacles, ⬇️ **slide** under high ones
- 🪙 Collect coins for points
- 🧲 **Magnet** power-up — pulls coins to you
- ⚡ **Boost** power-up — smash through obstacles
- ⏸ **Pause** button and **mute** toggle
- 🏆 **High score** saved in `localStorage`
- 🎵 Cheerful synthesised background music + jump / coin / crash / click SFX
- 🌳 Procedurally-spawned cartoon trees, buildings, clouds, particle bursts
- 📱 Works on desktop **and** mobile (swipe to move / jump / slide)
- 🎨 100% royalty-free — every sprite and sound is generated in code

---

## 🚀 Setup

Requires **Node.js 18+** (Node 20 recommended).

```bash
npm install
npm run dev
```

Then open the URL Vite prints — usually <http://localhost:5173>. Vite auto-opens
your browser.

To build a production bundle:

```bash
npm run build
npm run preview
```

---

## 🎮 Controls

| Action     | Keyboard           | Touch / Mouse        |
| ---------- | ------------------ | -------------------- |
| Move left  | ← Left Arrow       | Swipe left           |
| Move right | → Right Arrow      | Swipe right          |
| Jump       | ↑ Up Arrow         | Swipe up             |
| Slide      | ↓ Down Arrow       | Swipe down           |
| Pause      | P                  | ⏸ button (top-right) |
| Mute       | M                  | 🔊/🔇 on title screen |
| Start      | Space / Enter / ▶  | Tap PLAY             |

---

## 🗂 Folder Structure

```
subway-surfer-kids-game/
├── index.html                 # Page shell + canvas mount
├── package.json               # npm scripts + Phaser/Vite deps
├── vite.config.js             # Dev server config
├── README.md                  # You are here
├── .gitignore
└── src/
    ├── main.js                # Boots Phaser, registers scenes
    ├── scenes/
    │   ├── BootScene.js       # Generates all textures
    │   ├── MenuScene.js       # Title + Play button + best score
    │   ├── GameScene.js       # Main gameplay loop
    │   └── GameOverScene.js   # Score recap + restart
    └── utils/
        ├── assetGenerator.js  # Builds every sprite via Phaser Graphics
        └── soundGenerator.js  # Synthesises music & SFX via Web Audio API
```

---

## 🧪 Tips for Tweaking

Most of the "feel" knobs live at the top of [`src/scenes/GameScene.js`](src/scenes/GameScene.js):

- `LANES` — lane X-positions
- `this.speed` — starting scroll speed (px/sec)
- `this.spawnInterval` — ms between obstacle rows
- `speedUp()` — how much faster every 30s
- Power-up durations / spawn cadence (`spawnPowerUp`, `magnetUntil`, `boostUntil`)

Want different colors? Edit the palette literals in
[`src/utils/assetGenerator.js`](src/utils/assetGenerator.js). Want a different
tune? Tweak the `MELODY` array in [`src/utils/soundGenerator.js`](src/utils/soundGenerator.js).

---

## 📸 Screenshots

_Add screenshots here after running the game!_

| Title screen | In-game | Game over |
| ------------ | ------- | --------- |
| ![title](docs/screenshot-title.png) | ![game](docs/screenshot-game.png) | ![over](docs/screenshot-over.png) |

(Place PNGs in a `docs/` folder to enable.)

---

## ⚖️ License

MIT — do whatever you like. Built for fun; not affiliated with Subway Surfers.
