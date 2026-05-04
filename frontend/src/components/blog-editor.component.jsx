/* eslint-disable react/prop-types */
import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../imgs/blog banner light.png";
import darkBanner from "../imgs/blog banner dark.png";
import { uploadImage } from "../common/aws";
import { useContext, useEffect, useCallback, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../contexts/EditorContext";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations";

const DRAFT_KEY = "blog_editor_draft";

const BlogEditor = ({ isModal = false }) => {
  let { blog, setBlog, textEditor, setTextEditor, setEditorState, setActions } =
    useContext(EditorContext);

  // Guard: wait until blog context is available
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

  // --- Auto-save and Restore Logic ---
  useEffect(() => {
    // Attempt to restore draft from LocalStorage
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      const parsedDraft = JSON.parse(savedDraft);
      // Only restore if it's the same blog or a new one
      if (parsedDraft.blog_id === blog_id) {
        setBlog((prev) => ({ ...prev, ...parsedDraft.data }));
      }
    }
  }, []); // Only on mount

  // Save to localStorage on title or banner change
  useEffect(() => {
    const draftData = {
      blog_id,
      data: {
        title: blog.title,
        banner: blog.banner.startsWith("blob:") ? "" : blog.banner, // Don't save blob URLs
        des: blog.des,
        tags: blog.tags,
      },
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
  }, [blog.title, blog.banner, blog.des, blog.tags, blog_id]);

  useEffect(() => {
    if (!editorCore.current) {
      // Check if we have saved content for EditorJS
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
        },
        onReady() {
          // No need to overwrite the instance here
        }
      });

      editorCore.current = editor;
      setTextEditor(editor); 
    }

    return () => {
      if (editorCore.current && typeof editorCore.current.destroy === 'function') {
        // editorCore.current.destroy(); // Optional: destroy on unmount
      }
    };
  }, []);

  // Cleanup effect for preview URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (blog.banner && blog.banner.startsWith("blob:")) {
        URL.revokeObjectURL(blog.banner);
      }
    };
  }, [blog.banner]);

  const handleBannerUpload = (e) => {
    let img = e.target.files[0];

    if (img) {
      // Create local preview URL instead of uploading immediately
      const previewURL = URL.createObjectURL(img);
      setBlog({ ...blog, banner: previewURL, bannerFile: img });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      // enter key
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
    // if(!banner.length){
    //     return toast.error("Upload a blog banner to publish it")
    // }

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

      // If there's a local banner file, upload it now
      if (blog.bannerFile) {
        toast.loading(currentTranslations.uploading, { id: loadingToast });
        try {
          currentBanner = await uploadImage(blog.bannerFile);
          // Update the blog state so subsequent saves don't re-upload
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

              localStorage.removeItem(DRAFT_KEY); // Clear draft cache

              toast.dismiss(loadingToast);
              toast.success(currentTranslations.savedDraft);

              setTimeout(() => {
                if (!isModal) {
                  navigate("/dashboard/blogs?tab=draft");
                } else {
                  // If it's a modal, we navigate to the draft dashboard to show the change
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
          <p className="max-md:hidden text-black line-clamp-1 w-full">
            {blog.title.length ? blog.title : currentTranslations.newBlog}
          </p>

          <div className="flex gap-4 ml-auto">
            <button className="btn-dark py-2" onClick={handlePublishEvent}>
              {currentTranslations.publish}
            </button>
            <button className="btn-light py-2" onClick={handleSaveDraft}>
              {currentTranslations.saveDraft}
            </button>
          </div>
        </nav>
      )}
      <Toaster />
      <AnimationWrapper>
        <section className={isModal ? "py-0" : ""}>
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white">
              <label htmlFor="uploadBanner">
                <img src={banner} className="z-20" onError={handleError} />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder={currentTranslations.blogTitlePlaceholder}
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5" />

            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
