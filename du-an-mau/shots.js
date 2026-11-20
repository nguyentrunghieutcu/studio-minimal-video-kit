// Kịch bản hình: ai xuất hiện, ở cảnh nào, lúc nào. Mọi thời điểm lấy từ lời đọc (at / sentenceStart), không gõ số giây.
// Ví dụ này: "Bạch tuộc có ba trái tim" (6 câu, khoảng 15 giây).
const BACKGROUNDS = ['B1', 'B2', 'B3'];          // tên file trong assets/bg/*.svg (hoặc .jpg nếu bạn đổi dòng tải trong film.html)
const CHARACTERS = ['neutral', 'shocked', 'love'];  // tên file trong assets/cut/*.svg
const KEYS = ['ba', 'hai', 'một', 'xanh', 'ngừng', 'bò'];  // từ khóa tô vàng trong phụ đề

const SH = [], TITLES = [], PUNCH = [], SHAKE = [];
let END = 0;

function plan() {
  const S = n => sentenceStart(n);
  END = WORDS[WORDS.length - 1].e + 1.2;
  const title = (t, text, size, pair) => TITLES.push({ t, text, size, pair });
  const hit = (t, a) => SHAKE.push({ t, a });  // rung màn hình a pixel

  // Cảnh 1 (câu 1): bạch tuộc trôi giữa khung, tiêu đề "3 TIM" khi đọc "ba"
  SH.push({ s: 0, bg: 'B1', cam: lt => ({ z: 1 + 0.03 * lt, fx: 540, fy: 1000 }), draw(lt, t) {
    drawChar({ img: 'neutral', x: 540, y: 1000, s: 1.5, swim: 6 }, t);
    [0, 1, 2].forEach(i => { const d = t - (at('ba') + 0.25 * i); if (d > 0) heart(300 + i * 240, 560 - 20 * Math.sin(t * 3 + i), 70 * backOut(d / 0.2) * beat(t + i * 0.2), 0.1 * (i - 1)); });
  } });
  title(at('ba'), '3 TIM', 190, 'yellow'); PUNCH.push(at('ba')); hit(at('ba'), 26);

  // Cảnh 2 (câu 2): hai tim ở hai bên đầu (gần mang), con số 2
  SH.push({ s: S(2), bg: 'B2', cam: lt => ({ z: 1 + 0.03 * lt, fx: 540, fy: 1000 }), draw(lt, t) {
    const p = pose([[0, 'neutral'], [at('hai'), 'shocked']], t);
    drawChar({ img: p.img, since: p.since, x: 540, y: 1020, s: 1.5, swim: 6 }, t);
    const d = t - at('hai');
    if (d > 0) { heart(300, 850, 85 * backOut(d / 0.2) * beat(t), -0.2); heart(780, 850, 85 * backOut(d / 0.2) * beat(t, 2.2), 0.2); counter(540, 640, 2, d); }
  } });
  title(at('mang'), 'MANG', 170, 'blue');

  // Cảnh 3 (câu 3): một tim lớn ở giữa thân, nhân vật đổi sang "love"
  SH.push({ s: S(3), bg: 'B2', cam: (lt, t) => ({ z: lerp(1, 1.25, easeInOut(lt / 2)), fx: 540, fy: 1000 }), draw(lt, t) {
    const p = pose([[0, 'neutral'], [at('còn'), 'love']], t);
    drawChar({ img: p.img, since: p.since, x: 540, y: 1020, s: 1.5, swim: 6 }, t);
    const d = t - at('còn'); if (d > 0) heart(540, 960, 110 * backOut(d / 0.2) * beat(t), 0);
  } });
  title(at('khắp'), 'KHẮP\nCƠ THỂ', 150, 'white');

  // Cảnh 4 (câu 4): máu màu xanh, giọt xanh bay lên
  SH.push({ s: S(4), bg: 'B3', cam: lt => ({ z: 1.03 + 0.03 * lt, fx: 540, fy: 1000 }), draw(lt, t) {
    drawChar({ img: 'neutral', x: 540, y: 1020, s: 1.5, swim: 6 }, t);
    if (t > at('xanh')) { drops(540, 900, t - at('xanh')); burst(780, 700, t - at('xanh'), 95); }
  } });
  title(at('xanh'), 'MÁU XANH', 170, 'blue'); PUNCH.push(at('xanh')); hit(at('xanh'), 22);

  // Cảnh 5 (câu 5): bạch tuộc bơi ngang, tim chính dừng đập (đổi sang màu xám)
  SH.push({ s: S(5), bg: 'B1', cam: lt => ({ z: 1.02, fx: 540, fy: 1000 }), draw(lt, t) {
    const x = lerp(260, 820, easeInOut(lt / 3));
    const stopT = at('ngừng'), stopped = t >= stopT;
    drawChar({ img: stopped ? 'shocked' : 'neutral', since: stopped ? stopT : undefined, x, y: 1000, s: 1.4, swim: 22 }, t);
    heart(x, 560, 90 * (stopped ? 1 : beat(t, 3)), 0, stopped ? '#8d8d99' : '#ff4a6a');
  } });
  title(at('ngừng'), 'NGỪNG\nĐẬP', 160, 'red'); PUNCH.push(at('ngừng')); hit(at('ngừng'), 30);

  // Cảnh 6 (câu 6): kết, bạch tuộc "bò" chậm trên nền cát
  SH.push({ s: S(6), bg: 'B2', cam: lt => ({ z: 1.02 + 0.02 * lt, fx: 540, fy: 1000 }), draw(lt, t) {
    drawChar({ img: 'love', x: lerp(380, 700, easeInOut(lt / 3)), y: 1060, s: 1.5, swim: 4 }, t);
    for (let i = 0; i < 4; i++) { const k = (lt * 0.6 + i / 4) % 1; heart(300 + 160 * i, 900 - 420 * k, 30 + 14 * (i % 2), 0.3 * Math.sin(lt * 4 + i)); }
  } });
  title(at('thích'), 'THÍCH BÒ', 170, 'pink');

  // Tính thời điểm kết thúc mỗi cảnh và mỗi tiêu đề
  SH.forEach((s, i) => s.e = i + 1 < SH.length ? SH[i + 1].s : END);
  TITLES.sort((a, b) => a.t - b.t);
  TITLES.forEach((T, i) => { const shot = SH.find(s => T.t >= s.s && T.t < s.e); T.end = Math.min(TITLES[i + 1]?.t ?? END, shot.e); });
  TITLES[TITLES.length - 1].end = END;
}

