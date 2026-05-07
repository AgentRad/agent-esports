// ============= GLOBAL SEARCH OVERLAY =============
(function() {
  const INDEX = [
    // Players
    { type: 'player', name: 'Peterbot', meta: 'Peter Kata · Team Falcons · 18 yo · NA-E', url: 'player.html', cls: 'bg-falcons' },
    { type: 'player', name: 'Pollo', meta: 'Miguel Moreno · Team Falcons · 17 yo · NA-E', url: 'pollo.html', cls: 'bg-falcons' },
    { type: 'player', name: 'Bugha', meta: 'Kyle Giersdorf · Free Agent · 2019 World Cup Champion', url: 'bugha.html', cls: 'bg-default' },
    { type: 'player', name: 'Khanada', meta: 'Leon Khim Woobin · Dignitas · 21 yo · NA-W', url: 'khanada.html', cls: 'bg-dignitas' },
    { type: 'player', name: 'Mongraal', meta: 'Kyle Jackson · Former FaZe · UK · 21 yo', url: 'mongraal.html', cls: 'bg-faze' },
    { type: 'player', name: 'MrSavage', meta: 'Martin Foss Andersen · 100 Thieves · NOR · 21 yo', url: 'mrsavage.html', cls: 'bg-100t' },
    { type: 'player', name: 'EpikWhale', meta: 'Shane Cotton · XP42 Esports · 23 yo · NA-W', url: 'epikwhale.html', cls: 'bg-nrg' },
    { type: 'player', name: 'Ninja', meta: 'Tyler Blevins · Streamer · 18.6M Twitch followers', url: 'ninja.html', cls: 'bg-default' },
    { type: 'player', name: 'Tfue', meta: 'Turner Tenney · Retired · 11.4M Twitch followers', url: 'tfue.html', cls: 'bg-faze' },
    { type: 'player', name: 'Clix', meta: 'Cody Conrod · XSET · NA-E · 5.8M Twitch', url: 'clix.html', cls: 'bg-default' },
    { type: 'player', name: 'Aqua', meta: 'David Wang · 2019 World Cup Duo Champion · AUT', url: 'aqua.html', cls: 'bg-liquid' },
    { type: 'player', name: 'Nyhrox', meta: 'Emil Bergquist Pedersen · 2019 World Cup Duo Champion · NOR', url: 'nyhrox.html', cls: 'bg-default' },
    { type: 'player', name: 'MariusCOW', meta: 'Marius Wendt · Gentle Mates · 19 yo · DEN', url: 'mariuscow.html', cls: 'bg-default' },
    // Teams
    { type: 'team', name: 'Team Falcons', meta: 'Saudi-backed · #1 Org Power Index · 8 active FN players', url: 'team.html', cls: 'bg-falcons' },
    { type: 'team', name: 'Dignitas', meta: 'New Jersey · #2 Org Power Index · 4 active FN players', url: 'dignitas.html', cls: 'bg-dignitas' },
    { type: 'team', name: 'FaZe Clan', meta: 'Los Angeles · #3 Org Power Index · 5 active FN players', url: 'faze.html', cls: 'bg-faze' },
    { type: 'team', name: 'NRG', meta: 'Los Angeles · #4 Org Power Index · 6 active FN players', url: 'nrg.html', cls: 'bg-nrg' },
    { type: 'team', name: '100 Thieves', meta: 'Founded by Nadeshot · #5 Org Power Index', url: '100thieves.html', cls: 'bg-100t' },
    // Tournaments
    { type: 'tournament', name: 'Fortnite World Cup 2019', meta: 'Arthur Ashe Stadium · $30M prize pool · Bugha won Solo', url: 'tournament-wc2019.html', cls: 'bg-default' },
    { type: 'tournament', name: 'FNCS 2024 Global Championship', meta: 'Copenhagen LAN · Peterbot &amp; Pollo won $400K', url: 'tournament-fncs2024-global.html', cls: 'bg-faze' },
    { type: 'tournament', name: 'FNCS 2026 Major 1 Summit', meta: 'Live · Day 2 · Pollo &amp; Acorn lead 770 pts', url: 'event.html', cls: 'bg-falcons' },
    // Pages
    { type: 'page', name: 'Power Rankings', meta: 'Top 25 Fortnite players globally', url: 'index.html', cls: 'bg-default' },
    { type: 'page', name: 'Players Directory', meta: '12,847 indexed players · A-Z searchable', url: 'players.html', cls: 'bg-default' },
    { type: 'page', name: 'Teams Index', meta: 'All Fortnite organizations · Tier 1 + 2 + past', url: 'teams.html', cls: 'bg-default' },
    { type: 'page', name: 'Tournaments', meta: 'Live, upcoming, and historical events', url: 'tournaments.html', cls: 'bg-default' },
    { type: 'page', name: 'Stats &amp; Leaderboards', meta: 'Career earnings, K/D, win rate, FNCS Avg.', url: 'stats.html', cls: 'bg-default' },
    { type: 'page', name: 'History', meta: 'Fortnite competitive timeline 2018 to 2026', url: 'history.html', cls: 'bg-default' },
    { type: 'page', name: 'Compare Players', meta: 'Side-by-side stat comparison', url: 'compare.html', cls: 'bg-default' },
    { type: 'page', name: 'Coach Profiles', meta: 'Cordell · Falcons head coach', url: 'coach.html', cls: 'bg-default' },
    { type: 'page', name: 'News &amp; Articles', meta: 'Long-form features and analysis', url: 'article.html', cls: 'bg-default' }
  ];

  // Inject overlay into the page
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-modal">
      <input type="search" class="search-modal-input" id="search-modal-input" placeholder="Search players, teams, tournaments..." autocomplete="off" />
      <div class="search-results" id="search-results"></div>
      <div class="search-hint">
        <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate · <kbd>↵</kbd> Select · <kbd>esc</kbd> Close</span>
        <span>${INDEX.length} indexed entries</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('search-modal-input');
  const resultsEl = document.getElementById('search-results');
  let activeIdx = 0;
  let currentResults = [];

  function render(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      currentResults = INDEX.slice(0, 8);
    } else {
      currentResults = INDEX
        .map(item => {
          const name = item.name.toLowerCase();
          const meta = item.meta.toLowerCase();
          let score = 0;
          if (name === q) score = 1000;
          else if (name.startsWith(q)) score = 500;
          else if (name.includes(q)) score = 200;
          else if (meta.includes(q)) score = 50;
          return { item, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12)
        .map(x => x.item);
    }
    activeIdx = 0;
    if (!currentResults.length) {
      resultsEl.innerHTML = `<div class="search-empty">No results for "${query}". Try a player name like "Peterbot" or "Bugha".</div>`;
      return;
    }
    resultsEl.innerHTML = currentResults.map((r, i) => `
      <a class="search-result${i === 0 ? ' active' : ''}" href="${r.url}">
        <div class="sr-icon ${r.cls}">${r.name.charAt(0)}</div>
        <div>
          <div class="sr-name">${r.name}</div>
          <div class="sr-meta">${r.meta}</div>
        </div>
        <div class="sr-type ${r.type}">${r.type}</div>
      </a>
    `).join('');
  }

  function open() { overlay.classList.add('open'); input.value = ''; render(''); setTimeout(() => input.focus(), 50); }
  function close() { overlay.classList.remove('open'); }

  // Wire up all .search-box inputs in the page to open the overlay on focus
  document.querySelectorAll('.search-box').forEach(box => {
    box.addEventListener('focus', (e) => { e.preventDefault(); box.blur(); open(); });
    box.addEventListener('click', (e) => { e.preventDefault(); open(); });
  });

  // Escape, click outside
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !overlay.classList.contains('open') && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      open();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); open(); }
    if (overlay.classList.contains('open')) {
      if (e.key === 'Escape') { close(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, currentResults.length - 1); updateActive(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); updateActive(); }
      if (e.key === 'Enter') {
        const r = currentResults[activeIdx];
        if (r) window.location.href = r.url;
      }
    }
  });
  function updateActive() {
    resultsEl.querySelectorAll('.search-result').forEach((el, i) => {
      el.classList.toggle('active', i === activeIdx);
      if (i === activeIdx) el.scrollIntoView({ block: 'nearest' });
    });
  }
  input.addEventListener('input', e => render(e.target.value));
})();

