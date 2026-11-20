# Dựng film.html thành MP4: tua từng khung ở 60 fps (mỗi khung trộn 6 khung phụ để có hiệu ứng nhòe chuyển động).
# Nếu có assets/audio/vo.wav thì ghép luôn giọng đọc. Chạy từ thư mục dự án:
#   python tools/render.py renders/video-thu.mp4
import sys, os, base64, asyncio, subprocess
from playwright.async_api import async_playwright
FPS, SUB = 60, 6
out = sys.argv[1] if len(sys.argv) > 1 else 'renders/video-thu.mp4'
VOICE = 'assets/audio/vo.wav'
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
JS = '''(t) => {
  if (!window._acc) { _acc = document.createElement('canvas'); _acc.width = 1080; _acc.height = 1920; _ax = _acc.getContext('2d'); }
  const c = document.getElementById('c');
  for (let i = 0; i < %d; i++) { seek(t + i * (0.5 / %d) / %d); _ax.globalAlpha = 1 / (i + 1); _ax.drawImage(c, 0, 0); }
  return _acc.toDataURL('image/jpeg', 0.93).split(',')[1];
}''' % (SUB, FPS, SUB)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 600, 'height': 1000})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.abspath('film.html'))
        try: await pg.wait_for_function('window.READY === true', timeout=20000)
        except Exception: sys.exit('Trang chưa sẵn sàng. Lỗi: %s' % errs[:3])
        end = await pg.evaluate('END'); n = int(end * FPS)
        cmd = ['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-']
        if os.path.exists(VOICE): cmd += ['-i', VOICE, '-map', '0:v', '-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-shortest']
        cmd += ['-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]
        ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
        for i in range(n):
            ff.stdin.write(base64.b64decode(await pg.evaluate(JS, i / FPS)))
            if i % 300 == 0: print(f'{i}/{n}', flush=True)
        ff.stdin.close(); ff.wait(); await b.close()
        print('Xong', out, n, 'khung', '(có giọng đọc)' if os.path.exists(VOICE) else '(không có tiếng)')
asyncio.run(main())
