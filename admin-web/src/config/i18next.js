import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      login: {
        title: "Welcome Back",
        subtitle: "Securely access your management dashboard.",
        email_label: "Email Address",
        email_placeholder: "admin@edublog.vn",
        password_label: "Secure Password",
        password_placeholder: "••••••••••••",
        remember_me: "Remember Me",
        forgot_password: "Forgot Password?",
        sign_in: "Sign In Now",
        authenticating: "Authenticating...",
        email_required: "Please enter your email!",
        email_invalid: "Invalid email address!",
        password_required: "Please enter your password!",
        portal_tag: "Crystal Admin Portal",
        footer_text: "Protected by Enterprise Guard"
      },
      header: {
        search_placeholder: "Search anything...",
        admin_name: "Administrator",
        admin_role: "Super Admin"
      },
      sidebar: {
        menu_title: "Main Menu",
        dashboard: "Dashboard",
        users: "Users",
        categories: "Categories",
        blogs: "Blogs",
        comments: "Comments",
        notifications: "Notifications",
        logout: "Logout"
      },
      errors: {
        invalid_credentials: "Invalid email or password!",
        access_denied: "Access denied",
        already_exists: "Item already exists"
      }
    },
  },
  vi: {
    translation: {
      login: {
        title: "Chào mừng trở lại",
        subtitle: "Vui lòng đăng nhập để quản trị hệ thống.",
        email_label: "Địa chỉ Email",
        email_placeholder: "admin@edublog.vn",
        password_label: "Mật khẩu bảo mật",
        password_placeholder: "••••••••••••",
        remember_me: "Ghi nhớ đăng nhập",
        forgot_password: "Quên mật khẩu?",
        sign_in: "Đăng nhập ngay",
        authenticating: "Đang xác thực...",
        email_required: "Vui lòng nhập email!",
        email_invalid: "Email không hợp lệ!",
        password_required: "Vui lòng nhập mật khẩu!",
        portal_tag: "Cổng quản trị Crystal",
        footer_text: "Bảo mật bởi Enterprise Guard"
      },
      header: {
        search_placeholder: "Tìm kiếm mọi thứ...",
        admin_name: "Quản trị viên",
        admin_role: "Quản trị cấp cao"
      },
      sidebar: {
        menu_title: "Menu chính",
        dashboard: "Trang chủ",
        users: "Người dùng",
        categories: "Danh mục",
        blogs: "Bài đăng",
        comments: "Bình luận",
        notifications: "Thông báo",
        logout: "Đăng xuất"
      },
      errors: {
        invalid_credentials: "Email hoặc mật khẩu không đúng!",
        access_denied: "Bạn không có quyền truy cập",
        already_exists: "Dữ liệu đã tồn tại"
      }
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
