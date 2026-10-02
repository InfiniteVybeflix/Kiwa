(function() {
  if (window.__kiwaAIInstalled) return;
  window.__kiwaAIInstalled = true;

  var STYLE = [
    '#kiwa-fab{position:fixed;right:16px;bottom:90px;width:48px;height:48px;border-radius:50%;',
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

  function sendAI(prompt) {
    var settings = window.KiwaEditorSettings || {};
    var id = 'ed_' + (++seq) + '_' + Date.now();

    var systemPrompt = 'You are Kiwa AI, an assistant inside a document editor. Keep replies concise. When the user asks for content to insert, output ONLY that content without preamble or commentary.';

    var selection = getSelectionText();
    if (selection && selection.length > 0) {
      systemPrompt += '\n\nSelected text from the document:\n"""\n' + selection + '\n"""';
    }

    var msgs = history.slice(-8);
    msgs.push({role: 'user', content: prompt});

    var payload = {
      provider: settings.provider || 'aevibron',
      apiKey: settings.apiKey || '',
      baseUrl: settings.baseUrl || 'https://aevibron-gateway.vercel.app/api/v1',
      model: settings.model || 'core-v3',
      messages: msgs,
      systemPrompt: systemPrompt
    };

    return new Promise(function(resolve) {
      if (!window.KiwaEditorAI || !window.KiwaEditorAI.askAI) {
        resolve({ok: false, error: 'AI bridge not available'});
        return;
      }
      pending[id] = { resolve: resolve };
      try {
        window.KiwaEditorAI.askAI(id, JSON.stringify(payload));
      } catch(e) {
        delete pending[id];
        resolve({ok: false, error: e.message});
      }
      setTimeout(function() {
        if (pending[id]) { delete pending[id]; resolve({ok: false, error: 'timeout'}); }
      }, 95000);
    });
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
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    input.style.height = 'auto';
    addMessage('user', escapeHtml(text));
    history.push({role: 'user', content: text});
    var thinking = addMessage('ai', '<span class="kp-typing"><span></span><span></span><span></span></span>');

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
    panel.classList.add('open');
    overlay.classList.add('open');
    setTimeout(function() { input.focus(); }, 300);
  }
  function closePanel() {
    panel.classList.remove('open');
    overlay.classList.remove('open');
  }

  fab.addEventListener('click', openPanel);
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
            'commandresult:extractdocumentstructure'
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
          if (!matched && d.length > 20 && d.indexOf('"Structure"') >= 0) {
            matched = true;
            if (window.KiwaOnStructure) window.KiwaOnStructure(d);
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
    return new Promise(function(resolve){
      var sent = false;
      try {
        if (window.app && window.app.socket && window.app.socket.sendMessage) {
          window.app.socket.sendMessage('extractdocumentstructure url=interactive filter=all');
          sent = true;
        }
      } catch(e) {}
      if (!sent) { resolve(null); return; }
      extractionResolvers.push(resolve);
      setTimeout(function(){
        var idx = extractionResolvers.indexOf(resolve);
        if (idx >= 0) {
          extractionResolvers.splice(idx, 1);
          resolve(null);
        }
      }, 15000);
    });
  }

  function readDocumentAndDisplay(){
    var bubble = addMessage('ai', 'Reading document structure...');
    var bubbleBody = bubble.querySelector('.kp-msg-b');
    extractStructure().then(function(json){
      if (!json) {
        bubbleBody.innerHTML = '<span style="color:#F59E0B">Could not read document. Check console for raw messages.</span>';
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

  console.log('Kiwa AI editor panel installed (with structure extraction)');

})();
