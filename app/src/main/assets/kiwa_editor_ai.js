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
      } else if (window.app && window.app.socket && window.app.socket.sendMessage) {
        window.app.socket.sendMessage(msg);
      }
    } catch(e) {}
  }

  function replaceSelection(text) {
    // For "replace selection" the user must have something selected.
    // We delete the selection first, then insert the new text.
    if (!text) return;
    try {
      var s = window.app && window.app.socket ? window.app.socket : window.socket;
      if (s && s.sendMessage) {
        s.sendMessage('uno .uno:Delete');
        // Small delay so the delete lands before the insert.
        setTimeout(function(){ insertText(text); }, 60);
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
      adjustKeyboard();
    }, 300);
    setTimeout(adjustKeyboard, 700);
  }
  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
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

  // ============ DOCUMENT TEXT EXTRACTION ============
  // The robust strategy: trigger `uno .uno:SelectAll` + `uno .uno:Copy`,
  // wait for the clipboard file to be written by LOActivity.populateClipboard(),
  // then read it via KiwaEditorAI.getDocumentText(). This works for ALL
  // document types (text, PDFs, presentations, spreadsheets) because it
  // uses the LibreOffice engine's own copy pipeline, not DOM scraping.

  function getSocket() {
    if (window.socket && window.socket.sendMessage) return window.socket;
    if (window.app && window.app.socket && window.app.socket.sendMessage) return window.app.socket;
    return null;
  }

  function waitForClipboardFile(maxWaitMs) {
    return new Promise(function(resolve){
      var waited = 0;
      var step = 80;
      function tick() {
        if (window.KiwaEditorAI && window.KiwaEditorAI.clipboardFileExists && window.KiwaEditorAI.clipboardFileExists()) {
          resolve(true);
          return;
        }
        waited += step;
        if (waited >= maxWaitMs) { resolve(false); return; }
        setTimeout(tick, step);
      }
      tick();
    });
  }

  function extractStructure(){
    return new Promise(function(resolve){
      // Try the direct DOM reader first (fast). If it returns nothing,
      // fall back to the SelectAll+Copy strategy which works on all docs.
      var direct = null;
      try { direct = readDocumentFromDom(); } catch(e){}
      if (direct && direct.length) { resolve(direct); return; }
      extractViaSelectAll().then(function(viaSel){
        if (viaSel && viaSel.length) { resolve(viaSel); return; }
        resolve(null);
      });
    });
  }

  function readDocumentFromDom(){
    // For some document types the editor exposes a getSelectionText or
    // getDocText API. Try these first.
    try {
      if (window.app && window.app.map && typeof window.app.map.getDocText === 'function') {
        var t = window.app.map.getDocText();
        if (t && t.length) return buildStructure(t);
      }
    } catch(e) {}
    try {
      if (window.app && window.app.map && typeof window.app.map.getSelectionText === 'function') {
        var t2 = window.app.map.getSelectionText();
        if (t2 && t2.length > 2) return buildStructure(t2);
      }
    } catch(e) {}
    // If the user has selected text, use it
    try {
      var s = window.getSelection();
      if (s && s.toString() && s.toString().length > 2) {
        return buildStructure(s.toString());
      }
    } catch(e) {}
    // Otherwise return empty — the SelectAll+Copy path is the real extractor.
    return '';
  }

  function buildStructure(raw){
    if (!raw) return null;
    // CRITICAL: split on real newlines (\n), not on the two-character
    // sequence "\n". The previous implementation joined with the string
    // '\\n' (literal backslash-n) and then split on /\r?\n/ which doesn't
    // match — producing one giant "line" instead of a properly structured
    // document. That was the root cause of the "Could not read document"
    // failure: the AI received an unreadable blob of text.
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

  // Robust extraction strategy: SelectAll → Copy → wait for the clipboard
  // file → read it via the native bridge. This works on PDFs and all
  // other document types because it uses LibreOffice's own copy pipeline.
  function extractViaSelectAll(){
    return new Promise(function(resolve){
      var s = getSocket();
      if (!s) { resolve(null); return; }
      // Remember the current selection so we can restore it afterwards.
      var hadSelection = false;
      try {
        if (window.app && window.app.map && typeof window.app.map.getSelectionText === 'function') {
          var cur = window.app.map.getSelectionText();
          if (cur && cur.length > 0) hadSelection = true;
        }
      } catch(e) {}

      try { s.sendMessage('uno .uno:SelectAll'); } catch(e) { resolve(null); return; }
      // Give the engine a moment to actually select everything.
      setTimeout(function(){
        try { s.sendMessage('uno .uno:Copy'); } catch(e) { resolve(null); return; }
        // Wait for the clipboard file to be written. The native side
        // writes it synchronously in populateClipboard(), but the
        // .uno:Copy message round-trip takes a few hundred ms.
        waitForClipboardFile(2500).then(function(ok){
          // Restore the user's original selection (or collapse it).
          try {
            if (hadSelection) {
              s.sendMessage('uno .uno:Escape');
            } else {
              s.sendMessage('uno .uno:GoToStartOfDoc');
              s.sendMessage('uno .uno:Escape');
            }
          } catch(e) {}
          if (!ok) { resolve(null); return; }
          var text = '';
          try {
            if (window.KiwaEditorAI && window.KiwaEditorAI.getDocumentText) {
              text = window.KiwaEditorAI.getDocumentText() || '';
            }
          } catch(e) { text = ''; }
          if (text && text.length > 1) resolve(buildStructure(text));
          else resolve(null);
        });
      }, 350);
    });
  }

  function readDocumentAndDisplay(){
    var bubble = addMessage('ai', 'Reading document content...');
    var bubbleBody = bubble.querySelector('.kp-msg-b');
    bubbleBody.innerHTML = '<div style="display:flex;align-items:center;gap:8px"><span class="kp-typing"><span></span><span></span><span></span></span><span style="font-size:12px;color:#6B6B76">Reading...</span></div>';
    extractStructure().then(function(json){
      if (!json) {
        bubbleBody.innerHTML = '<span style="color:#F59E0B">Could not extract document text.</span>' +
          '<div style="font-size:11px;color:#6B6B76;margin-top:6px">The document may be empty, password-protected, or use a format Kiwa cannot extract. Try selecting text manually and ask AI to work with the selection.</div>';
        return;
      }
      // Show a brief summary and offer to send to AI
      var obj = null;
      try { obj = JSON.parse(json); } catch(e) {}
      var lineCount = obj && obj.DocStructure ? obj.DocStructure.LineCount : 0;
      var preview = '';
      try {
        var lines = obj.DocStructure.Lines;
        var keys = Object.keys(lines);
        for (var i = 0; i < Math.min(keys.length, 4); i++) {
          preview += escapeHtml(lines[keys[i]].content || '') + '<br>';
        }
        if (keys.length > 4) preview += '<span style="color:#6B6B76">… ' + (keys.length - 4) + ' more lines</span>';
      } catch(e) {}
      bubbleBody.innerHTML =
        '<div style="font-weight:600;color:#10B981">✓ Read ' + lineCount + ' lines</div>' +
        '<div style="font-size:12px;margin-top:6px;color:#A8A8B3;line-height:1.5">' + preview + '</div>' +
        '<div class="kp-actions" style="margin-top:8px">' +
          '<button class="kp-action primary" data-action="summarize">Summarize</button>' +
          '<button class="kp-action" data-action="rewrite">Rewrite</button>' +
          '<button class="kp-action" data-action="ask">Ask AI</button>' +
        '</div>';
      bubbleBody.querySelector('[data-action="summarize"]').addEventListener('click', function(){
        input.value = 'Summarize the document';
        sendAIWithContext();
      });
      bubbleBody.querySelector('[data-action="rewrite"]').addEventListener('click', function(){
        input.value = 'Rewrite the document to be more professional and concise';
        sendAIWithContext();
      });
      bubbleBody.querySelector('[data-action="ask"]').addEventListener('click', function(){
        input.focus();
        input.value = '';
      });
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

  // ============ AI-DRIVEN EDITING ============
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
    'You will receive the current document content as a JSON structure with lines, then the user\'s request.',
    '',
    'If the user is asking a question or chatting, respond with plain text.',
    '',
    'If the user wants to CHANGE the document, you can either:',
    '1) Output a NEW full version of the document text (the user can replace the whole document with it),',
    '   OR output a partial replacement starting with the heading or first changed line.',
    '2) Reply with text that explains the change AND includes the new text in plain prose.',
    '',
    'Examples:',
    'User: "rewrite the first paragraph to be more formal"',
    'You: (output the rewritten paragraph as plain text — the user will insert it)',
    '',
    'User: "what is in this document?"',
    'You: "The document contains 3 headings and a form with 10 fields..."',
    '',
    'Be concise. When you produce replacement text, output ONLY the replacement text.',
    'Do not wrap replacement text in markdown code fences unless you really mean code.'
  ].join('\n');

  function detectTransform(text){
    // We no longer rely on a Transforms JSON envelope from the AI —
    // the AI simply produces replacement text, and the user decides
    // whether to insert or replace.
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

  function renderResponseWithActions(msgEl, text){
    var bubble = msgEl.querySelector('.kp-msg-b');
    bubble.innerHTML = formatText(text);
    var actions = document.createElement('div');
    actions.className = 'kp-actions';
    actions.style.marginTop = '8px';
    actions.innerHTML =
      '<button class="kp-action primary" data-insert>Insert at cursor</button>' +
      '<button class="kp-action" data-replace>Replace selection</button>' +
      '<button class="kp-action" data-copy>Copy</button>';
    bubble.appendChild(actions);
    actions.querySelector('[data-insert]').addEventListener('click', function(){
      insertText(text);
      closePanel();
    });
    actions.querySelector('[data-replace]').addEventListener('click', function(){
      replaceSelection(text);
      closePanel();
    });
    actions.querySelector('[data-copy]').addEventListener('click', function(){
      try { navigator.clipboard.writeText(text); } catch(e){}
    });
  }

  // Override sendAI: fetch structure, use edit-mode prompt, parse response
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
    var selection = getSelectionText();

    var chain = getStructure(30000);

    chain.then(function(structureJson){
      var systemPrompt = EDIT_SYSTEM_PROMPT;
      if (selection && selection.length > 1) {
        systemPrompt += '\n\nThe user has selected this text in the document:\n"""' + selection.substring(0, 4000) + '"""';
        systemPrompt += '\nFocus on the selected text when responding.';
      } else if (structureJson) {
        var trimmed = structureJson.length > 18000 ? structureJson.substring(0, 18000) + '...[truncated]' : structureJson;
        systemPrompt += '\n\nCurrent document content (JSON of lines):\n' + trimmed;
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
      history.push({role: 'assistant', content: r.text});
      persistEditorChat();
      renderResponseWithActions(thinking, r.text);
      chat.scrollTop = chat.scrollHeight;
    });
  }

  // ============ KEYBOARD HANDLING (single source of truth) ============
  // When the soft keyboard is open, lift the panel above it so the user
  // can see what they're typing. Uses visualViewport which reflects the
  // actual visible area, unlike window.innerHeight.
  var panelEl = panel;       // alias for clarity
  var inputEl = input;
  var chatEl = chat;

  function adjustKeyboard(){
    if(!window.visualViewport) return;
    var vv = window.visualViewport;
    var kbHeight = window.innerHeight - vv.height - vv.offsetTop;
    if(kbHeight > 80){
      panelEl.style.bottom = kbHeight + 'px';
      panelEl.style.maxHeight = Math.max(180, vv.height - 40) + 'px';
      if(inputEl === document.activeElement){
        setTimeout(function(){ chatEl.scrollTop = chatEl.scrollHeight; }, 50);
      }
    } else {
      panelEl.style.bottom = '0px';
      panelEl.style.maxHeight = '72vh';
    }
  }
  window.KiwaEditorAdjustKeyboard = adjustKeyboard;

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', adjustKeyboard);
    window.visualViewport.addEventListener('scroll', adjustKeyboard);
  }
  inputEl.addEventListener('focus', function(){
    setTimeout(adjustKeyboard, 100);
    setTimeout(adjustKeyboard, 300);
    setTimeout(adjustKeyboard, 600);
  });
  inputEl.addEventListener('blur', function(){ setTimeout(adjustKeyboard, 120); });

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
      s.editorChat = history.slice(-30);
      if (window.KiwaEditorAI && window.KiwaEditorAI.saveEditorSettings) {
        window.KiwaEditorAI.saveEditorSettings(JSON.stringify(s));
        window.KiwaEditorSettings = s;
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

  console.log('Kiwa AI editor panel installed (with native-backed document extraction)');

})();
