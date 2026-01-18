const WAVE_PATTERNS = [
  {
    duration: 12,
    events: [
      { t: 0.6, kind: 'line', enemy: 'drifter', count: 5 },
      { t: 3.1, kind: 'vee', enemy: 'zigzag', count: 6 },
      { t: 6.2, kind: 'swarm', enemy: 'swarmer', count: 8 },
      { t: 9.4, kind: 'line', enemy: 'tank', count: 3 }
    ]
  },
  {
    duration: 14,
    events: [
      { t: 0.8, kind: 'columns', enemy: 'drifter', count: 6 },
      { t: 3.6, kind: 'charge', enemy: 'charger', count: 4 },
      { t: 6.6, kind: 'vee', enemy: 'swarmer', count: 7 },
      { t: 10.2, kind: 'line', enemy: 'zigzag', count: 6 }
    ]
  },
  {
    duration: 13,
    events: [
      { t: 0.7, kind: 'swarm', enemy: 'swarmer', count: 10 },
      { t: 4.3, kind: 'line', enemy: 'tank', count: 4 },
      { t: 7.2, kind: 'columns', enemy: 'zigzag', count: 6 },
      { t: 10.2, kind: 'charge', enemy: 'charger', count: 5 }
    ]
  }
];

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry));
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

export function getWavePattern(level) {
  const pattern = WAVE_PATTERNS[(level - 1) % WAVE_PATTERNS.length];
  return cloneValue(pattern);
}

export const BOSS_INTERVAL = 5;
