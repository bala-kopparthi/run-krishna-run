# Run Krishna Run — Technical Writeup

A browser-based endless-runner game inspired by Subway Surfers. Single-page,
zero backend, zero downloaded assets, runs on any modern browser after
`npm install && npm run dev`.

> **Live repo:** https://github.com/bala-kopparthi/run-krishna-run

---

## 1. Tech Stack

| Layer              | Choice                              | Why                                                                                                                |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Language           | **JavaScript (ES2020+ modules)**    | Runs natively in browsers, no compile step, fast iteration loop.                                                   |
| Game engine        | **Phaser 3.80**                     | Mature 2D HTML5 engine — scene management, Arcade physics, tweens, particles, input — all batteries included.      |
| Build tool / dev server | **Vite 5**                     | Native ESM dev server, sub-100ms HMR, zero-config production builds. Lighter and faster than webpack/CRA.          |
| Runtime            | **Node.js 20** (for tooling only)   | Vite + npm. The game itself never touches Node.                                                                    |
| Asset generation   | **Phaser Graphics → generateTexture** | Sprites are drawn programmatically and baked into GPU textures. No PNGs, no licensing concerns, ~0 KB download.  |
| Sound              | **Web Audio API**                   | All SFX + music are synthesised in the browser from oscillators and noise buffers. No `<audio>` tags, no MP3s.     |
| Persistence        | **`window.localStorage`**           | High score survives reloads without a backend.                                                                     |
| Source control     | **Git + GitHub**                    | Repo created via the GitHub CLI (`gh`).                                                                            |

**Nothing else.** No React, no TypeScript, no CSS framework, no bundler plugins,
no backend, no database, no auth, no Docker. The whole production bundle is
~1.4 MB (Phaser itself) plus ~15 KB of game code.

---

## 2. File Structure

```
run-krishna-run/
├── index.html                # Page shell, mounts #game-root, no game logic
├── package.json              # 2 deps: phaser (runtime), vite (dev)
├── vite.config.js            # Dev server on :5173, binds to 0.0.0.0
├── .claude/launch.json       # IDE preview config (optional)
└── src/
    ├── main.js               # Phaser config + scene registry + boot
    ├── constants.js          # GAME_WIDTH / GAME_HEIGHT (shared)
    ├── scenes/
    │   ├── BootScene.js      # Generates textures, jumps to MenuScene
    │   ├── MenuScene.js      # Title, PLAY button, high score, mute
    │   ├── GameScene.js      # The actual gameplay loop (~280 lines)
    │   └── GameOverScene.js  # Score recap + RESTART
    └── utils/
        ├── assetGenerator.js # ~200 lines — every sprite drawn in code
        └── soundGenerator.js # ~120 lines — Web Audio synth for SFX + music
```

The split is deliberate: **scenes own behaviour, utils own resources.** New
gameplay features go in scenes; new visuals or sounds go in utils. A second
developer can extend either side without touching the other.

---

## 3. Architecture: Scene-Based State Machine

Phaser organises a game as a directed flow of **scenes** (think: "screens").
Sunny Run uses four:

```
BootScene → MenuScene → GameScene ⇄ GameOverScene
                ↑__________________________|
```

- **BootScene** runs once. It calls `generateAllTextures(scene)` which paints
  every sprite into a `Phaser.GameObjects.Graphics` object and bakes it with
  `generateTexture('player', 48, 72)`. After that, anywhere in the game we can
  do `this.add.image(x, y, 'player')` and the GPU already has the texture.
- **MenuScene** owns the title screen. It reads `localStorage` to display the
  best score and wires up keyboard / click input.
- **GameScene** owns the runner loop (covered below).
- **GameOverScene** receives `{ score, coins, best }` via `scene.start(name, data)`
  and writes a new high score to `localStorage` if it beat the previous one.

State transitions are explicit — there is no global game state object. Each
scene re-reads what it needs on `create()`, which keeps coupling low.

---

## 4. The Gameplay Loop — `GameScene.js`

The illusion of running forward is achieved by **scrolling the world toward
a stationary player**.

### 4.1 The three lanes

```js
const LANES = [GAME_WIDTH/2 - 110, GAME_WIDTH/2, GAME_WIDTH/2 + 110];
```

Three fixed X positions. The player is always tweened between them — never
"sliding" through intermediate positions. Lane changes use:

```js
this.tweens.add({ targets: this.player, x: LANES[this.lane], duration: 120, ease: 'Quad.easeOut' });
```

