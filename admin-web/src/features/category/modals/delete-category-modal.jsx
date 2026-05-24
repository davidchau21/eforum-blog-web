import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import tagApi from "../../../api/tag";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

const DeleteCategoryModal = ({ isOpen, onClose, category }) => {
  const handleResponseError = useHandleResponseError();

  const onDelete = useCallback(async () => {
    const { ok, errors } = await tagApi.deleteTag(category?._id ?? "");
    if (ok) {
      onClose("delete", true);
    }
    if (errors) {
      handleResponseError(errors.message);
    }
  }, [category, onClose]);

  const [pendingDelete, deleteCategory] = useHandleAsyncRequest(onDelete);

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
      closable={false}
      className="custom-confirm-modal"
      width={400}
      modalRender={(node) => (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-rose-500/10 rounded-[2rem] overflow-hidden relative"
            >
              {/* Background accent */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleClose}
                disabled={pendingDelete}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-10 disabled:opacity-50"
              >
                <X size={20} />
              </button>

              <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-rose-400 to-rose-600 p-0.5 shadow-lg shadow-rose-500/30 mb-6 relative group">
                  <div className="w-full h-full bg-white rounded-[1.4rem] flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-rose-50 group-hover:bg-rose-100 transition-colors duration-500" />
                    <Trash2 size={32} className="text-rose-500 relative z-10" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-black text-slate-800 mb-2 font-exo-2 tracking-tight">
                  Xóa danh mục
                </h3>
                <p className="text-slate-500 text-[15px] font-medium leading-relaxed mb-8">
                  Bạn có chắc chắn muốn xóa danh mục này không?{" "}
                  Hành động này <span className="underline decoration-rose-300 decoration-2 underline-offset-2">không thể</span> hoàn tác.
                </p>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <Button
                    onClick={handleClose}
                    disabled={pendingDelete}
                    className="flex-1 h-12 bg-slate-100 hover:!bg-slate-200 text-slate-600 border-none font-bold text-[15px] rounded-2xl transition-colors disabled:opacity-50 font-exo-2"
                  >
                    Hủy bỏ
                  </Button>
                  <Button
                    onClick={deleteCategory}
                    loading={pendingDelete}
                    className="flex-1 h-12 bg-gradient-to-r from-rose-500 to-rose-600 hover:!from-rose-600 hover:!to-rose-700 text-white border-none font-bold text-[15px] rounded-2xl shadow-md shadow-rose-500/20 transition-all font-exo-2"
                  >
                    Xóa vĩnh viễn
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    />
  );
};

DeleteCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default DeleteCategoryModal;
