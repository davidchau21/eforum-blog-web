# Hướng Dẫn Hệ Thống Tài Khoản và Xác Thực trên EForum

Tài liệu này cung cấp chi tiết về cách thức vận hành của hệ thống đăng ký, đăng nhập, và quản lý tài khoản trên nền tảng EForum.

## 1. Đăng ký tài khoản mới (Signup)
Để tham gia EForum, người dùng cần đăng ký tài khoản với các thông tin sau:
- **Họ và tên (Fullname)**: Độ dài tối thiểu phải từ 3 ký tự trở lên.
- **Email**: Phải là email hợp lệ (ví dụ: `user@domain.com`). Mỗi email chỉ được đăng ký một tài khoản duy nhất.
- **Mật khẩu (Password)**: Độ dài từ 6 đến 20 ký tự, bắt buộc phải chứa ít nhất:
  - 1 chữ số.
  - 1 chữ cái thường (a-z).
  - 1 chữ cái viết hoa (A-Z).

*Quy trình xác thực đăng ký:* Sau khi gửi thông tin thành công, hệ thống sẽ gửi một mã OTP gồm 6 chữ số đến email đăng ký. Người dùng phải nhập đúng mã OTP này tại trang xác thực OTP để kích hoạt tài khoản chính thức.

## 2. Xác thực OTP (Verify OTP)
- Mã OTP gửi qua email có thời hạn nhất định.
- Mã này dùng để xác nhận email là có thật và thuộc sở hữu của người dùng.
- Trạng thái tài khoản sẽ là "Chưa kích hoạt" cho đến khi mã OTP được xác thực thành công.

## 3. Đăng nhập (Signin)
EForum hỗ trợ hai phương thức đăng nhập:
- **Đăng nhập truyền thống**: Sử dụng Email và Mật khẩu đã đăng ký.
- **Đăng nhập qua Google (OAuth)**: Đăng nhập nhanh bằng tài khoản Google. Hệ thống sẽ sử dụng Google Access Token để xác thực và tạo tài khoản tự động (nếu chưa tồn tại) hoặc đăng nhập thẳng vào tài khoản hiện có liên kết với Gmail đó.

## 4. Quên mật khẩu & Khôi phục (Forgot/Reset Password)
Nếu quên mật khẩu, người dùng thực hiện các bước sau:
1. Nhập email của tài khoản tại trang **Quên mật khẩu**.
2. Hệ thống sẽ gửi một mã OTP khôi phục qua email.
3. Người dùng nhập mã OTP này cùng với **Mật khẩu mới** tại trang thiết lập lại mật khẩu để hoàn tất khôi phục.

## 5. Đổi mật khẩu (Change Password)
Khi đã đăng nhập, người dùng có thể đổi mật khẩu bất kỳ lúc nào trong cài đặt bảo mật bằng cách cung cấp:
- **Mật khẩu hiện tại (Current Password)**.
- **Mật khẩu mới (New Password)** (tuân thủ quy tắc 6-20 ký tự, có số, chữ thường và chữ hoa).

## 6. Đăng xuất (Logout)
Khi chọn đăng xuất, hệ thống sẽ gửi Access Token hiện tại lên Server để hủy phiên làm việc (session) và xóa token này khỏi danh sách hợp lệ, đảm bảo an toàn cho tài khoản.
