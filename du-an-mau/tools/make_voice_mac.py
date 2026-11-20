# Tạo giọng đọc bằng lệnh `say` của macOS (giọng tiếng Việt "Linh") rồi sinh words.js khớp với giọng đó.
# Chỉ dùng thư viện chuẩn của Python, cần macOS và ffmpeg. Chạy từ thư mục dự án: python3 tools/make_voice_mac.py [tên giọng]
# Cách khớp thời gian: mỗi câu trong VO.txt (một câu mỗi dòng) được đọc riêng, đo độ dài thật của file âm thanh,
# rồi chia thời gian cho từng từ theo số chữ cái. Đây là xấp xỉ, không chính xác từng từ như khi căn bằng Whisper.
import json, os, re, subprocess, sys, wave, tempfile
voice = sys.argv[1] if len(sys.argv) > 1 else 'Linh'
lines = [l.strip() for l in open('VO.txt', encoding='utf-8') if l.strip()]
SR, LEAD, GAP = 44100, 0.15, 0.22
os.makedirs('assets/audio', exist_ok=True)
tmp = tempfile.mkdtemp()
pcm, words, t = b'', [], LEAD
pcm += b'\0\0' * int(SR * LEAD)
for i, line in enumerate(lines):
    aiff, wav = f'{tmp}/s{i}.aiff', f'{tmp}/s{i}.wav'
    subprocess.run(['say', '-v', voice, '-o', aiff, line], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', aiff, '-ac', '1', '-ar', str(SR), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', wav], check=True)
    w = wave.open(wav); n = w.getnframes(); data = w.readframes(n); w.close()
    dur = n / SR
    toks = line.split(); weights = [len(re.sub(r'\W', '', x)) + 1 for x in toks]; tot = sum(weights); a = t
    for x, wt in zip(toks, weights):
        d = dur * wt / tot; words.append({'w': x, 's': round(a, 3), 'e': round(a + d * 0.92, 3)}); a += d
    pcm += data + b'\0\0' * int(SR * GAP); t += dur + GAP
o = wave.open('assets/audio/vo.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(pcm); o.close()
open('words.js', 'w', encoding='utf-8').write('window.WORDS=' + json.dumps(words, ensure_ascii=False) + ';\n')
print('Đã tạo assets/audio/vo.wav (%.1f s) và words.js (%d từ)' % (len(pcm) / 2 / SR, len(words)))
