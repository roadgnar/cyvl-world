// ============================================================
// CYVL ARCADE — Game Registry & Shared Utilities
// ============================================================

var ARCADE_GAMES = [
  {
    id: 'infrastructure-wars',
    title: 'INFRASTRUCTURE WARS',
    subtitle: 'The Cyvl Saga',
    description: 'Twin-stick shooter. Scan roads with LiDAR. Defeat snow plows. Liberate cities for AI.',
    path: '/games/infrastructure-wars/',
    tags: ['SHOOTER', 'ACTION', 'DESKTOP'],
    colors: { primary: '#00e5ff', secondary: '#00ff88', accent: '#ff6600' }
  },
  {
    id: 'whac-a-pothole',
    title: 'WHAC-A-POTHOLE',
    subtitle: 'Infrastructure Defense Unit',
    description: 'Potholes are popping up everywhere! Click fast to patch them before the roads crumble.',
    path: '/games/whac-a-pothole/',
    tags: ['ARCADE', 'CASUAL'],
    colors: { primary: '#ff6600', secondary: '#00ff88', accent: '#00e5ff' }
  },
  {
    id: 'hangman',
    title: 'INFRASTRUCTURE HANGMAN',
    subtitle: 'Save the Bridge',
    description: 'Guess infrastructure words before the bridge collapses. 8 guesses. No hard hats required.',
    path: '/games/hangman/',
    tags: ['WORD', 'CASUAL'],
    colors: { primary: '#00e5ff', secondary: '#ff2244', accent: '#00ff88' }
  },
  {
    id: 'road-invaders',
    title: 'ROAD INVADERS',
    subtitle: 'Defend the Pavement',
    description: 'Waves of potholes, cones, and paperwork descend from above. Blast them with asphalt patches!',
    path: '/games/road-invaders/',
    tags: ['SHOOTER', 'CLASSIC'],
    colors: { primary: '#aa44ff', secondary: '#ff6600', accent: '#00e5ff' }
  },
  {
    id: 'fiber-snake',
    title: 'FIBER SNAKE',
    subtitle: 'Lay the Line',
    description: 'Lay fiber optic cable through the city grid. Collect data nodes. Don\'t cross your own line.',
    path: '/games/fiber-snake/',
    tags: ['CLASSIC', 'CASUAL'],
    colors: { primary: '#00e5ff', secondary: '#00ff88', accent: '#ffd700' }
  },
  {
    id: 'cone-crusher',
    title: 'CONE CRUSHER',
    subtitle: 'Infrastructure Demolition',
    description: 'Smash through traffic cones, barriers, and signs with your wrecking ball. 5 levels of breakout.',
    path: '/games/cone-crusher/',
    tags: ['ARCADE', 'CLASSIC'],
    colors: { primary: '#ff6600', secondary: '#ffee00', accent: '#00e5ff' }
  }
];

// ============================================================
// Card Renderer
// ============================================================
function renderGameCards(containerId) {
  var container = document.getElementById(containerId);
  if (!container) return;

  ARCADE_GAMES.forEach(function(game) {
    var card = document.createElement('a');
    card.href = game.path;
    card.className = 'game-card';
    card.setAttribute('data-game', game.id);

    var tagsHtml = game.tags.map(function(t) {
      return '<span class="game-tag">' + t + '</span>';
    }).join('');

    card.innerHTML =
      '<div class="game-card-screen">' +
        '<canvas class="game-card-preview" width="380" height="200"></canvas>' +
        '<div class="game-card-screen-overlay"></div>' +
      '</div>' +
      '<div class="game-card-info">' +
        '<h2 class="game-card-title">' + game.title + '</h2>' +
        '<p class="game-card-subtitle">' + game.subtitle + '</p>' +
        '<p class="game-card-desc">' + game.description + '</p>' +
        '<div class="game-card-tags">' + tagsHtml + '</div>' +
        '<div id="lb-mini-' + game.id + '"></div>' +
      '</div>' +
      '<div class="game-card-coin">INSERT COIN</div>';

    container.appendChild(card);

    // Start preview animation
    var canvas = card.querySelector('.game-card-preview');
    if (canvas) startPreviewAnimation(canvas, game);
  });
}

// ============================================================
// Card Preview Animations
// ============================================================
function startPreviewAnimation(canvas, game) {
  var ctx = canvas.getContext('2d');
  var w = canvas.width, h = canvas.height;
  var particles = [];
  var gridOffset = 0;

  for (var i = 0; i < 20; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.5 - 0.2,
      size: Math.random() * 2 + 1,
      color: [game.colors.primary, game.colors.secondary, game.colors.accent][Math.floor(Math.random() * 3)],
      alpha: Math.random() * 0.6 + 0.2
    });
  }

  function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    gridOffset = (gridOffset + 0.3) % 20;
    ctx.strokeStyle = 'rgba(13,42,58,0.6)';
    ctx.lineWidth = 1;
    for (var y = gridOffset; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (var x = gridOffset; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
      if (p.x < -5) p.x = w + 5;
      if (p.x > w + 5) p.x = -5;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// Arcade Audio (Web Audio API synthesis)
// ============================================================
var arcadeAudioCtx = null;

function initArcadeAudio() {
  if (arcadeAudioCtx) return;
  try {
    arcadeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch(e) {}
}

function playArcadeSound(type) {
  if (!arcadeAudioCtx) return;
  var osc = arcadeAudioCtx.createOscillator();
  var gain = arcadeAudioCtx.createGain();
  osc.connect(gain);
  gain.connect(arcadeAudioCtx.destination);
  var now = arcadeAudioCtx.currentTime;

  if (type === 'hover') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'select') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'boot') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);
  }
}

// ============================================================
// Event Binding for Cards
// ============================================================
function bindCardEvents() {
  var cards = document.querySelectorAll('.game-card');
  cards.forEach(function(card) {
    card.addEventListener('mouseenter', function() {
      playArcadeSound('hover');
    });
    card.addEventListener('click', function() {
      playArcadeSound('select');
    });
  });
}
