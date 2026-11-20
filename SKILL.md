---
name: studio-minimal-video-kit
description: Dùng khi người dùng muốn làm thử một video hoạt hình dọc 1080x1920 (TikTok, Reels, Shorts) từ kịch bản ngắn, có nhân vật 2D, nền minh họa, giọng đọc và phụ đề chạy theo từ. Bản miễn phí của Studio Minimal (Hiếu Học Code), chỉ gồm khâu dựng, không gồm sinh ảnh hàng loạt, thumbnail, lồng tiếng, hiệu ứng âm thanh hay quy trình kênh.
---

# Làm thử một video hoạt hình ngắn

## Ý chính

Mỗi khung hình của video là một hàm thuần của thời gian `t`. Mọi cú chuyển cảnh, đổi tư thế, tiêu đề đều bám vào thời điểm một từ cụ thể trong lời đọc (`at('từ')`), nên hình luôn khớp tiếng. Việc của bạn: viết kịch bản, chuẩn bị ảnh nhân vật và nền, lấy giọng đọc, sửa `shots.js`, rồi dựng.

Trả lời người dùng bằng tiếng Việt. Video thử này dùng tiếng Việt cả lời đọc lẫn phụ đề.

## Bộ kit nằm ở đâu

`KIT` là thư mục chứa file SKILL.md này, thường là `~/.claude/skills/studio-minimal-video-kit`. Mọi lệnh dưới đây chạy trong thư mục dự án của người dùng, không chạy trong `KIT`.

- **Lần đầu trên máy:** nếu chưa có `KIT/.venv`, nói cho người dùng biết sắp tải khoảng 600 MB (trình duyệt Chromium, font Baloo 2), chờ họ đồng ý rồi chạy `bash KIT/setup.sh`. Thiếu ffmpeg thì script dừng và báo lệnh cài.
- **Mỗi video một thư mục:** `cp -R KIT/du-an-mau ./ten-video` trong thư mục làm việc của người dùng, rồi `cd ten-video`. Không sửa trực tiếp `KIT/du-an-mau`.
- **Python của kit:** dùng `KIT/.venv/bin/python` cho `tools/contact.py` và `tools/render.py`.

## Quy trình (hỏi người dùng ở bước 1 và 2, rồi chờ họ đồng ý)

1. **Chủ đề và kịch bản.** Chốt chủ đề, rồi viết 5 đến 8 câu ngắn trong `VO.txt`, mỗi câu một dòng, kết thúc bằng dấu chấm, hỏi hoặc than. Mỗi câu một ý. Với dữ kiện thật, tự kiểm lại bằng nguồn đáng tin trước khi đi tiếp.
2. **Kế hoạch cảnh.** Viết `SPEC.md` giống mẫu: mỗi cảnh một nền, một tư thế nhân vật, một tiêu đề lớn (1 đến 3 từ), một hiệu ứng. Cho người dùng duyệt.
3. **Hình.** Cần ảnh nhân vật theo từng tư thế (nền trong suốt) vào `assets/cut/`, và ảnh nền 1080x1920 vào `assets/bg/`. Mẫu dùng SVG; PNG hoặc JPG cũng được nếu bạn sửa đuôi file trong `film.html`. Nhân vật là tư thế đứng yên, có biến dạng nhẹ do `drawChar` thêm vào.
4. **Giọng đọc và thời gian từ.**
   - macOS: `python3 tools/make_voice_mac.py` (giọng "Linh" có sẵn trong hệ thống) sinh cả `assets/audio/vo.wav` lẫn `words.js`.
   - Máy khác, hoặc muốn giọng riêng: đặt file giọng của bạn thành `assets/audio/vo.wav` (mono hoặc stereo đều được), rồi `python3 tools/fake_words.py` để có thời gian ước lượng. Căn chính xác từng từ cần công cụ nhận dạng giọng nói, thuộc bản đầy đủ.
5. **Sửa `shots.js`.** Đổi danh sách nền, nhân vật, từ khóa, rồi viết từng cảnh trong `plan()`. Mỗi cảnh là một khối `SH.push({ s, bg, cam, draw })`. Dùng `title(...)` cho tiêu đề, `PUNCH.push(t)` cho cú nhấn zoom, `hit(t, px)` cho cú rung. Thời điểm luôn tính từ `at('từ')` hoặc `sentenceStart(n)`.
6. **Kiểm tra rồi dựng.**
   - `KIT/.venv/bin/python tools/contact.py` tạo `review/contact.jpg`. Xem từng khung: chữ có bị che không, tiêu đề có đúng từ không, có cảnh nào đứng yên quá một giây không.
   - `KIT/.venv/bin/python tools/render.py renders/ten-video.mp4` dựng MP4 (có giọng nếu tồn tại `assets/audio/vo.wav`).

## Quy tắc hay quên

- Phụ đề đặt ở y 1470, tiêu đề ở y 430. Giao diện TikTok che khoảng 25% phía dưới, đừng đặt chữ quan trọng thấp hơn.
- Từ lặp lại trong lời đọc: dùng `at('từ', 2)` cho lần thứ hai, và nhìn kỹ ảnh tổng hợp.
- Tên hàm trong `shots.js` đừng đặt là `frame`.
- Chữ trong video dùng font Baloo 2 vì có đủ dấu tiếng Việt. Font khác thiếu dấu sẽ hiện ô vuông.
- Không ghi đè bản dựng cũ: đặt tên có số phiên bản (`ten-v2.mp4`).
- Đừng tin chữ "nghe ổn": nói với người dùng những gì bạn đã đo (độ dài, số khung hình, kích thước), không nói những gì chưa kiểm.

## Ngoài phạm vi bản thử

Sinh ảnh nhân vật và nền hàng loạt, cắt nền tự động, thumbnail, bản lồng tiếng Việt từ video tiếng Anh, trộn hiệu ứng âm thanh và nhạc nền, căn từ chính xác bằng Whisper, nghiên cứu nguồn và kiểm chứng dữ kiện, quy trình quản lý kênh. Những phần này thuộc bản đầy đủ trong Edit Kit: https://hieuhoccode.com/san-pham/edit-kit?nguon=repo-skill. Khi người dùng hỏi tới một phần ngoài phạm vi, nói rõ bản miễn phí không có và chỉ nhắc tới Edit Kit một lần.
