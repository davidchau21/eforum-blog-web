/* eslint-disable react/prop-types */
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../../common/page-animation";
import { useContext, useEffect, useState, useCallback } from "react";
import { EditorContext } from "../../contexts/EditorContext";
import Tag from "../tags.component";
import axios from "axios";
import { UserContext } from "../../App";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { uploadImage } from "../../common/aws";

const GroupPublishForm = ({ isModal = false }) => {
  let characterLimit = 200;
  let tagLimit = 10;
  const bannerDefault =
    "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

  let { blog_id } = useParams();
  let {
    blog,
    blog: { banner, title, tags, des, content },
    setEditorState,
    setBlog,
    setActions,
  } = useContext(EditorContext);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [availableTags, setAvailableTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [customTagInput, setCustomTagInput] = useState("");

  let navigate = useNavigate();

  const handleCloseEvent = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, title: input.value });
  };

  const handleBlogDesChange = (e) => {
    let input = e.target;
    setBlog({ ...blog, des: input.value });
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handleAddCustomTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!val) return;
      if (tags.includes(val)) {
        toast.error("Tag already exists");
        return;
      }
      if (tags.length >= tagLimit) {
        toast.error(`You can add max ${tagLimit} Tags`);
        return;
      }
      setBlog({ ...blog, tags: [...tags, val] });
      setCustomTagInput("");
    }
  };

  const publishBlog = useCallback(
    async (e) => {
      if (e && e.target && e.target.className.includes("disable")) {
        return;
      }

      if (!title.length) {
        return toast.error("Write blog title before publishing");
      }

      if (des && des.length > characterLimit) {
        return toast.error(
          `Description should be within ${characterLimit} characters to publish`,
        );
      }

      let loadingToast = toast.loading("Publishing....");
      if (e && e.target) e.target.classList.add("disable");

      let currentBanner = banner;

      if (blog.bannerFile) {
        toast.loading("Uploading banner...", { id: loadingToast });
        try {
          currentBanner = await uploadImage(blog.bannerFile);
          setBlog((prev) => ({ ...prev, banner: currentBanner, bannerFile: null }));
        } catch (uploadErr) {
          toast.dismiss(loadingToast);
          if (e && e.target) e.target.classList.remove("disable");
          return toast.error(uploadErr.message);
        }
      }

      let blogObj = {
        title,
        banner: currentBanner,
        des,
        content,
        tags,
        draft: false,
        groupId: blog?.group || null,
      };

      try {
        await Promise.all(
          tags.map(async (tag) => {
            try {
              await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/tags",
                { tag_name: tag },
                {
                  headers: { Authorization: `Bearer ${access_token}` },
                },
              );
            } catch (error) {
              console.error(`Failed to save tag: ${tag}`, error);
            }
          }),
        );

        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/create-blog",
          { ...blogObj, id: blog_id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        localStorage.removeItem("group_blog_editor_draft");

        toast.dismiss(loadingToast);
        
        const isActive = response.data?.isActive;

        if (isActive) {
          toast.success("Bài viết đã được đăng thành công! 👍");
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#3b82f6", "#8b5cf6"],
          });
        } else {
          toast.success("Bài viết đã gửi thành công!\nĐang chờ ban quản trị nhóm duyệt. 👍");
        }

        setTimeout(() => {
          if (blog?.group) {
            navigate(`/group/${blog.group}?tab=discussion`);
          } else {
            navigate("/dashboard/blogs");
          }
        }, 800);
      } catch (error) {
        if (e && e.target) e.target.classList.remove("disable");
        toast.dismiss(loadingToast);
        toast.error(
          error.response?.data?.error ||
            "An error occurred while publishing the blog",
        );
      } finally {
        if (e && e.target) e.target.classList.remove("disable");
      }
    },
    [
      access_token,
      banner,
      bannerDefault,
      blog_id,
      content,
      des,
      navigate,
      tags,
      title,
      blog,
    ],
  );

  useEffect(() => {
    if (isModal && setActions) {
      setActions((prev) => ({
        ...prev,
        publishBlog,
      }));
    }
  }, [isModal, setActions, publishBlog]);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/tags?limit=0", {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then((response) => {
        const fetchedTags = response.data.list || [];
        setAvailableTags(fetchedTags);
        setFilteredTags({ list: fetchedTags, total: fetchedTags.length });
      })
      .catch((error) => console.error("Failed to fetch tags:", error));
  }, []);

  return (
    <AnimationWrapper>
      <section
        className={`${isModal ? "p-0" : "w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4"}`}
      >
        <Toaster />

        {!isModal && (
          <button
            className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
            onClick={handleCloseEvent}
          >
            <i className="fi fi-br-cross"></i>
          </button>
        )}

        <div
          className={`${isModal ? "w-full space-y-4" : "max-w-[550px] center"}`}
        >
          <p className="text-dark-grey mb-1">Preview</p>

          {banner && banner.length > 0 && (
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
              <img
                src={banner}
                alt="Preview Banner"
                onError={(e) => (e.target.src = bannerDefault)}
              />
            </div>
          )}

          <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">
            {title}
          </h1>

          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des}
          </p>
        </div>

        <div
          className={`${isModal ? "w-full border-t border-subtle mt-10 pt-10" : "border-grey lg:border-1 lg:pl-8"}`}
        >
          <div className="space-y-6">
            <div>
              <p className="text-dark-grey font-medium mb-2">Blog Title</p>
              <input
                type="text"
                placeholder="Blog Title"
                defaultValue={title}
                className="input-box pl-4 focus:bg-white"
                onChange={handleBlogTitleChange}
              />
            </div>

            <div>
              <p className="text-dark-grey font-medium mb-2">
                Short description about your blog
              </p>
              <textarea
                maxLength={characterLimit}
                defaultValue={des}
                className="h-32 resize-none leading-7 input-box pl-4 focus:bg-white"
                onChange={handleBlogDesChange}
                onKeyDown={handleTitleKeyDown}
              ></textarea>
              <p className="mt-1.5 text-dark-grey text-xs text-right opacity-60">
                {characterLimit - des.length} characters left
              </p>
            </div>
          </div>

          <div className="space-y-5 mt-8">
            <div>
              <p className="text-dark-grey font-medium mb-2">
                Choose topic tags
              </p>
              <select
                className="w-full bg-grey/30 border border-subtle rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                defaultValue=""
                onChange={(e) => {
                  const selectedTag = e.target.value;
                  if (
                    selectedTag &&
                    !tags.includes(selectedTag) &&
                    tags.length < tagLimit
                  ) {
                    setBlog({ ...blog, tags: [...tags, selectedTag] });
                  } else if (tags.length >= tagLimit) {
                    toast.error(`You can add max ${tagLimit} Tags`);
                  }
                }}
              >
                <option value="" disabled>
                  Choose a topic
                </option>
                {availableTags.map((tag, i) => (
                  <option key={i} value={tag.tag_name}>
                    {tag.tag_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-dark-grey font-medium mb-2">
                Or type custom tag (Press Enter to add)
              </p>
              <input
                type="text"
                placeholder="Type and press Enter..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="input-box pl-4 focus:bg-white"
              />
            </div>
          </div>

          {tags.length > 0 && (
            <div className="relative bg-grey/20 border border-subtle rounded-2xl p-4 mt-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <Tag tag={tag} tagIndex={i} key={i} />
                ))}
              </div>
              <p className="mt-3 text-dark-grey text-[10px] font-bold uppercase tracking-widest opacity-50 text-right">
                {tagLimit - tags.length} Tags remaining
              </p>
            </div>
          )}

          {!isModal && (
            <button 
              className="whitespace-nowrap bg-purple text-white rounded-full py-3 px-8 mt-8 text-[15px] font-semibold hover:bg-purple/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-purple/10" 
              onClick={publishBlog}
            >
              Publish
            </button>
          )}
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default GroupPublishForm;
