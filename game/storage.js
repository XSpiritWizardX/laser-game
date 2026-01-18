const SETTINGS_KEY = 'laser_skies_settings_v1';
const STATS_KEY = 'laser_skies_stats_v1';

const DEFAULT_SETTINGS = {
  audio: {
    sfx: true,
    music: true,
    volume: 0.55
  },
  display: {
    shake: true,
    particles: true
  },
  controls: {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    fire: ['Space', 'KeyJ'],
    pause: ['KeyP', 'Escape']
  }
};

const DEFAULT_STATS = {
  highScore: 0,
  bestCombo: 0,
  bestLevel: 1,
  totalRuns: 0,
  totalKills: 0,
  bossesDefeated: 0,
  totalTime: 0
};

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }
  if (value && typeof value === 'object') {
    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = cloneValue(entry);
    }
    return result;
  }
  return value;
}

function mergeDefaults(base, update) {
  if (Array.isArray(base)) {
    return Array.isArray(update) ? cloneValue(update) : cloneValue(base);
  }
  if (base && typeof base === 'object') {
    const result = {};
    for (const key of Object.keys(base)) {
      result[key] = mergeDefaults(base[key], update ? update[key] : undefined);
    }
    if (update && typeof update === 'object') {
      for (const key of Object.keys(update)) {
        if (!(key in base)) {
          result[key] = cloneValue(update[key]);
        }
      }
    }
    return result;
  }
  return update !== undefined ? update : base;
}

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore storage failures (private browsing, quota).
  }
}

export function loadSettings() {
  const stored = readStorage(SETTINGS_KEY);
  return mergeDefaults(DEFAULT_SETTINGS, stored);
}

export function saveSettings(settings) {
  writeStorage(SETTINGS_KEY, settings);
}

export function loadStats() {
  const stored = readStorage(STATS_KEY);
  return mergeDefaults(DEFAULT_STATS, stored);
}

export function saveStats(stats) {
  writeStorage(STATS_KEY, stats);
}

export function getDefaultSettings() {
  return cloneValue(DEFAULT_SETTINGS);
}
