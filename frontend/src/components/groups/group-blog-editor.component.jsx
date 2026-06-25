/* eslint-disable react/prop-types */
import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../../imgs/logo-light.png";
import darkLogo from "../../imgs/logo-dark.png";
import AnimationWrapper from "../../common/page-animation";
import lightBanner from "../../imgs/blog banner light.png";
import darkBanner from "../../imgs/blog banner dark.png";
import { uploadImage } from "../../common/aws";
import { useContext, useEffect, useCallback, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../../contexts/EditorContext";
import EditorJS from "@editorjs/editorjs";
import { tools } from "../tools.component";
import axios from "axios";
import { ThemeContext, UserContext } from "../../App";
import { getTranslations } from "../../../translations";

const DRAFT_KEY = "group_blog_editor_draft";

const GroupBlogEditor = ({ isModal = false }) => {
  let { blog, setBlog, textEditor, setTextEditor, setEditorState, setActions } =
    useContext(EditorContext);

  const {
    title = "",
    banner = "",
    content = [],
    tags = [],
    des = "",
  } = blog || {};

  let {
    userAuth: { access_token, language },
  } = useContext(UserContext);
  let { theme } = useContext(ThemeContext);
  let { blog_id } = useParams();

  let navigate = useNavigate();

  const currentTranslations = getTranslations(language);

  const editorCore = useRef(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      if (parsedDraft.blog_id === blog_id) {
        setBlog((prev) => ({ ...prev, ...parsedDraft.data }));
      }
    }
  }, []);

  useEffect(() => {
    const draftData = {
      blog_id,
      data: {
        title: blog.title,
        banner: blog.banner.startsWith("blob:") ? "" : blog.banner,
        des: blog.des,
        tags: blog.tags,
      },
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [blog.title, blog.banner, blog.des, blog.tags, blog_id]);

  useEffect(() => {
    if (!editorCore.current) {
      const savedDraft = localStorage.getItem(DRAFT_KEY);
      let initialContent = Array.isArray(content) ? content[0] : content;

      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        if (parsedDraft.blog_id === blog_id && parsedDraft.data.content) {
          initialContent = parsedDraft.data.content;
        }
      }

      const editor = new EditorJS({
        holder: "textEditor",
        data: initialContent,
        tools: tools,
        placeholder: currentTranslations.blogStoryPlaceholder,
        async onChange(api) {
          const updatedContent = await api.saver.save();
          const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
          draft.data = { ...draft.data, content: updatedContent };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        }
      });

      editorCore.current = editor;
      setTextEditor(editor); 
    }
  }, []);

  useEffect(() => {
    return () => {
      if (blog.banner && blog.banner.startsWith("blob:")) {
        URL.revokeObjectURL(blog.banner);
      }
    };
  }, [blog.banner]);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    let file = e.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const previewURL = URL.createObjectURL(file);
        setBlog({ ...blog, banner: previewURL, bannerFile: file });
        toast.success(
          language === "vi"
            ? "Đã tải ảnh banner lên!"
            : "Banner image loaded successfully!"
        );
      } else {
        toast.error(
          language === "vi"
            ? "Vui lòng kéo thả file ảnh (.png, .jpg, .jpeg)!"
            : "Please drop an image file (.png, .jpg, .jpeg)!"
        );
      }
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.closest("#textEditor") ||
          activeEl.closest(".ce-paragraph") ||
          activeEl.closest(".codex-editor"))
      ) {
        return;
      }

      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const previewURL = URL.createObjectURL(file);
            setBlog((prev) => ({ ...prev, banner: previewURL, bannerFile: file }));
            toast.success(
              language === "vi"
                ? "Đã dán ảnh banner thành công!"
                : "Banner image pasted successfully!"
            );
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [language, setBlog]);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];
    if (img) {
      const previewURL = URL.createObjectURL(img);
      setBlog({ ...blog, banner: previewURL, bannerFile: img });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = theme == "light" ? lightBanner : darkBanner;
  };

  const handlePublishEvent = useCallback(() => {
    if (!title.length) {
      return toast.error(currentTranslations.writeTitleToPublish);
    }

    if (textEditor && typeof textEditor.save === "function") {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [blog, title, textEditor, setBlog, setEditorState, currentTranslations]);

  const handleSaveDraft = useCallback(
    async (e) => {
      if (e && e.target && e.target.className.includes("disable")) {
        return;
      }

      if (!title.length) {
        return toast.error(currentTranslations.saveDraftTitleError);
      }

      let loadingToast = toast.loading(currentTranslations.savingDraft);
      if (e && e.target) e.target.classList.add("disable");

      let currentBanner = banner;

      if (blog.bannerFile) {
        toast.loading(currentTranslations.uploading, { id: loadingToast });
        try {
          currentBanner = await uploadImage(blog.bannerFile);
          setBlog((prev) => ({
            ...prev,
            banner: currentBanner,
            bannerFile: null,
          }));
        } catch (uploadErr) {
          toast.dismiss(loadingToast);
          if (e && e.target) e.target.classList.remove("disable");
          return toast.error(uploadErr.message);
        }
      }

      if (textEditor && typeof textEditor.save === "function") {
        textEditor.save().then((content) => {
          let blogObj = {
            title,
            banner: currentBanner,
            des,
            content,
            tags,
            draft: true,
            groupId: blog?.group || null,
          };

          axios
            .post(
              import.meta.env.VITE_SERVER_DOMAIN + "/blogs/create-blog",
              { ...blogObj, id: blog_id },
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                },
              },
            )
            .then(() => {
              if (e && e.target) e.target.classList.remove("disable");

              localStorage.removeItem(DRAFT_KEY);

              toast.dismiss(loadingToast);
              toast.success(currentTranslations.savedDraft);

              setTimeout(() => {
                const targetGroup = blog?.group || blogObj.groupId;
                if (targetGroup) {
                  navigate(`/group/${targetGroup}?tab=discussion`);
                } else {
                  navigate("/dashboard/blogs?tab=draft");
                }
              }, 500);
            })
            .catch(({ response }) => {
              if (e && e.target) e.target.classList.remove("disable");
              toast.dismiss(loadingToast);
              return toast.error(response.data.error);
            });
        });
      }
    },
    [
      blog_id,
      title,
      banner,
      des,
      tags,
      textEditor,
      access_token,
      navigate,
      isModal,
      currentTranslations,
      blog,
    ],
  );

  useEffect(() => {
    if (isModal && setActions) {
      setActions((prev) => ({
        ...prev,
        handlePublishEvent,
        handleSaveDraft,
      }));
    }
  }, [isModal, setActions, handlePublishEvent, handleSaveDraft]);

  return (
    <>
      {!isModal && (
        <nav className="navbar">
          <Link to="/" className="flex-none w-10">
            <img src={theme == "light" ? darkLogo : lightLogo} />
          </Link>
          <p className="max-md:hidden text-black line-clamp-1 w-full font-semibold">
            {blog.title.length ? blog.title : currentTranslations.newBlog}
          </p>

          <div className="flex gap-4 ml-auto">
            <button 
              className="whitespace-nowrap bg-purple text-white rounded-full py-2 px-6 text-[15px] font-semibold hover:bg-purple/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-purple/10 shrink-0" 
              onClick={handlePublishEvent}
            >
              {currentTranslations.publish}
            </button>
            <button 
              className="whitespace-nowrap bg-grey/80 dark:bg-grey/30 text-black dark:text-white rounded-full py-2 px-6 text-[15px] font-semibold hover:bg-grey dark:hover:bg-grey/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0" 
              onClick={handleSaveDraft}
            >
              {currentTranslations.saveDraft}
            </button>
            <button
              className="hidden md:flex items-center gap-2 bg-transparent text-dark-grey hover:text-red border border-grey/80 dark:border-grey/30 rounded-full py-2 px-6 text-[15px] font-semibold hover:border-red/30 hover:bg-red/5 transition-all duration-200 shrink-0"
              onClick={() => {
                const isVi = language === "vi";
                const confirmMsg = isVi
                  ? "Bạn có chắc chắn muốn hủy viết bài? Tất cả thay đổi chưa lưu sẽ bị mất."
                  : "Are you sure you want to cancel? All unsaved changes will be lost.";
                if (window.confirm(confirmMsg)) {
                  localStorage.removeItem(DRAFT_KEY);
                  const targetGroup = blog?.group;
                  if (targetGroup) {
                    navigate(`/group/${targetGroup}?tab=discussion`);
                  } else {
                    navigate(-1);
                  }
                }
              }}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </button>
          </div>
        </nav>
      )}
      <Toaster />
      <AnimationWrapper>
        <section className={isModal ? "py-0" : "pb-20 md:pb-0"}>
          <div className="mx-auto max-w-[900px] w-full mt-6">
            <div 
              className={`relative aspect-video rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                isDragging 
                  ? "border-purple bg-purple/5 scale-[0.99] shadow-lg" 
                  : "border-grey/80 dark:border-grey/30 bg-grey/30 hover:bg-grey/50 hover:border-purple/30"
              } flex flex-col items-center justify-center`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {blog.banner ? (
                <label htmlFor="uploadBanner" className="cursor-pointer block w-full h-full relative group">
                  <img src={blog.banner} className="w-full h-full object-cover" onError={handleError} />
                  <input
                    id="uploadBanner"
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    hidden
                    onChange={handleBannerUpload}
                  />
                  {/* Edit overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                    <i className="fi fi-rr-edit text-2xl animate-pulse"></i>
                    <span className="text-sm font-semibold">
                      {language === "vi" ? "Thay đổi ảnh banner (Kéo thả hoặc dán ảnh mới)" : "Change banner image (Drag & drop or paste new)"}
                    </span>
                  </div>
                </label>
              ) : (
                <label htmlFor="uploadBanner" className="cursor-pointer flex flex-col items-center justify-center p-8 text-center w-full h-full select-none group">
                  <input
                    id="uploadBanner"
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    hidden
                    onChange={handleBannerUpload}
                  />
                  <div className="w-16 h-16 rounded-2xl bg-purple/10 flex items-center justify-center mb-4 text-purple group-hover:scale-110 transition-transform duration-300">
                    <i className="fi fi-rr-picture text-3xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-black dark:text-white mb-2">
                    {language === "vi" ? "Thêm ảnh banner cho bài viết" : "Add a blog banner image"}
                  </h3>
                  <p className="text-sm text-dark-grey max-w-sm mb-4 leading-relaxed">
                    {language === "vi" 
                      ? "Kéo thả ảnh vào đây, nhấn để chọn từ máy, hoặc nhấn Ctrl+V để dán ảnh trực tiếp từ clipboard" 
                      : "Drag & drop image here, click to browse, or press Ctrl+V to paste directly from clipboard"}
                  </p>
                  <div className="flex gap-2 items-center justify-center text-xs text-purple font-medium bg-purple/10 px-3 py-1.5 rounded-full border border-purple/20">
                    <i className="fi fi-rr-info text-sm"></i>
                    <span>PNG, JPG, JPEG</span>
                  </div>
                </label>
              )}

              {/* Drag over overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-white/90 dark:bg-black/90 z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
                  <div className="w-20 h-20 rounded-full bg-purple/10 flex items-center justify-center mb-4 text-purple animate-bounce">
                    <i className="fi fi-rr-upload-bubble text-4xl"></i>
                  </div>
                  <p className="text-xl font-bold text-black dark:text-white">
                    {language === "vi" ? "Thả ảnh để tải lên banner" : "Drop image to upload banner"}
                  </p>
                  <p className="text-sm text-dark-grey mt-1">
                    {language === "vi" ? "Hỗ trợ PNG, JPG, JPEG" : "Supports PNG, JPG, JPEG"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3 mt-10">
              <span className="bg-purple/10 text-purple text-xs font-bold px-3 py-1 rounded-full border border-purple/20">
                {language === "vi" ? "Tiêu đề bài viết" : "Blog Title"}
              </span>
            </div>

            <textarea
              defaultValue={title}
              placeholder={currentTranslations.blogTitlePlaceholder}
              className="text-4xl md:text-5xl font-gelasio font-semibold w-full h-20 outline-none resize-none mt-2 leading-tight placeholder:opacity-30 bg-white text-black dark:text-white transition-all"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <div className="w-full h-[1px] bg-gradient-to-r from-purple/30 via-grey/50 to-transparent my-6" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>

      {!isModal && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-grey/60 px-5 py-3 flex items-center justify-between shadow-lg">
          <p className="text-xs text-dark-grey">
            {language === "vi" ? "Chưa xuất bản" : "Not published yet"}
          </p>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-grey/80 dark:border-grey/30 text-dark-grey hover:text-red hover:border-red/30 hover:bg-red/5 transition-all text-sm font-bold"
            onClick={() => {
              const isVi = language === "vi";
              const confirmMsg = isVi
                ? "Bạn có chắc chắn muốn hủy viết bài? Tất cả thay đổi chưa lưu sẽ bị mất."
                : "Are you sure you want to cancel? All unsaved changes will be lost.";
              if (window.confirm(confirmMsg)) {
                localStorage.removeItem(DRAFT_KEY);
                const targetGroup = blog?.group;
                if (targetGroup) {
                  navigate(`/group/${targetGroup}?tab=discussion`);
                } else {
                  navigate(-1);
                }
              }
            }}
          >
            <i className="fi fi-rr-cross-circle text-base mt-0.5"></i>
            {language === "vi" ? "Hủy bài viết" : "Discard"}
          </button>
        </div>
      )}
    </>
  );
};

export default GroupBlogEditor;
