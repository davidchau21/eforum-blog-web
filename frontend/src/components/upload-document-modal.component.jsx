import { useState, useRef, useContext } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserContext } from "../App";
import { getTranslations } from "../../translations";

/* eslint-disable react/prop-types */
const UploadDocumentModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const { userAuth } = useContext(UserContext);
  const { access_token, language } = userAuth;
  const translations = getTranslations(language || "vi");

  if (!isOpen) return null;

  const allowedExtensions = ["pdf", "ppt", "pptx", "doc", "docx"];

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error("Định dạng file không hỗ trợ! Chỉ nhận PDF, PPT, PPTX, DOC, DOCX.");
      return;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB
    if (selectedFile.size > maxSize) {
      toast.error("Dung lượng file quá lớn! Giới hạn tối đa là 15MB.");
      return;
    }

    setFile(selectedFile);
    
    // Automatically set title based on file name if title is empty
    const fileNameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf("."));
    setTitle(fileNameWithoutExt);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      return toast.error("Vui lòng chọn hoặc kéo thả tài liệu vào vùng tải lên.");
    }
    if (!title.trim()) {
      return toast.error("Vui lòng điền tiêu đề cho tài liệu.");
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Đang chuẩn bị và tải tài liệu lên...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);

      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      toast.dismiss(loadingToast);
      toast.success("Tải tài liệu lên thành công! 🎉");
      
      // Reset state
      setFile(null);
      setTitle("");
      setDescription("");
      
      onUploadSuccess(data); // Trigger list refresh on parent component
      onClose();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error(err.response?.data?.error || "Đã có lỗi xảy ra trong quá trình tải lên.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-grey/40 dark:border-zinc-800/80 overflow-hidden flex flex-col relative animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-grey/60 dark:border-zinc-800/60 flex items-center justify-between">
          <h3 className="text-lg font-black text-black dark:text-white">
            Đóng góp Tài liệu / Slide
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-grey hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all duration-200"
            disabled={isUploading}
          >
            <i className="fi fi-rr-cross-small text-xl mt-0.5"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpload} className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* File selector dropzone */}
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? "border-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/10"
                  : "border-grey dark:border-zinc-800 hover:border-indigo-500 hover:bg-grey/30 dark:hover:bg-zinc-800/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileChange}
              />
              <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-500 mb-4">
                <i className="fi fi-rr-cloud-upload text-3xl mt-1"></i>
              </div>
              <p className="font-extrabold text-sm text-black dark:text-white mb-1">
                Kéo thả file tài liệu vào đây
              </p>
              <p className="text-xs text-dark-grey mb-3">
                Hoặc click để duyệt file trên thiết bị
              </p>
              <span className="text-[10px] font-bold text-dark-grey uppercase tracking-wider bg-grey dark:bg-zinc-800 px-3 py-1.5 rounded-full border border-grey">
                PDF, PPT, PPTX, DOC, DOCX • Tối đa 15MB
              </span>
            </div>
          ) : (
            /* Selected File Display */
            <div className="border border-grey dark:border-zinc-800/80 bg-grey/20 dark:bg-zinc-950/20 rounded-2xl p-4 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="fi fi-rr-file-check text-2xl mt-1"></i>
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-black dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-dark-grey font-bold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="w-8 h-8 rounded-full bg-grey dark:bg-zinc-800 text-dark-grey hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all duration-200"
                disabled={isUploading}
              >
                <i className="fi fi-rr-trash text-sm mt-0.5"></i>
              </button>
            </div>
          )}

          {/* Title input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
              Tiêu đề tài liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề hoặc tên tài liệu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-grey/30 focus:bg-grey/50 dark:bg-zinc-800/50 dark:focus:bg-zinc-800/80 border-none rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 text-black dark:text-white"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-black dark:text-white uppercase tracking-wider">
              Mô tả chi tiết (Tùy chọn)
            </label>
            <textarea
              placeholder="Giới thiệu sơ lược nội dung tài liệu, cách ôn tập..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-grey/30 focus:bg-grey/50 dark:bg-zinc-800/50 dark:focus:bg-zinc-800/80 border-none rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:focus:ring-indigo-400/20 text-black dark:text-white resize-none"
              disabled={isUploading}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-grey dark:border-zinc-800 text-black dark:text-white py-3.5 rounded-xl text-sm font-extrabold hover:bg-grey/40 dark:hover:bg-zinc-800/40 transition-all active:scale-95 text-center"
              disabled={isUploading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl text-sm font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUploading || !file || !title.trim()}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tải lên...</span>
                </>
              ) : (
                <>
                  <i className="fi fi-rr-check text-sm mt-0.5"></i>
                  <span>Đăng tài liệu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
