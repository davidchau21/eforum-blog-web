# Hướng Dẫn Quản Lý và Viết Bài trên EForum

Diễn đàn EForum cho phép người dùng chia sẻ kiến thức, bài học thông qua chức năng viết và xuất bản bài viết (blog). Dưới đây là các tính năng và quy trình chi tiết.

## 1. Trình soạn thảo bài viết (Editor)
EForum sử dụng bộ soạn thảo **Editor.js** vô cùng mạnh mẽ với giao diện khối (block-based format). Hỗ trợ nhiều loại nội dung:
- **Tiêu đề (Header)**: Các cấp độ tiêu đề H2, H3 để định cấu trúc bài viết.
- **Văn bản thường (Paragraph)**: Định dạng văn bản gelasio dễ đọc.
- **Hình ảnh (Image)**: Hỗ trợ chèn hình ảnh minh họa sinh động.
- **Khối Code (Code block)**: Viết các mã lệnh lập trình có định dạng.
- **Trích dẫn (Quote) & Liên kết (Link)**: Nhúng các trích dẫn và liên kết ngoài.

## 2. Tiêu đề và Banner bài viết
Mỗi bài đăng trên EForum bắt buộc phải có:
- **Tiêu đề bài viết**: Phải ngắn gọn, súc tích và phản ánh đúng nội dung bài viết.
- **Banner bài viết**: Hình ảnh đại diện hiển thị ở đầu bài viết và trên các danh sách cấp feed.

## 3. Bản nháp (Draft) và Xuất bản (Publish)
Hệ thống quản lý bài đăng hỗ trợ hai trạng thái:
- **Bản nháp (Draft)**: Lưu tạm bài viết khi đang soạn thảo dở dang. Bản nháp chỉ hiển thị với chính tác giả trong trang quản lý bài viết (`Manage Blogs`).
- **Xuất bản (Publish)**: Bài viết sẽ được đăng công khai lên diễn đàn. Người dùng có thể gắn thêm tối đa **5 Thẻ chủ đề (Tags)** để phân loại bài viết và giúp độc giả dễ tìm kiếm hơn.

## 4. Quản lý bài viết cá nhân
Trong Dashboard cá nhân, mục `Quản lý bài viết` (`Manage Blogs`) cho phép tác giả:
- Xem danh sách bài viết đã xuất bản (`Published`).
- Xem danh sách bài viết nháp (`Drafts`).
- Tìm kiếm bài viết của mình theo tên tiêu đề.
- Chỉnh sửa lại bài viết đã đăng (giữ nguyên hoặc cập nhật lại bản nháp).

## 5. Xóa bài viết (Delete Blog)
Tác giả có quyền xóa bài viết của mình bất kỳ lúc nào. Sau khi xác nhận xóa:
- Bài viết sẽ bị gỡ bỏ vĩnh viễn khỏi cơ sở dữ liệu.
- Các bình luận, lượt tim liên quan đến bài viết đó cũng sẽ được dọn dẹp sạch sẽ.
- Ban quản trị diễn đàn (Admin) cũng có quyền gỡ bỏ bài viết nếu bài đăng vi phạm quy chuẩn cộng đồng.
