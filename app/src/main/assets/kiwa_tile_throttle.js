/* Kiwa tile throttle: smooths out rapid tile re-requests during pinch-zoom
 * to prevent the "invalid tile command" error in the COOL renderer.
 *
 * Root cause: during a fast pinch-zoom, the COOL JS sends many `tile`
 * commands with rapidly changing coordinates and zoom levels. The native
 * engine can fall behind, then surface an error like "the server
 * encountered an invalid error while parsing the tile command".
 *
 * Fix: wrap the socket's sendMessage so `tile`/`tilecombine` commands are
 * debounced — only the latest tile request within a short window is sent,
 * older ones are dropped. Non-tile commands pass through immediately.
 */
(function() {
  if (window.__kiwaTileThrottle) return;
  window.__kiwaTileThrottle = true;

  var DEBOUNCE_MS = 25;          // cap burst of pinch-zoom tile requests
  var MAX_QUEUE_AGE_MS = 120;    // drop requests older than this

  function findSocket() {
    if (window.socket && typeof window.socket.sendMessage === 'function') return window.socket;
    if (window.app && window.app.socket && typeof window.app.socket.sendMessage === 'function') return window.app.socket;
    if (window.app && window.app.socket && window.app.socket.socket &&
        typeof window.app.socket.socket.sendMessage === 'function') return window.app.socket.socket;
    return null;
  }

  var installed = false;
  var pending = null;       // {msg, ts}
  var pendingTimer = null;

  function install(s) {
    if (!s || s.__kiwaTileThrottled) return;
    s.__kiwaTileThrottled = true;
    var orig = s.sendMessage.bind(s);
    s.sendMessage = function(msg) {
      try {
        if (typeof msg === 'string' &&
            (msg.indexOf('tilecombine') === 0 || msg.indexOf('tile ') === 0 ||
             msg.indexOf('tile ') === 0 || msg.indexOf('tilecombine ') === 0)) {
          // Replace the pending tile request with this newer one — the
          // older one would be a stale tile by the time it renders.
          var now = Date.now();
          // If a pending tile was waiting to be sent, drop it — the new
          // request supersedes it. Also drop if it's older than the cap.
          if (pending && (now - pending.ts) > MAX_QUEUE_AGE_MS) {
            pending = null;
          }
          pending = { msg: msg, ts: now };
          if (pendingTimer) clearTimeout(pendingTimer);
          pendingTimer = setTimeout(function() {
            if (!pending) return;
            var toSend = pending.msg;
            pending = null;
            pendingTimer = null;
            try { orig(toSend); } catch (e) {}
          }, DEBOUNCE_MS);
          return;
        }
      } catch (e) { /* fall through to original */ }
      return orig(msg);
    };
    installed = true;
  }

  // Try installing on a polling schedule because the socket is created
  // asynchronously by cool.html after it loads.
  var attempts = 0;
  function tryInstall() {
    if (installed) return;
    if (attempts++ > 60) return;  // ~30s
    var s = findSocket();
    if (s) {
      install(s);
    } else {
      setTimeout(tryInstall, 500);
    }
  }
  tryInstall();

  // Also re-install if the socket is replaced (e.g. document reload)
  // by checking every 5s for the first 60s.
  var recheckAttempts = 0;
  function recheck() {
    if (recheckAttempts++ > 12) return;
    var s = findSocket();
    if (s && !s.__kiwaTileThrottled) install(s);
    setTimeout(recheck, 5000);
  }
  setTimeout(recheck, 5000);

  console.log('[Kiwa] tile throttle installed');
})();
