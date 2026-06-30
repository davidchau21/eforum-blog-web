/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const AccountSettings = () => {
  const navigate = useNavigate();
  const {
    userAuth,
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  const isGoogleAuth = userAuth?.google_auth || false;

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);

  const handleDeactivateAccount = async () => {
    if (!isGoogleAuth && !deactivatePassword) {
      return toast.error("Vui lòng nhập mật khẩu để xác nhận.");
    }
    setDeactivating(true);
    const loadingToast = toast.loading("Đang xử lý...");
    try {
      await axios.delete(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/delete-account",
        {
          data: { password: deactivatePassword },
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      toast.dismiss(loadingToast);
      toast.success("Tài khoản đã được vô hiệu hóa.");
      sessionStorage.removeItem("user");
      setUserAuth({ access_token: null });
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err?.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />

      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-black tracking-tight">Tài khoản</h1>
        <p className="text-[14px] text-dark-grey mt-2">
          Quản lý thông tin tài khoản và các cài đặt bảo mật.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-black/[0.02] border border-grey rounded-[2rem] p-8 mb-6">
        <h2 className="text-[15px] font-bold text-black mb-4 flex items-center gap-2">
          <i className="fi fi-rr-user-gear text-dark-grey"></i>
          Thông tin tài khoản
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-grey">
            <span className="text-[13px] text-dark-grey font-medium">Email</span>
            <span className="text-[13px] text-black font-semibold">
              {userAuth?.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-grey">
            <span className="text-[13px] text-dark-grey font-medium">Username</span>
            <span className="text-[13px] text-black font-semibold">
              @{userAuth?.username || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-[13px] text-dark-grey font-medium">Phương thức đăng nhập</span>
            <span className={`inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-full ${
              isGoogleAuth
                ? "bg-blue-50 text-blue-600 border border-blue-200"
                : "bg-grey text-dark-grey border border-grey"
            }`}>
              <i className={`fi ${isGoogleAuth ? "fi-brands-google" : "fi-rr-lock"} text-[11px]`}></i>
              {isGoogleAuth ? "Google" : "Mật khẩu"}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-rose-200 dark:border-rose-950/40 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-rose-50 dark:bg-rose-950/10 border-b border-rose-200 dark:border-rose-950/30">
          <h2 className="text-[14px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <i className="fi fi-rr-shield-exclamation"></i>
            Vùng nguy hiểm
          </h2>
          <p className="text-[12px] text-rose-500/80 dark:text-rose-400/60 mt-0.5">
            Các thao tác dưới đây không thể hoàn tác dễ dàng.
          </p>
        </div>

        <div className="px-6 py-5 bg-white flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-black">Vô hiệu hóa tài khoản</p>
            <p className="text-[12px] text-dark-grey mt-0.5">
              Tài khoản sẽ bị ẩn khỏi hệ thống. Admin có thể khôi phục lại nếu cần.
            </p>
          </div>
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-950/50 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            Vô hiệu hóa
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setShowDeactivateModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-grey"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                <i className="fi fi-rr-shield-exclamation text-rose-500 dark:text-rose-400 text-base"></i>
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-black">
                  Xác nhận vô hiệu hóa tài khoản
                </h3>
                <p className="text-[12.5px] text-dark-grey mt-1 leading-relaxed">
                  Tài khoản của bạn sẽ bị ẩn và bạn sẽ bị đăng xuất ngay lập tức.
                  Liên hệ admin nếu bạn muốn khôi phục về sau.
                </p>
              </div>
            </div>

            {!isGoogleAuth && (
              <div className="mb-4">
                <label className="text-[12px] font-semibold text-dark-grey block mb-1.5">
                  Nhập mật khẩu để xác nhận
                </label>
                <input
                  type="password"
                  value={deactivatePassword}
                  onChange={(e) => setDeactivatePassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleDeactivateAccount()}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-grey bg-grey text-black text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  autoFocus
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowDeactivateModal(false);
                  setDeactivatePassword("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-grey text-sm font-semibold text-dark-grey hover:bg-grey transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleDeactivateAccount}
                disabled={deactivating}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-[#ffffff] text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deactivating ? "Đang xử lý..." : "Xác nhận vô hiệu hóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimationWrapper>
  );
};

export default AccountSettings;
