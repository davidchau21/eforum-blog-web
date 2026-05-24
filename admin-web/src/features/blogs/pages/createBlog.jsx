import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadApi from "../../../api/uploadApi";
import lightBanner from "../../../assets/images/lightBanner.png";
import axios from "axios";
import { tools } from "../tools.component";
import EditorJS from "@editorjs/editorjs";
import tagApi from "../../../api/tag";
import { Select, message } from "antd";
import blogApi from "../../../api/blogApi";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  UploadCloud, 
  Tags, 
  BookOpen, 
  FileText, 
  Sparkles, 
  Trash2, 
  Edit 
} from "lucide-react";

let defaultBanner = "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";
const LIMIT_TAGS = 10;

const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

const CreateBlog = () => {
  const navigate = useNavigate();
  const handleResponseError = useHandleResponseError();
  const handleResponseSuccess = useHandleResponseSuccess();
  const [tags, setTags] = useState([]);

  const onGetTag = async () => {
    const { ok, body } = await tagApi.getAllTags({
      limit: 999999,
      page: 0,
    });
    if (ok && body) {
      setTags(body.list);
    }
  };

  const [blog, setBlog] = useState({
    title: "",
    content: "",
    banner: "",
    des: "",
    tags: [],
  });
  const [textEditor, setTextEditor] = useState({ isReady: false });

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "textEditor",
          data: Array.isArray(blog.content) ? blog.content[0] : blog.content,
          tools: tools,
          placeholder: "Hãy viết câu chuyện tuyệt vời của bạn ở đây...",
        })
      );
    }
    onGetTag();
  }, []);

  const handleBannerUpload = async (e) => {
    const img = e.target.files[0];
    if (img) {
      const { ok, body } = await uploadApi.getUploadUrl();

      if (ok && body) {
        await axios.put(body.uploadURL, img, {
          headers: { "Content-Type": "image/jpeg" },
        });

        const imgUrl = body.uploadURL.split("?")[0];
        setBlog((prev) => ({ ...prev, banner: imgUrl }));
        message.success("Tải ảnh bìa lên thành công!");
      }
    } else {
      setBlog((prev) => ({ ...prev, banner: lightBanner }));
    }
  };

  const handleTitleChange = (e) => {
    e.preventDefault();
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog((prev) => ({ ...prev, title: input.value }));
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };

  const handleUploadBlog = async (isDraft) => {
    if (textEditor.isReady) {
      textEditor
        .save()
        .then(async (data) => {
          if (data.blocks.length) {
            const body = {
              title: blog.title,
              banner: blog.banner || defaultBanner,
              des: blog.des,
              content: data,
              tags: blog.tags,
              draft: isDraft,
            };
            const { ok, errors } = await blogApi.createorUpdateBlog(body);
            if (ok) {
              handleResponseSuccess(
                isDraft ? "Lưu bản nháp thành công" : "Tạo blog mới thành công", 
                () => {
                  navigate("/blogs");
                }
              );
            }
            if (errors) {
              handleResponseError(errors);
            }
          } else {
            return message.error("Hãy nhập nội dung bài viết trước khi đăng!");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const handleBlogDesChange = (e) => {
    e.preventDefault();
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog((prev) => ({ ...prev, des: input.value }));
  };

  const handleChangeTags = (value) => {
    if (value.length <= LIMIT_TAGS) {
      setBlog((prev) => ({ ...prev, tags: value }));
    } else {
      message.warning(`Bạn chỉ có thể chọn tối đa ${LIMIT_TAGS} thẻ tag!`);
    }
  };

  return (
    <motion.div 
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full p-8 font-exo-2 max-w-[1250px] mx-auto"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/blogs")}
            className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-2xl border border-slate-200 shadow-sm transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Quản lý bài đăng</span>
              <span>/</span>
              <span>Tạo mới</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
              Tạo bài viết mới
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5 bg-slate-200/50 px-4 py-2 rounded-full text-xs font-bold text-slate-500 w-fit">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-pulse"></span>
          Trạng thái soạn thảo: Bản nháp
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column - The Canvas (Title, Description, Rich Editor) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Short Description Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Tiêu đề bài viết</label>
              <textarea
                value={blog.title}
                placeholder="Nhập tiêu đề hấp dẫn..."
                className="text-2xl font-bold w-full min-h-[60px] outline-none resize-none leading-snug placeholder:text-slate-300 text-slate-800 bg-white border border-slate-200 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl p-4 transition-all duration-200"
                onChange={handleTitleChange}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">Mô tả ngắn</label>
                <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded-md">
                  {blog.des ? blog.des.length : 0}/200
                </span>
              </div>
              <textarea
                maxLength={200}
                value={blog.des}
                placeholder="Tóm tắt ngắn gọn nội dung bài đăng để hiển thị ở danh sách bài viết..."
                className="text-base font-medium w-full min-h-[90px] outline-none resize-none leading-relaxed placeholder:text-slate-300 text-slate-600 bg-white border border-slate-200 hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl p-4 transition-all duration-200"
                onChange={handleBlogDesChange}
              />
            </div>
          </div>

          {/* Editor.js Writing Space */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-8 min-h-[550px] relative">
            <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-100">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-black text-slate-700 tracking-wider uppercase">Nội dung chi tiết</span>
              <span className="text-[11px] text-slate-400 font-bold ml-auto flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">
                <Sparkles size={12} className="text-emerald-500" /> Không gian viết bài chuyên nghiệp
              </span>
            </div>
            <div id="textEditor" className="font-gelasio text-slate-700 prose prose-slate max-w-none focus:outline-none min-h-[400px]"></div>
          </div>
        </div>

        {/* Right Column - Meta Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-8">
          {/* Banner Upload Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <FileText size={18} className="text-emerald-500" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Ảnh bìa bài đăng</span>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 transition-all duration-300">
              {blog.banner ? (
                <div className="group relative w-full h-full">
                  <img
                    src={blog.banner}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt="Upload Banner"
                    onError={handleError}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
                    <label 
                      htmlFor="uploadBanner" 
                      className="p-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      <Edit size={16} />
                    </label>
                    <button
                      onClick={() => setBlog((prev) => ({ ...prev, banner: "" }))}
                      className="p-3 bg-white hover:bg-rose-50 text-rose-500 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <label 
                  htmlFor="uploadBanner"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer rounded-2xl p-6 text-center transition-all duration-300 group"
                >
                  <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-2xl mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <UploadCloud size={24} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Tải ảnh bìa của bạn
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium max-w-[180px] block leading-normal">
                    Hỗ trợ định dạng JPG, JPEG, PNG tỉ lệ 16:9
                  </span>
                </label>
              )}
              <input
                id="uploadBanner"
                type="file"
                accept=".png, .jpg, .jpeg"
                hidden
                onChange={handleBannerUpload}
              />
            </div>
          </div>

          {/* Tags Selection Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Tags size={18} className="text-emerald-500" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Thẻ phân loại (Tags)</span>
            </div>

            {tags.length > 0 ? (
              <Select
                options={tags.map((tag) => ({
                  label: tag.tag_name,
                  value: tag.tag_name,
                }))}
                mode="multiple"
                placeholder="Lựa chọn thẻ tag..."
                className="w-full text-slate-600 rounded-xl"
                style={{ minHeight: "44px" }}
                variant="filled"
                value={blog.tags}
                onChange={handleChangeTags}
                dropdownStyle={{ borderRadius: '12px' }}
              />
            ) : (
              <p className="text-xs text-slate-400 italic">Đang tải danh sách thẻ...</p>
            )}
            <span className="text-[10px] text-slate-400 font-medium block leading-normal">
              Định dạng giúp người đọc và hệ thống dễ dàng tìm kiếm bài đăng của bạn hơn.
            </span>
          </div>

          {/* Actions & Confirm Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <BookOpen size={18} className="text-emerald-500" />
              <span className="text-sm font-black text-slate-700 uppercase tracking-wider">Xuất bản & Lưu trữ</span>
            </div>
            
            <p className="text-xs font-medium text-slate-400 leading-relaxed">
              Bạn có thể lưu trữ dưới dạng bản nháp để tiếp tục hoàn thiện sau hoặc xuất bản trực tiếp lên trang chủ.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-exo-2 font-black text-xs transition-colors cursor-pointer"
                onClick={() => handleUploadBlog(true)}
              >
                LƯU BẢN NHÁP
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-exo-2 font-black text-xs shadow-lg shadow-emerald-500/20 transition-colors cursor-pointer"
                onClick={() => handleUploadBlog(false)}
              >
                XUẤT BẢN NGAY
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateBlog;
