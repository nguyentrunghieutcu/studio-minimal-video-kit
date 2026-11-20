# Xuất ảnh tổng hợp các khung hình để kiểm tra nhanh trước khi dựng thật: review/contact.jpg
# Dùng: python tools/contact.py            (mỗi cảnh một khung)
#       python tools/contact.py 1.0 2.5    (các thời điểm bạn chọn, đơn vị giây)
# Cần Pillow (pip install pillow, đã có trong .venv do setup.sh tạo).
import sys, os, base64, io, asyncio
from PIL import Image, ImageDraw
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 600, 'height': 1000})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await pg.goto('file://' + os.path.abspath('film.html'))
        try: await pg.wait_for_function('window.READY === true', timeout=15000)
        except Exception: print('Chưa sẵn sàng. Lỗi:', errs); return
        info = await pg.evaluate('({end: END, shots: SH.map(s => [s.s, s.e])})'); print(info)
        argv = sys.argv[1:]
        times = [float(x) for x in argv] if argv else [round(s + (e - s) * 0.6, 2) for s, e in info['shots']]
        tiles = []
        for t in times:
            url = await pg.evaluate(f'(seek({t}), document.getElementById("c").toDataURL("image/jpeg", 0.85))')
            tiles.append((t, Image.open(io.BytesIO(base64.b64decode(url.split(',')[1]))).resize((270, 480))))
        cols = 5; rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 270, rows * 500), 'white'); d = ImageDraw.Draw(sheet)
        for i, (t, im) in enumerate(tiles):
            x, y = (i % cols) * 270, (i // cols) * 500; sheet.paste(im, (x, y)); d.text((x + 6, y + 482), f'{t:.2f}s', fill='black')
        os.makedirs('review', exist_ok=True); sheet.save('review/contact.jpg', quality=88)
        print('Đã lưu review/contact.jpg. Lỗi trang:', errs[:5]); await b.close()
asyncio.run(main())
