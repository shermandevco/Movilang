// MoviLang — власні анімовані спутники (SVG). Кожен вид має 4 стадії: яйце, малюк, дорослий, легендарний.
// MLPET.svg(species, stage 0..3, mood 'happy'|'sad'|'sleepy'|'new', outfit {svg, col, col2} | null) → рядок SVG.
(function () {
  var S = {
    owl:     {c:'#8a6a4a', b:'#ecdcbc', a:'#e8913a', top:70, neck:128, eyeY:104, eyeDx:18, egg:'#cdb48e', spot:'#8a6a4a'},
    wolf:    {c:'#8c97aa', b:'#eef1f6', a:'#2b2f3a', top:74, neck:140, eyeY:98,  eyeDx:19, egg:'#b9c3d4', spot:'#6a7488'},
    monkey:  {c:'#8a5634', b:'#f2c9a0', a:'#5a3420', top:68, neck:132, eyeY:104, eyeDx:15, egg:'#d9a878', spot:'#8a5634'},
    goat:    {c:'#f1ede4', b:'#ffffff', a:'#c9a26b', top:70, neck:132, eyeY:102, eyeDx:19, egg:'#efe6d2', spot:'#c9a26b'},
    raven:   {c:'#2c2c3e', b:'#3e3e58', a:'#9aa0b4', top:70, neck:128, eyeY:102, eyeDx:17, egg:'#7f9fa8', spot:'#3a4a52'},
    spider:  {c:'#40295a', b:'#5d3f80', a:'#ff9a3a', top:86, neck:140, eyeY:118, eyeDx:15, egg:'#e9e0f0', spot:'#7a5aa0'},
    tractor: {c:'#d8432c', b:'#ffcf5a', a:'#2b2b33', top:58, neck:106, eyeY:84,  eyeDx:13, egg:'#ffb36a', spot:'#d8432c'},
    mouse:   {c:'#d9b386', b:'#f6e6cc', a:'#ff9aa8', top:72, neck:132, eyeY:106, eyeDx:16, egg:'#f0dcb8', spot:'#c4985e'},
    cat:     {c:'#9a9cab', b:'#f3f2f6', a:'#ff9aa8', top:72, neck:130, eyeY:104, eyeDx:18, egg:'#d6d8e2', spot:'#6e7080'},
    sloth:   {c:'#a68c6c', b:'#ecdfc6', a:'#5a4532', top:66, neck:132, eyeY:106, eyeDx:20, egg:'#d8c8a8', spot:'#8a7254'}
  };
  function el(cx, cy, rx, ry, f, extra) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="' + f + '"' + (extra || '') + '/>'; }
  function halfW(y, cy, rx, ry) { var k = (y - cy) / ry; return k * k >= 1 ? 0 : rx * Math.sqrt(1 - k * k); }

  /* ---------- очі й рот ---------- */
  function eyes(d, mood, iris, big, slit) {
    var y = d.eyeY, r = big ? 10 : 8.5, out = '';
    [100 - d.eyeDx, 100 + d.eyeDx].forEach(function (x, i) {
      if (mood === 'sleepy') { out += '<path d="M' + (x - r) + ' ' + y + ' q' + r + ' ' + (r * .8) + ' ' + (r * 2) + ' 0" fill="none" stroke="#1e1a24" stroke-width="2.6" stroke-linecap="round"/>'; return; }
      out += '<g class="pe-eye">' + el(x, y, r, r * 1.08, '#fff') +
        (slit ? el(x, y + 1, r * .62, r * .8, iris) + el(x, y + 1, r * .16, r * .66, '#16141c') : el(x, y + 1, r * .64, r * .7, iris) + el(x, y + 1.5, r * .36, r * .4, '#16141c')) +
        '<circle cx="' + (x - r * .28) + '" cy="' + (y - r * .3) + '" r="' + (r * .24) + '" fill="#fff"/></g>';
      if (mood === 'sad') out += '<path d="M' + (x - r - 2) + ' ' + (y - r - (i ? -2 : 4)) + ' L' + (x + r + 2) + ' ' + (y - r - (i ? 4 : -2)) + '" stroke="#1e1a24" stroke-width="2.4" stroke-linecap="round"/>' +
        '<path d="M' + (x - r) + ' ' + (y - r * .2) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x + r) + ' ' + (y - r * .2) + ' Z" fill="' + d.c + '" opacity=".9"/>';
    });
    if (mood === 'sad') out += '<path class="pe-tear" d="M' + (100 + d.eyeDx + 4) + ' ' + (y + 10) + ' q3 6 0 9 q-3 -3 0 -9z" fill="#7ad0ff"/>';
    return out;
  }
  function mouth(x, y, mood, w) {
    w = w || 7;
    if (mood === 'sad') return '<path d="M' + (x - w) + ' ' + (y + 3) + ' q' + w + ' -6 ' + (w * 2) + ' 0" fill="none" stroke="#1e1a24" stroke-width="2.2" stroke-linecap="round"/>';
    if (mood === 'sleepy') return el(x, y + 1, 3, 2.2, '#1e1a24', ' opacity=".7"');
    return '<path d="M' + (x - w) + ' ' + y + ' q' + w + ' ' + (w * .9) + ' ' + (w * 2) + ' 0" fill="none" stroke="#1e1a24" stroke-width="2.2" stroke-linecap="round"/>';
  }
  function cheeks(d) { return el(100 - d.eyeDx - 6, d.eyeY + 16, 6, 3.5, '#ff8aa0', ' opacity=".45"') + el(100 + d.eyeDx + 6, d.eyeY + 16, 6, 3.5, '#ff8aa0', ' opacity=".45"'); }
  function blob(d, R, cy, ry) { return el(100, cy || 122, R, ry || 58, d.c) + el(100, (cy || 122) + 20, R * .62, (ry || 58) * .6, d.b); }
  function feet(col, y) { return el(82, y || 178, 12, 6, col) + el(118, y || 178, 12, 6, col); }
  function wings(col, cy, sheen) {
    return '<g class="pe-wl">' + el(54, cy, 13, 30, col, ' transform="rotate(14 54 ' + cy + ')"') + (sheen ? '<path d="M50 ' + (cy - 14) + ' q-4 16 2 30" stroke="' + sheen + '" stroke-width="2" fill="none" opacity=".6"/>' : '') + '</g>' +
      '<g class="pe-wr">' + el(146, cy, 13, 30, col, ' transform="rotate(-14 146 ' + cy + ')"') + (sheen ? '<path d="M150 ' + (cy - 14) + ' q4 16 -2 30" stroke="' + sheen + '" stroke-width="2" fill="none" opacity=".6"/>' : '') + '</g>';
  }

  /* ---------- види (доросла геометрія) ---------- */
  var DRAW = {
    owl: function (d, m, big) { return {
      back: '',
      body: wings('#6e5238', 132) + blob(d, 50) +
        '<path class="pe-ear" d="M64 76 L56 46 L84 68 Z" fill="' + d.c + '"/><path class="pe-ear r" d="M136 76 L144 46 L116 68 Z" fill="' + d.c + '"/>' +
        [0, 1, 2].map(function (i) { return '<path d="M' + (88 + i * 12) + ' ' + (146 + (i % 2) * 6) + ' l4 4 l4 -4" stroke="#b89a70" stroke-width="2" fill="none"/>'; }).join('') +
        el(100 - d.eyeDx, d.eyeY, 19, 19, '#f4e6c8') + el(100 + d.eyeDx, d.eyeY, 19, 19, '#f4e6c8') +
        eyes(d, m, '#e8913a', big) + '<path d="M100 114 l-7 4 l7 12 l7 -12z" fill="#e8913a"/>' + feetOwl()
    }; },
    wolf: function (d, m, big) { return {
      back: '<path class="pe-tail" d="M138 158 q40 -6 40 -48 q-2 -10 -10 -8 q6 26 -34 40z" fill="' + d.c + '"/><path class="pe-tail" d="M170 104 q-2 -10 -10 -8 q4 10 4 18z" fill="#eef1f6"/>',
      body: blob(d, 48) + '<path class="pe-ear" d="M62 88 L68 38 L94 72 Z" fill="' + d.c + '"/><path class="pe-ear" d="M70 78 L72 52 L86 72 Z" fill="#f2b8c0"/>' +
        '<path class="pe-ear r" d="M138 88 L132 38 L106 72 Z" fill="' + d.c + '"/><path class="pe-ear r" d="M130 78 L128 52 L114 72 Z" fill="#f2b8c0"/>' +
        '<path d="M84 72 q16 -10 32 0 q-6 12 -16 18 q-10 -6 -16 -18z" fill="#6e7890"/>' + el(100, 120, 28, 20, '#eef1f6') +
        eyes(d, m, '#f2b84a', big) + el(100, 112, 7, 5, '#22252e') + mouth(100, 120, m, 6) + feet('#6e7890')
    }; },
    monkey: function (d, m, big) { return {
      back: '<path class="pe-tail" d="M136 162 q40 4 36 -30 q-3 -18 -18 -12 q-10 6 0 14 q8 -2 6 -8" fill="none" stroke="' + d.c + '" stroke-width="8" stroke-linecap="round"/>',
      body: el(52, 102, 15, 15, d.c) + el(52, 102, 9, 9, d.b) + el(148, 102, 15, 15, d.c) + el(148, 102, 9, 9, d.b) + blob(d, 48) +
        '<path d="M92 66 q4 -12 8 -2 q4 -10 8 2" fill="' + d.c + '"/>' +
        el(100 - d.eyeDx, d.eyeY, 17, 16, d.b) + el(100 + d.eyeDx, d.eyeY, 17, 16, d.b) + el(100, 122, 26, 18, d.b) +
        eyes(d, m, '#5a3420', big) + el(96, 116, 2, 1.6, '#5a3420') + el(104, 116, 2, 1.6, '#5a3420') + mouth(100, 124, m, 8) + feet(d.a)
    }; },
    goat: function (d, m, big) { return {
      back: '',
      body: '<path d="M80 76 q-14 -30 -30 -24 q14 2 18 28z" fill="#c9a26b"/><path d="M120 76 q14 -30 30 -24 q-14 2 -18 28z" fill="#c9a26b"/>' +
        '<g class="pe-ear">' + el(52, 100, 18, 8, '#e4ddd0', ' transform="rotate(20 52 100)"') + '</g><g class="pe-ear r">' + el(148, 100, 18, 8, '#e4ddd0', ' transform="rotate(-20 148 100)"') + '</g>' +
        blob(d, 48) + el(100, 120, 22, 16, '#f8e8ea') + goatEyes(d, m, big) + el(100, 116, 6, 3.5, '#d48a96') + mouth(100, 122, m, 5) +
        '<path d="M94 132 q6 18 12 0z" fill="#ddd4c4"/>' + feet('#5a4a3a')
    }; },
    raven: function (d, m, big) { return {
      back: '',
      body: wings('#22222f', 132, '#8a7ab8') + blob(d, 48) + '<path d="M92 66 l6 -12 l4 10 l6 -8 l0 12z" fill="' + d.c + '"/>' +
        '<path d="M84 140 q16 10 32 0" stroke="#6a6a90" stroke-width="2" fill="none" opacity=".5"/>' +
        eyes(d, m, '#3a3a50', big) + '<path d="M100 110 l-10 6 l10 16 l10 -16z" fill="#8f96aa"/><path d="M100 110 l-10 6 l10 4 l10 -4z" fill="#b4bacb"/>' + feet('#8f96aa')
    }; },
    spider: function (d, m, big) {
      var legs = '';
      for (var i = 0; i < 4; i++) { var y = 112 + i * 12, k = i % 2 ? ' b' : '';
        legs += '<path class="pe-leg' + k + '" d="M66 ' + y + ' q-22 -' + (16 - i * 4) + ' -36 ' + (4 + i * 6) + '" stroke="' + d.c + '" stroke-width="6" fill="none" stroke-linecap="round"/>' +
          '<path class="pe-leg r' + k + '" d="M134 ' + y + ' q22 -' + (16 - i * 4) + ' 36 ' + (4 + i * 6) + '" stroke="' + d.c + '" stroke-width="6" fill="none" stroke-linecap="round"/>'; }
      return { back: legs,
        body: el(100, 130, 46, 46, d.c) + el(100, 146, 28, 22, d.b) + '<path d="M86 156 h28 M90 164 h20" stroke="#ff9a3a" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
          '<circle cx="90" cy="100" r="3.5" fill="#16141c"/><circle cx="110" cy="100" r="3.5" fill="#16141c"/>' + eyes(d, m, '#ff9a3a', big) +
          '<path d="M94 134 l2 6 l2 -6 M102 134 l2 6 l2 -6" stroke="#fff" stroke-width="2" fill="none"/>' + mouth(100, 130, m, 6) };
    },
    tractor: function (d, m, big) { return {
      back: '<g class="pe-smoke"><circle cx="134" cy="56" r="7" fill="#ccc" opacity=".6"/><circle cx="142" cy="44" r="5" fill="#ccc" opacity=".4"/></g><rect x="128" y="62" width="9" height="30" rx="3" fill="#3a3a44"/>',
      body: '<rect x="44" y="98" width="114" height="62" rx="20" fill="' + d.c + '"/><rect x="128" y="112" width="34" height="40" rx="10" fill="#b8341f"/>' +
        '<rect x="62" y="56" width="62" height="54" rx="14" fill="' + d.c + '"/><rect x="70" y="64" width="46" height="36" rx="9" fill="#cfe9ff"/>' +
        '<path d="M140 126 h16 M140 134 h16 M140 142 h16" stroke="#7a1e10" stroke-width="3" stroke-linecap="round"/>' +
        eyes(d, m, '#2b2b33', big) + mouth(93, 96, m, 6) + '<rect x="56" y="136" width="62" height="6" rx="3" fill="#ffcf5a"/>' +
        '<g class="pe-wheel" style="transform-origin:72px 162px"><circle cx="72" cy="162" r="26" fill="#2b2b33"/><circle cx="72" cy="162" r="12" fill="#ffcf5a"/><path d="M72 136 v52 M46 162 h52" stroke="#45454f" stroke-width="5"/><circle cx="72" cy="162" r="5" fill="#2b2b33"/></g>' +
        '<g class="pe-wheel" style="transform-origin:142px 170px"><circle cx="142" cy="170" r="16" fill="#2b2b33"/><circle cx="142" cy="170" r="7" fill="#ffcf5a"/><path d="M142 154 v32 M126 170 h32" stroke="#45454f" stroke-width="4"/></g>'
    }; },
    mouse: function (d, m, big) { return {
      back: '<path class="pe-tail" d="M136 164 q34 12 40 -12 q4 -16 -8 -14" fill="none" stroke="#f0a8b0" stroke-width="4" stroke-linecap="round"/>',
      body: '<g class="pe-ear">' + el(62, 74, 25, 25, d.c) + el(62, 74, 15, 15, '#ffc0c8') + '</g><g class="pe-ear r">' + el(138, 74, 25, 25, d.c) + el(138, 74, 15, 15, '#ffc0c8') + '</g>' +
        blob(d, 46, 126, 54) + eyes(d, m, '#2a1e1a', big) + el(100, 120, 4.5, 3.5, '#ff7a8a') +
        '<path d="M80 122 h-20 M80 126 l-18 5 M120 122 h20 M120 126 l18 5" stroke="#8a6a50" stroke-width="1.4" opacity=".7"/>' + mouth(100, 126, m, 5) +
        '<rect x="97" y="128" width="6" height="5" rx="1" fill="#fff"/>' + feet('#f0a8b0')
    }; },
    cat: function (d, m, big) { return {
      back: '<path class="pe-tail" d="M136 162 q30 -4 30 -40 q0 -16 12 -18" fill="none" stroke="' + d.c + '" stroke-width="10" stroke-linecap="round"/>',
      body: '<path class="pe-ear" d="M60 90 L66 44 L94 70 Z" fill="' + d.c + '"/><path class="pe-ear" d="M68 80 L70 56 L86 70 Z" fill="#ffb8c4"/>' +
        '<path class="pe-ear r" d="M140 90 L134 44 L106 70 Z" fill="' + d.c + '"/><path class="pe-ear r" d="M132 80 L130 56 L114 70 Z" fill="#ffb8c4"/>' +
        blob(d, 48) + '<path d="M92 70 l3 10 M100 68 v12 M108 70 l-3 10" stroke="#6e7080" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M56 120 q8 -2 14 2 M58 130 q8 -4 14 0 M144 120 q-8 -2 -14 2 M142 130 q-8 -4 -14 0" stroke="#6e7080" stroke-width="3" stroke-linecap="round" fill="none"/>' +
        el(100, 120, 20, 14, '#f3f2f6') + eyes(d, m, '#6ad06a', big, true) + '<path d="M96 114 h8 l-4 5z" fill="#ff8a9a"/>' +
        '<path d="M78 118 h-18 M78 122 l-16 4 M122 118 h18 M122 122 l16 4" stroke="#6e7080" stroke-width="1.3" opacity=".7"/>' + mouth(100, 122, m, 5) + feet('#f3f2f6')
    }; },
    sloth: function (d, m, big) { return {
      back: '<g class="pe-arm"><rect x="38" y="112" width="20" height="58" rx="10" fill="#8a7254" transform="rotate(12 48 112)"/></g><g class="pe-arm r"><rect x="142" y="112" width="20" height="58" rx="10" fill="#8a7254" transform="rotate(-12 152 112)"/></g>',
      body: blob(d, 52) + '<path d="M90 68 q6 -10 10 0 q4 -10 10 0" fill="#8a7254"/>' + el(100, 110, 40, 30, d.b) +
        '<ellipse cx="' + (100 - d.eyeDx) + '" cy="' + (d.eyeY + 4) + '" rx="15" ry="10" fill="#5a4532" transform="rotate(-18 ' + (100 - d.eyeDx) + ' ' + (d.eyeY + 4) + ')"/>' +
        '<ellipse cx="' + (100 + d.eyeDx) + '" cy="' + (d.eyeY + 4) + '" rx="15" ry="10" fill="#5a4532" transform="rotate(18 ' + (100 + d.eyeDx) + ' ' + (d.eyeY + 4) + ')"/>' +
        eyes(d, m, '#2a1e14', big) + el(100, 118, 7, 5, '#3a2a1e') + mouth(100, 126, m, 9) + feet('#8a7254')
    }; }
  };
  function feetOwl() { return '<path d="M80 176 l-6 6 M84 176 v8 M88 176 l6 6 M112 176 l-6 6 M116 176 v8 M120 176 l6 6" stroke="#e8913a" stroke-width="3" stroke-linecap="round"/>'; }
  function goatEyes(d, m, big) {
    if (m === 'sleepy' || m === 'sad') return eyes(d, m, '#c9a26b', big);
    var r = big ? 10 : 8.5, o = '';
    [100 - d.eyeDx, 100 + d.eyeDx].forEach(function (x) { o += '<g class="pe-eye">' + el(x, d.eyeY, r, r, '#fff') + el(x, d.eyeY + 1, r * .7, r * .7, '#d9a84a') + '<rect x="' + (x - r * .5) + '" y="' + (d.eyeY - 1) + '" width="' + r + '" height="3.4" rx="1.6" fill="#16141c"/><circle cx="' + (x - r * .3) + '" cy="' + (d.eyeY - r * .35) + '" r="' + (r * .22) + '" fill="#fff"/></g>'; });
    return o;
  }

  /* ---------- одяг ---------- */
  function outfit(o, d, layer) {
    if (!o || !o.svg) return '';
    var t = d.top, n = d.neck, c = o.col || '#c4302b', c2 = o.col2 || '#ffd25a', hw = Math.max(30, halfW(n, 122, 50, 58) || 40);
    if (layer === 'back') return o.svg === 'cloak' ? '<path class="pe-cape" d="M60 ' + (n - 6) + ' Q40 170 56 188 L144 188 Q160 170 140 ' + (n - 6) + ' Z" fill="' + c + '"/>' : '';
    switch (o.svg) {
      case 'scarf': return '<g class="pe-scarf"><path d="M' + (100 - hw - 3) + ' ' + (n - 8) + ' Q100 ' + (n + 10) + ' ' + (100 + hw + 3) + ' ' + (n - 8) + ' L' + (100 + hw) + ' ' + (n + 6) + ' Q100 ' + (n + 24) + ' ' + (100 - hw) + ' ' + (n + 6) + ' Z" fill="' + c + '"/>' +
        '<path d="M' + (100 - hw * .5) + ' ' + (n + 1) + ' l4 14 M' + (100 - hw * .1) + ' ' + (n + 3) + ' l2 15 M' + (100 + hw * .3) + ' ' + (n + 2) + ' l-2 15 M' + (100 + hw * .7) + ' ' + (n - 1) + ' l-4 13" stroke="' + c2 + '" stroke-width="4"/>' +
        '<g class="pe-scarf-t"><path d="M' + (100 + hw * .35) + ' ' + (n + 8) + ' l14 2 l-2 40 l-14 -4 z" fill="' + c + '"/><path d="M' + (100 + hw * .35 + 1) + ' ' + (n + 20) + ' l13 2 M' + (100 + hw * .35) + ' ' + (n + 32) + ' l13 2" stroke="' + c2 + '" stroke-width="4"/>' +
        '<path d="M' + (100 + hw * .35 - 1) + ' ' + (n + 46) + ' l1 6 M' + (100 + hw * .35 + 4) + ' ' + (n + 47) + ' l0 6 M' + (100 + hw * .35 + 9) + ' ' + (n + 48) + ' l-1 6" stroke="' + c + '" stroke-width="2"/></g>' +
        el(100 + hw * .35 + 5, n + 8, 8, 7, c) + '</g>';
      case 'wizard': return '<path d="M' + (100 - 34) + ' ' + (t + 6) + ' Q' + 92 + ' ' + (t - 30) + ' ' + 108 + ' ' + (t - 64) + ' Q' + 116 + ' ' + (t - 70) + ' ' + 122 + ' ' + (t - 60) + ' Q' + 110 + ' ' + (t - 40) + ' ' + 134 + ' ' + (t + 6) + ' Z" fill="' + c + '"/>' +
        el(100, t + 6, 44, 9, c, ' opacity=".95"') + el(100, t + 4, 44, 6, '#00000033') + '<path d="M100 ' + (t - 22) + ' l3 6 l7 1 l-5 5 l1 7 l-6 -3 l-6 3 l1 -7 l-5 -5 l7 -1z" fill="' + c2 + '"/>' + '<circle cx="116" cy="' + (t - 42) + '" r="2.5" fill="' + c2 + '"/>';
      case 'tophat': return el(100, t + 4, 36, 8, '#1e1a24') + '<rect x="78" y="' + (t - 40) + '" width="44" height="44" rx="4" fill="#1e1a24"/>' + '<rect x="78" y="' + (t - 6) + '" width="44" height="8" fill="' + c + '"/>' + el(100, t - 40, 22, 5, '#2e2a36');
      case 'cowboy': return '<path d="M48 ' + (t + 4) + ' Q100 ' + (t + 22) + ' 152 ' + (t + 4) + ' Q140 ' + (t + 16) + ' 100 ' + (t + 18) + ' Q60 ' + (t + 16) + ' 48 ' + (t + 4) + 'z" fill="' + c + '"/><path d="M74 ' + (t + 8) + ' Q72 ' + (t - 30) + ' 92 ' + (t - 28) + ' Q100 ' + (t - 20) + ' 108 ' + (t - 28) + ' Q128 ' + (t - 30) + ' 126 ' + (t + 8) + 'z" fill="' + c + '"/><path d="M74 ' + t + ' h52" stroke="' + c2 + '" stroke-width="5"/>';
      case 'cap': case 'policecap': return '<path d="M70 ' + (t + 8) + ' Q70 ' + (t - 26) + ' 100 ' + (t - 26) + ' Q130 ' + (t - 26) + ' 130 ' + (t + 8) + 'z" fill="' + c + '"/><path d="M100 ' + (t + 6) + ' Q128 ' + (t + 2) + ' 146 ' + (t + 12) + ' Q124 ' + (t + 16) + ' 100 ' + (t + 12) + 'z" fill="' + (o.svg === 'policecap' ? '#1e1a24' : c2) + '"/>' +
        (o.svg === 'policecap' ? '<path d="M100 ' + (t - 16) + ' l7 3 v6 q0 5 -7 8 q-7 -3 -7 -8 v-6z" fill="' + c2 + '"/>' : '<circle cx="100" cy="' + (t - 25) + '" r="3" fill="' + c2 + '"/>');
      case 'beanie': return '<path d="M68 ' + (t + 10) + ' Q68 ' + (t - 28) + ' 100 ' + (t - 28) + ' Q132 ' + (t - 28) + ' 132 ' + (t + 10) + 'z" fill="' + c + '"/><rect x="66" y="' + (t + 2) + '" width="68" height="12" rx="6" fill="' + c2 + '"/><circle cx="100" cy="' + (t - 30) + '" r="8" fill="#fff"/>';
      case 'helmet': return '<path d="M66 ' + (t + 16) + ' Q64 ' + (t - 28) + ' 100 ' + (t - 30) + ' Q136 ' + (t - 28) + ' 134 ' + (t + 16) + ' L122 ' + (t + 16) + ' L120 ' + (t + 4) + ' L80 ' + (t + 4) + ' L78 ' + (t + 16) + 'z" fill="#aab3c2"/><rect x="96" y="' + (t + 2) + '" width="8" height="22" rx="3" fill="#8a93a2"/><path d="M100 ' + (t - 30) + ' Q118 ' + (t - 50) + ' 112 ' + (t - 22) + '" fill="' + c + '"/>';
      case 'crown': return '<path d="M74 ' + (t + 6) + ' L72 ' + (t - 20) + ' L86 ' + (t - 6) + ' L100 ' + (t - 26) + ' L114 ' + (t - 6) + ' L128 ' + (t - 20) + ' L126 ' + (t + 6) + ' Z" fill="' + c2 + '" stroke="#b8862a" stroke-width="2"/><circle cx="100" cy="' + (t - 4) + '" r="4" fill="' + c + '"/><circle cx="84" cy="' + (t + 1) + '" r="3" fill="#5ab0ff"/><circle cx="116" cy="' + (t + 1) + '" r="3" fill="#5ab0ff"/>';
      case 'roses': case 'laurel':
        var g = ''; for (var i = 0; i < 7; i++) { var a = Math.PI * (1.05 + i * .15), x = 100 + Math.cos(a) * 34, y = t + 10 + Math.sin(a) * 16;
          g += o.svg === 'roses' ? '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + c + '"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="2.5" fill="#7a0d1e"/>' : el(x.toFixed(1), y.toFixed(1), 8, 4, c2, ' transform="rotate(' + (i * 22 - 66) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"'); }
        return g;
      case 'bow': return '<path d="M100 ' + n + ' l-22 -12 v24z M100 ' + n + ' l22 -12 v24z" fill="' + c + '"/>' + el(100, n, 6, 6, c2);
      case 'bowtie': return '<path d="M100 ' + n + ' l-14 -8 v16z M100 ' + n + ' l14 -8 v16z" fill="' + c + '"/>' + el(100, n, 4, 4, '#1e1a24');
      case 'tie': return '<path d="M94 ' + (n - 4) + ' h12 l-2 7 h-8z" fill="' + c + '"/><path d="M96 ' + (n + 3) + ' h8 l5 34 l-9 9 l-9 -9z" fill="' + c + '"/><path d="M97 ' + (n + 14) + ' l10 6 M95 ' + (n + 26) + ' l12 6" stroke="' + c2 + '" stroke-width="3"/>';
      case 'shades': case 'goggles':
        var ex = d.eyeDx, ey = d.eyeY, gg = o.svg === 'goggles';
        return (gg ? '<path d="M' + (100 - hw - 6) + ' ' + ey + ' H' + (100 + hw + 6) + '" stroke="#3a2a1e" stroke-width="6"/>' : '<path d="M' + (100 - ex - 12) + ' ' + (ey - 4) + ' L' + (100 - hw) + ' ' + (ey - 8) + ' M' + (100 + ex + 12) + ' ' + (ey - 4) + ' L' + (100 + hw) + ' ' + (ey - 8) + '" stroke="#1e1a24" stroke-width="3"/>') +
          el(100 - ex, ey, gg ? 15 : 13, gg ? 14 : 10, gg ? '#7ad8ff' : '#1e1a24', gg ? ' stroke="#c9a26b" stroke-width="4" opacity=".9"' : '') + el(100 + ex, ey, gg ? 15 : 13, gg ? 14 : 10, gg ? '#7ad8ff' : '#1e1a24', gg ? ' stroke="#c9a26b" stroke-width="4" opacity=".9"' : '') +
          '<path d="M' + (100 - ex + 12) + ' ' + ey + ' Q100 ' + (ey - 5) + ' ' + (100 + ex - 12) + ' ' + ey + '" stroke="' + (gg ? '#c9a26b' : '#1e1a24') + '" stroke-width="3" fill="none"/>' +
          '<path d="M' + (100 - ex - 6) + ' ' + (ey - 4) + ' l6 -3" stroke="#fff" stroke-width="2" opacity=".6"/>';
      case 'cloak': return '<path d="M' + (100 - hw - 6) + ' ' + (n - 6) + ' Q100 ' + (n + 16) + ' ' + (100 + hw + 6) + ' ' + (n - 6) + ' Q' + (100 + hw) + ' ' + (n + 14) + ' 100 ' + (n + 22) + ' Q' + (100 - hw) + ' ' + (n + 14) + ' ' + (100 - hw - 6) + ' ' + (n - 6) + 'z" fill="' + c2 + '"/>' + el(100, n + 14, 5, 5, '#c9a26b');
      case 'sweater': return '<path d="M' + (100 - hw - 2) + ' ' + (n - 4) + ' Q100 ' + (n + 8) + ' ' + (100 + hw + 2) + ' ' + (n - 4) + ' L' + (100 + 48) + ' 160 Q100 184 ' + (100 - 48) + ' 160 Z" fill="' + c + '"/>' +
        '<path d="M64 150 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8 l8 -8 l8 8" stroke="' + c2 + '" stroke-width="3" fill="none"/>';
    }
    return '';
  }

  /* ---------- яйце ---------- */
  function egg(d, m) {
    var spots = '', i; for (i = 0; i < 6; i++) spots += el(70 + (i * 23) % 62, 82 + (i * 37) % 80, 6 + i % 3 * 2, 5 + i % 2 * 2, d.spot, ' opacity=".55"');
    return '<g class="pe-egg">' + '<path d="M100 48 C142 48 156 108 156 136 C156 168 130 186 100 186 C70 186 44 168 44 136 C44 108 58 48 100 48Z" fill="' + d.egg + '"/>' + spots +
      '<path d="M58 118 l12 -8 l10 10 l12 -10 l10 10 l12 -10 l10 10 l12 -8 l8 6" fill="none" stroke="#3a2e26" stroke-width="2.4" stroke-linejoin="round" opacity=".55"/>' +
      (m === 'sleepy' ? '' : '<g class="pe-peek"><path d="M78 122 l10 -8 l10 10 l12 -10 l10 8 v10 h-42z" fill="#1e1a24" opacity=".85"/><circle cx="90" cy="126" r="3" fill="#fff"/><circle cx="110" cy="126" r="3" fill="#fff"/></g>') +
      '<path d="M70 74 q8 -14 20 -18" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/></g>';
  }

  function svg(sp, stage, mood, o) {
    var d = S[sp] || S.owl, inner = '', big = stage === 1, gold = stage === 3;
    if (stage === 0) inner = egg(d, mood);
    else {
      var p = DRAW[sp] || DRAW.owl, r = p(d, mood === 'new' ? 'happy' : mood, big);
      var core = outfit(o, d, 'back') + r.back + '<g class="pe-breathe">' + r.body + (mood === 'happy' || mood === 'new' ? cheeks(d) : '') + outfit(o, d, 'front') + '</g>';
      inner = stage === 1 ? '<g transform="translate(100 186) scale(.78) translate(-100 -186)">' + core + '</g>' : stage === 3 ? '<g transform="translate(100 186) scale(1.04) translate(-100 -186)">' + core + '</g>' : core;
    }
    var aura = gold ? '<g class="pe-halo"><circle cx="100" cy="112" r="88" fill="url(#pg' + sp + ')"/>' + [0, 1, 2, 3, 4, 5].map(function (i) { var a = i * Math.PI / 3; return '<path d="M' + (100 + Math.cos(a) * 84).toFixed(1) + ' ' + (112 + Math.sin(a) * 84).toFixed(1) + ' l2.5 5 l5.5 .8 l-4 3.8 l1 5.5 l-5 -2.6 l-5 2.6 l1 -5.5 l-4 -3.8 l5.5 -.8z" fill="#ffe28a"/>'; }).join('') + '</g>' : '';
    return '<svg class="ml-pet" viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="pg' + sp + '"><stop offset="0" stop-color="#ffe28a" stop-opacity=".55"/><stop offset="1" stop-color="#ffe28a" stop-opacity="0"/></radialGradient></defs>' +
      aura + el(100, 190, 46, 7, '#000', ' class="pe-shadow" opacity=".28"') + '<g class="pe-all m-' + mood + (gold ? ' gold' : '') + '">' + inner + '</g>' +
      (mood === 'sleepy' && stage > 0 ? '<g class="pe-z"><text x="140" y="70" font-size="18" font-weight="700" fill="#cfd8ff">z</text><text x="152" y="54" font-size="13" font-weight="700" fill="#cfd8ff">z</text></g>' : '') + '</svg>';
  }
  window.MLPET = {svg:svg, species:Object.keys(S)};
})();
