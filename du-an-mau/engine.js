// Bộ vẽ hoạt hình bản thử. Mọi hàm vẽ là hàm thuần của thời gian t (giây): cùng t thì ra cùng một khung hình.
const W = 1080, H = 1920, INK = '#2a1a14', YEL = '#ffd21f';
const PAIRS = {
  yellow: ['#ffd21f', '#c27a10'], red: ['#ff4a3d', '#8e1a14'], white: ['#ffffff', '#9aa6b4'],
  blue: ['#5ec8ff', '#1f6fa8'], pink: ['#ff7ab8', '#a8336d'],
};
const cv = document.getElementById('c'), ctx = cv.getContext('2d');
const IMG = {};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = k => 1 - Math.pow(1 - clamp(k), 3);
const easeInOut = k => (k = clamp(k), k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const backOut = k => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
const spring = dt => dt < 0 ? 0 : 1 - 0.6 * Math.exp(-9 * dt) * Math.cos(20 * dt);
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---- Từ và thời gian: mọi mốc đều lấy từ words.js (do tools/make_voice_mac.py hoặc fake_words.py sinh) ----
// Chuẩn hóa giữ nguyên chữ có dấu tiếng Việt.
const norm = w => w.toLowerCase().replace(/[^\p{L}\p{N}'\-]/gu, '');
function wi(word, occ = 1) {
  let n = 0;
  for (let i = 0; i < WORDS.length; i++) if (norm(WORDS[i].w) === word && ++n === occ) return i;
  throw new Error('Không tìm thấy từ "' + word + '" lần thứ ' + occ + ' trong words.js');
}
const at = (word, occ = 1) => WORDS[wi(word, occ)].s;       // thời điểm từ bắt đầu
// Thời điểm câu thứ n (tính từ 1) bắt đầu: câu kết thúc bằng . ? !
function sentenceStart(n) {
  let k = 1;
  for (let i = 0; i < WORDS.length; i++) {
    if (k === n) return WORDS[i].s;
    if (/[.?!]$/.test(WORDS[i].w)) k++;
  }
  throw new Error('Không có câu số ' + n);
}

// ---- Tư thế: [[thời điểm, tên ảnh], ...] -> ảnh hiện tại ----
function pose(list, t) { let cur = list[0]; for (const p of list) if (t >= p[0]) cur = p; return { img: cur[1], since: cur[0] }; }

// ---- Nhân vật. c: {img, x, y, s (tỉ lệ), rot, flip, swim (px), bob (0..1), alpha} ----
function drawChar(c, t) {
  const im = IMG[c.img], w = im.width, h = im.height, bob = c.bob ?? 1;
  const y = c.y + bob * 10 * Math.sin(2.7 * t);
  const rot = (c.rot || 0) + bob * 0.035 * Math.sin(2.7 * t + 1);
  const q = c.since !== undefined && t - c.since >= 0 && t - c.since < 1 ? 0.16 * Math.exp(-10 * (t - c.since)) * Math.cos(22 * (t - c.since)) : 0;  // nảy nhẹ khi đổi tư thế
  const sx = c.s * (c.sx ?? 1) / (1 + q) * (c.flip ? -1 : 1), sy = c.s * (c.sy ?? 1) * (1 + q);
  ctx.save(); ctx.translate(c.x, y); ctx.rotate(rot); ctx.scale(sx, sy); ctx.globalAlpha *= c.alpha ?? 1;
  if (c.swim) {  // uốn thân theo sóng: cắt ảnh thành 28 dải
    const N = 28;
    for (let i = 0; i < N; i++) {
      const x0 = i * w / N, u = 1 - (i + 0.5) / N, wt = u > 0.3 ? Math.pow((u - 0.3) / 0.7, 1.5) : 0;
      const dy = Math.sin(8 * t - 4.5 * u) * c.swim * wt / c.s;
      ctx.drawImage(im, x0, 0, w / N + 1, h, -w / 2 + x0, -h / 2 + dy, w / N + 1, h);
    }
  } else ctx.drawImage(im, -w / 2, -h / 2);
  ctx.restore();
  return { x: c.x, y };
}

// ---- Nền, bong bóng, viền tối ----
function drawBg(name, lt) {
  const z = 1.04 + 0.015 * lt;  // trôi chậm 1.5%/giây
  ctx.drawImage(IMG[name], W / 2 - W / 2 * z, H / 2 - H / 2 * z, W * z, H * z);
}
function specks(lt, seed) {
  const r = rng(seed); ctx.save(); ctx.fillStyle = '#fff';
  for (let i = 0; i < 30; i++) {
    const x = r() * W, y0 = r() * H, v = 14 + r() * 36, s = 2 + r() * 4.5, ph = r() * 6;
    const y = ((y0 - v * lt) % H + H) % H;
    ctx.globalAlpha = 0.4 * (0.7 + 0.3 * Math.sin(lt * 2 + ph));
    ctx.beginPath(); ctx.arc(x + 8 * Math.sin(lt * 0.9 + ph), y, s / 2, 0, 7); ctx.fill();
  }
  ctx.restore();
}
function vignette(a = 0.4) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.72);
  g.addColorStop(0, 'rgba(10,5,20,0)'); g.addColorStop(1, `rgba(10,5,20,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---- Tiêu đề lớn (y = 430). T: {t, end, text, size, pair} ----
function drawTitle(T, t) {
  const dt = t - T.t; if (dt < 0 || t >= T.end) return;
  const lines = T.text.split('\n'), [fill, dark] = PAIRS[T.pair];
  let size = T.size; ctx.font = `800 ${size}px Sub`;
  const wmax = Math.max(...lines.map(l => ctx.measureText(l).width));
  if (wmax > 980) size *= 980 / wmax;
  ctx.save(); ctx.translate(W / 2, 430); ctx.rotate(1.4 * Math.PI / 180 * Math.sin(dt * 5.5)); ctx.scale(spring(dt), spring(dt));
  ctx.font = `800 ${size}px Sub`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  lines.forEach((l, i) => {
    const y = (i - (lines.length - 1) / 2) * size * 0.95;
    ctx.lineWidth = 0.22 * size; ctx.strokeStyle = INK;
    ctx.fillStyle = dark; ctx.strokeText(l, 0, y + 0.09 * size); ctx.fillText(l, 0, y + 0.09 * size);
    ctx.fillStyle = fill; ctx.strokeText(l, 0, y); ctx.fillText(l, 0, y);
  });
  ctx.restore();
}

// ---- Phụ đề từng cụm 2-3 từ, viên thuốc trắng ở y = 1470, từ khóa màu vàng ----
let CHUNKS = [];
function buildChunks(keys) {
  CHUNKS = []; let cur = [];
  const flush = () => { if (cur.length) CHUNKS.push(cur), cur = []; };
  WORDS.forEach((w, i) => {
    cur.push(i);
    const end = /[.?!,]$/.test(w.w);
    if (end || cur.length === 3) flush();
  });
  flush();
  CHUNKS = CHUNKS.map(ids => {
    let key = ids.find(i => keys.includes(norm(WORDS[i].w)));
    if (key === undefined) key = ids.reduce((a, b) => norm(WORDS[b].w).length > norm(WORDS[a].w).length ? b : a);
    return { ids, key, s: WORDS[ids[0]].s };
  });
}
function drawCaption(t) {
  let c = null; for (const ch of CHUNKS) if (t >= ch.s) c = ch;
  if (!c || t > WORDS[c.ids[c.ids.length - 1]].e + 0.6) return;
  const fs = 64, dt = t - c.s, sc = lerp(0.82, 1, backOut(dt / 0.13));
  const words = c.ids.map(i => WORDS[i].w.replace(/[.,?!](?!\d)/g, '').toLocaleUpperCase('vi'));
  ctx.font = `800 ${fs}px Sub`;
  const gap = 18, ws = words.map(w => ctx.measureText(w).width), tw = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
  const ph = 1.5 * fs, pw = tw + 70;
  ctx.save(); ctx.translate(W / 2, 1470); ctx.scale(sc, sc);
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = '#fff'; ctx.lineWidth = 7; ctx.strokeStyle = INK; ctx.fill(); ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; let x = -tw / 2;
  words.forEach((w, k) => {
    if (c.ids[k] === c.key) { ctx.lineWidth = 0.14 * fs; ctx.strokeStyle = INK; ctx.strokeText(w, x, 4); ctx.fillStyle = '#e6a800'; }
    else ctx.fillStyle = INK;
    ctx.fillText(w, x, 4); x += ws[k] + gap;
  });
  ctx.restore();
}

// ---- Đạo cụ ----
function stroke2(path, wInk, wCol, col) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = INK; ctx.lineWidth = wInk; path(); ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = wCol; path(); ctx.stroke(); }
function star(n, r1, r2, rot) { ctx.beginPath(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); }
function burst(x, y, dt, r = 100) {  // ngôi sao nổ "bùm"
  if (dt < 0 || dt > 0.45) return;
  const g = backOut(dt / 0.1), fade = dt > 0.3 ? 1 - (dt - 0.3) / 0.15 : 1, rr = r * (0.55 + 0.45 * g);
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= fade; ctx.lineJoin = 'round';
  star(24, rr, rr * 0.62, dt * 2); ctx.fillStyle = YEL; ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.fill(); ctx.stroke();
  star(24, rr * 0.6, rr * 0.38, -dt * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
}
function heartPath(s) { ctx.beginPath(); ctx.moveTo(0, s * 0.35); ctx.bezierCurveTo(-s * 1.1, -s * 0.35, -s * 0.45, -s * 1.05, 0, -s * 0.45); ctx.bezierCurveTo(s * 0.45, -s * 1.05, s * 1.1, -s * 0.35, 0, s * 0.35); ctx.closePath(); }
function heart(x, y, s, rot = 0, col = '#ff4a6a') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); heartPath(s);
  ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = Math.max(5, s * 0.08); ctx.lineJoin = 'round'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(-s * 0.38, -s * 0.45, s * 0.14, s * 0.08, -0.6, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); ctx.restore();
}
function beat(lt, rate = 2.2) { return 1 + 0.12 * Math.max(0, Math.sin(lt * rate * Math.PI * 2)) ** 3; }  // nhịp đập
function counter(x, y, n, dt) {  // con số nảy lên mỗi lần đổi
  const s = 1 + 0.35 * Math.exp(-12 * dt) * Math.cos(18 * dt);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.font = '800 190px Sub'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 40; ctx.strokeStyle = INK; ctx.strokeText(String(n), 0, 12); ctx.fillStyle = YEL; ctx.fillText(String(n), 0, 12); ctx.restore();
}
function drops(x, y, lt, col = '#5ec8ff') {  // giọt máu xanh bay lên
  const r = rng(5);
  for (let i = 0; i < 9; i++) {
    const d = r() * 1.2, v = 120 + r() * 120, k = lt - d; if (k < 0) continue;
    const yy = y - v * (k % 2.2), xx = x + (r() - 0.5) * 520 + 20 * Math.sin(k * 3 + i), s = 14 + r() * 14;
    ctx.beginPath(); ctx.arc(xx, yy, s, 0, 7); ctx.fillStyle = col; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.fill(); ctx.stroke();
  }
}
