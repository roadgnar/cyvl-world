// ============================================================
// CYVL ARCADE — Leaderboard Module (Firebase Realtime Database)
// ============================================================
// Usage: Include Firebase SDK + this script, then call:
//   CyvlLeaderboard.show('game-id', score)
// at game over. Everything else is handled automatically.
// ============================================================

(function() {
  'use strict';

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDbrsxkLgU_p8Ns6kUiaAoLqKFOHwMk59Y",
    authDomain: "cyvl-world.firebaseapp.com",
    databaseURL: "https://cyvl-world-default-rtdb.firebaseio.com",
    projectId: "cyvl-world",
    storageBucket: "cyvl-world.firebasestorage.app",
    messagingSenderId: "749377302571",
    appId: "1:749377302571:web:174fbb645b65fb64727a6e"
  };

  var MAX_ENTRIES = 10;
  var db = null;
  var lastSubmitTime = 0;
  var overlayOpen = false;

  // ---- Firebase Init ----
  function ensureFirebase() {
    if (db) return;
    if (typeof firebase === 'undefined') return;
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }
    db = firebase.database();
  }

  // ---- Data Operations ----
  function submitScore(gameId, name, score, callback) {
    if (Date.now() - lastSubmitTime < 3000) {
      if (callback) callback(null);
      return;
    }
    var entry = {
      name: name.substring(0, 10).toUpperCase(),
      score: Math.max(0, Math.floor(score)),
      ts: Date.now()
    };
    lastSubmitTime = Date.now();
    ensureFirebase();
    if (!db) { if (callback) callback('no-db'); return; }
    db.ref('leaderboards/' + gameId).push(entry, function(err) {
      if (callback) callback(err);
    });
  }

  function getLeaderboard(gameId, callback) {
    ensureFirebase();
    if (!db) { callback([]); return; }
    db.ref('leaderboards/' + gameId)
      .orderByChild('score')
      .limitToLast(MAX_ENTRIES)
      .once('value', function(snap) {
        var entries = [];
        snap.forEach(function(child) { entries.push(child.val()); });
        entries.sort(function(a, b) { return b.score - a.score; });
        callback(entries);
      }, function() { callback([]); });
  }

  // ---- Player Name ----
  function getSavedName() { return localStorage.getItem('cyvlArcadeName') || ''; }
  function saveName(n) { localStorage.setItem('cyvlArcadeName', n); }

  // ---- Styles (injected once) ----
  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var css = document.createElement('style');
    css.textContent = [
      '.cyvl-lb-overlay{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9998;background:rgba(10,10,26,0.93);display:flex;justify-content:center;align-items:center;font-family:"Courier New",monospace;opacity:0;transition:opacity 0.3s}',
      '.cyvl-lb-overlay.visible{opacity:1}',
      '.cyvl-lb-panel{background:#0d1520;border:2px solid #00e5ff;border-radius:4px;padding:24px 28px;max-width:440px;width:92%;box-shadow:0 0 30px rgba(0,229,255,0.3),inset 0 0 20px rgba(0,229,255,0.05)}',
      '.cyvl-lb-title{color:#00e5ff;font-size:1.2rem;text-align:center;letter-spacing:4px;text-shadow:0 0 12px rgba(0,229,255,0.6);margin-bottom:4px}',
      '.cyvl-lb-game{color:#007a8a;font-size:0.7rem;text-align:center;letter-spacing:3px;margin-bottom:16px}',
      '.cyvl-lb-score-row{text-align:center;color:#00ff88;font-size:1.3rem;margin-bottom:16px;text-shadow:0 0 8px rgba(0,255,136,0.4)}',
      '.cyvl-lb-name-section{text-align:center;margin-bottom:16px}',
      '.cyvl-lb-name-label{color:#007a8a;font-size:0.7rem;letter-spacing:2px;margin-bottom:6px}',
      '.cyvl-lb-input{background:#0a0a1a;border:1px solid #007a8a;color:#00e5ff;font-family:"Courier New",monospace;font-size:1.6rem;text-align:center;letter-spacing:8px;padding:8px;width:120px;text-transform:uppercase;outline:none;transition:border-color 0.2s}',
      '.cyvl-lb-input:focus{border-color:#00e5ff;box-shadow:0 0 10px rgba(0,229,255,0.3)}',
      '.cyvl-lb-submit{display:inline-block;margin-top:10px;background:transparent;border:1px solid #00ff88;color:#00ff88;font-family:"Courier New",monospace;font-size:0.8rem;letter-spacing:2px;padding:6px 20px;cursor:pointer;transition:all 0.2s}',
      '.cyvl-lb-submit:hover{background:rgba(0,255,136,0.1);box-shadow:0 0 10px rgba(0,255,136,0.3)}',
      '.cyvl-lb-table{width:100%;border-collapse:collapse;margin:8px 0}',
      '.cyvl-lb-table th{color:#007a8a;font-size:0.65rem;letter-spacing:2px;text-align:left;padding:4px 6px;border-bottom:1px solid #0d2a3a}',
      '.cyvl-lb-table td{color:#8899aa;font-size:0.8rem;padding:5px 6px;border-bottom:1px solid rgba(13,42,58,0.3)}',
      '.cyvl-lb-table tr.cyvl-lb-you td{color:#00ff88;text-shadow:0 0 6px rgba(0,255,136,0.3)}',
      '.cyvl-lb-rank{width:32px;color:#ff6600}',
      '.cyvl-lb-name-col{letter-spacing:2px}',
      '.cyvl-lb-score-col{text-align:right;color:#00e5ff}',
      '.cyvl-lb-empty{color:#334455;text-align:center;padding:20px;font-size:0.8rem;letter-spacing:1px}',
      '.cyvl-lb-close{display:block;margin:14px auto 0;background:transparent;border:1px solid #007a8a;color:#007a8a;font-family:"Courier New",monospace;font-size:0.8rem;letter-spacing:2px;padding:8px 28px;cursor:pointer;transition:all 0.2s}',
      '.cyvl-lb-close:hover{color:#00e5ff;border-color:#00e5ff;box-shadow:0 0 12px rgba(0,229,255,0.4)}',
      '.cyvl-lb-loading{color:#007a8a;text-align:center;padding:16px;font-size:0.75rem;letter-spacing:1px}',
      '.cyvl-lb-error{color:#ff2244;text-align:center;padding:12px;font-size:0.75rem}',
      '.cyvl-lb-mini{margin-top:8px;font-size:0.65rem}',
      '.cyvl-lb-mini-row{display:flex;justify-content:space-between;padding:1px 0;color:#556677}',
      '.cyvl-lb-mini-row .r{color:#ff6600;width:20px}',
      '.cyvl-lb-mini-row .n{color:#8899aa;letter-spacing:1px;flex:1}',
      '.cyvl-lb-mini-row .s{color:#00e5ff;text-align:right}',
    ].join('\n');
    document.head.appendChild(css);
  }

  // ---- Format Score ----
  function fmtScore(n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ---- Build Overlay ----
  function showOverlay(gameId, score, onClose) {
    if (overlayOpen) return;
    overlayOpen = true;
    injectStyles();

    var overlay = document.createElement('div');
    overlay.className = 'cyvl-lb-overlay';

    var gameName = gameId.replace(/-/g, ' ').toUpperCase();

    var panel = document.createElement('div');
    panel.className = 'cyvl-lb-panel';

    // Title
    panel.innerHTML =
      '<div class="cyvl-lb-title">LEADERBOARD</div>' +
      '<div class="cyvl-lb-game">' + gameName + '</div>' +
      '<div class="cyvl-lb-score-row">YOUR SCORE: ' + fmtScore(score) + '</div>';

    // Board container
    var boardDiv = document.createElement('div');
    boardDiv.id = 'cyvl-lb-board';
    boardDiv.innerHTML = '<div class="cyvl-lb-loading">LOADING...</div>';
    panel.appendChild(boardDiv);

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'cyvl-lb-close';
    closeBtn.textContent = '[ESC] CLOSE';
    closeBtn.addEventListener('click', function() { close(); });
    panel.appendChild(closeBtn);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Fade in
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { overlay.classList.add('visible'); });
    });

    // Intercept keyboard
    function onKey(e) {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (e.key === 'Escape') { close(); }
      if (e.key === 'Enter') {
        var inp = document.getElementById('cyvl-lb-name-input');
        if (inp && document.activeElement === inp) {
          doSubmit();
        } else if (!document.getElementById('cyvl-lb-name-input')) {
          close();
        }
      }
    }
    document.addEventListener('keydown', onKey, true);
    overlay.addEventListener('click', function(e) { e.stopPropagation(); });

    function close() {
      overlayOpen = false;
      document.removeEventListener('keydown', onKey, true);
      overlay.classList.remove('visible');
      setTimeout(function() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onClose) onClose();
      }, 300);
    }

    // Check if name exists
    var saved = getSavedName();
    if (saved) {
      // Auto-submit and show board
      submitAndShow(gameId, saved, score, boardDiv);
    } else {
      // Show name input
      showNameInput(gameId, score, boardDiv, panel);
    }

    function doSubmit() {
      var inp = document.getElementById('cyvl-lb-name-input');
      if (!inp) return;
      var name = inp.value.trim().toUpperCase();
      if (name.length === 0) { inp.style.borderColor = '#ff2244'; return; }
      saveName(name);
      // Replace name section with loading
      var sec = document.getElementById('cyvl-lb-name-section');
      if (sec) sec.parentNode.removeChild(sec);
      submitAndShow(gameId, name, score, boardDiv);
    }

    function showNameInput(gid, sc, bd, pnl) {
      var sec = document.createElement('div');
      sec.id = 'cyvl-lb-name-section';
      sec.className = 'cyvl-lb-name-section';
      sec.innerHTML =
        '<div class="cyvl-lb-name-label">ENTER YOUR INITIALS</div>' +
        '<input type="text" id="cyvl-lb-name-input" class="cyvl-lb-input" maxlength="3" autocomplete="off" spellcheck="false" placeholder="___">' +
        '<br><button class="cyvl-lb-submit" id="cyvl-lb-go">SUBMIT</button>';
      pnl.insertBefore(sec, bd);

      var inp = document.getElementById('cyvl-lb-name-input');
      setTimeout(function() { inp.focus(); }, 100);

      document.getElementById('cyvl-lb-go').addEventListener('click', doSubmit);
    }
  }

  function submitAndShow(gameId, name, score, boardDiv) {
    boardDiv.innerHTML = '<div class="cyvl-lb-loading">SUBMITTING...</div>';
    submitScore(gameId, name, score, function(err) {
      if (err) {
        boardDiv.innerHTML = '<div class="cyvl-lb-error">SUBMISSION FAILED</div>';
        loadBoard(gameId, name, boardDiv);
        return;
      }
      loadBoard(gameId, name, boardDiv);
    });
  }

  function loadBoard(gameId, playerName, boardDiv) {
    boardDiv.innerHTML = '<div class="cyvl-lb-loading">LOADING SCORES...</div>';
    getLeaderboard(gameId, function(entries) {
      if (entries.length === 0) {
        boardDiv.innerHTML = '<div class="cyvl-lb-empty">NO SCORES YET — YOU\'RE THE FIRST!</div>';
        return;
      }
      var html = '<table class="cyvl-lb-table"><tr><th>RANK</th><th>NAME</th><th style="text-align:right">SCORE</th></tr>';
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        var isYou = e.name === playerName.toUpperCase();
        html += '<tr class="' + (isYou ? 'cyvl-lb-you' : '') + '">' +
          '<td class="cyvl-lb-rank">' + (i + 1) + '.</td>' +
          '<td class="cyvl-lb-name-col">' + escHtml(e.name) + (isYou ? ' \u25C0' : '') + '</td>' +
          '<td class="cyvl-lb-score-col">' + fmtScore(e.score) + '</td></tr>';
      }
      html += '</table>';
      boardDiv.innerHTML = html;
    });
  }

  function escHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ---- Mini Leaderboard (for hub page) ----
  function renderMini(containerId, gameId, count) {
    injectStyles();
    var el = document.getElementById(containerId);
    if (!el) return;
    count = count || 3;
    ensureFirebase();
    if (!db) { el.innerHTML = ''; return; }
    db.ref('leaderboards/' + gameId)
      .orderByChild('score')
      .limitToLast(count)
      .once('value', function(snap) {
        var entries = [];
        snap.forEach(function(child) { entries.push(child.val()); });
        entries.sort(function(a, b) { return b.score - a.score; });
        if (entries.length === 0) { el.innerHTML = ''; return; }
        var html = '<div class="cyvl-lb-mini">';
        for (var i = 0; i < entries.length; i++) {
          html += '<div class="cyvl-lb-mini-row">' +
            '<span class="r">' + (i + 1) + '.</span>' +
            '<span class="n">' + escHtml(entries[i].name) + '</span>' +
            '<span class="s">' + fmtScore(entries[i].score) + '</span></div>';
        }
        html += '</div>';
        el.innerHTML = html;
      }, function() { el.innerHTML = ''; });
  }

  // ---- Public API ----
  window.CyvlLeaderboard = {
    show: function(gameId, score, onClose) { showOverlay(gameId, score, onClose); },
    isOpen: function() { return overlayOpen; },
    submit: submitScore,
    get: getLeaderboard,
    renderMini: renderMini,
    getSavedName: getSavedName,
    saveName: saveName
  };
})();
