const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');

const world = { width: canvas.width, height: canvas.height };

const state = {
  running: false,
  paused: false,
  gameOver: false,
  score: 0,
  lives: 3,
  level: 1,
  spawnTimer: 0,
  spawnInterval: 1.2,
  lastTime: 0
};

const ship = {
  x: world.width / 2,
  y: world.height - 80,
  w: 46,
  h: 38,
  speed: 320,
  cooldown: 0,
  invuln: 0
};

const keys = new Set();
const lasers = [];
const enemies = [];
const sparks = [];
const stars = [];

const palette = {
  ship: '#76d6ff',
  enemy: '#ffb347',
  laser: '#ff4b4b',
  spark: '#ffd36a',
  hud: '#f4f6fb',
  shadow: 'rgba(5, 10, 18, 0.8)'
};

const blockedKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space']);

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rectsIntersect(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < 90; i += 1) {
    stars.push({
      x: rand(0, world.width),
      y: rand(0, world.height),
      speed: rand(18, 70),
      size: rand(1, 2.5),
      alpha: rand(0.4, 0.9)
    });
  }
}

function resetGame() {
  state.running = true;
  state.paused = false;
  state.gameOver = false;
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.spawnTimer = 0;
  state.spawnInterval = 1.2;
  state.lastTime = 0;
  ship.x = world.width / 2;
  ship.y = world.height - 80;
  ship.cooldown = 0;
  ship.invuln = 0;
  lasers.length = 0;
  enemies.length = 0;
  sparks.length = 0;
}

function showOverlay(title, body) {
  overlay.innerHTML = '<div class="overlay-title">' + title + '</div><div class="overlay-body">' + body + '</div>';
  overlay.classList.add('show');
}

function hideOverlay() {
  overlay.textContent = '';
  overlay.classList.remove('show');
}

function startGame() {
  resetGame();
  hideOverlay();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  showOverlay('Sky Lost', 'Press Enter to try again');
}

function togglePause() {
  if (!state.running || state.gameOver) {
    return;
  }
  state.paused = !state.paused;
  if (state.paused) {
    showOverlay('Paused', 'Press P to resume');
  } else {
    hideOverlay();
  }
}

function fireLaser() {
  lasers.push({
    x: ship.x - 2,
    y: ship.y - ship.h * 0.65,
    w: 4,
    h: 14,
    speed: 700
  });
}

function spawnEnemy() {
  const size = rand(26, 44);
  const edge = 26;
  enemies.push({
    x: rand(edge, world.width - edge),
    y: -size * 1.2,
    w: size,
    h: size * 0.8,
    hp: size > 38 ? 2 : 1,
    speed: rand(70, 120) + state.level * 8,
    wobble: rand(0.6, 1.2),
    phase: rand(0, Math.PI * 2),
    value: size > 38 ? 80 : 50
  });
}

function spawnSparks(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    sparks.push({
      x,
      y,
      vx: rand(-140, 140),
      vy: rand(-180, 80),
      life: rand(0.3, 0.6)
    });
  }
}

function updateStars(dt) {
  for (const star of stars) {
    star.y += star.speed * dt;
    if (star.y > world.height + 2) {
      star.y = -2;
      star.x = rand(0, world.width);
    }
  }
}

function updateInput(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) {
    dx -= 1;
  }
  if (keys.has('ArrowRight') || keys.has('KeyD')) {
    dx += 1;
  }
  if (keys.has('ArrowUp') || keys.has('KeyW')) {
    dy -= 1;
  }
  if (keys.has('ArrowDown') || keys.has('KeyS')) {
    dy += 1;
  }

  const len = Math.hypot(dx, dy);
  if (len > 0) {
    dx /= len;
    dy /= len;
  }

  ship.x += dx * ship.speed * dt;
  ship.y += dy * ship.speed * dt;
  ship.x = clamp(ship.x, ship.w * 0.6, world.width - ship.w * 0.6);
  ship.y = clamp(ship.y, world.height * 0.25, world.height - ship.h);

  if (keys.has('Space') && ship.cooldown <= 0) {
    fireLaser();
    ship.cooldown = 0.22;
  }
}

function updateLasers(dt) {
  for (let i = lasers.length - 1; i >= 0; i -= 1) {
    const laser = lasers[i];
    laser.y -= laser.speed * dt;
    if (laser.y + laser.h < 0) {
      lasers.splice(i, 1);
    }
  }
}

function updateEnemies(dt) {
  state.spawnTimer += dt;
  const interval = Math.max(0.45, state.spawnInterval - (state.level - 1) * 0.08);
  if (state.spawnTimer >= interval) {
    spawnEnemy();
    state.spawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    enemy.phase += dt * enemy.wobble;
    enemy.x += Math.sin(enemy.phase) * 22 * dt;
    enemy.y += enemy.speed * dt;

    if (enemy.y - enemy.h > world.height + 30) {
      enemies.splice(i, 1);
      state.lives -= 1;
      if (state.lives <= 0) {
        endGame();
      }
    }
  }
}

