import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import groupApi from "../../../api/groupApi";
import { motion } from "framer-motion";
import { Lock, Unlock, X } from "lucide-react";

const ActiveModal = ({ isOpen, onClose, group }) => {
  const handleResponseError = useHandleResponseError();

  const onToggle = useCallback(async () => {
    if (group) {
      const { ok, errors } = await groupApi.toggleGroupStatus(group._id);
      if (ok) {
        onClose("active", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    }
  }, [group, onClose, handleResponseError]);

  const [pendingToggle, executeToggle] = useHandleAsyncRequest(onToggle);

  const handleClose = () => {
    if (pendingToggle) return;
    onClose("active", false);
  };

  const isDisabled = group?.isDisabled;

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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-5 shadow-inner ${
            isDisabled
              ? "bg-emerald-50 text-emerald-500 shadow-emerald-100"
              : "bg-amber-50 text-amber-500 shadow-amber-100"
          }`}
        >
          {isDisabled ? (
            <Unlock size={26} className="animate-pulse" />
          ) : (
            <Lock size={26} className="animate-pulse" />
          )}
        </motion.div>

        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-2">
          {isDisabled ? "Kích hoạt nhóm học tập" : "Vô hiệu hóa nhóm học tập"}
        </h2>

        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">
          Bạn có chắc chắn muốn{" "}
          {isDisabled ? "kích hoạt lại" : "vô hiệu hóa"} nhóm{" "}
          <span className="font-bold text-slate-700">"{group?.name}"</span>?{" "}
          {isDisabled
            ? "Các thành viên sẽ có thể truy cập và tham gia hoạt động bình thường."
            : "Các thành viên sẽ không thể truy cập nội dung hay tài liệu của nhóm."}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full">
          <motion.button
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={pendingToggle}
            onClick={handleClose}
            className="h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            HỦY BỎ
          </motion.button>

          <Button
            type="primary"
            loading={pendingToggle}
            onClick={executeToggle}
            className={`h-11 rounded-2xl text-xs font-black tracking-wider border-none transition-all flex items-center justify-center cursor-pointer ${
              isDisabled
                ? "bg-emerald-500 hover:!bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                : "bg-amber-500 hover:!bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            }`}
          >
            {isDisabled ? "KÍCH HOẠT" : "VÔ HIỆU HÓA"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ActiveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  group: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default ActiveModal;
