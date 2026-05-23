// Generates royalty-free game sounds + music at runtime using the Web Audio API.
// Nothing is downloaded; everything is synthesised in-browser.
//
// Each play* function returns immediately. `startMusic()` starts a cheerful
// looping melody; `stopMusic()` stops it.

let audioCtx = null;
let musicTimer = null;
let musicGain = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
  }
  // Browsers require a resume after the first user gesture.
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

export function setMuted(m) {
  muted = m;
  if (musicGain) musicGain.gain.value = muted ? 0 : 0.05;
}
export function isMuted() { return muted; }

// Generic tone helper.
function tone({ freq = 440, dur = 0.12, type = 'sine', vol = 0.2, slideTo = null, attack = 0.005, release = 0.05 } = {}) {
  if (muted) return;
  const ac = ctx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  if (slideTo != null) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
  }
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + attack);
  gain.gain.linearRampToValueAtTime(0, ac.currentTime + dur + release);
  osc.connect(gain).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur + release + 0.02);
}

// Public SFX:
export function playJump() {
  tone({ freq: 420, slideTo: 760, dur: 0.18, type: 'square', vol: 0.18 });
}
export function playCoin() {
  tone({ freq: 880, dur: 0.07, type: 'triangle', vol: 0.22 });
  setTimeout(() => tone({ freq: 1320, dur: 0.10, type: 'triangle', vol: 0.22 }), 60);
}
export function playCrash() {
  if (muted) return;
  const ac = ctx();
  // Burst of noise.
  const bufferSize = ac.sampleRate * 0.4;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ac.createBufferSource();
  noise.buffer = buffer;
  const gain = ac.createGain();
  gain.gain.value = 0.25;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 900;
  noise.connect(filter).connect(gain).connect(ac.destination);
  noise.start();
  // Bonk tone too.
  tone({ freq: 220, slideTo: 80, dur: 0.35, type: 'sawtooth', vol: 0.2 });
}
export function playClick() {
  tone({ freq: 600, dur: 0.05, type: 'square', vol: 0.15 });
}
export function playPowerUp() {
  tone({ freq: 520, slideTo: 1040, dur: 0.25, type: 'triangle', vol: 0.2 });
}

// Cheerful 8-bit-ish looping melody.
const MELODY = [
  { n: 523, d: 0.18 }, { n: 659, d: 0.18 }, { n: 784, d: 0.18 }, { n: 1046, d: 0.36 },
  { n: 784, d: 0.18 }, { n: 880, d: 0.18 }, { n: 988, d: 0.36 },
  { n: 880, d: 0.18 }, { n: 784, d: 0.18 }, { n: 659, d: 0.18 }, { n: 523, d: 0.36 },
  { n: 659, d: 0.18 }, { n: 784, d: 0.18 }, { n: 1046, d: 0.36 }
];

export function startMusic() {
  if (musicTimer) return;
  const ac = ctx();
  musicGain = ac.createGain();
  musicGain.gain.value = muted ? 0 : 0.05;
  musicGain.connect(ac.destination);

  let i = 0;
  const playNext = () => {
    const step = MELODY[i % MELODY.length];
    const osc = ac.createOscillator();
    const noteGain = ac.createGain();
    osc.type = 'square';
    osc.frequency.value = step.n;
    noteGain.gain.setValueAtTime(0, ac.currentTime);
    noteGain.gain.linearRampToValueAtTime(1, ac.currentTime + 0.01);
    noteGain.gain.linearRampToValueAtTime(0, ac.currentTime + step.d * 0.9);
    osc.connect(noteGain).connect(musicGain);
    osc.start();
    osc.stop(ac.currentTime + step.d);
    i++;
    musicTimer = setTimeout(playNext, step.d * 1000);
  };
  playNext();
}

export function stopMusic() {
  if (musicTimer) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
  if (musicGain) {
    musicGain.disconnect();
    musicGain = null;
  }
}