// ============= SCORE STRIP (ESPN-style horizontal scroll of live games) =============
(function() {
  const games = [
    {
      league: 'FNCS Major 1 · Summit',
      status: 'LIVE · Game 11', live: true,
      a: { logo: 'F', cls: 'bg-falcons', name: 'Pollo / Acorn / Ajerss', score: '770' },
      b: { logo: 'D', cls: 'bg-dignitas', name: 'Khanada / Rapid / Boltz', score: '710' }
    },
    {
      league: 'CS2 · IEM Katowice QF',
      status: 'LIVE · Map 2 (Mirage)', live: true,
      a: { logo: 'V', cls: 'bg-vit', name: 'Vitality', score: '13' },
      b: { logo: 'F', cls: 'bg-faze', name: 'FaZe', score: '11' }
    },
    {
      league: 'Valorant · VCT Masters',
      status: 'LIVE · Map 1', live: true,
      a: { logo: 'S', cls: 'bg-sentinels', name: 'Sentinels', score: '8' },
      b: { logo: 'EG', cls: 'bg-100t', name: 'Evil Geniuses', score: '6' }
    },
    {
      league: 'FNCS · EU Major 2 GF',
      status: 'LIVE · Game 8', live: true,
      a: { logo: 'M', cls: 'bg-default', name: 'MariusCOW / Pixie / Vanyak', score: '298' },
      b: { logo: 'F', cls: 'bg-default', name: 'Flickzy / Sky / Scroll', score: '284' }
    },
    {
      league: 'CS2 · ESL Pro League',
      status: 'LIVE · Map 1', live: true,
      a: { logo: 'S', cls: 'bg-default', name: 'Spirit', score: '9' },
      b: { logo: 'N', cls: 'bg-navi', name: 'NaVi', score: '11' }
    },
    {
      league: 'LoL · LCS Spring Final',
      status: 'LIVE · Game 3', live: true,
      a: { logo: 'C9', cls: 'bg-default', name: 'Cloud9', score: '2' },
      b: { logo: 'TL', cls: 'bg-liquid', name: 'Team Liquid', score: '1' }
    },
    {
      league: 'CS2 · BLAST Premier',
      status: '5:00 PM ET', live: false,
      a: { logo: 'G2', cls: 'bg-g2', name: 'G2', score: '·' },
      b: { logo: 'M', cls: 'bg-default', name: 'MOUZ', score: '·' }
    },
    {
      league: 'Valorant · VCT Masters',
      status: '6:30 PM ET', live: false,
      a: { logo: 'L', cls: 'bg-loud', name: 'LOUD', score: '·' },
      b: { logo: 'F', cls: 'bg-furia', name: 'FURIA', score: '·' }
    },
    {
      league: 'Apex · ALGS Split 2',
      status: '7:00 PM ET', live: false,
      a: { logo: 'T', cls: 'bg-tsm', name: 'TSM', score: '·' },
      b: { logo: 'N', cls: 'bg-nrg', name: 'NRG', score: '·' }
    },
    {
      league: 'CoD · CDL Major',
      status: '8:30 PM ET', live: false,
      a: { logo: 'O', cls: 'bg-default', name: 'OpTic Texas', score: '·' },
      b: { logo: 'A', cls: 'bg-default', name: 'Atlanta FaZe', score: '·' }
    }
  ];

  function gameCard(g) {
    const aLost = g.live && parseFloat(g.a.score) < parseFloat(g.b.score);
    const bLost = g.live && parseFloat(g.b.score) < parseFloat(g.a.score);
    return `
      <a href="event.html" class="score-card${g.live ? '' : ' upcoming'}">
        <div class="score-card-head">
          <span>${g.league}</span>
          ${g.live ? '<span class="live-pip">LIVE</span>' : `<span>${g.status}</span>`}
        </div>
        <div class="score-team">
          <div class="t-logo ${g.a.cls}">${g.a.logo}</div>
          <div class="t-name${aLost ? ' lost' : ''}">${g.a.name}</div>
          <div class="t-score${aLost ? ' lost' : ''}">${g.a.score}</div>
        </div>
        <div class="score-team">
          <div class="t-logo ${g.b.cls}">${g.b.logo}</div>
          <div class="t-name${bLost ? ' lost' : ''}">${g.b.name}</div>
          <div class="t-score${bLost ? ' lost' : ''}">${g.b.score}</div>
        </div>
      </a>
    `;
  }

  const el = document.getElementById('scorestrip');
  if (el) el.innerHTML = games.map(gameCard).join('');
})();

