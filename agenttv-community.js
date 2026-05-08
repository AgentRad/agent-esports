/**
 * agenttv-community.js
 * Community / live-chat client-side enhancements for AgentTV.
 * Module pattern · self-contained · no dependencies on app.js or agenttv.js.
 *
 * Adds:
 *  - Thread upvote buttons (increment locally, persist to localStorage)
 *  - Poll voting (one vote per poll, persist to localStorage, animate selection)
 *  - "Active reader" / "viewer count" pulse simulation every 5 seconds
 *  - Auto-scroll the live chat feed to the bottom on load
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'agenttv:community:v1';

  // ----- storage -----
  function readStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { votes: {}, polls: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { votes: {}, polls: {} };
      parsed.votes = parsed.votes || {};
      parsed.polls = parsed.polls || {};
      return parsed;
    } catch (e) {
      return { votes: {}, polls: {} };
    }
  }
  function writeStore(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ----- thread upvote -----
  function initThreadVotes() {
    var buttons = document.querySelectorAll('.vote-btn[data-thread]');
    if (!buttons.length) return;
    var state = readStore();

    buttons.forEach(function (btn) {
      var id = btn.getAttribute('data-thread');
      var countEl = document.querySelector('.vote-count[data-vote="' + id + '"]');
      if (!countEl) return;
      var base = parseInt(countEl.textContent, 10) || 0;
      var voted = !!state.votes[id];

      // Apply persisted state on load
      if (voted) {
        btn.classList.add('voted');
        countEl.textContent = String(base + 1);
      }

      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var currentState = readStore();
        var isVoted = !!currentState.votes[id];
        var current = parseInt(countEl.textContent, 10) || 0;

        if (isVoted) {
          delete currentState.votes[id];
          btn.classList.remove('voted');
          countEl.textContent = String(Math.max(0, current - 1));
        } else {
          currentState.votes[id] = 1;
          btn.classList.add('voted');
          countEl.textContent = String(current + 1);
        }
        writeStore(currentState);
      });
    });
  }

  // ----- poll voting -----
  function initPolls() {
    var pollBlocks = document.querySelectorAll('.comm-poll[data-poll]');
    if (!pollBlocks.length) return;
    var state = readStore();

    pollBlocks.forEach(function (block) {
      var pollId = block.getAttribute('data-poll');
      var options = block.querySelectorAll('.poll-opt');
      var votedOpt = state.polls[pollId];

      if (votedOpt) {
        options.forEach(function (opt) {
          if (opt.getAttribute('data-opt') === votedOpt) opt.classList.add('voted');
        });
      }

      options.forEach(function (opt) {
        opt.addEventListener('click', function (ev) {
          ev.preventDefault();
          var currentState = readStore();
          var prev = currentState.polls[pollId];
          var thisOpt = opt.getAttribute('data-opt');

          // Clear previous selection in this poll
          options.forEach(function (o) { o.classList.remove('voted'); });

          if (prev === thisOpt) {
            // Toggle off · removes vote
            delete currentState.polls[pollId];
          } else {
            currentState.polls[pollId] = thisOpt;
            opt.classList.add('voted');
          }
          writeStore(currentState);
        });
      });
    });
  }

  // ----- pulse simulator (active readers / chat viewers) -----
  function pulseCount(el, opts) {
    if (!el) return;
    var base = parseInt((el.textContent || '').replace(/[^\d]/g, ''), 10);
    if (!base || isNaN(base)) return;
    var min = opts && opts.min ? opts.min : Math.max(50, Math.floor(base * 0.97));
    var max = opts && opts.max ? opts.max : Math.floor(base * 1.03);
    var suffix = (opts && opts.suffix) || '';

    setInterval(function () {
      // Random walk around the original base
      var drift = Math.floor((Math.random() - 0.5) * (max - min) * 0.6);
      var next = base + drift;
      if (next < min) next = min;
      if (next > max) next = max;
      el.textContent = next.toLocaleString() + suffix;
    }, 5000);
  }

  function initPulse() {
    var readers = document.getElementById('active-readers');
    if (readers) {
      // Preserve "active readers" suffix
      pulseCount(readers, { suffix: ' active readers' });
    }
    var viewers = document.getElementById('chat-viewer-count');
    if (viewers) pulseCount(viewers);
  }

  // ----- start-thread placeholder -----
  function initStartThread() {
    var btn = document.getElementById('start-thread');
    if (!btn) return;
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      // Visible placeholder confirmation, no real submit
      var original = btn.textContent;
      btn.textContent = 'Sign-in required · coming soon';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1800);
    });
  }

  // ----- live chat: auto-scroll & input placeholder -----
  function initChat() {
    var feed = document.getElementById('chat-feed');
    if (feed) feed.scrollTop = feed.scrollHeight;

    var form = document.getElementById('chat-input');
    if (form) {
      var input = form.querySelector('input');
      var btn = form.querySelector('button');
      if (btn && input) {
        btn.addEventListener('click', function (ev) {
          ev.preventDefault();
          if (!input.value.trim()) return;
          var original = input.value;
          input.value = '';
          input.placeholder = 'Sent (placeholder · message not delivered)';
          input.disabled = true;
          setTimeout(function () {
            input.disabled = false;
            input.placeholder = 'Send a message... (placeholder · not connected to a real backend)';
            input.focus();
          }, 1500);
          // Discard the value · this is a placeholder
          void original;
        });
      }
    }
  }

  function init() {
    initThreadVotes();
    initPolls();
    initPulse();
    initStartThread();
    initChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