### 4.2 The scrolling road

Two `TileSprite` objects scroll downward by mutating `tilePositionY` each
frame. The grass strips and clouds are just decoration. Everything else
(obstacles, coins, scenery, power-ups) is created at `y = -60` and pushed
down at the current `scrollSpeed` until it leaves the screen, then `.destroy()`'d.

### 4.3 The frame budget — `update(time, delta)`

Phaser calls `update()` ~60 times per second with `delta` in ms. We use
`delta/1000` as `dt` so movement is frame-rate-independent:

```js
o.y += scrollSpeed * dt;   // pixels per second × seconds = pixels
```

This is important — anyone running at 144 Hz or on a throttled tab should
see the same speed.

### 4.4 Collision: jump vs. low, slide vs. high

There are two obstacle types: low barriers and overhead signs. The trick is:
- **Jumping** temporarily shrinks the player's physics body height. While
  the body is short, low obstacles miss it.
- **Sliding** swaps to the duck sprite and reshapes the body to be wide-and-short.
  Overhead signs (only the top 20px is solid) miss it.
- The actual `physics.overlap` check is gated by these flags in
  `onHit(player, obstacle)`. If both conditions clear, we call `endGame()`.

This is much simpler than true Y-axis jumping with gravity, but feels the
same to the player.

### 4.5 Difficulty curve

A `Phaser.Time.TimerEvent` fires every 30 s and multiplies `this.speed` by
1.12 (capped at 700 px/s). It also tightens `spawnInterval`. A "SPEED UP!"
banner flashes on-screen.

### 4.6 Power-ups

- **Magnet** (6 s): in the `update` loop, coins are pulled toward the player
  vector instead of falling straight down.
- **Boost** (5 s): obstacle collisions destroy the obstacle and emit
  particles instead of ending the game. Scroll speed also multiplies by 1.5.

Both are tracked as `magnetUntil` / `boostUntil` timestamps so the active
check is simply `if (magnetUntil > time.now)`.

### 4.7 Score

```js
this.score = Math.floor(this.elapsed * 0.02 + this.coinsCollected * 10);
```

Score grows continuously with elapsed time and jumps by 10 per coin.
Encourages both surviving and collecting.

---

## 5. Programmatic Assets — `assetGenerator.js`

Each function follows the same pattern:

```js
function makePlayer(scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xffe0b2, 1);            // skin tone
  g.fillCircle(24, 14, 12);            // head
  // ... draw body, arms, shoes ...
  g.generateTexture('player', 48, 72); // bake to GPU
  g.destroy();                         // drop the graphics object
}
```

Why this approach?
- **No asset pipeline.** No PNG-export tool, no spritesheet packer.
- **No copyright risk** — every pixel is original code.
- **Tiny download.** The page weight is essentially Phaser itself.
- **Trivial recoloring** — change a hex literal, get a new palette.

Trade-off: artwork quality is capped at "stylised cartoon shapes." For a
production game I'd switch to texture atlases generated by TexturePacker or
hand-drawn art.

---

## 6. Synthesised Audio — `soundGenerator.js`

The Web Audio API exposes a graph: `OscillatorNode → GainNode → destination`.
A "jump" sound is:

```js
osc.frequency.value = 420;
osc.frequency.exponentialRampToValueAtTime(760, ac.currentTime + 0.18);
gain.gain.linearRampToValueAtTime(0.18, ac.currentTime + 0.005);
gain.gain.linearRampToValueAtTime(0,    ac.currentTime + 0.23);
```

That's it — an oscillator sweep with a quick envelope. Crash sound layers
band-limited white noise on top of a downward sawtooth sweep.

Background music is a hand-written 14-note melody scheduled with
`setTimeout`s using square-wave oscillators (8-bit feel).

**Browser gotcha:** Chrome and Safari suspend `AudioContext` until a user
gesture. We call `ac.resume()` inside the PLAY button handler.

---

## 7. Bugs Hit & How They Were Fixed

This is the most useful section for an interview — *real* engineering is
mostly debugging.

### 7.1 The blank-page bug

**Symptom:** After the first build, the page was blank. The browser console
showed *no errors* but *no logs either*.

**Diagnosis:** I instrumented `main.js` with a `console.log` at the top of
the boot function. It didn't fire. That meant the module itself was failing
during *evaluation*, not during execution. I then re-imported `main.js`
manually from DevTools:

```js
await import('/src/main.js')
// → ReferenceError: Cannot access 'GAME_WIDTH' before initialization
//   at GameScene.js:13:16
```