// Live point counter · periodically tick scores up
(function() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;
  function bump() {
    const idx = Math.floor(Math.random() * counters.length);
    const el = counters[idx];
    const cur = parseInt(el.textContent, 10);
    const inc = Math.random() < 0.6 ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 12) + 5;
    const next = cur + inc;
    el.textContent = next;
    const delta = el.parentElement.querySelector('.delta');
    if (delta) {
      delta.textContent = '+' + inc;
      delta.classList.add('show');
      setTimeout(() => delta.classList.remove('show'), 1400);
    }
  }
  setInterval(bump, 1800);
})();

// Game clocks tick up
(function() {
  const clocks = document.querySelectorAll('[data-clock]');
  if (!clocks.length) return;
  setInterval(() => {
    clocks.forEach(c => {
      const [m, s] = c.textContent.split(':').map(Number);
      let total = m * 60 + s + 1;
      const mm = String(Math.floor(total / 60)).padStart(2, '0');
      const ss = String(total % 60).padStart(2, '0');
      c.textContent = `${mm}:${ss}`;
    });
  }, 1000);
})();

// PR chart for player profile page
(function() {
  const svg = document.getElementById('pr-chart');
  if (!svg) return;
  const data = [2080, 2150, 2220, 2280, 2310, 2410, 2480, 2540, 2610, 2680, 2740, 2820, 2870, 2930, 2980, 3020, 3080, 3120, 3160, 3190, 3220, 3240, 3260, 3275, 3284, 3284];
  const labels = ['Nov', '', '', 'Dec', '', '', 'Jan', '', '', 'Feb', '', '', 'Mar', '', '', 'Apr', '', '', 'May', '', '', '', '', '', '', 'Now'];
  const w = 800, h = 240, padL = 40, padR = 16, padT = 16, padB = 28;
  const min = Math.min(...data) - 80;
  const max = Math.max(...data) + 80;
  const xs = (i) => padL + (i / (data.length - 1)) * (w - padL - padR);
  const ys = (v) => h - padB - ((v - min) / (max - min)) * (h - padT - padB);
  const points = data.map((v, i) => [xs(i), ys(v)]);
  const path = points.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = path + ` L ${xs(data.length - 1)} ${h - padB} L ${padL} ${h - padB} Z`;

  let gridY = '';
  for (let i = 0; i <= 4; i++) {
    const y = padT + (i / 4) * (h - padT - padB);
    const v = Math.round(max - (i / 4) * (max - min));
    gridY += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#e5e5e7"/>`;
    gridY += `<text x="${padL - 8}" y="${y + 4}" fill="#9a9aa3" font-size="10" font-family="JetBrains Mono" text-anchor="end" font-weight="700">${v}</text>`;
  }

  let xLabels = '';
  labels.forEach((lab, i) => {
    if (lab) {
      xLabels += `<text x="${xs(i)}" y="${h - 8}" fill="#9a9aa3" font-size="10" font-family="JetBrains Mono" text-anchor="middle" font-weight="700">${lab}</text>`;
    }
  });

  const dots = points.map((p, i) => i === points.length - 1 ? `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#cc0000" stroke="#fff" stroke-width="3"/>` : '').join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="prGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#cc0000" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#cc0000" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${gridY}
    ${xLabels}
    <path d="${area}" fill="url(#prGrad)"/>
    <path d="${path}" stroke="#cc0000" stroke-width="2.5" fill="none"/>
    ${dots}
  `;
})();
