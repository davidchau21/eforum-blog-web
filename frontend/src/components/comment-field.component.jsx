/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
import { MdCameraAlt } from "react-icons/md";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
}) => {
  let {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentsArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);
  let {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleComment = () => {
    if (!access_token) return toast.error("Vui lòng đăng nhập để bình luận");
    if (!comment.length && !image)
      return toast.error("Hãy nhập nội dung hoặc chọn ảnh để bình luận");

    setIsSubmitting(true);

    const uploadImage = () => {
      return new Promise((resolve, reject) => {
        if (!image) return resolve(null);
        axios
          .get(import.meta.env.VITE_SERVER_DOMAIN + "/files/get-upload-url")
          .then((response) => {
            const uploadURL = response.data.uploadURL;
            axios
              .put(uploadURL, image, {
                headers: { "Content-Type": image.type },
              })
              .then(() => resolve(uploadURL.split("?")[0]))
              .catch((err) => {
                console.error(err);
                reject("Image upload failed");
              });
          })
          .catch((err) => {
            console.error(err);
            reject("Failed to get upload URL");
          });
      });
    };

    uploadImage()
      .then((imageUrl) => {
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/comments/add",
            {
              _id,
              blog_author,
              comment,
              replying_to: replyingTo,
              image: imageUrl,
            },
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          )
          .then(({ data }) => {
            setComment("");
            setImage(null);
            setIsSubmitting(false);

            data.commented_by = {
              personal_info: { username, profile_img, fullname },
            };
            data.image = imageUrl;

            let newCommentArr;

            if (replyingTo) {
              if (!commentsArr[index].children)
                commentsArr[index].children = [];
              commentsArr[index].children.push(data._id);
              data.childrenLevel = commentsArr[index].childrenLevel + 1;
              data.parentIndex = index;
              data.image = imageUrl;
              commentsArr[index].isReplyLoaded = true;
              commentsArr.splice(index + 1, 0, data);
              newCommentArr = commentsArr;
              setReplying(false);
            } else {
              data.childrenLevel = 0;
              newCommentArr = [data, ...commentsArr];
            }

            let parentCommentIncrementval = replyingTo ? 0 : 1;
            setBlog({
              ...blog,
              comments: { ...comments, results: newCommentArr },
              activity: {
                ...activity,
                total_comments: total_comments + 1,
                total_parent_comments:
                  total_parent_comments + parentCommentIncrementval,
              },
            });
            setTotalParentCommentsLoaded(
              (prevVal) => prevVal + parentCommentIncrementval,
            );
          })
          .catch((err) => {
            console.log(err);
            setIsSubmitting(false);
            toast.error("Tài khoản của bạn đã bị khóa bình luận.");
          });
      })
      .catch((err) => {
        console.log(err);
        setIsSubmitting(false);
        toast.error("Lỗi khi tải ảnh. Vui lòng thử lại.");
      });
  };

  const imageInputId = replyingTo ? "ReplyImageInput" : "ImageInput";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
      <Toaster />

      <div className="flex items-start gap-4">
        {/* Author Avatar */}
        {profile_img ? (
          <img
            src={profile_img}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-100"
            alt={fullname}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-slate-100 flex-shrink-0"></div>
        )}

        <div className="flex-1 min-w-0">
          {/* Textarea */}
          <div className="relative mb-3">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                replyingTo ? "Write a reply..." : "Add to the comment..."
              }
              rows={replyingTo ? 2 : 3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 resize-none focus:outline-none focus:border-indigo-400 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Image preview */}
          {image && (
            <div className="relative inline-block mb-3">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected"
                className="h-32 w-auto object-cover rounded-xl border border-slate-200 shadow-sm"
              />
              <button
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                onClick={() => setImage(null)}
              >
                <i className="fi fi-br-cross text-[8px]"></i>
              </button>
            </div>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <label
                htmlFor={imageInputId}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              >
                <i className="fi fi-rr-picture text-lg leading-none"></i>
              </label>
              <input
                id={imageInputId}
                onChange={handleImageChange}
                className="hidden"
                type="file"
                accept="image/*"
              />

              <button className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors hidden sm:block">
                <i className="fi fi-rr-code text-lg leading-none"></i>
              </button>
              <button className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors hidden sm:block">
                <i className="fi fi-rr-at text-lg leading-none"></i>
              </button>
            </div>

            <button
              onClick={handleComment}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isSubmitting
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-3.5 w-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    ></path>
                  </svg>
                  Posting...
                </span>
              ) : (
                "Comment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentField;
