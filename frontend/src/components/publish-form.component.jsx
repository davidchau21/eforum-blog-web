/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext, useEffect, useState, useCallback } from "react";
import { EditorContext } from "../contexts/EditorContext";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
// import bannerDefault from "../imgs/banner-default.png";

const PublishForm = ({ isModal = false }) => {
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
  const [selectedClassTag, setSelectedClassTag] = useState(""); // Trạng thái để lưu tag mặc định đã chọn
  const [selectedSubjectTag, setSelectedSubjectTag] = useState(""); // Trạng thái để lưu tag môn học đã chọn

  let navigate = useNavigate();

  // Các tag mặc định bạn muốn thêm vào dropdown
  const defaultTagsClass = [
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
    "Khác",
  ];

  const defaultTagsSubject = [
    "Toán",
    "Văn",
    "Anh",
    "Lý",
    "Hóa",
    "Sinh",
    "Sử",
    "Địa",
    "GDCD",
    "Công Nghệ",
    "Tin Học",
    "Môn học khác",
  ];

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
      // enter key
      e.preventDefault();
    }
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();

      // let tag = e.target.value.trim();

      // if (tags.length < tagLimit) {
      //   if (!tags.includes(tag) && tag.length) {
      //     setBlog({ ...blog, tags: [...tags, tag] });
      //   }
      // } else {
      //   toast.error(`You can add max ${tagLimit} Tags`);
      // }

      // e.target.value = "";
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

      // if (!tags.length) {
      //   return toast.error("Enter at least 1 tag to help us rank your blog");
      // }

      // // Kiểm tra nếu người dùng chưa chọn tag mặc định
      // if (!selectedClassTag) {
      //   return toast.error("Please choose a default class before publishing");
      // }

      // if (!selectedSubjectTag) {
      //   return toast.error("Please choose a default subject before publishing");
      // }

      let loadingToast = toast.loading("Publishing....");
      if (e && e.target) e.target.classList.add("disable");

      let blogObj = {
        title,
        banner: banner.length === 0 ? bannerDefault : banner,
        des,
        content,
        tags,
        draft: false,
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

        await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
          { ...blogObj, id: blog_id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        toast.dismiss(loadingToast);
        toast.success("Published 👍 \nBài viết của bạn đang chờ duyệt");

        // Celebration confetti!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#3b82f6", "#8b5cf6"],
        });

        setTimeout(() => {
          navigate("/dashboard/blogs");
        }, 500);
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
      selectedClassTag,
      selectedSubjectTag,
      tags,
      title,
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

    // Initialize selected tags from existing blog tags (for editing)
    if (tags && tags.length) {
      const classTag = tags.find((t) => defaultTagsClass.includes(t));
      const subjectTag = tags.find((t) => defaultTagsSubject.includes(t));

      if (classTag) setSelectedClassTag(classTag);
      if (subjectTag) setSelectedSubjectTag(subjectTag);
    }
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
                Choose default class
              </p>
              <select
                className="w-full bg-grey/30 border border-subtle rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                value={selectedClassTag}
                onChange={(e) => {
                  const selectedTag = e.target.value;
                  let newTags = [...tags];
                  if (selectedClassTag) {
                    newTags = newTags.filter((t) => t !== selectedClassTag);
                  }
                  if (
                    selectedTag &&
                    !newTags.includes(selectedTag) &&
                    newTags.length < tagLimit
                  ) {
                    setBlog({ ...blog, tags: [...newTags, selectedTag] });
                    setSelectedClassTag(selectedTag);
                  }
                }}
              >
                <option value="" disabled>
                  Choose a class
                </option>
                {defaultTagsClass.map((tag, i) => (
                  <option key={i} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-dark-grey font-medium mb-2">
                Choose default subjects
              </p>
              <select
                className="w-full bg-grey/30 border border-subtle rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                value={selectedSubjectTag}
                onChange={(e) => {
                  const selectedTag = e.target.value;
                  let newTags = [...tags];
                  if (selectedSubjectTag) {
                    newTags = newTags.filter((t) => t !== selectedSubjectTag);
                  }
                  if (
                    selectedTag &&
                    !newTags.includes(selectedTag) &&
                    newTags.length < tagLimit
                  ) {
                    setBlog({ ...blog, tags: [...newTags, selectedTag] });
                    setSelectedSubjectTag(selectedTag);
                  }
                }}
              >
                <option value="" disabled>
                  Choose a subject
                </option>
                {defaultTagsSubject.map((tag, i) => (
                  <option key={i} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-dark-grey font-medium mb-2">
                Choose from existing topics
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
            <button className="btn-dark px-8" onClick={publishBlog}>
              Publish
            </button>
          )}
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
