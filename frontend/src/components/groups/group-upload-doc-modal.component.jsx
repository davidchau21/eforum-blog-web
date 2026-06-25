import { motion, AnimatePresence } from "framer-motion";

/* eslint-disable react/prop-types */
export const GroupUploadDocModal = ({
  isOpen,
  onClose,
  docForm,
  setDocForm,
  selectedFile,
  setSelectedFile,
  handleUploadDocument,
  theme,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full max-w-md p-8 rounded-[32px] border ${
              theme === "light"
                ? "bg-white border-slate-200"
                : "bg-[#18181b] border-white/5 text-white"
            } shadow-2xl z-10 font-jakarta`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black tracking-tight">
                Chia sẻ tài liệu
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <i className="fi fi-rr-cross-small"></i>
              </button>
            </div>

            <form
              onSubmit={handleUploadDocument}
              className="space-y-4 font-inter text-sm"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tiêu đề tài liệu *
                </label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) =>
                    setDocForm({ ...docForm, title: e.target.value })
                  }
                  placeholder="Ví dụ: Đề thi toán rời rạc kì 1..."
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Mô tả tài liệu
                </label>
                <textarea
                  value={docForm.description}
                  onChange={(e) =>
                    setDocForm({ ...docForm, description: e.target.value })
                  }
                  placeholder="Mô tả tóm tắt nội dung file..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all resize-none text-slate-700 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Tài liệu đính kèm *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    required={!selectedFile}
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-xl py-3 px-4 outline-none focus:border-indigo-500 transition-all text-slate-400"
                  />
                </div>
                {selectedFile && (
                  <p className="text-xs text-indigo-500 mt-1 font-bold">
                    Đã chọn: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 font-bold transition-all text-xs font-jakarta"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all text-xs font-jakarta shadow-lg shadow-indigo-500/25"
                >
                  Tải lên
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
