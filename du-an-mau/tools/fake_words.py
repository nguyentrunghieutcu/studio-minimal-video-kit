# Tạo words.js với thời gian ước lượng (khoảng 3,5 từ mỗi giây) khi chưa có giọng đọc thật.
# Dùng khi bạn không dùng macOS hoặc muốn xem thử hình trước. Chạy từ thư mục dự án: python3 tools/fake_words.py
import re, json
text = re.sub(r'\[[^\]]+\]\s*', '', open('VO.txt', encoding='utf-8').read()).split()
t, out = 0.15, []
for w in text:
    d = 0.17 + 0.022 * len(re.sub(r'\W', '', w))
    out.append({'w': w, 's': round(t, 3), 'e': round(t + d, 3)}); t += d + 0.01
    if w[-1] in '.?!': t += 0.1
open('words.js', 'w', encoding='utf-8').write('window.WORDS=' + json.dumps(out, ensure_ascii=False) + ';\n')
print(len(out), 'từ, từ cuối kết thúc lúc', out[-1]['e'], 's')
