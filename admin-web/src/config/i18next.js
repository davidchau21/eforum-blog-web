import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "Welcome to React": "Welcome to React and react-i18next",
      },
      error: {
        error: {
          "access-denied": "Bạn không có quyền truy cập",
          area: {
            name: {
              "already-exist": "Tên khu vực đã tồn tại",
            },
          },
          table: {
            name: {
              "already-exist": "Tên bàn đã tồn tại",
            },
          },
          validate: {
            login: {
              "invalid-credential": "Email hoặc mật khẩu không đúng",
            },
            user: {
              "already-exist": "Email đã tồn tại",
            },
            form: {
              "ingredient-required": "Vui lòng thêm nguyên liệu",
            },
          },
          category: {
            name: {
              "already-exist": "Tên danh mục đã tồn tại",
            },
          },
        },
      },
    },
  },
  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
