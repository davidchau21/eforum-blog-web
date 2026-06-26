# Hướng Dẫn Tính Năng Nhóm Học Tập (Learning Groups) trên EForum

Tính năng Nhóm học tập (Learning Groups) trên EForum được thiết kế nhằm giúp các thành viên cùng nhau xây dựng không gian học tập, chia sẻ tài liệu và thảo luận sâu theo từng môn học hoặc đề tài nghiên cứu cụ thể.

## 1. Các loại Nhóm Học Tập
Nhóm học tập trên EForum được chia làm hai loại chính tùy thuộc vào mục đích bảo mật:
- **Nhóm Công khai (Public Groups)**:
  - Bất kỳ thành viên nào cũng có thể tìm kiếm nhóm, xem thông tin mô tả, danh sách thành viên, bài viết thảo luận và các tài liệu được chia sẻ.
  - Tuy nhiên, chỉ những người đã nhấn tham gia nhóm mới có quyền đăng bài thảo luận mới hoặc tải tài liệu mới lên nhóm.
- **Nhóm Riêng tư (Private Groups)**:
  - Tất cả nội dung thảo luận, bài viết, tài liệu chia sẻ và danh sách thành viên của nhóm đều bị ẩn đối với người ngoài.
  - Để truy cập các nội dung học tập bên trong, người dùng bắt buộc phải gửi yêu cầu tham gia và chờ Ban quản trị nhóm phê duyệt.

## 2. Vai trò và Cấp quyền trong Nhóm (Roles & Permissions)
Để duy trì trật tự và chất lượng chuyên môn, thành viên trong nhóm được phân thành các vai trò với quyền hạn cụ thể:
- **Trưởng nhóm (OWNER)**: 
  - Là người sáng lập ra nhóm. Có quyền hạn cao nhất: thay đổi cài đặt nhóm (avatar, banner, tên, mô tả, quy định), phê duyệt/từ chối thành viên mới, phân quyền vai trò cho thành viên khác, xóa thành viên khỏi nhóm, và có quyền xóa nhóm vĩnh viễn.
- **Phó nhóm (DEPUTY)**: 
  - Hỗ trợ Trưởng nhóm quản trị cộng đồng. Có quyền thay đổi cài đặt nhóm, duyệt thành viên mới, cập nhật vai trò cho Kiểm duyệt viên/Thành viên thường, xóa bài viết hoặc tài liệu của thành viên khác. Phó nhóm không thể tự ý xóa Trưởng nhóm hoặc xóa nhóm.
- **Kiểm duyệt viên (MODERATOR)**: 
  - Hỗ trợ kiểm duyệt nội dung và thành viên. Có quyền phê duyệt yêu cầu tham gia và phê duyệt bài viết mới của thành viên (nếu cài đặt nhóm cấu hình cho phép Kiểm duyệt viên thực hiện).
- **Thành viên thường (MEMBER)**: 
  - Có quyền viết bài viết thảo luận và tải tài liệu học tập lên nhóm. Bài viết và tài liệu này có thể cần Ban quản trị duyệt trước khi hiển thị chính thức tùy thuộc vào cấu hình cài đặt của nhóm.

## 3. Thảo luận và Chia sẻ Tài liệu trong Nhóm
- **Thảo luận (Discussion)**:
  - Thành viên nhóm có thể soạn thảo và đăng bài viết trực tiếp trong không gian nhóm. Nếu nhóm bật tính năng "Cần duyệt bài", bài viết sẽ nằm ở mục "Chờ duyệt" cho đến khi được Trưởng nhóm, Phó nhóm hoặc Kiểm duyệt viên phê duyệt.
- **Tài liệu (Documents)**:
  - EForum hỗ trợ chia sẻ các file tài liệu học tập phổ biến bao gồm PDF, Word (DOC, DOCX), PowerPoint (PPT, PPTX) với dung lượng tối đa 15MB cho mỗi file.
  - Thành viên có thể theo dõi số lượt xem và lượt tải về trực quan của từng file tài liệu được chia sẻ.

## 4. Ràng buộc bảo mật và đăng nhập (Authentication Guard)
- Nhằm bảo vệ tính riêng tư và tài nguyên học thuật của diễn đàn, **EForum yêu cầu người dùng bắt buộc phải đăng nhập tài khoản** để có thể truy cập bất kỳ không gian nhóm học tập nào, kể cả các nhóm công khai.
- Nếu người dùng chưa đăng nhập cố gắng truy cập trang danh sách nhóm (`/groups`) hoặc trang chi tiết nhóm (`/group/:id`), hệ thống sẽ hiển thị thông báo yêu cầu đăng nhập thân thiện: *"Vui lòng đăng nhập để truy cập nhóm học tập"* và tự động chuyển hướng người dùng về trang đăng nhập (`/signin`).
