/* AgentTV · retention layer · client-side localStorage helpers
   Public API:
     window.AgentTV.addToWatchlist(name, type, url)
     window.AgentTV.removeFromWatchlist(name)
     window.AgentTV.isFollowing(name)
     window.AgentTV.getFollows()
     window.AgentTV.getFollowCount(name)
*/
(function () {
  'use strict';

  var STORAGE_KEY = 'agenttv-follows';
  var COUNT_KEY = 'agenttv-follow-counts';

  function readFollows() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeFollows(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) { /* quota or private mode */ }
  }

  function readCounts() {
    try {
      var raw = localStorage.getItem(COUNT_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (e) { return {}; }
  }

  function writeCounts(map) {
    try { localStorage.setItem(COUNT_KEY, JSON.stringify(map)); } catch (e) {}
  }

  // Seeded "social proof" baseline so the counter doesn't read zero on a cold page.
  function seedCount(name) {
    var counts = readCounts();
    if (counts[name] == null) {
      // Deterministic seed from name length plus a small fixed bias.
      var base = 412 + (name.length * 37) % 2200;
      counts[name] = base;
      writeCounts(counts);
    }
    return counts[name];
  }

  function bumpCount(name, delta) {
    var counts = readCounts();
    counts[name] = Math.max(0, (counts[name] || seedCount(name)) + delta);
    writeCounts(counts);
    return counts[name];
  }

  function isFollowing(name) {
    return readFollows().some(function (f) { return f.name === name; });
  }

  function addToWatchlist(name, type, url) {
    if (!name) return false;
    var list = readFollows();
    if (list.some(function (f) { return f.name === name; })) return false;
    list.push({
      name: name,
      type: type || 'player',
      url: url || (typeof location !== 'undefined' ? location.pathname.split('/').pop() : ''),
      addedAt: new Date().toISOString()
    });
    writeFollows(list);
    bumpCount(name, +1);
    return true;
  }

  function removeFromWatchlist(name) {
    var list = readFollows();
    var next = list.filter(function (f) { return f.name !== name; });
    if (next.length === list.length) return false;
    writeFollows(next);
    bumpCount(name, -1);
    return true;
  }

  function getFollows() { return readFollows(); }
  function getFollowCount(name) {
    var c = readCounts();
    return c[name] != null ? c[name] : seedCount(name);
  }

  /* ---------- Follow button injection ---------- */

  function detectPlayerName() {
    // Prefer .wiki-infobox-name, then .page-title inside .page-header.
    var infoName = document.querySelector('.wiki-infobox-name');
    if (infoName && infoName.textContent.trim()) return infoName.textContent.trim();
    var pageTitle = document.querySelector('.page-header .page-title');
    if (pageTitle && pageTitle.textContent.trim()) return pageTitle.textContent.trim();
    var bannerName = document.querySelector('.profile-banner .profile-banner-inner h1, .profile-banner h1');
    if (bannerName && bannerName.textContent.trim()) return bannerName.textContent.trim();
    return null;
  }

  function detectPlayerType() {
    var path = (location.pathname || '').toLowerCase();
    if (/team|sentinels|fnatic|liquid|navi|g2|faze|tsm|nrg|loud|t1|geng|jdg|blg|spirit|vitality|mouz|dignitas|100thieves|paperrex|darkzero|furia|eg|wave|twistedminds|falcons/.test(path)) {
      // Heuristic: many team pages use these slugs. Default still player unless explicit.
    }
    if (/tournament|fncs|wc20|katowice|masters|major/.test(path)) return 'tournament';
    return 'player';
  }

  function injectFollowButton() {
    if (document.querySelector('[data-agenttv-follow]')) return;
    var name = detectPlayerName();
    if (!name) return;

    // Find the best mount point.
    var mount = document.querySelector('.profile-banner-inner') ||
                document.querySelector('.page-header') ||
                document.querySelector('.wiki-infobox');
    if (!mount) return;

    var type = detectPlayerType();
    var following = isFollowing(name);
    var count = getFollowCount(name);

    var wrap = document.createElement('div');
    wrap.setAttribute('data-agenttv-follow', '1');
    wrap.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:12px;flex-wrap:wrap;';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-watch';
    btn.style.cssText = 'background:' + (following ? '#1d1d1d' : '#cc0000') + ';color:#fff;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:8px 14px;border-radius:2px;cursor:pointer;';
    btn.textContent = following ? '★ Following' : '★ Follow';

    var pulse = document.createElement('span');
    pulse.setAttribute('data-agenttv-count', '1');
    pulse.style.cssText = 'font-size:11px;color:#6b6b73;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;display:inline-flex;align-items:center;gap:6px;';
    pulse.innerHTML = '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#cc0000;box-shadow:0 0 0 0 rgba(204,0,0,0.6);animation:agenttvPulse 1.6s infinite;"></span><span data-agenttv-count-num>' + count.toLocaleString() + '</span> following';

    // pulse keyframes (inline so we don't touch styles.css)
    if (!document.getElementById('agenttv-pulse-css')) {
      var s = document.createElement('style');
      s.id = 'agenttv-pulse-css';
      s.textContent = '@keyframes agenttvPulse { 0% { box-shadow: 0 0 0 0 rgba(204,0,0,0.6); } 70% { box-shadow: 0 0 0 8px rgba(204,0,0,0); } 100% { box-shadow: 0 0 0 0 rgba(204,0,0,0); } }';
      document.head.appendChild(s);
    }

    btn.addEventListener('click', function () {
      var nowFollowing;
      if (isFollowing(name)) {
        removeFromWatchlist(name);
        nowFollowing = false;
      } else {
        addToWatchlist(name, type, location.pathname.split('/').pop() || location.pathname);
        nowFollowing = true;
      }
      btn.textContent = nowFollowing ? '★ Following' : '★ Follow';
      btn.style.background = nowFollowing ? '#1d1d1d' : '#cc0000';
      var n = pulse.querySelector('[data-agenttv-count-num]');
      if (n) n.textContent = getFollowCount(name).toLocaleString();
    });

    wrap.appendChild(btn);
    wrap.appendChild(pulse);

    // Insert near the top of the mount.
    if (mount.firstChild) {
      mount.appendChild(wrap);
    } else {
      mount.appendChild(wrap);
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    try { injectFollowButton(); } catch (e) { /* never break the host page */ }
  });

  window.AgentTV = {
    addToWatchlist: addToWatchlist,
    removeFromWatchlist: removeFromWatchlist,
    isFollowing: isFollowing,
    getFollows: getFollows,
    getFollowCount: getFollowCount,
    _injectFollowButton: injectFollowButton
  };
})();
