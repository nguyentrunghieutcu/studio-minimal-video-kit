#!/usr/bin/env bash
# Cài môi trường để dựng video thử: Python venv + Playwright (Chromium) + Pillow, và tải font Baloo 2.
# Chạy một lần:  bash setup.sh (từ đâu cũng được, script tự vào thư mục của nó)
# Không cài gì ra ngoài thư mục này, trừ trình duyệt Chromium của Playwright (nằm trong thư mục cache của người dùng,
# hoặc thư mục bạn chỉ định bằng biến PLAYWRIGHT_BROWSERS_PATH).
set -euo pipefail
cd "$(dirname "$0")"

need() { command -v "$1" >/dev/null 2>&1 || { echo "Thiếu công cụ: $1. $2"; exit 1; }; }
need ffmpeg "macOS: brew install ffmpeg"
need curl "Cài curl rồi chạy lại."

# Playwright cần Python 3.9 trở lên và có bánh xe (wheel) cài sẵn; thử các bản phổ biến trước.
PY=""
for c in python3.12 python3.13 python3.11 python3.10 python3; do
  if command -v "$c" >/dev/null 2>&1; then PY="$c"; break; fi
done
[ -n "$PY" ] || { echo "Không thấy Python 3. macOS: brew install python@3.12"; exit 1; }
echo "Dùng $($PY -V) tại $(command -v $PY)"

if [ ! -d .venv ]; then "$PY" -m venv .venv; fi
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet playwright pillow
.venv/bin/python -m playwright install chromium

mkdir -p du-an-mau/assets/fonts
FONT=du-an-mau/assets/fonts/Baloo2.ttf
if [ ! -s "$FONT" ]; then
  # Font Baloo 2 (giấy phép SIL Open Font License) từ kho google/fonts. Thử vài địa chỉ vì đôi khi một địa chỉ bị lỗi tạm thời.
  for url in \
    'https://github.com/google/fonts/raw/main/ofl/baloo2/Baloo2%5Bwght%5D.ttf' \
    'https://raw.githubusercontent.com/google/fonts/main/ofl/baloo2/Baloo2%5Bwght%5D.ttf' \
    'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/baloo2/Baloo2%5Bwght%5D.ttf'; do
    if curl -sSfL -o "$FONT" "$url" && [ "$(wc -c < "$FONT")" -gt 100000 ]; then break; fi
    rm -f "$FONT"; sleep 2
  done
fi
[ -s "$FONT" ] || { echo "Không tải được font Baloo 2. Tải tay từ https://fonts.google.com/specimen/Baloo+2 rồi đặt tên file là $FONT"; exit 1; }

echo
echo "Xong. Mỗi video làm trong một thư mục riêng, chép từ du-an-mau:"
echo "  cp -R \"$PWD/du-an-mau\" ~/video-claude/video-thu && cd ~/video-claude/video-thu"
echo "  python3 tools/make_voice_mac.py                       # macOS: tạo giọng đọc tiếng Việt và words.js"
echo "  \"$PWD/.venv/bin/python\" tools/contact.py            # xem trước các khung hình"
echo "  \"$PWD/.venv/bin/python\" tools/render.py renders/video-thu.mp4"
