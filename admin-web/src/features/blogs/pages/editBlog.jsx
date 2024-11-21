import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import userApi from "../../../api/userApi";
import uploadApi from "../../../api/uploadApi";
import lightBanner from "../../../assets/images/lightBanner.png";
import axios from "axios";
import { tools } from "../tools.component";
import EditorJS from "@editorjs/editorjs";
import tagApi from "../../../api/tag";
import { Select } from "antd";
import blogApi from "../../../api/blogApi";
import { decrementLoading, incrementLoading } from "@/redux/globalSlice";
import { useDispatch } from "react-redux";

const LIMIT_TAGS = 10;

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const handleResponseError = useHandleResponseError();
  const handleResponseSuccess = useHandleResponseSuccess();
  const [tags, setTags] = useState([]);
  const [editblog, setEditBlog] = useState(undefined);

  const [blog, setBlog] = useState({
    title: "",
    content: "",
    banner: "",
    des: "",
    tags: [],
  });

  const onGetBlog = useCallback(async () => {
    const { ok, body, errors } = await blogApi.getId(id);
    if (ok && body) {
      setEditBlog(body.blog);
    }
    if (errors) {
      handleResponseError(errors, () => navigate("/users"));
    }
  }, [id, handleResponseError]);

  const [pendingGetDetail, getDetail] = useHandleAsyncRequest(onGetBlog);

  useEffect(() => {
    if (!id) {
      navigate("/blogs");
    } else {
      getDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getDetail]);

  useEffect(() => {
    if (pendingGetDetail) {
      dispatch(incrementLoading());
    } else {
      dispatch(decrementLoading());
    }
  }, [pendingGetDetail, dispatch]);

  const onGetTag = async () => {
    const { ok, body } = await tagApi.getAllTags({
      limit: 999999,
      page: 0,
    });
    if (ok && body) {
      setTags(body.list);
    }
  };

  useEffect(() => {
    if (editblog) {
      setBlog({
        title: editblog.title,
        content: editblog.content,
        banner: editblog.banner,
        des: editblog.des,
        tags: editblog.tags,
      });
      if (!textEditor.isReady) {
        setTextEditor(
          new EditorJS({
            holderId: "textEditor",
            data: Array.isArray(editblog.content)
              ? editblog.content[0]
              : editblog.content,
            tools: tools,
            placeholder: "Let's write an awesome story",
          })
        );
      }
    }
  }, [editblog]);

  const [textEditor, setTextEditor] = useState({ isReady: false });

  useEffect(() => {
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

    img.src = lightBanner;
  };

  const handleUploadBlog = async (isDraft) => {
    if (textEditor.isReady) {
      textEditor
        .save()
        .then(async (data) => {
          if (data.blocks.length) {
            const body = {
              id: editblog.blog_id,
              title: blog.title,
              banner: blog.banner,
              des: blog.des,
              content: data,
              tags: blog.tags,
              draft: isDraft,
            };
            const { ok, errors } = await blogApi.createorUpdateBlog(body);
            if (ok) {
              handleResponseSuccess("Cập nhật blog thành công", () => {
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
        <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
          <label htmlFor="uploadBanner" style={{ cursor: "pointer" }}>
            <img
              src={blog.banner}
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
              value={blog.tags}
              onChange={handleChangeTags}
            />
          </div>
        )}

        <hr className="w-full opacity-10 my-5" />

        <div id="textEditor" className="font-gelasio"></div>
        <div className="flex gap-4 ml-auto">
          <button
            className="w-full text-base bg-brown-1 hover:!bg-brown-3 duration-300 h-10 font-exo-2 font-bold text-white"
            onClick={() => handleUploadBlog(false)}
          >
            Publish
          </button>
          <button
            className="w-full text-base bg-brown-1 hover:!bg-brown-3 duration-300 h-10 font-exo-2 font-bold text-white"
            onClick={() => handleUploadBlog(true)}
          >
            Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