**Root cause:** A **circular ES-module import**.
`main.js` exported `GAME_WIDTH` *and* imported `GameScene.js`. `GameScene.js`
imported `GAME_WIDTH` back from `main.js`. ES modules tolerate cycles via
"live bindings," but `GameScene.js` evaluated this at module top-level:

```js
const LANES = [GAME_WIDTH/2 - 110, GAME_WIDTH/2, GAME_WIDTH/2 + 110];
```

At that moment, `main.js` had paused mid-evaluation (waiting for its scene
imports to finish), so `GAME_WIDTH` was still in its temporal-dead-zone. The
TDZ ReferenceError crashed the module before any `console.log` could run.

**Fix:** Move the shared constants to their own file (`src/constants.js`).
Both `main.js` and the scenes import from there — no cycle.

**Lesson worth saying out loud:** *"Whenever a re-export and a re-import
share a file, you have a circular import waiting to bite you. Push shared
constants into a leaf module."*

### 7.2 The `window.load` event miss

`main.js` originally booted Phaser inside `window.addEventListener('load', ...)`.
Because ES modules are deferred, in some browsers the `load` event has
**already fired** by the time the module's body runs — so the listener never
triggered. Fixed by checking `document.readyState`:

```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
```

### 7.3 Dev server vs. preview iframe

Vite defaulted to binding only to `127.0.0.1`, which meant any IDE preview
iframe (or another device on the LAN) couldn't reach it. Switched to
`server: { host: true }` so it binds to all interfaces.

---

## 8. Things I Deliberately *Didn't* Build

Interviewers love hearing what you chose not to do:

- **TypeScript** — overkill for a 600-LOC game.
- **A bundler beyond Vite** — Vite's defaults are excellent.
- **A state library** — Phaser's per-scene `create()` is enough; Redux
  would be ceremony.
- **Real 3D / parallax** — the single-camera top-down view sells the
  illusion of movement for free.
- **A real audio file pipeline** — synth saves 1–2 MB and zero licensing.

---

## 9. What I'd Build Next

- **Coin chains** — three-coin arc patterns instead of straight lines.
- **Diagonal lane switch hop** — visual flourish during lane changes.
- **Daily seed** — reproducible obstacle layouts using `Math.seedrandom`.
- **PWA install** — `manifest.json` + service worker for offline play.
- **Touch UI overlay** — on-screen jump/slide buttons for mobile-first players.
- **WebGL particle shader for the boost** — a real screen-space speed-line effect.

---

## 10. Likely Interview Questions (and answers worth practising)

**Q: Why Phaser instead of writing to canvas directly?**
A: I wanted the scene graph, tween system, and Arcade physics without
re-implementing them. Phaser's ~1.4 MB is a one-time cost for features I'd
otherwise spend a week building. For an even smaller game I'd reach for
plain `requestAnimationFrame`.

**Q: Why no asset files?**
A: Three reasons: ~0 KB download size, no licensing headaches, and tiny
visual changes (palettes, sizes) are one-line edits. The trade-off is art
ceiling — I couldn't ship a polished art style this way.

**Q: How does the game stay smooth on slower machines?**
A: All movement uses `delta`-time integration so physics is frame-rate
independent, and the world is procedurally spawned + destroyed off-screen,
so the active object count never grows.

**Q: How did you debug the blank-page issue?**
A: (Tell the circular-import story from §7.1.) The lesson was that
silent module-evaluation errors hide behind an empty console — the trick
is to manually `await import(...)` the entry module from DevTools, which
forces the error to surface.

**Q: How would you scale this to a multiplayer leaderboard?**
A: A `POST /api/scores` to any minimal backend (Cloudflare Workers + KV
would be fine for this scale). Client-side I'd swap `localStorage` for a
small wrapper that writes locally *and* fires-and-forgets to the server.

---

## 11. Honest note on AI assistance

Modern teams expect engineers to use AI tools. What interviewers actually
look for is whether **you** understand the architecture, can justify
trade-offs, and can debug under pressure. Reading this doc through once,
then re-implementing one feature (a new power-up, a new obstacle type)
without help will give you genuine ownership. That's far more convincing
than rehearsing a story.

---

## 12. Commands cheat-sheet

```bash
git clone https://github.com/bala-kopparthi/run-krishna-run
cd run-krishna-run
npm install      # ~12 packages, ~5 s
npm run dev      # Vite on http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```
