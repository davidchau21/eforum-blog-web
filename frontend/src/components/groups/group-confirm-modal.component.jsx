import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeContext } from "../../App";

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
  theme: propTheme,
}) => {
  const { theme: contextTheme } = useContext(ThemeContext) || {};
  const theme = propTheme || contextTheme || "dark";

  const getStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "fi-rr-trash text-xl text-rose-500",
          iconBg: "bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/15 dark:border-rose-500/30",
          confirmBtn: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-600/30",
          accentGlow: "bg-rose-500/10 dark:bg-rose-500/5",
          outerRing: "border-rose-100 dark:border-rose-950/20 bg-rose-500/[0.02]",
        };
      case "warning":
        return {
          icon: "fi-rr-exclamation text-xl text-amber-500",
          iconBg: "bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15 dark:border-amber-500/30",
          confirmBtn: "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-lg shadow-amber-500/10 hover:shadow-amber-600/20",
          accentGlow: "bg-amber-500/10 dark:bg-amber-500/5",
          outerRing: "border-amber-100 dark:border-amber-950/20 bg-amber-500/[0.02]",
        };
      default: // info
        return {
          icon: "fi-rr-info text-xl text-indigo-500",
          iconBg: "bg-indigo-500/10 border-indigo-500/20 dark:bg-indigo-500/15 dark:border-indigo-500/30",
          confirmBtn: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-600/30",
          accentGlow: "bg-indigo-500/10 dark:bg-indigo-500/5",
          outerRing: "border-indigo-100 dark:border-indigo-950/20 bg-indigo-500/[0.02]",
        };
    }
  };

  const styles = getStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md"
          />

          {/* Premium Modal Panel */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className={`relative w-full max-w-md p-8 rounded-[36px] border ${
              theme === "light"
                ? "bg-white border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
                : "bg-[#0c0c0e] border-white/[0.05] text-white shadow-[0_30px_70px_rgba(0,0,0,0.45)]"
            } z-10 overflow-hidden font-jakarta`}
          >
            {/* Ambient Background Glow Bubbles */}
            <div className={`absolute -top-24 -left-24 w-52 h-52 ${styles.accentGlow} rounded-full blur-[60px] pointer-events-none`} />
            <div className="absolute -bottom-24 -right-24 w-40 h-40 bg-slate-500/5 rounded-full blur-[50px] pointer-events-none" />

            {/* Content Container */}
            <div className="text-center relative z-10 space-y-4 pt-2">
              {/* Premium Ring Icon Display */}
              <div className={`w-20 h-20 rounded-[28px] border ${styles.outerRing} flex items-center justify-center mx-auto mb-5 shadow-inner`}>
                <div className={`w-14 h-14 rounded-2xl ${styles.iconBg} border flex items-center justify-center shadow-sm`}>
                  <i className={`fi ${styles.icon}`}></i>
                </div>
              </div>

              {/* Title & Message */}
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-jakarta">
                {title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[320px] mx-auto font-inter">
                {message}
              </p>
            </div>

            {/* Actions Buttons */}
            <div className="flex gap-3.5 mt-8 relative z-10">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3.5 px-4 border border-slate-250 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 font-extrabold transition-all text-xs font-jakarta text-slate-500 hover:text-slate-700 dark:text-slate-350 dark:hover:text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`w-1/2 py-3.5 px-4 rounded-2xl font-extrabold transition-all text-xs font-jakarta cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${styles.confirmBtn}`}
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