function updateSparks(dt) {
  for (let i = sparks.length - 1; i >= 0; i -= 1) {
    const spark = sparks[i];
    spark.life -= dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.vy += 220 * dt;
    if (spark.life <= 0) {
      sparks.splice(i, 1);
    }
  }
}

function handleCollisions() {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    for (let j = lasers.length - 1; j >= 0; j -= 1) {
      const laser = lasers[j];
      if (rectsIntersect(laser.x, laser.y, laser.w, laser.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
        lasers.splice(j, 1);
        enemy.hp -= 1;
        spawnSparks(laser.x, laser.y, 6);
        if (enemy.hp <= 0) {
          enemies.splice(i, 1);
          state.score += enemy.value;
          spawnSparks(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5, 10);
        }
        break;
      }
    }
  }

  if (ship.invuln > 0) {
    return;
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (rectsIntersect(ship.x - ship.w * 0.5, ship.y - ship.h * 0.4, ship.w, ship.h, enemy.x, enemy.y, enemy.w, enemy.h)) {
      enemies.splice(i, 1);
      state.lives -= 1;
      ship.invuln = 1.4;
      spawnSparks(ship.x, ship.y, 12);
      if (state.lives <= 0) {
        endGame();
      }
    }
  }
}

function updateDifficulty() {
  const targetLevel = Math.floor(state.score / 600) + 1;
  state.level = Math.max(state.level, targetLevel);
}

function update(dt) {
  ship.cooldown = Math.max(0, ship.cooldown - dt);
  ship.invuln = Math.max(0, ship.invuln - dt);
  updateInput(dt);
  updateLasers(dt);
  updateEnemies(dt);
  handleCollisions();
  updateSparks(dt);
  updateDifficulty();
}

function drawBackground() {
  ctx.fillStyle = '#070d17';
  ctx.fillRect(0, 0, world.width, world.height);
}

function drawStars() {
  ctx.save();
  for (const star of stars) {
    ctx.fillStyle = 'rgba(255, 255, 255, ' + star.alpha + ')';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawShip() {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  if (ship.invuln > 0 && Math.floor(ship.invuln * 10) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }
  ctx.fillStyle = palette.ship;
  ctx.beginPath();
  ctx.moveTo(0, -ship.h * 0.6);
  ctx.lineTo(ship.w * 0.45, ship.h * 0.4);
  ctx.lineTo(0, ship.h * 0.2);
  ctx.lineTo(-ship.w * 0.45, ship.h * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLasers() {
  ctx.fillStyle = palette.laser;
  for (const laser of lasers) {
    ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
  }
}

function drawEnemies() {
  for (const enemy of enemies) {
    ctx.save();
    ctx.translate(enemy.x + enemy.w * 0.5, enemy.y + enemy.h * 0.5);
    ctx.fillStyle = palette.enemy;
    ctx.beginPath();
    ctx.moveTo(0, -enemy.h * 0.6);
    ctx.lineTo(enemy.w * 0.5, enemy.h * 0.5);
    ctx.lineTo(0, enemy.h * 0.1);
    ctx.lineTo(-enemy.w * 0.5, enemy.h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawSparks() {
  ctx.fillStyle = palette.spark;
  for (const spark of sparks) {
    ctx.globalAlpha = Math.max(0, spark.life * 2);
    ctx.fillRect(spark.x, spark.y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawHud() {
  ctx.fillStyle = palette.hud;
  ctx.font = '600 18px Oxanium, sans-serif';
  ctx.fillText('Score: ' + state.score, 16, 26);
  ctx.fillText('Lives: ' + state.lives, 16, 48);
  ctx.fillText('Level: ' + state.level, 16, 70);
}

function render() {
  drawBackground();
  drawStars();
  drawShip();
  drawLasers();
  drawEnemies();
  drawSparks();
  drawHud();
}

function gameLoop(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const dt = Math.min(0.05, (timestamp - state.lastTime) / 1000);
  state.lastTime = timestamp;

  updateStars(dt);
  if (state.running && !state.paused && !state.gameOver) {
    update(dt);
  }
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (blockedKeys.has(event.code)) {
    event.preventDefault();
  }

  if (!event.repeat) {
    if (event.code === 'Enter' && !state.running) {
      startGame();
    }
    if (event.code === 'KeyR' && state.gameOver) {
      startGame();
    }
    if (event.code === 'KeyP') {
      togglePause();
    }
  }

  keys.add(event.code);
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.code);
});

window.addEventListener('blur', () => {
  if (state.running && !state.paused && !state.gameOver) {
    togglePause();
  }
});

initStars();
showOverlay('Laser Skies', 'Press Enter to start');
requestAnimationFrame(gameLoop);