function render(t) {
  const shot = SH.find(s => t >= s.s && t < s.e) || SH[SH.length - 1], lt = t - shot.s;
  let shx = 0, shy = 0;
  SHAKE.forEach((s, i) => { const d = t - s.t; if (d < 0 || d > 0.8) return; const a = s.a * Math.exp(-7 * d); shx += a * Math.sin(d * 90 + i); shy += a * Math.cos(d * 77 + i * 2); });
  let punch = 1; PUNCH.forEach(p => { const d = t - p; if (d >= 0 && d < 1.2) punch *= 1 + 0.1 * (d < 0.05 ? d / 0.05 : Math.exp(-5 * (d - 0.05))); });
  const c = shot.cam(lt, t), z = c.z * punch;
  const fx = clamp(c.fx, W / 2 / z, W - W / 2 / z), fy = clamp(c.fy, H / 2 / z, H - H / 2 / z);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#0b0a1e'; ctx.fillRect(0, 0, W, H);
  ctx.setTransform(z, 0, 0, z, W / 2 - fx * z + shx, H / 2 - fy * z + shy);
  drawBg(shot.bg, lt); shot.draw(lt, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  specks(lt, SH.indexOf(shot) * 97 + 3); vignette(0.4);
  ctx.setTransform(1, 0, 0, 1, shx * 0.5, shy * 0.5);
  TITLES.forEach(T => drawTitle(T, t));
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawCaption(t);
}
