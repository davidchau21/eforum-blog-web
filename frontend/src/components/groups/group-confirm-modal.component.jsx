import { motion, AnimatePresence } from "framer-motion";

/* eslint-disable react/prop-types */
export const GroupConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận hành động",
  message = "Bạn có chắc chắn muốn thực hiện hành động này không?",
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "info", // danger, warning, info
  theme = "dark",
}) => {
  const getStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "fi-rr-trash text-rose-500",
          iconBg: "bg-rose-500/10 border-rose-500/20",
          confirmBtn: "bg-rose-600 hover:bg-rose-700 shadow-rose-500/25",
          accentGlow: "bg-rose-500/10",
        };
      case "warning":
        return {
          icon: "fi-rr-exclamation text-amber-500",
          iconBg: "bg-amber-500/10 border-amber-500/20",
          confirmBtn: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25 text-slate-950",
          accentGlow: "bg-amber-500/10",
        };
      default: // info
        return {
          icon: "fi-rr-info text-indigo-500",
          iconBg: "bg-indigo-500/10 border-indigo-500/20",
          confirmBtn: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25",
          accentGlow: "bg-indigo-500/10",
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-sm p-6 rounded-[28px] border ${
              theme === "light"
                ? "bg-white border-slate-200"
                : "bg-[#18181b] border-white/5 text-white"
            } shadow-2xl z-10 overflow-hidden font-jakarta`}
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -top-12 -left-12 w-28 h-28 ${styles.accentGlow} rounded-full blur-2xl pointer-events-none`} />

            <div className="text-center space-y-4 pt-2">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} border flex items-center justify-center text-xl mx-auto mb-4`}>
                <i className={`fi ${styles.icon}`}></i>
              </div>

              {/* Title & Message */}
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                {message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-[11px] uppercase tracking-wider font-jakarta text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-1/2 py-2.5 ${styles.confirmBtn} text-white rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider font-jakarta cursor-pointer shadow-md`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
