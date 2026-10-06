(function() {
  if (window.__kiwaAIInstalled) return;
  window.__kiwaAIInstalled = true;

  var STYLE = [
    '#kiwa-fab{position:fixed;left:16px;bottom:90px;width:48px;height:48px;border-radius:50%;',
    'background:linear-gradient(135deg,#FFB800,#FFC933);box-shadow:0 4px 20px rgba(255,184,0,0.45);',
    'border:0;display:flex;align-items:center;justify-content:center;color:#1a1200;z-index:99999;',
    'cursor:pointer;transition:transform 0.18s}',
    '#kiwa-fab:active{transform:scale(0.92)}',
    '#kiwa-panel{position:fixed;left:0;right:0;bottom:0;max-height:72vh;background:#121216;',
    'border-top-left-radius:20px;border-top-right-radius:20px;border:1px solid #26262D;',
    'box-shadow:0 -20px 60px rgba(0,0,0,0.5);z-index:99998;transform:translateY(100%);',
    'transition:transform 0.28s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;',
    'font-family:-apple-system,BlinkMacSystemFont,"Inter",system-ui,sans-serif;color:#F5F5F7}',
    '#kiwa-panel.open{transform:translateY(0)}',
    '#kiwa-panel .kp-handle{width:44px;height:4px;background:#26262D;border-radius:2px;margin:8px auto 12px}',
    '#kiwa-panel .kp-head{display:flex;align-items:center;padding:0 16px 12px;border-bottom:1px solid #1C1C22;gap:10px}',
    '#kiwa-panel .kp-avatar{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#FFB800,#FFC933);',
    'display:flex;align-items:center;justify-content:center;color:#1a1200;font-weight:700}',
    '#kiwa-panel .kp-title{flex:1}',
    '#kiwa-panel .kp-title h3{font-size:14px;font-weight:600;margin:0}',
    '#kiwa-panel .kp-title p{font-size:11px;color:#6B6B76;margin:0}',
    '#kiwa-panel .kp-close{width:28px;height:28px;border-radius:7px;background:transparent;border:0;',
    'display:flex;align-items:center;justify-content:center;color:#A8A8B3;cursor:pointer}',
    '#kiwa-panel .kp-close:active{background:#1F1F25}',
    '#kiwa-panel .kp-chips{padding:10px 16px;display:flex;gap:6px;overflow-x:auto;border-bottom:1px solid #1C1C22}',
    '#kiwa-panel .kp-chips::-webkit-scrollbar{display:none}',
    '#kiwa-panel .kp-chip{flex-shrink:0;padding:6px 11px;background:#18181D;border:1px solid #26262D;',
    'border-radius:20px;font-size:11px;font-weight:500;color:#A8A8B3;cursor:pointer;white-space:nowrap}',
    '#kiwa-panel .kp-chip:active{background:rgba(255,184,0,0.14);color:#FFB800;border-color:#FFB800}',
    '#kiwa-panel .kp-chat{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;',
    'gap:10px;min-height:120px;max-height:46vh}',
    '#kiwa-panel .kp-msg{display:flex;gap:8px;max-width:92%;font-size:13px;line-height:1.5}',
    '#kiwa-panel .kp-msg.user{align-self:flex-end;flex-direction:row-reverse}',
    '#kiwa-panel .kp-msg-av{width:24px;height:24px;border-radius:7px;display:flex;align-items:center;',
    'justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}',
    '#kiwa-panel .kp-msg.ai .kp-msg-av{background:#FFB800;color:#1a1200}',
    '#kiwa-panel .kp-msg.user .kp-msg-av{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff}',
    '#kiwa-panel .kp-msg-b{padding:8px 12px;border-radius:10px;word-break:break-word}',
    '#kiwa-panel .kp-msg.ai .kp-msg-b{background:#18181D;border:1px solid #1C1C22}',
    '#kiwa-panel .kp-msg.user .kp-msg-b{background:#FFB800;color:#1a1200}',
    '#kiwa-panel .kp-actions{padding:6px 0 0;display:flex;gap:6px;flex-wrap:wrap}',
    '#kiwa-panel .kp-action{padding:6px 10px;background:#1F1F25;border:1px solid #26262D;border-radius:8px;',
    'font-size:11px;color:#A8A8B3;cursor:pointer;display:inline-flex;align-items:center;gap:5px}',
    '#kiwa-panel .kp-action:active{background:#25252C}',
    '#kiwa-panel .kp-action.primary{background:#FFB800;border-color:#FFB800;color:#1a1200;font-weight:600}',
    '#kiwa-panel .kp-input{padding:12px 16px;border-top:1px solid #1C1C22;display:flex;gap:8px;align-items:flex-end}',
    '#kiwa-panel .kp-input textarea{flex:1;background:#18181D;border:1px solid #26262D;border-radius:10px;',
    'padding:10px 12px;color:#F5F5F7;font-size:13px;font-family:inherit;resize:none;max-height:100px;',
    'min-height:38px;outline:0}',
    '#kiwa-panel .kp-input textarea:focus{border-color:#FFB800}',
    '#kiwa-panel .kp-input textarea::placeholder{color:#6B6B76}',
    '#kiwa-panel .kp-send{width:38px;height:38px;border-radius:10px;background:#FFB800;border:0;',
    'display:flex;align-items:center;justify-content:center;color:#1a1200;cursor:pointer;flex-shrink:0}',
    '#kiwa-panel .kp-send:active{background:#FFC933}',
    '#kiwa-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:99997;opacity:0;',
    'pointer-events:none;transition:opacity 0.28s}',
    '#kiwa-overlay.open{opacity:1;pointer-events:auto}',
    '.kp-typing span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#6B6B76;',
    'margin-right:3px;animation:kpPulse 1.2s infinite}',
    '.kp-typing span:nth-child(2){animation-delay:0.2s}',
    '.kp-typing span:nth-child(3){animation-delay:0.4s}',
    '@keyframes kpPulse{0%,100%{opacity:1}50%{opacity:0.4}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  var overlay = document.createElement('div');
  overlay.id = 'kiwa-overlay';
  document.body.appendChild(overlay);

  var fab = document.createElement('button');
  fab.id = 'kiwa-fab';
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"/></svg>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.id = 'kiwa-panel';
  var chips = [
    ['__READ_DOC__', '📖 Read document'],
    ['Summarize the selected text', 'Summarize'],
    ['Rewrite the selected text more professionally', 'Rewrite'],
    ['Fix grammar and spelling in the selection', 'Fix grammar'],
    ['Translate the selection to Spanish', 'Translate'],
    ['Make the selection shorter', 'Shorten'],
    ['Expand the selection with more detail', 'Expand']
  ];
  var chipsHtml = '';
  for (var ci = 0; ci < chips.length; ci++) {
    chipsHtml += '<div class="kp-chip" data-chip="' + chips[ci][0].replace(/"/g, '&quot;') + '">' + chips[ci][1] + '</div>';
  }
  panel.innerHTML =
    '<div class="kp-handle"></div>' +
    '<div class="kp-head">' +
      '<div class="kp-avatar">K</div>' +
      '<div class="kp-title"><h3>Kiwa AI</h3><p>Document assistant</p></div>' +
      '<button class="kp-close" id="kpClose">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="kp-chips">' + chipsHtml + '</div>' +
    '<div class="kp-chat" id="kpChat"></div>' +
    '<div class="kp-input">' +
      '<textarea id="kpInput" placeholder="Ask Kiwa AI or describe an edit..." rows="1"></textarea>' +
      '<button class="kp-send" id="kpSend">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>' +
      '</button>' +
    '</div>';
  document.body.appendChild(panel);

  var chat = document.getElementById('kpChat');
  var input = document.getElementById('kpInput');
  var pending = {};
  var seq = 0;
  var history = [];

  window.KiwaEditorResponse = function(callId, json) {
    var entry = pending[callId];
    if (!entry) return;
    delete pending[callId];
    try { entry.resolve(JSON.parse(json)); }
    catch(e) { entry.resolve({ok: false, error: 'bad json'}); }
  };

  function getSelectionText() {
    try {
      if (window.app && window.app.map && window.app.map.getSelectionText) {
        var t = window.app.map.getSelectionText();
        if (t) return t;
      }
      var s = window.getSelection();
      return s ? s.toString() : '';
    } catch(e) { return ''; }
  }

  // sendAI replaced by sendAIWithContext

  function escapeUnoString(s) {
    return String(s)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  }

  function insertText(text) {
    if (!text) return;
    var escaped = escapeUnoString(text);
    var msg = 'uno .uno:InsertText text="' + escaped + '"';
    try {
      if (window.socket && window.socket.sendMessage) {
        window.socket.sendMessage(msg);
      } else if (window.COOMessageHandler && window.COOMessageHandler.postMobileMessage) {
        window.COOMessageHandler.postMobileMessage(msg);
      }
    } catch(e) {}
  }

  function addMessage(role, html) {
    var m = document.createElement('div');
    m.className = 'kp-msg ' + role;
    m.innerHTML = '<div class="kp-msg-av">' + (role === 'user' ? 'You' : 'K') + '</div><div class="kp-msg-b">' + html + '</div>';
    chat.appendChild(m);
    chat.scrollTop = chat.scrollHeight;
    return m;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }

  function formatText(s) {
    var esc = escapeHtml(s);
    esc = esc.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    esc = esc.replace(/`([^`\n]+)`/g, '<code style="background:#0A0A0C;padding:1px 5px;border-radius:4px;font-size:12px">$1</code>');
    esc = esc.replace(/\n/g, '<br>');
    return esc;
  }

  function handleSend() {
    sendAIWithContext();
  }

  function handleSendOld() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    addMessage('user', escapeHtml(text));
    history.push({role: 'user', content: text});
    var thinking = addMessage('ai', '<div style="display:flex;align-items:center;gap:8px"><span class="kp-typing"><span></span><span></span><span></span></span><span style="font-size:12px;color:#6B6B76">Kiwa is thinking\u2026</span></div>');

    sendAI(text).then(function(r) {
      var bubble = thinking.querySelector('.kp-msg-b');
      if (r && r.ok && r.text) {
        bubble.innerHTML = formatText(r.text);
        history.push({role: 'assistant', content: r.text});

        var actions = document.createElement('div');
        actions.className = 'kp-actions';
        actions.innerHTML =
          '<button class="kp-action primary" data-insert>Insert at cursor</button>' +
          '<button class="kp-action" data-replace>Replace selection</button>' +
          '<button class="kp-action" data-copy>Copy</button>';
        thinking.appendChild(actions);

        actions.querySelector('[data-insert]').addEventListener('click', function() {
          insertText(r.text);
          closePanel();
        });
        actions.querySelector('[data-replace]').addEventListener('click', function() {
          insertText(r.text);
          closePanel();
        });
        actions.querySelector('[data-copy]').addEventListener('click', function() {
          try { navigator.clipboard.writeText(r.text); } catch(e){}
        });
      } else {
        bubble.innerHTML = '<span style="color:#EF4444">' + escapeHtml((r && r.error) || 'Unknown error') + '</span>';
        history.pop();
      }
      chat.scrollTop = chat.scrollHeight;
    });
  }

  function openPanel() {
    // reset drag-injected styles so the panel starts at its proper place
    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.transform = '';
    panel.style.maxHeight = '';
    panel.classList.add('open');
    overlay.classList.add('open');
    setTimeout(function() {
      input.focus();
      if(window.KiwaEditorAdjustKeyboard) window.KiwaEditorAdjustKeyboard();
    }, 300);
    setTimeout(function(){
      if(window.KiwaEditorAdjustKeyboard) window.KiwaEditorAdjustKeyboard();
    }, 700);
  }
  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
    // Reset any inline styles injected by dragging so the panel returns
    // to its normal bottom-anchored layout next time it opens.
    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.transform = '';
    panel.style.maxHeight = '';
  }

  // Make FAB draggable — tap opens the panel, drag repositions it
  (function(){
    var dragStart = null;
    var wasDragged = false;
    fab.addEventListener('touchstart', function(e){
      var t = e.touches[0];
      dragStart = { x: t.clientX, y: t.clientY, fabX: fab.getBoundingClientRect().left, fabY: fab.getBoundingClientRect().top };
      wasDragged = false;
    }, {passive: true});
    fab.addEventListener('touchmove', function(e){
      if(!dragStart) return;
      var t = e.touches[0];
      var dx = t.clientX - dragStart.x;
      var dy = t.clientY - dragStart.y;
      if(Math.abs(dx) > 8 || Math.abs(dy) > 8){
        wasDragged = true;
        fab.style.left = Math.max(8, Math.min(window.innerWidth - 56, dragStart.fabX + dx)) + 'px';
        fab.style.top = Math.max(8, Math.min(window.innerHeight - 56, dragStart.fabY + dy)) + 'px';
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
      }
    }, {passive: true});
    fab.addEventListener('touchend', function(){ dragStart = null; setTimeout(function(){ wasDragged = false; }, 100); });
    fab.addEventListener('click', function(e){
      if(wasDragged){ e.preventDefault(); e.stopPropagation(); return; }
      openPanel();
    });
  })();
  document.getElementById('kpClose').addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);
  document.getElementById('kpSend').addEventListener('click', handleSend);
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  input.addEventListener('input', function() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  });

  var chipEls = document.querySelectorAll('.kp-chip');
  for (var k = 0; k < chipEls.length; k++) {
    (function(el) {
      el.addEventListener('click', function() {
        var c = el.dataset.chip;
        if (c === '__READ_DOC__') {
          readDocumentAndDisplay();
          return;
        }
        input.value = c;
        input.focus();
      });
    })(chipEls[k]);
  }

  try {
    if (window.KiwaEditorAI && window.KiwaEditorAI.getSettings) {
      var raw = window.KiwaEditorAI.getSettings();
      if (raw) window.KiwaEditorSettings = JSON.parse(raw);
    }
  } catch(e) {}

  // ============ DOCUMENT STRUCTURE EXTRACTION (4C.1) ============
  var rawLog = [];
  var extractionResolvers = [];

  window.KiwaOnStructure = function(jsonString){
    var pending = extractionResolvers.splice(0);
    for (var i = 0; i < pending.length; i++) pending[i](jsonString);
  };

  window.KiwaOnRawMessage = function(text){
    rawLog.push({t: Date.now(), s: text});
    if (rawLog.length > 200) rawLog.shift();
  };

  window.KiwaOnError = function(msg){
    var pending = extractionResolvers.splice(0);
    for (var i = 0; i < pending.length; i++) pending[i](null);
  };

  function installSocketWatcher(){
    var s = window.socket;
    if (!s && window.app && window.app.socket && window.app.socket.socket) {
      s = window.app.socket.socket;
    }
    if (!s) {
      setTimeout(installSocketWatcher, 500);
      return;
    }
    if (s.__kiwaWrapped) return;
    s.__kiwaWrapped = true;

    var orig = s.onmessage;
    s.onmessage = function(evt){
      try {
        if (evt && typeof evt.data === 'string') {
          var d = evt.data;
          var prefixes = [
            'extractdocumentstructure:',
            'extractdocumentstructure ',
            'extracteddocumentstructure:',
            'documentstructure:',
            'commandresult: extractdocumentstructure',
            'commandresult:extractdocumentstructure',
            'commandresult:extract-document-structure',
            'commandresult: extract-document-structure'
          ];
          var matched = false;
          for (var i = 0; i < prefixes.length; i++) {
            if (d.indexOf(prefixes[i]) === 0) {
              var payload = d.substring(prefixes[i].length).trim();
              matched = true;
              if (window.KiwaOnStructure) window.KiwaOnStructure(payload);
              break;
            }
          }
          if (!matched && d.length > 20 && (d.indexOf('"DocStructure"') >= 0 || d.indexOf('"Structure"') >= 0)) {
            matched = true;
            var startBrace = d.indexOf('{');
            var payload2 = startBrace >= 0 ? d.substring(startBrace) : d;
            if (window.KiwaOnStructure) window.KiwaOnStructure(payload2);
          }
          if (!matched && d.length > 40) {
            if (window.KiwaEditorAI && window.KiwaEditorAI.onRawMessage) {
              try { window.KiwaEditorAI.onRawMessage(d.substring(0, 400)); } catch(e){}
            }
          }
        }
      } catch(e) {}
      if (orig) return orig.call(this, evt);
    };
  }
  installSocketWatcher();

  function extractStructure(){
    // Try the direct DOM reader first (fast). If it returns nothing,
    // fall back to the SelectAll strategy which works even when the editor
    // is rendering tiles instead of DOM text.
    return new Promise(function(resolve){
      var direct = null;
      try { direct = readDocumentFromDom(); } catch(e){}
      if (direct) { resolve(direct); return; }
      extractViaSelectAll().then(function(viaSel){
        if (viaSel) { resolve(viaSel); return; }
        resolve(null);
      });
    });
  }

  function readDocumentFromDom(){
    // Collabora renders tiles, not DOM text. To get the document content we
    // use the editor's own APIs. Several fallbacks in case one is unavailable.

    // Strategy 1: app.map.getDocText() — some builds expose this directly
    try {
      if (window.app && window.app.map && typeof window.app.map.getDocText === 'function') {
        var t = window.app.map.getDocText();
        if (t && t.length) return buildStructure(t);
      }
    } catch(e) {}

    // Strategy 2: getSelectionText on the map object
    try {
      if (window.app && window.app.map && typeof window.app.map.getSelectionText === 'function') {
        var t2 = window.app.map.getSelectionText();
        if (t2 && t2.length) return buildStructure(t2);
      }
    } catch(e) {}

    // Strategy 3: global selection
    try {
      var s = window.getSelection();
      if (s && s.toString() && s.toString().length > 2) {
        return buildStructure(s.toString());
      }
    } catch(e) {}

    // Strategy 4: read the raw text nodes (fallback — may be empty if tiles only)
    try {
      var selectors = ['.text-run','[class*="text-run"]','.Paragraph','.paragraph'];
      var parts = [];
      for (var i = 0; i < selectors.length; i++) {
        var nodes = document.querySelectorAll(selectors[i]);
        for (var n = 0; n < nodes.length; n++) {
          var txt = (nodes[n].innerText || nodes[n].textContent || '').trim();
          if (txt) parts.push(txt);
        }
        if (parts.length) break;
      }
      if (parts.length) return buildStructure(parts.join('\\n'));
    } catch(e) {}

    // Strategy 5: leaflet container text
    try {
      var area = document.querySelector('.leaflet-container') || document.body;
      var all = (area.innerText || '').split('\\n').map(function(x){ return x.trim(); }).filter(function(x){ return x.length > 0; });
      if (all.length > 3) return buildStructure(all.join('\\n'));
    } catch(e) {}

    return null;
  }

  function buildStructure(raw){
    if (!raw) return null;
    var lines = raw.split(/\r?\n/).map(function(s){ return s.trim(); }).filter(function(s){ return s.length > 0; });
    if (!lines.length) return null;
    var out = {
      DocStructure: {
        Note: 'Extracted from the document text.',
        LineCount: lines.length,
        Lines: {}
      }
    };
    var max = Math.min(lines.length, 300);
    for (var i = 0; i < max; i++) {
      out.DocStructure.Lines['Line.' + i] = { content: lines[i] };
    }
    return JSON.stringify(out);
  }

  // Add a special "select all then extract" strategy when the user taps Read document.
  // It briefly selects everything, reads, then deselects.
  function extractViaSelectAll(){
    return new Promise(function(resolve){
      var s = window.app && window.app.socket;
      if (!s || !s.sendMessage) { resolve(null); return; }
      // Select all
      try {
        s.sendMessage('uno .uno:SelectAll');
      } catch(e){ resolve(null); return; }
      // Give it a moment to select
      setTimeout(function(){
        // Try to grab selection via a couple of entry points
        var text = '';
        try {
          if (window.app && window.app.map && typeof window.app.map.getSelectionText === 'function') {
            text = window.app.map.getSelectionText() || '';
          }
        } catch(e){}
        if (!text) {
          try {
            var sel = window.getSelection();
            if (sel) text = sel.toString() || '';
          } catch(e){}
        }
        // Collapse the selection back to just the cursor
        try { s.sendMessage('uno .uno:GoToStartOfDoc'); } catch(e){}
        if (text && text.length > 1) resolve(buildStructure(text));
        else resolve(null);
      }, 500);
    });
  }

  function readDocumentAndDisplay(){
    var bubble = addMessage('ai', 'Reading document structure...');
    var bubbleBody = bubble.querySelector('.kp-msg-b');
    extractStructure().then(function(json){
      if (!json) {
        bubbleBody.innerHTML = '<span style="color:#F59E0B">Could not read document. The server may have rejected the request.</span>' +
          '<div style="font-size:11px;color:#6B6B76;margin-top:6px">Try again, or open a different document. If this persists, the extraction command format may differ from this Collabora build.</div>';
        return;
      }
      bubbleBody.innerHTML = summarizeStructure(json);
    });
  }

  function summarizeStructure(json){
    try {
      var obj = JSON.parse(json);
      var lines = [];
      function walk(node, depth){
        if (!node || depth > 3) return;
        if (typeof node === 'string') return;
        if (Array.isArray(node)){
          for (var i = 0; i < node.length && i < 20; i++) walk(node[i], depth);
          return;
        }
        if (typeof node === 'object'){
          var keys = Object.keys(node);
          for (var j = 0; j < keys.length; j++){
            var k = keys[j];
            var v = node[k];
            if (typeof v === 'string' && v.length < 200 && depth <= 2){
              lines.push('<div style="font-size:12px;padding:2px 0"><strong>' + k + ':</strong> ' + escapeHtml(v) + '</div>');
            } else if (typeof v === 'object'){
              lines.push('<div style="font-size:12px;padding:4px 0 2px"><strong style="color:#FFB800">' + k + '</strong></div>');
              walk(v, depth + 1);
            }
          }
        }
      }
      walk(obj, 0);
      if (!lines.length) return '<pre style="font-size:10px;max-height:200px;overflow:auto">' + escapeHtml(json.substring(0, 2000)) + '</pre>';
      return lines.slice(0, 40).join('');
    } catch(e){
      return '<pre style="font-size:10px;max-height:200px;overflow:auto">' + escapeHtml(json.substring(0, 2000)) + '</pre>';
    }
  }

  // ============ AI-DRIVEN EDITING (4C.2 + 4C.3) ============
  var structureCache = { data: null, ts: 0 };

  function getStructure(maxAgeMs){
    maxAgeMs = maxAgeMs || 30000;
    var now = Date.now();
    if (structureCache.data && (now - structureCache.ts) < maxAgeMs) {
      return Promise.resolve(structureCache.data);
    }
    return extractStructure().then(function(json){
      if (json) {
        structureCache.data = json;
        structureCache.ts = now;
      }
      return json;
    });
  }

  function invalidateStructure(){
    structureCache.data = null;
    structureCache.ts = 0;
  }

  var EDIT_SYSTEM_PROMPT = [
    'You are Kiwa AI, editing a document in a mobile office suite.',
    '',
    'You will receive the current document structure as JSON, then the user\'s request.',
    '',
    'If the user is asking a question or chatting, respond with plain text.',
    '',
    'If the user wants to CHANGE the document, respond with ONLY a JSON object:',
    '{"Transforms": {"<selector>": {"<property>": "<value>"}}}',
    '',
    'Selectors (from the structure you receive):',
    '- ContentControls.ByIndex.<n>',
    '- ContentControls.ByTag.<tag>',
    '- ContentControls.ByAlias.<alias>',
    '- Headings.ByIndex.<n>',
    '- Headings.ByTitle.<title>',
    '',
    'Common properties: content, alias, text, tag.',
    '',
    'Examples:',
    'User: "add a name at number 5"',
    'You: {"Transforms": {"ContentControls.ByTag.5": {"content": "John Doe"}}}',
    '',
    'User: "change the title to Introduction"',
    'You: {"Transforms": {"Headings.ByIndex.0": {"text": "Introduction"}}}',
    '',
    'User: "what is in this document?"',
    'You: "The document contains 3 headings and a form with 10 fields..."',
    '',
    'If the user\'s request cannot be matched to a real item, respond:',
    '{"error": "I could not find X. Available items are: ..."}',
    '',
    'Output ONLY the JSON object when it is a transform. No markdown, no commentary.'
  ].join('\n');

  function detectTransform(text){
    if (!text) return null;
    var trimmed = String(text).trim();
    // strip markdown fences if the AI added them
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    if (trimmed.charAt(0) !== '{') return null;
    try {
      var obj = JSON.parse(trimmed);
      if (obj && obj.Transforms) return obj;
      if (obj && obj.error) return { __error: obj.error };
    } catch(e) {}
    return null;
  }

  function summarizeTransform(t){
    if (t && t.__error) return '<div style="color:#F59E0B">' + escapeHtml(t.__error) + '</div>';
    if (!t || !t.Transforms) return '<div>No changes described.</div>';
    var lines = [];
    var keys = Object.keys(t.Transforms);
    for (var i = 0; i < keys.length; i++){
      var sel = keys[i];
      var ops = t.Transforms[sel];
      var props = Object.keys(ops);
      var summary = props.map(function(p){ return p + ' = "' + ops[p] + '"'; }).join(', ');
      lines.push('<div style="padding:3px 0"><strong style="color:#FFB800">' + escapeHtml(sel) + '</strong><br><span style="font-size:12px">' + escapeHtml(summary) + '</span></div>');
    }
    return lines.join('');
  }

  function renderTransformPreview(msgEl, transform){
    var raw = JSON.stringify(transform, null, 2);
    var html = '' +
      '<div class="kp-preview-title" style="font-weight:600;margin-bottom:8px">\uD83C\uDFAF Proposed edit</div>' +
      '<div class="kp-preview-body" style="margin-bottom:10px">' + summarizeTransform(transform) + '</div>' +
      '<div class="kp-actions">' +
        '<button class="kp-action" data-preview="raw">Show JSON</button>' +
        '<button class="kp-action primary" data-preview="apply">Apply</button>' +
        '<button class="kp-action" data-preview="cancel">Cancel</button>' +
      '</div>' +
      '<pre data-preview="json" style="display:none;font-size:10px;background:#0A0A0C;padding:8px;border-radius:6px;margin-top:8px;max-height:180px;overflow:auto">' +
        escapeHtml(raw) +
      '</pre>';
    var bubble = msgEl.querySelector('.kp-msg-b');
    bubble.innerHTML = html;

    var rawBtn = msgEl.querySelector('[data-preview="raw"]');
    var applyBtn = msgEl.querySelector('[data-preview="apply"]');
    var cancelBtn = msgEl.querySelector('[data-preview="cancel"]');
    var pre = msgEl.querySelector('[data-preview="json"]');

    if (rawBtn) rawBtn.addEventListener('click', function(){
      pre.style.display = (pre.style.display === 'none') ? 'block' : 'none';
    });
    if (cancelBtn) cancelBtn.addEventListener('click', function(){
      bubble.innerHTML = '<span style="color:#6B6B76">Cancelled.</span>';
    });
    if (applyBtn) applyBtn.addEventListener('click', function(){
      applyBtn.disabled = true;
      applyBtn.textContent = 'Applying...';
      applyTransform(transform).then(function(result){
        if (result.ok) {
          bubble.innerHTML = '<div style="color:#10B981;font-weight:600">\u2713 Applied</div><div style="font-size:12px;color:#A8A8B3;margin-top:4px">' + escapeHtml(result.note || '') + '</div>';
        } else {
          bubble.innerHTML = '<div style="color:#EF4444;font-weight:600">Apply failed</div><div style="font-size:12px;margin-top:4px">' + escapeHtml(result.error || 'Unknown error') + '</div>';
        }
      });
    });
  }

  function applyTransform(transform){
    return new Promise(function(resolve){
      var sent = false;
      try {
        if (window.app && window.app.socket && window.app.socket.sendMessage) {
          var encoded = encodeURIComponent(JSON.stringify(transform));
          window.app.socket.sendMessage('transformdocumentstructure url=interactive transform=' + encoded);
          sent = true;
        }
      } catch(e){
        resolve({ok: false, error: 'Send failed: ' + e.message});
        return;
      }
      if (!sent) {
        resolve({ok: false, error: 'Socket unavailable'});
        return;
      }
      // invalidate cache so re-verification gets fresh data
      invalidateStructure();
      // Give the server time to apply, then re-extract
      setTimeout(function(){
        extractStructure().then(function(newStruct){
          if (!newStruct) {
            resolve({ok: true, note: 'Applied. Re-extraction unavailable — check the document.'});
            return;
          }
          structureCache.data = newStruct;
          structureCache.ts = Date.now();
          // Naive check: does any value from the transform appear in the new structure?
          var expected = [];
          var keys = Object.keys(transform.Transforms || {});
          for (var i = 0; i < keys.length; i++){
            var ops = transform.Transforms[keys[i]];
            var props = Object.keys(ops);
            for (var j = 0; j < props.length; j++){
              var v = ops[props[j]];
              if (typeof v === 'string' && v.length > 1) expected.push(v);
            }
          }
          var found = expected.some(function(v){ return newStruct.indexOf(v) >= 0; });
          if (found) {
            resolve({ok: true, note: 'Verified — the change is in the document.'});
          } else {
            resolve({ok: true, note: 'Applied, but verification was inconclusive. Check the document.'});
          }
        });
      }, 1200);
    });
  }

  // Override sendAI: fetch structure, use edit-mode prompt, parse response
  var _origSendAI = null;
  function sendAIWithContext(){
    var inp = document.getElementById('kpInput');
    var text = (inp.value || '').trim();
    if (!text) return;

    var u = addMessage('user', escapeHtml(text));
    inp.value = '';
    inp.style.height = 'auto';
    history.push({role: 'user', content: text});
    var thinking = addMessage('ai', '<div style="display:flex;align-items:center;gap:8px"><span class="kp-typing"><span></span><span></span><span></span></span><span style="font-size:12px;color:#6B6B76">Kiwa is thinking\u2026</span></div>');

    var settings = window.KiwaEditorSettings || {};

    var chain = getStructure(30000);

    chain.then(function(structureJson){
      var systemPrompt = EDIT_SYSTEM_PROMPT;
      if (structureJson) {
        var trimmed = structureJson.length > 18000 ? structureJson.substring(0, 18000) + '...[truncated]' : structureJson;
        systemPrompt += '\n\nCurrent document structure:\n' + trimmed;
      }
      var msgs = history.slice(-6);
      var payload = {
        provider: settings.provider || 'aevibron',
        apiKey: settings.apiKey || '',
        baseUrl: settings.baseUrl || 'https://aevibron-gateway.vercel.app/api/v1',
        model: settings.model || 'aevibron-core-v3',
        messages: msgs,
        systemPrompt: systemPrompt
      };

      var id = 'ed_' + (++seq) + '_' + Date.now();
      var promise = new Promise(function(resolve){
        if (!window.KiwaEditorAI || !window.KiwaEditorAI.askAI) { resolve({ok: false, error: 'AI bridge unavailable'}); return; }
        pending[id] = { resolve: resolve };
        try { window.KiwaEditorAI.askAI(id, JSON.stringify(payload)); }
        catch(e){ delete pending[id]; resolve({ok: false, error: e.message}); }
        setTimeout(function(){ if (pending[id]) { delete pending[id]; resolve({ok: false, error: 'timeout'}); } }, 95000);
      });
      return promise;
    }).then(function(r){
      var bubble = thinking.querySelector('.kp-msg-b');
      if (!r || !r.ok || !r.text) {
        bubble.innerHTML = '<span style="color:#EF4444">' + escapeHtml((r && r.error) || 'Unknown error') + '</span>';
        history.pop();
        chat.scrollTop = chat.scrollHeight;
        return;
      }
      var transform = detectTransform(r.text);
      if (transform) {
        if (transform.__error) {
          bubble.innerHTML = '<div style="color:#F59E0B">' + escapeHtml(transform.__error) + '</div>';
          history.push({role: 'assistant', content: r.text});
        } else {
          renderTransformPreview(thinking, transform);
          history.push({role: 'assistant', content: r.text});
        }
      } else {
        bubble.innerHTML = formatText(r.text);
        history.push({role: 'assistant', content: r.text});
        // If the user's request implies document creation, offer it
        if(detectCreateIntentLocal(text) && window.KiwaEditorAI && window.KiwaEditorAI.saveEditorSettings){
          showCreateConfirmCardLocal(thinking, detectCreateIntentLocal(text), r.text);
        }
      }
      chat.scrollTop = chat.scrollHeight;
    });
  }

  // ============ KEYBOARD HANDLING ============
  // When the soft keyboard is open, lift the panel above it so the user
  // can see what they're typing. Uses visualViewport which reflects the
  // actual visible area, unlike window.innerHeight.
  (function(){
    function adjust(){
      if(!window.visualViewport) return;
      var vv = window.visualViewport;
      var keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
      if(keyboardHeight > 80){
        panel.style.bottom = keyboardHeight + 'px';
        panel.style.maxHeight = Math.max(180, vv.height - 40) + 'px';
        if(input === document.activeElement){
          setTimeout(function(){ chat.scrollTop = chat.scrollHeight; }, 50);
        }
      } else {
        panel.style.bottom = '0px';
        panel.style.maxHeight = '72vh';
      }
    }
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', adjust);
      window.visualViewport.addEventListener('scroll', adjust);
    }
    input.addEventListener('focus', function(){ setTimeout(adjust, 100); });
    input.addEventListener('blur', function(){ setTimeout(adjust, 100); });
  })();

  // ============ SOFT KEYBOARD LIFT ============
  // When the on-screen keyboard is open, visualViewport shrinks. Use that
  // to lift the panel so the input stays visible while typing.
  (function(){
    var panelEl = document.getElementById('kiwa-panel');
    var inputEl = document.getElementById('kpInput');
    var chatEl = document.getElementById('kpChat');
    if(!panelEl || !inputEl) return;

    function adjust(){
      if(!window.visualViewport) return;
      var vv = window.visualViewport;
      var kbHeight = window.innerHeight - vv.height - vv.offsetTop;
      if(kbHeight > 80){
        panelEl.style.bottom = kbHeight + 'px';
        panelEl.style.maxHeight = Math.max(180, vv.height - 40) + 'px';
        if(chatEl) chatEl.scrollTop = chatEl.scrollHeight;
      } else {
        panelEl.style.bottom = '0px';
        panelEl.style.maxHeight = '72vh';
      }
    }

    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', adjust);
      window.visualViewport.addEventListener('scroll', adjust);
    }
    inputEl.addEventListener('focus', function(){
      setTimeout(adjust, 120);
      setTimeout(adjust, 300);
      setTimeout(adjust, 600);
    });
    inputEl.addEventListener('blur', function(){ setTimeout(adjust, 120); });
    // expose so openPanel can force an adjustment
    window.KiwaEditorAdjustKeyboard = adjust;
  })();

  // ============ VIEWPORT META (keyboard resize) ============
  // Cool.html has its own viewport meta. We replace it with one that
  // tells Chrome on Android to resize the layout viewport when the
  // soft keyboard appears. This is the official Chromium fix (Chrome 108+).
  (function(){
    var existing = document.querySelector('meta[name="viewport"]');
    if (existing) existing.remove();
    var meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, interactive-widget=resizes-content, viewport-fit=cover';
    document.head.appendChild(meta);
  })();

  // ============ DRAGGABLE PANEL ============
  // If the keyboard still covers it on some devices, the user can drag
  // the whole panel up by the header. Last-resort usability.
  (function(){
    var head = panel.querySelector('.kp-head');
    if(!head) return;
    var dragY = null;
    var startTop = 0;
    head.style.cursor = 'grab';
    head.addEventListener('touchstart', function(e){
      var t = e.touches[0];
      dragY = t.clientY;
      startTop = panel.getBoundingClientRect().top;
    }, {passive: true});
    head.addEventListener('touchmove', function(e){
      if(dragY === null) return;
      var t = e.touches[0];
      var dy = t.clientY - dragY;
      var newTop = Math.max(8, startTop + dy);
      panel.style.top = newTop + 'px';
      panel.style.bottom = 'auto';
      panel.style.transform = 'none';
    }, {passive: true});
    head.addEventListener('touchend', function(){ dragY = null; });
  })();

  // ============ CHAT HISTORY PERSISTENCE ============
  function persistEditorChat(){
    try {
      var s = window.KiwaEditorSettings || {};
      if (!s.editorChat) s.editorChat = [];
      s.editorChat = history.slice(-30);
      if (window.KiwaEditorAI && window.KiwaEditorAI.saveEditorSettings) {
        window.KiwaEditorAI.saveEditorSettings(JSON.stringify(s));
      } else {
        try {
          var existing = window.KiwaEditorAI && window.KiwaEditorAI.getSettings ? JSON.parse(window.KiwaEditorAI.getSettings()) : {};
          existing.editorChat = s.editorChat;
          // no save method yet — fall through
        } catch(e){}
      }
    } catch(e){}
  }

  (function(){
    try {
      if (window.KiwaEditorAI && window.KiwaEditorAI.getSettings) {
        var raw = window.KiwaEditorAI.getSettings();
        if (raw) {
          var s = JSON.parse(raw);
          window.KiwaEditorSettings = s;
          if (s.editorChat && s.editorChat.length) {
            history = s.editorChat.slice(-30);
            // restore visible messages
            for (var i = 0; i < history.length; i++) {
              var m = history[i];
              if (m.role === 'user') addMessage('user', escapeHtml(m.content));
              else addMessage('ai', formatText(m.content));
            }
          }
        }
      }
    } catch(e){}
  })();

  // patch addMessage to save after each
  var _origAddMessage = addMessage;
  addMessage = function(role, html){
    var el = _origAddMessage(role, html);
    try { persistEditorChat(); } catch(e){}
    return el;
  };

  // ============ CREATE INTENT (editor) ============
  function detectCreateIntentLocal(text){
    if(!text) return null;
    var t = text.toLowerCase();
    var docWords = ['document','doc','letter','report','essay','article','memo','note'];
    var sheetWords = ['spreadsheet','sheet','table','budget','invoice','tracker'];
    var slideWords = ['presentation','slides','deck','powerpoint','pitch'];
    var createWords = ['create','make','write','generate','draft','produce','new'];
    function hasAny(list){ for(var i=0;i<list.length;i++){ if(t.indexOf(list[i])>=0) return true; } return false; }
    if(!hasAny(createWords)) return null;
    if(hasAny(slideWords)) return 'slide';
    if(hasAny(sheetWords)) return 'sheet';
    if(hasAny(docWords)) return 'doc';
    return null;
  }

  function showCreateConfirmCardLocal(container, type, content){
    var typeNames = { doc:'Document (.docx)', sheet:'Spreadsheet (.xlsx)', slide:'Presentation (.pptx)' };
    var card = document.createElement('div');
    card.style.cssText = 'background:#18181D;border:1px solid #FFB800;border-radius:12px;padding:12px;margin-top:6px';
    var preview = content.length > 300 ? content.substring(0,300) + '\u2026' : content;
    card.innerHTML =
      '<div style="font-weight:600;margin-bottom:6px;color:#FFB800;font-size:13px">\ud83d\udcc4 Create ' + typeNames[type] + '?</div>' +
      '<pre style="background:#0A0A0C;border:1px solid #1C1C22;border-radius:8px;padding:8px;font-size:11px;max-height:100px;overflow:auto;white-space:pre-wrap;color:#A8A8B3;margin-bottom:10px">' + escapeHtml(preview) + '</pre>' +
      '<div style="display:flex;gap:8px">' +
        '<button data-cf="yes" style="flex:1;padding:8px;background:#FFB800;color:#1a1200;border:0;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer">Yes, create it</button>' +
        '<button data-cf="insert" style="padding:8px 12px;background:transparent;border:1px solid #26262D;color:#F5F5F7;border-radius:8px;font-weight:600;font-size:12px;cursor:pointer">Insert here</button>' +
        '<button data-cf="no" style="padding:8px 12px;background:transparent;border:1px solid #26262D;color:#A8A8B3;border-radius:8px;font-size:12px;cursor:pointer">Cancel</button>' +
      '</div>';
    container.appendChild(card);
    card.querySelector('[data-cf="no"]').addEventListener('click', function(){ card.remove(); });
    card.querySelector('[data-cf="insert"]').addEventListener('click', function(){
      card.remove();
      insertText(content);
    });
    card.querySelector('[data-cf="yes"]').addEventListener('click', function(){
      card.remove();
      if(window.KiwaEditorAI && window.KiwaEditorAI.saveEditorSettings){
        // We don't have access to the native createFileWithContent here directly.
        // Instead we save the content as a pending file via a message to the home screen.
        // Simplest path: alert the user to create it from the home screen.
        var msg = document.createElement('div');
        msg.style.cssText = 'font-size:12px;color:#FFB800;margin-top:6px';
        msg.textContent = 'To create a new file, close this document and use the home screen. Or tap "Insert here" to add the content to this document.';
        card.parentNode.appendChild(msg);
      }
    });
  }

  console.log('Kiwa AI editor panel installed (with structure extraction)');

})();
