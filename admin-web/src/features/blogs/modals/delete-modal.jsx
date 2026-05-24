import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import blogApi from "../../../api/blogApi";
import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, blog }) => {
  const handleResponseError = useHandleResponseError();

  const onDelete = useCallback(async () => {
    if (blog) {
      const { ok, errors } = await blogApi.deleteBlog(blog.blog_id);
      if (ok) {
        onClose("delete", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    }
  }, [blog, onClose, handleResponseError]);

  const [pendingDelete, executeDelete] = useHandleAsyncRequest(onDelete);

  const handleClose = () => {
    if (pendingDelete) return;
    onClose("delete", false);
  };

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
      width={400}
    >
      <div className="flex flex-col items-center text-center font-exo-2">
        {/* Warning Icon Container with pulsing glow */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-5 shadow-inner shadow-rose-100"
        >
          <Trash2 size={28} className="animate-pulse" />
        </motion.div>

        {/* Modal Title */}
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">
          Xóa vĩnh viễn bài đăng
        </h2>

        {/* Modal Message */}
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
          Bạn có chắc chắn muốn xóa bài viết này không? Hành động này sẽ loại bỏ hoàn toàn dữ liệu và <span className="text-rose-500 font-bold">không thể hoàn tác</span>.
        </p>

        {/* Buttons Action Group */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pendingDelete}
            onClick={handleClose}
            className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            HỦY BỎ
          </motion.button>
          
          <Button
            type="primary"
            danger
            loading={pendingDelete}
            onClick={executeDelete}
            className="h-11 rounded-2xl bg-rose-500 hover:!bg-rose-600 text-white text-xs font-black tracking-wider border-none shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            XÁC NHẬN XÓA
          </Button>
        </div>
      </div>
    </Modal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blog: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default DeleteModal;
