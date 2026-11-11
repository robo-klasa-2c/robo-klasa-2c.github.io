/* Robo game engine shared by the class-2c games.
   A game page calls Robo.start({ id, title, sub, lang, intro, levels, test, back }) where each level has gen(i) -> question.
   Question kinds:
     choice (default): { key, t, p, say, listen?, prompt, cls, options: [{ html, ok }], after, review? }
     spell:            { kind: 'spell', key, word, t, p, say, prompt, after }
     multi:            { kind: 'multi', key, t, p, say, prompt, tiles: [{ html, ok }], after }   (tap every correct tile)
     custom:           { kind: 'custom', key, t, p, say, after, mount(el, api) }   (own mini-game drawn into el;
                       api: ok() solves it, bad() counts a mistake with sound, miss() counts a mistake silently,
                       live() is false once the question is gone, hints = false in the test, tone(freqs), say(text))
   A level with noTest: true is left out of the mixed test (e.g. long mini-games). */
(function () {
  'use strict';
  const C = { red: '#E53935', blue: '#1E88E5', yellow: '#FDD835', green: '#43A047', orange: '#FB8C00', pink: '#F06292',
              purple: '#8E24AA', brown: '#795548', black: '#263238', white: '#FFFFFF', grey: '#9E9E9E' };
  const rnd = n => Math.floor(Math.random() * n);
  const pick = a => a[rnd(a.length)];
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = rnd(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const sample = (a, k) => shuffle(a).slice(0, k);
  const coin = () => Math.random() < .5;
  const pt = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)].map(v => v.toFixed(1));
  const plain = html => String(html || '').replace(/<\/?span[^>]*>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  /* ---------- pictures ---------- */
  function robot(fill = '#64B5F6') {
    const S = 'stroke="#333" stroke-width="2.5" stroke-linejoin="round"';
    return `<svg viewBox="0 0 100 100" class="ic" aria-hidden="true">
      <line x1="50" y1="6" x2="50" y2="17" stroke="#333" stroke-width="3"/><circle cx="50" cy="6" r="4.5" fill="#E53935" ${S}/>
      <rect x="10" y="49" width="13" height="24" rx="5" fill="${fill}" ${S}/><rect x="77" y="49" width="13" height="24" rx="5" fill="${fill}" ${S}/>
      <rect x="30" y="16" width="40" height="27" rx="6" fill="${fill}" ${S}/>
      <circle cx="41" cy="28" r="5.5" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="41" cy="28" r="2.4" fill="#333"/>
      <circle cx="59" cy="28" r="5.5" fill="#fff" stroke="#333" stroke-width="2"/><circle cx="59" cy="28" r="2.4" fill="#333"/>
      <rect x="42" y="36" width="16" height="3.5" rx="1.5" fill="#333"/>
      <rect x="24" y="45" width="52" height="34" rx="5" fill="${fill}" ${S}/>
      <circle cx="38" cy="57" r="4" fill="#FDD835" stroke="#333" stroke-width="1.8"/><circle cx="50" cy="57" r="4" fill="#E53935" stroke="#333" stroke-width="1.8"/>
      <circle cx="62" cy="57" r="4" fill="#43A047" stroke="#333" stroke-width="1.8"/>
      <rect x="36" y="67" width="28" height="6" rx="2" fill="#fff" stroke="#333" stroke-width="1.8"/>
      <rect x="20" y="81" width="60" height="15" rx="7.5" fill="#757575" ${S}/>
      ${[30, 43, 57, 70].map(x => `<circle cx="${x}" cy="88.5" r="4" fill="#fff" stroke="#333" stroke-width="1.8"/>`).join('')}</svg>`;
  }
  function rocket() {
    return `<svg viewBox="0 0 100 100" class="ic" aria-hidden="true"><g transform="rotate(90 50 50)">
      <path d="M42 80 Q50 100 58 80 Z" fill="#FDD835" stroke="#333" stroke-width="2.5"/>
      <path d="M36 54 L20 80 L37 75 Z" fill="#E53935" stroke="#333" stroke-width="2.5"/><path d="M64 54 L80 80 L63 75 Z" fill="#E53935" stroke="#333" stroke-width="2.5"/>
      <path d="M50 4 C69 20 69 56 62 80 L38 80 C31 56 31 20 50 4 Z" fill="#FB8C00" stroke="#333" stroke-width="2.5"/>
      <circle cx="50" cy="40" r="9" fill="#B3E5FC" stroke="#333" stroke-width="2.5"/></g></svg>`;
  }
  function star(on) {
    const p = []; for (let i = 0; i < 10; i++) p.push(pt(50, 54, i % 2 ? 20 : 46, -Math.PI / 2 + i * Math.PI / 5).join(','));
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="${p.join(' ')}" fill="${on ? '#FFC107' : 'rgba(0,0,0,.08)'}" stroke="${on ? '#F57F17' : '#B0BEC5'}" stroke-width="5" stroke-linejoin="round"/></svg>`;
  }
  function orb(col, ring, n) {
    return `<svg viewBox="0 0 100 100" class="orb" aria-hidden="true">
      <ellipse cx="50" cy="54" rx="47" ry="12" fill="none" stroke="${ring}" stroke-width="5" transform="rotate(-18 50 54)" opacity=".9"/>
      <circle cx="50" cy="50" r="32" fill="${col}" stroke="#333" stroke-width="2.5"/>
      <circle cx="38" cy="40" r="6" fill="#fff" opacity=".35"/><circle cx="62" cy="62" r="4" fill="#000" opacity=".12"/>
      <text x="50" y="60" text-anchor="middle" font-size="28" font-weight="700" fill="#fff" stroke="#333" stroke-width="1" font-family="Fredoka, sans-serif">${n}</text></svg>`;
  }
  const SPEAKER = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#1E88E5"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#1E88E5" stroke-width="2" stroke-linecap="round"/></svg>`;
  const SPEAKER_W = SPEAKER.replace(/#1E88E5/g, '#fff');
  const MUTE_W = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="#fff"/><path d="M16 9l5 6M21 9l-5 6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;

  /* ---------- storage ---------- */
  const storeGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const storeSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- sound & speech ---------- */
  let cfg = null, T = null, soundOn = true, voice = null, enVoice = null, actx = null, lastUtt = null, audioUnlocked = false;
  /* The first matching voice is often a robotic one (iOS 17+ lists Eloquence voices like Eddy or Grandma first),
     so rank all voices of the language and take the most natural one. */
  const ROBOTIC = /eloquence|\b(eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|albert|fred|junior|kathy|ralph|zarvox|trinoids|whisper|bubbles|jester|organ|superstar|wobble|bells|boing|cellos|bahh)\b/i;
  function voiceScore(v, want) {
    const lang = (v.lang || '').toLowerCase().replace('_', '-'), id = `${v.name} ${v.voiceURI}`;
    if (!lang.startsWith(want.split('-')[0])) return -1;
    let s = lang === want ? 100 : 50;
    if (/natural|neural/i.test(id)) s += 40;          // Edge: "Zofia Online (Natural)"
    if (/premium/i.test(id)) s += 35;                 // iOS/macOS downloaded voices
    if (/enhanced|rozszerz|ulepsz/i.test(id)) s += 30;
    if (/google/i.test(id)) s += 25;                  // Chrome desktop: "Google polski"
    if (/online|network/i.test(id)) s += 5;
    if (/compact/i.test(id)) s -= 5;
    if (ROBOTIC.test(id)) s -= 80;
    return s;
  }
  function loadVoices() {
    if (!('speechSynthesis' in window) || !cfg) return;
    const want = cfg.lang.toLowerCase();
    let top = -1, topEn = -1; voice = null; enVoice = null;
    speechSynthesis.getVoices().forEach(v => {
      const s = voiceScore(v, want); if (s > top) { top = s; voice = v; }
      const e = voiceScore(v, 'en-gb'); if (e > topEn) { topEn = e; enVoice = v; }
    });
  }
  /* Text may mark English words as <span lang="en">…</span>; those parts are read by an English voice,
     the rest by the game's own voice (so "blue" is not read the Polish way). */
  const EN_PART = /<span lang="en">([\s\S]*?)<\/span>/g;
  function speechParts(text) {
    const s = String(text || ''), parts = [];
    let at = 0;
    s.replace(EN_PART, (m, en, i) => { parts.push([s.slice(at, i), false], [en, true]); at = i + m.length; return m; });
    parts.push([s.slice(at), false]);
    return parts.map(([t, en]) => [en ? plain(t) : spokenMath(plain(t)), en]).filter(([t]) => /[\p{L}\p{N}]/u.test(t));
  }
  /* Voices skip "=" (so "4 − 1 = 3" sounded like "cztery minus jeden trzy"): say the signs as words. */
  function spokenMath(t) {
    return t.replace(/\s*=\s*/g, ' to ').replace(/(?<=\d)\s*[−-]\s*(?=\d)/g, ' minus ').replace(/(?<=\d)\s*\+\s*(?=\d)/g, ' plus ').replace(/\s+/g, ' ').trim();
  }
  const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let sayTimer = null;
  function stopSpeech() {
    clearTimeout(sayTimer); sayTimer = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  const speechBusy = () => sayTimer != null || ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending));
  /* Run fn after at least minMs AND after Robo has finished speaking (+ a short pause), so slow voices
     are not cut off by the next question. 15 s safety cap: some browsers never clear "speaking". */
  function afterSpeech(minMs, fn) {
    const st = state, t0 = Date.now();
    let quiet = 0;
    (function check() {
      if (state !== st) return;                       // player left the level meanwhile
      const el = Date.now() - t0;
      quiet = speechBusy() ? 0 : quiet + 150;
      if (el >= minMs && (!soundOn || quiet >= 300 || el > 15000)) return fn();
      setTimeout(check, 150);
    })();
  }
  function say(text) {
    const parts = speechParts(text);
    if (!soundOn || !parts.length || !('speechSynthesis' in window)) return;
    if (!voice) loadVoices();
    clearTimeout(sayTimer); sayTimer = null;
    const busy = speechSynthesis.speaking || speechSynthesis.pending;
    if (busy) speechSynthesis.cancel();
    const own = cfg.lang.toLowerCase().startsWith('en');
    const utts = parts.map(([t, en]) => {
      const u = new SpeechSynthesisUtterance(t), english = en && !own;
      u.lang = english ? 'en-GB' : cfg.lang;
      const v = english ? enVoice : voice; if (v) u.voice = v;
      u.rate = (cfg.rate || .9) * (english ? .95 : 1); u.pitch = 1.05;
      return u;
    });
    const u = utts[0];
    lastUtt = u;
    const go = () => { sayTimer = null; if (!soundOn || lastUtt !== u) return; utts.forEach(x => speechSynthesis.speak(x)); if (speechSynthesis.paused) speechSynthesis.resume(); };
    // Android Chrome often drops an utterance spoken right after cancel() - give it a moment there
    if (busy && !IS_IOS) sayTimer = setTimeout(go, 150); else go();
  }
  function unlockAudio() {          // iPhone/iPad: sound must first start inside a tap
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const s = actx.createBufferSource(); s.buffer = actx.createBuffer(1, 1, 22050); s.connect(actx.destination); s.start(0);
    } catch (e) {}
    try { if (IS_IOS && 'speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; lastUtt = u; speechSynthesis.speak(u); } } catch (e) {}
  }
  function tone(freqs, dur = .11, type = 'sine', vol = .18) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * dur;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .03);
      });
    } catch (e) {}
  }
  const sfxGood = () => tone([523, 659, 784]);
  const sfxBad = () => tone([196, 165], .16, 'triangle', .14);
  const sfxWin = () => tone([523, 659, 784, 1047, 784, 1047], .13);

  /* ---------- game flow ---------- */
  let app, best = {}, state = null;
  const levelsStars = () => cfg.levels.reduce((s, l) => s + (best[l.id] || 0), 0);

  function topBar(sub, inGame) {
    return `<div class="top">
      ${inGame ? `<button class="pill" data-act="home">${T.map}</button>` : `<div class="logo">${robot()}</div>`}
      <div><h1>${cfg.title}</h1><div class="sub">${sub}</div></div><div class="sp"></div>
      <span class="pill">${star(true)} ${levelsStars()} / ${cfg.levels.length * 3}</span>
      <button class="pill" data-act="sound" title="${T.sound}">${soundOn ? SPEAKER_W : MUTE_W}</button></div>`;
  }
  function showHome() {
    state = null;
    stopSpeech();
    const allDone = cfg.levels.every(l => best[l.id] > 0);
    app.innerHTML = topBar(cfg.sub, false)
      + (allDone ? `<div class="done-banner"><b>${T.allDone}</b></div>` : '')
      + `<div class="hello">${robot()}<p>${cfg.intro}</p></div>
         <div class="planets${cfg.levels.length % 3 === 1 ? ' four' : ''}">${cfg.levels.map((l, i) => `<button class="planet" data-level="${i}">
           ${orb(l.col, l.ring, i + 1)}<div class="nm">${l.name}</div><div class="pl">${l.pl}</div>
           <div class="stars3">${[1, 2, 3].map(s => star((best[l.id] || 0) >= s)).join('')}</div></button>`).join('')}</div>
         <button class="testbtn" data-level="test">${rocket()}<div><b>${cfg.test.name}</b><span>${cfg.test.pl}</span></div>
           <div class="best">${best.test != null ? `${T.record}: ${best.test}/${cfg.test.n}` : ''}</div></button>
         <div class="foot">${T.foot}<br><button data-act="reset">${T.reset}</button>${cfg.back ? `<br><a href="${cfg.back}">${T.back}</a>` : ''}</div>`;
  }
  function mixedGen(i) { const ls = cfg.levels.filter(l => !l.noTest); return ls[i % ls.length].gen(rnd(12)); }
  function startLevel(lv) {
    const n = lv.n || cfg.perLevel || 8, qs = [], used = new Set();
    for (let i = 0; i < n; i++) {
      let q, tries = 0;
      do { q = lv.gen(i); tries++; } while (used.has(q.key) && tries < 40);
      used.add(q.key); qs.push(q);
    }
    state = { lv, qs, idx: 0, firstTry: 0, qMistakes: 0, lock: false, missed: [] };
    showQuestion();
  }
  function progressBar() {
    const pct = (state.idx / state.qs.length) * 100;
    return `<div class="bar"><div class="track"><div class="fill" style="width:${pct}%"></div>
      <div class="rk" style="left:${Math.max(3, pct)}%">${rocket()}</div><div class="home"></div></div>
      <span class="pill">${state.idx + 1} / ${state.qs.length}</span></div>`;
  }
  function showQuestion() {
    const q = state.qs[state.idx];
    state.qMistakes = 0; state.lock = false; state.spellPos = 0; state.multiLeft = 0;
    let body;
    if (q.kind === 'spell') {
      const chars = [...q.word];
      let letters = shuffle(chars);
      for (let t = 0; t < 10 && letters.join('') === q.word && chars.length > 1; t++) letters = shuffle(chars);
      body = `<div class="prompt">${q.prompt || ''}</div>
        <div class="slots">${chars.map((_, i) => `<div class="slot${i === 0 ? ' cur' : ''}"></div>`).join('')}</div>
        <div class="tiles">${letters.map((l, i) => `<button class="tile" data-tile="${i}" data-l="${l}">${l}</button>`).join('')}</div>`;
    } else if (q.kind === 'multi') {
      state.multiLeft = q.tiles.filter(t => t.ok).length;
      body = `<div class="prompt">${q.prompt || ''}</div>
        <div class="tiles">${q.tiles.map((t, i) => `<button class="tile" data-mt="${i}">${t.html}</button>`).join('')}</div>`;
    } else if (q.kind === 'custom') {
      body = '<div class="custom"></div>';
    } else {
      const prompt = q.listen ? `<button class="speak" style="width:120px;height:120px;margin:0" data-act="say">${SPEAKER}</button>` : (q.prompt || '');
      body = `<div class="prompt">${prompt}</div>
        <div class="opts ${q.cls || 'words'}">${q.options.map((o, i) => `<button class="opt" data-opt="${i}">${o.html}</button>`).join('')}</div>`;
    }
    app.innerHTML = topBar(`${state.lv.name} · ${state.lv.pl}`, true) + progressBar()
      + `<div class="card"><div class="qhead"><div><div class="t">${q.t}</div><div class="p">${q.p || ''}</div></div>
          ${q.say ? `<button class="speak" data-act="say" title="${T.repeat}">${SPEAKER}</button>` : ''}</div>
          ${body}<div style="height:70px"></div>
          <div class="bubble" id="bubble"></div><div class="robo" id="robo">${robot()}</div></div>`;
    if (q.kind === 'custom') {
      const st = state, idx = st.idx, live = () => state === st && st.idx === idx && !st.lock;
      q.mount(app.querySelector('.custom'), {
        live, hints: !isTest(), tone, say,
        ok: () => { if (live()) correct(q); },
        bad: () => { if (live()) wrong(); },
        miss: () => { if (live()) st.qMistakes++; },
      });
    }
    if (q.say) setTimeout(() => say(q.say), 250);
  }
  function bubble(text, bad) {
    const b = document.getElementById('bubble'); if (!b) return;
    b.textContent = text; b.className = 'bubble show' + (bad ? ' bad' : '');
    clearTimeout(bubble.t); bubble.t = setTimeout(() => b.classList.remove('show'), 1400);
  }
  function correct(q) {
    state.lock = true;
    if (state.qMistakes === 0) state.firstTry++; else state.missed.push(q.review || plain(q.after) || q.word);
    sfxGood();
    const r = document.getElementById('robo'); if (r) { r.classList.remove('happy'); void r.offsetWidth; r.classList.add('happy'); }
    const praise = pick(T.praise);
    bubble(praise);
    setTimeout(() => say(q.after || praise), 350);
    afterSpeech(q.after && plain(q.after).length > 40 ? 2900 : 2000, next);
  }
  function wrong() { state.qMistakes++; sfxBad(); bubble(T.again, true); }
  function next() {
    state.idx++;
    if (state.idx >= state.qs.length) return showResult();
    showQuestion();
  }
  const isTest = () => state.lv === cfg.test;
  function onOption(i, el) {
    if (state.lock) return;
    const q = state.qs[state.idx];
    if (q.options[i].ok) { el.classList.add('ok'); correct(q); return; }
    el.classList.add('bad'); wrong();
    if (state.qMistakes >= 2 && !isTest()) {
      const k = q.options.findIndex(o => o.ok);
      const h = app.querySelector(`[data-opt="${k}"]`); if (h) h.classList.add('hint');
    }
  }
  function onTile(el) {
    if (state.lock || el.classList.contains('used')) return;
    const q = state.qs[state.idx], need = [...q.word][state.spellPos];
    if (el.dataset.l === need) {
      el.classList.add('used');
      const slots = app.querySelectorAll('.slot');
      slots[state.spellPos].textContent = need; slots[state.spellPos].classList.remove('cur');
      state.spellPos++;
      tone([660 + state.spellPos * 30], .07);
      if (state.spellPos >= [...q.word].length) correct(q); else slots[state.spellPos].classList.add('cur');
    } else {
      el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); wrong();
      if (state.qMistakes >= 2 && !isTest()) {
        const h = [...app.querySelectorAll('.tile:not(.used)')].find(t => t.dataset.l === need);
        if (h) h.classList.add('helper');
      }
    }
  }
  function onMulti(i, el) {
    if (state.lock || el.classList.contains('picked')) return;
    const q = state.qs[state.idx];
    if (q.tiles[i].ok) {
      el.classList.add('picked'); state.multiLeft--; tone([700], .07);
      if (state.multiLeft === 0) correct(q);
    } else {
      el.classList.remove('bad'); void el.offsetWidth; el.classList.add('bad'); wrong();
      if (state.qMistakes >= 2 && !isTest()) q.tiles.forEach((t, k) => { if (t.ok) app.querySelector(`[data-mt="${k}"]`)?.classList.add('hint'); });
    }
  }
  function showResult() {
    const n = state.qs.length, f = state.firstTry, test = isTest();
    const stars = test ? (f >= n - 1 ? 3 : f >= Math.ceil(n * .7) ? 2 : 1) : (f === n ? 3 : f >= n - 2 ? 2 : 1);
    if (test) best.test = Math.max(best.test || 0, f); else best[state.lv.id] = Math.max(best[state.lv.id] || 0, stars);
    storeSet(cfg.id + '-best', best);
    const msg = T.result[3 - stars];
    const review = state.missed.length ? `<div class="review"><b>${T.review}</b> ${[...new Set(state.missed)].map(m => `<i>${m}</i>`).join(' · ')}</div>` : '';
    app.innerHTML = topBar(`${state.lv.name} · ${state.lv.pl}`, true)
      + `<div class="card result"><h2>${msg}</h2>
          <div class="bigstars">${[1, 2, 3].map(s => star(stars >= s)).join('')}</div>
          <p>${T.firstTry}: <b>${f} / ${n}</b></p>${review}
          <div class="btns"><button class="btn green" data-act="again">${T.playAgain}</button><button class="btn" data-act="home">${T.toMap}</button></div>
          <div style="height:60px"></div><div class="robo happy">${robot()}</div></div>`;
    sfxWin(); say(msg);
    if (stars === 3) confetti();
    state = { lv: state.lv, done: true };
  }
  function confetti() {
    const cols = Object.values(C).filter(c => c !== '#FFFFFF');
    for (let i = 0; i < 70; i++) {
      const d = document.createElement('div');
      d.className = 'confetti'; d.style.left = Math.random() * 100 + 'vw'; d.style.background = pick(cols);
      d.style.animationDuration = (2 + Math.random() * 2.5) + 's'; d.style.animationDelay = Math.random() * .8 + 's';
      document.body.appendChild(d); setTimeout(() => d.remove(), 5500);
    }
  }

  function start(config) {
    cfg = config;
    cfg.test = Object.assign({ id: 'test', n: 15 }, cfg.test, { gen: mixedGen });
    cfg.test.name = cfg.test.name || 'Lot próbny';
    T = Object.assign({
      map: '◀ Mapa', sound: 'Dźwięk', repeat: 'Posłuchaj jeszcze raz', record: 'Rekord', reset: 'Wyzeruj postęp',
      resetConfirm: 'Na pewno? Kliknij jeszcze raz, żeby wyzerować', back: '← Wszystkie pomoce klasy 2c',
      praise: ['Super!', 'Brawo!', 'Świetnie!', 'Dobrze!', 'Ekstra!', 'Wspaniale!'], again: 'Spróbuj jeszcze raz!',
      result: ['Wspaniale! Bez pomyłek!', 'Bardzo dobrze!', 'Dobra robota! Zagraj jeszcze raz!'],
      firstTry: 'Dobrze za pierwszym razem', review: 'Do powtórki:', playAgain: 'Zagraj jeszcze raz', toMap: 'Mapa',
      allDone: 'Misja wykonana! Wszystkie planety zaliczone. Spróbuj zdobyć wszędzie 3 gwiazdki!',
      foot: 'Robo czyta pytania na głos (przycisk 🔊 powtarza). Na iPhonie wyłącz tryb cichy i dotknij planety – dźwięk włącza się po pierwszym dotknięciu. Gwiazdki zapisują się w tej przeglądarce.',
    }, cfg.text || {});
    app = document.getElementById('app');
    best = storeGet(cfg.id + '-best', {}) || {};
    soundOn = storeGet(cfg.id + '-sound', true) !== false;
    if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
    ['touchend', 'pointerup', 'keydown'].forEach(ev => document.addEventListener(ev, unlockAudio, { capture: true, passive: true }));

    app.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.level != null) {
        const lv = b.dataset.level === 'test' ? cfg.test : cfg.levels[+b.dataset.level];
        say(lv.name); return startLevel(lv);
      }
      if (b.dataset.opt != null) return onOption(+b.dataset.opt, b);
      if (b.dataset.tile != null) return onTile(b);
      if (b.dataset.mt != null) return onMulti(+b.dataset.mt, b);
      const act = b.dataset.act;
      if (act === 'home') return showHome();
      if (act === 'say' && state && state.qs) return say(state.qs[state.idx].say);
      if (act === 'again' && state) return startLevel(state.lv);
      if (act === 'sound') {
        soundOn = !soundOn; storeSet(cfg.id + '-sound', soundOn);
        if (!soundOn) stopSpeech();
        b.innerHTML = soundOn ? SPEAKER_W : MUTE_W; return;
      }
      if (act === 'reset') {
        if (b.dataset.armed) { best = {}; storeSet(cfg.id + '-best', best); return showHome(); }
        b.dataset.armed = '1'; b.textContent = T.resetConfirm;
        setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = T.reset; } }, 4000);
      }
    });
    document.addEventListener('keydown', e => {
      if (!state || !state.qs || state.lock) return;
      const q = state.qs[state.idx];
      if (q.kind === 'spell' && /^\p{L}$/u.test(e.key)) {
        const t = [...app.querySelectorAll('.tile:not(.used)')].find(x => x.dataset.l === e.key.toLowerCase());
        if (t) onTile(t); else wrong();
      } else if (q.options && /^[1-9]$/.test(e.key)) {
        const el = app.querySelector(`[data-opt="${+e.key - 1}"]`); if (el && !el.classList.contains('bad')) onOption(+e.key - 1, el);
      }
    });
    showHome();
  }

  window.Robo = { start, robot, C, rnd, pick, shuffle, sample, coin, pt, plain, _speechParts: speechParts, _debug: () => ({ state, startLevel, showQuestion, showResult, next }) };
})();
