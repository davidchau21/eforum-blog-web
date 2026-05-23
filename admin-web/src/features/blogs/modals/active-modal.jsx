import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import blogApi from "../../../api/blogApi";
import { motion } from "framer-motion";
import { Lock, Unlock, X } from "lucide-react";

const ActiveModal = ({ isOpen, onClose, blog }) => {
  const handleResponseError = useHandleResponseError();

  const onActive = useCallback(async () => {
    if (blog) {
      const { ok, errors } = await blogApi.activeBlog(blog.blog_id);
      if (ok) {
        onClose("active", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    }
  }, [blog, onClose, handleResponseError]);

  const [pendingActive, executeActive] = useHandleAsyncRequest(onActive);

  const handleClose = () => {
    if (pendingActive) return;
    onClose("active", false);
  };

  const isActive = blog?.isActive;

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      centered
      closeIcon={<X size={18} className="text-slate-400 hover:text-slate-600 transition-colors" />}
      styles={{
        content: {
          borderRadius: "24px",
          padding: "32px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }
      }}
      width={440}
    >
      <div className="flex flex-col items-center text-center font-exo-2">
        {/* Dynamic Icon Container based on status */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-5 shadow-inner ${
            isActive 
              ? "bg-amber-50 text-amber-500 shadow-amber-100" 
              : "bg-emerald-50 text-emerald-500 shadow-emerald-100"
          }`}
        >
          {isActive ? (
            <Lock size={26} className="animate-pulse" />
          ) : (
            <Unlock size={26} className="animate-pulse" />
          )}
        </motion.div>

        {/* Modal Title */}
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">
          {isActive ? "Vô hiệu hóa bài viết" : "Kích hoạt bài viết"}
        </h2>

        {/* Modal Message */}
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
          Bạn có chắc chắn muốn {isActive ? "vô hiệu hóa" : "kích hoạt"} bài viết <span className="font-bold text-slate-700">"{blog?.title}"</span>? {isActive ? "Bài viết sẽ tạm thời không thể hiển thị đối với người dùng." : "Bài viết sẽ lập tức xuất hiện trở lại trên trang chủ."}
        </p>

        {/* Buttons Action Group */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pendingActive}
            onClick={handleClose}
            className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            HỦY BỎ
          </motion.button>
          
          <Button
            type="primary"
            loading={pendingActive}
            onClick={executeActive}
            className={`h-11 rounded-2xl text-xs font-black tracking-wider border-none transition-all flex items-center justify-center cursor-pointer ${
              isActive 
                ? "bg-amber-500 hover:!bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                : "bg-emerald-500 hover:!bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            }`}
          >
            {isActive ? "VÔ HIỆU HÓA" : "KÍCH HOẠT"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ActiveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blog: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default ActiveModal;
