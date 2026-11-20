# Bạch tuộc có ba trái tim: video hoạt hình dọc 1080x1920, khoảng 15 giây

Đây là bản mô tả (SPEC) của video mẫu. Khi làm video của bạn, hãy viết một SPEC tương tự trước, rồi mới sửa `VO.txt` và `shots.js`.

Lưu ý về nội dung: ví dụ này chỉ để minh họa cách dựng. Các câu về tim bạch tuộc là kiến thức phổ thông, **chưa được kiểm chứng bằng nguồn chính thống trong bộ này**. Khi làm video thật, hãy tự kiểm lại từng dữ kiện bằng nguồn đáng tin (bài báo khoa học, viện nghiên cứu, bảo tàng) trước khi đăng. Riêng chi tiết "tim chính ngừng đập khi bơi", một số nguồn ghi đây là sự gián đoạn ngắn của dòng máu chứ không phải tắt hẳn, nên bản thử dùng chữ "tạm ngừng".

## Nhân vật (3 tư thế, vẽ bằng SVG, quay mặt thẳng)
neutral (bình thường) · shocked (ngạc nhiên) · love (mắt trái tim). File ở `assets/cut/`.

## Nền (3 cảnh)
B1 biển sâu xanh đậm có bong bóng · B2 đáy biển cát có rong · B3 hoàng hôn tím hồng có mặt trăng. File ở `assets/bg/`.

## Lời đọc (6 câu, mỗi câu một dòng trong VO.txt)
1. Bạch tuộc có ba trái tim.
2. Hai trái tim bơm máu qua mang.
3. Trái tim còn lại bơm máu đi khắp cơ thể.
4. Máu của nó có màu xanh.
5. Và khi bơi, tim chính tạm ngừng đập.
6. Vì thế bạch tuộc thích bò hơn bơi.

## Kế hoạch cảnh

| Cảnh | Bắt đầu | Nền | Trên màn hình | Tiêu đề | Hiệu ứng |
| --- | --- | --- | --- | --- | --- |
| 1 | đầu video | B1 | Bạch tuộc trôi giữa khung, ba trái tim hiện lần lượt | 3 TIM (vàng) tại từ "ba" | nhấn zoom, rung |
| 2 | câu 2 | B2 | Đổi sang ngạc nhiên, hai tim ở hai bên đầu, số 2 | MANG (xanh dương) tại từ "mang" | tim đập |
| 3 | câu 3 | B2 | Đổi sang mắt trái tim, một tim lớn ở giữa thân | KHẮP CƠ THỂ (trắng) tại từ "khắp" | đẩy gần dần |
| 4 | câu 4 | B3 | Giọt xanh bay lên, ngôi sao nổ | MÁU XANH (xanh dương) tại từ "xanh" | nhấn zoom, rung |
| 5 | câu 5 | B1 | Bơi ngang khung, tim đổi sang màu xám khi "ngừng" | NGỪNG ĐẬP (đỏ) tại từ "ngừng" | nhấn zoom, rung mạnh |
| 6 | câu 6 | B2 | Bò chậm trên cát, tim nhỏ bay lên | THÍCH BÒ (hồng) tại từ "thích" | |

Mọi thời điểm lấy từ lời đọc (`at('từ')` hoặc `sentenceStart(n)`), không gõ số giây.
