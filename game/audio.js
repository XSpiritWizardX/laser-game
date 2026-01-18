export function createAudio(settings) {
  let ctx = null;
  let masterGain = null;
  let musicGain = null;
  let musicNodes = [];
  let musicTimer = null;
  let unlocked = false;

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.connect(masterGain);
    }
    return ctx;
  }

  function syncSettings() {
    if (!masterGain) {
      return;
    }
    masterGain.gain.value = settings.audio.volume;
    if (!settings.audio.music) {
      stopMusic();
    } else if (unlocked && !musicNodes.length) {
      startMusic();
    }
  }

  function unlock() {
    ensureContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    unlocked = true;
    syncSettings();
  }

  function playTone({ freq, duration, type, gain, detune = 0 }) {
    if (!settings.audio.sfx || !unlocked) {
      return;
    }
    ensureContext();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(masterGain);
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playSweep({ from, to, duration, type, gain }) {
    if (!settings.audio.sfx || !unlocked) {
      return;
    }
    ensureContext();
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + duration);
    amp.gain.value = gain;
    osc.connect(amp);
    amp.connect(masterGain);
    const now = ctx.currentTime;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  }

  function playLaser() {
    playTone({ freq: 820, duration: 0.08, type: 'sawtooth', gain: 0.08 });
  }

  function playExplosion() {
    playSweep({ from: 220, to: 50, duration: 0.25, type: 'triangle', gain: 0.12 });
  }

  function playHit() {
    playTone({ freq: 140, duration: 0.14, type: 'square', gain: 0.1 });
  }

  function playPickup() {
    playTone({ freq: 620, duration: 0.12, type: 'sine', gain: 0.09, detune: 120 });
    playTone({ freq: 820, duration: 0.1, type: 'sine', gain: 0.07 });
  }

  function playBoss() {
    playSweep({ from: 120, to: 260, duration: 0.35, type: 'sawtooth', gain: 0.12 });
  }

  function startMusic() {
    if (!settings.audio.music || !unlocked) {
      return;
    }
    if (musicNodes.length) {
      return;
    }
    ensureContext();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 880;
    filter.Q.value = 0.8;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.12;
    padGain.connect(filter);
    filter.connect(musicGain);

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscC = ctx.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'triangle';
    oscC.type = 'sine';
    oscA.connect(padGain);
    oscB.connect(padGain);
    oscC.connect(padGain);

    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const chords = [
      [110, 165, 220],
      [98, 147, 196],
      [123, 184, 246],
      [92, 138, 185]
    ];
    let chordIndex = 0;

    function applyChord() {
      const chord = chords[chordIndex % chords.length];
      const now = ctx.currentTime;
      oscA.frequency.setTargetAtTime(chord[0], now, 0.4);
      oscB.frequency.setTargetAtTime(chord[1], now, 0.4);
      oscC.frequency.setTargetAtTime(chord[2], now, 0.4);
      chordIndex += 1;
    }

    applyChord();
    musicTimer = setInterval(applyChord, 4200);
    oscA.start();
    oscB.start();
    oscC.start();
    lfo.start();
    musicNodes = [oscA, oscB, oscC, lfo, filter, padGain];
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    for (const node of musicNodes) {
      if (node.stop) {
        try {
          node.stop();
        } catch (error) {
          // Ignore stop errors from already stopped nodes.
        }
      }
      if (node.disconnect) {
        node.disconnect();
      }
    }
    musicNodes = [];
  }

  return {
    unlock,
    syncSettings,
    playLaser,
    playExplosion,
    playHit,
    playPickup,
    playBoss,
    startMusic,
    stopMusic
  };
}
