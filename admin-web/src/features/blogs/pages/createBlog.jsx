import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import uploadApi from "../../../api/uploadApi";
import lightBanner from "../../../assets/images/lightBanner.png";
import axios from "axios";
import { tools } from "../tools.component";
import EditorJS from "@editorjs/editorjs";
import tagApi from "../../../api/tag";
import { Select } from "antd";
import blogApi from "../../../api/blogApi";

let defaultBanner = "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

const LIMIT_TAGS = 10;

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
    banner: "", // Sử dụng ảnh mặc định ban đầu
    des: "",
    tags: [],
  });
  const [textEditor, setTextEditor] = useState({ isReady: false });

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holderId: "textEditor",
          data: Array.isArray(blog.content) ? blog.content[0] : blog.content,
          tools: tools,
          placeholder: "Let's write an awesome story",
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
      }
    } else {
      // Nếu không chọn ảnh, dùng ảnh mặc định
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
    img.src = defaultBanner; // Dùng ảnh mặc định nếu ảnh tải bị lỗi
  };

  const handleUploadBlog = async (isDraft) => {
    if (textEditor.isReady) {
      textEditor
        .save()
        .then(async (data) => {
          if (data.blocks.length) {
            const body = {
              title: blog.title,
              banner: blog.banner || defaultBanner, // Dùng ảnh mặc định nếu không có banner
              des: blog.des,
              content: data,
              tags: blog.tags,
              draft: isDraft,
            };
            const { ok, errors } = await blogApi.createorUpdateBlog(body);
            if (ok) {
              handleResponseSuccess("Tạo blog mới thành công", () => {
                navigate("/blogs");
              });
            }
            if (errors) {
              handleResponseError(errors);
            }
          } else {
            return toast.error("Write something in your blog to publish it");
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
    setBlog((prev) => {
      if (prev.tags.length < LIMIT_TAGS) {
        return { ...prev, tags: value };
      }
    });
  };

  return (
    <div className="w-full p-5">
      <div className="mx-auto max-w-[650px] w-full">
        <div className="relative aspect-video hover:opacity-80 bg-white">
          <label htmlFor="uploadBanner" style={{ cursor: "pointer" }}>
            <img
              src={blog.banner || lightBanner} // Dùng ảnh mặc định nếu không có banner
              className="z-20"
              alt="Upload Banner"
              onError={handleError}
            />
          </label>
          <input
            id="uploadBanner"
            type="file"
            accept=".png, .jpg, .jpeg"
            hidden
            onChange={handleBannerUpload}
          />
        </div>
        <div className="mt-4">
          <label className="font-bold ">Title</label>
          <textarea
            value={blog.title}
            placeholder="Blog Title"
            className="text-4xl font-medium w-full h-20 outline-none resize-none  leading-tight placeholder:opacity-40 bg-white"
            onChange={handleTitleChange}
          />
        </div>
        <div className="mt-4">
          <label className="font-bold ">Description</label>
          <textarea
            maxLength={200}
            value={blog.des}
            placeholder="Description"
            className="text-4xl font-medium w-full h-20 outline-none resize-none  leading-tight placeholder:opacity-40 bg-white"
            onChange={handleBlogDesChange}
          />
        </div>
        {tags.length && (
          <div className="mt-4">
            <label className="font-bold ">Tags</label>
            <Select
              options={tags.map((tag) => ({
                label: tag.tag_name,
                value: tag.tag_name,
              }))}
              mode="multiple"
              placeholder="Chọn thẻ tag"
              className="h-10 w-full bg-white"
              variant="filled"
              onChange={handleChangeTags}
            />
          </div>
        )}

        <hr className="w-full opacity-10 my-5" />

        <div id="textEditor" className="font-gelasio"></div>
        <div className="flex gap-4 ml-auto">
          <button
            className="w-full text-base bg-emerald-500 hover:!bg-emerald-600 duration-300 h-10 font-exo-2 font-bold text-white"
            onClick={() => handleUploadBlog(false)}
          >
            Publish
          </button>
          <button
            className="w-full text-base bg-emerald-500 hover:!bg-emerald-600 duration-300 h-10 font-exo-2 font-bold text-white"
            onClick={() => handleUploadBlog(true)}
          >
            Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;
