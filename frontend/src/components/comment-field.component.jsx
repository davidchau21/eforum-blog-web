/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useContext, useState, useRef, useEffect, useCallback } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  // Edit mode props
  editMode = false,
  editingCommentId = null,
  initialValue = "",
  onEditSubmit = null,
  onEditCancel = null,
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

  const [comment, setComment] = useState(editMode ? initialValue : "");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // @mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionCursorPos, setMentionCursorPos] = useState(null);
  const textareaRef = useRef(null);
  const mentionDebounceRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const fetchMentionUsers = useCallback((q) => {
    if (!q) { setMentionResults([]); return; }
    clearTimeout(mentionDebounceRef.current);
    mentionDebounceRef.current = setTimeout(() => {
      axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/comments/mention-users?query=${encodeURIComponent(q)}`)
        .then(({ data }) => setMentionResults(data.users || []))
        .catch(() => setMentionResults([]));
    }, 200);
  }, []);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setComment(val);

    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const mentionMatch = textBefore.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionCursorPos(cursorPos - mentionMatch[0].length);
      setShowMentionDropdown(true);
      fetchMentionUsers(mentionMatch[1]);
    } else {
      setShowMentionDropdown(false);
      setMentionQuery("");
    }
  };

  const insertMention = (user) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBefore = comment.slice(0, cursorPos);
    const mentionStart = textBefore.lastIndexOf("@");
    const before = comment.slice(0, mentionStart);
    const after = comment.slice(cursorPos);
    const newVal = `${before}@${user.personal_info.username} ${after}`;
    setComment(newVal);
    setShowMentionDropdown(false);
    setMentionResults([]);
    setTimeout(() => {
      const newCursorPos = mentionStart + user.personal_info.username.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 10);
  };

  const handleComment = () => {
    if (!access_token) return toast.error("Vui lòng đăng nhập để bình luận");
    if (!comment.length && !image) return toast.error("Hãy nhập nội dung hoặc chọn ảnh để bình luận");

    // Edit mode: call the edit handler
    if (editMode && onEditSubmit) {
      if (!comment.trim()) return toast.error("Nội dung không được để trống.");
      onEditSubmit(comment.trim());
      return;
    }

    setIsSubmitting(true);

    const uploadImage = () => {
      return new Promise((resolve, reject) => {
        if (!image) return resolve(null);
        axios
          .get(import.meta.env.VITE_SERVER_DOMAIN + "/files/get-upload-url")
          .then((response) => {
            const { uploadURL, publicURL } = response.data;
            axios
              .put(uploadURL, image, { headers: { "Content-Type": image.type } })
              .then(() => resolve(publicURL))
              .catch((err) => { console.error(err); reject("Image upload failed"); });
          })
          .catch((err) => { console.error(err); reject("Failed to get upload URL"); });
      });
    };

    uploadImage()
      .then((imageUrl) => {
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/comments/add",
            { _id, blog_author, comment, replying_to: replyingTo, image: imageUrl },
            { headers: { Authorization: `Bearer ${access_token}` } },
          )
          .then(({ data }) => {
            setComment("");
            setImage(null);
            setIsSubmitting(false);

            data.commented_by = { personal_info: { username, profile_img, fullname } };
            data.image = imageUrl;

            let newCommentArr;

            if (replyingTo) {
              commentsArr[index].repliesCount++;
              data.parentIndex = index;
              data.image = imageUrl;
              commentsArr[index].isReplyLoaded = true;
              commentsArr.splice(index + 1, 0, data);
              newCommentArr = commentsArr;
              setReplying(false);
            } else {
              newCommentArr = [data, ...commentsArr];
            }

            let parentCommentIncrementval = replyingTo ? 0 : 1;
            setBlog({
              ...blog,
              comments: { ...comments, results: newCommentArr },
              activity: {
                ...activity,
                total_comments: total_comments + 1,
                total_parent_comments: total_parent_comments + parentCommentIncrementval,
              },
            });
            setTotalParentCommentsLoaded((prevVal) => prevVal + parentCommentIncrementval);
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

  // Render mention highlight in comment text (visual only, simple approach)
  const renderCommentText = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <Link
          key={i}
          to={`/user/${part.slice(1)}`}
          className="text-indigo-600 font-bold hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className={`${editMode ? "" : "bg-white rounded-2xl border border-grey p-4 sm:p-6 shadow-sm"}`}>
      {!editMode && <Toaster />}

      <div className="flex items-start gap-4">
        {/* Author Avatar (only in non-edit mode) */}
        {!editMode && (
          profile_img ? (
            <img
              src={profile_img}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-grey"
              alt={fullname}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-grey flex-shrink-0"></div>
          )
        )}

        <div className="flex-1 min-w-0">
          {/* Textarea + mention dropdown wrapper */}
          <div className="relative mb-3">
            <textarea
              ref={textareaRef}
              value={comment}
              onChange={handleTextChange}
              placeholder={replyingTo ? "Write a reply..." : "Add to the comment... (dùng @ để mention)"}
              rows={editMode ? 2 : replyingTo ? 2 : 3}
              className={`w-full px-4 py-3 border rounded-xl text-sm placeholder:text-dark-grey/40 resize-none focus:outline-none focus:border-indigo-400 transition-all duration-300 font-medium text-black ${
                editMode
                  ? "bg-indigo-50 border-indigo-300 focus:bg-white"
                  : "bg-grey border-grey focus:bg-white"
              }`}
            />

            {/* @mention dropdown */}
            {showMentionDropdown && mentionResults.length > 0 && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-grey rounded-xl shadow-xl z-50 w-64 overflow-hidden">
                {mentionResults.map((user) => (
                  <button
                    key={user._id}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); insertMention(user); }}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-indigo-50 transition-colors"
                  >
                    <img
                      src={user.personal_info.profile_img}
                      className="w-7 h-7 rounded-full object-cover border border-grey"
                      alt=""
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-black truncate">{user.personal_info.fullname}</p>
                      <p className="text-[10px] text-dark-grey/60">@{user.personal_info.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Image preview */}
          {image && !editMode && (
            <div className="relative inline-block mb-3">
              <img
                src={URL.createObjectURL(image)}
                alt="Selected"
                className="h-32 w-auto object-cover rounded-xl border border-grey shadow-sm"
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
            {!editMode ? (
              <div className="flex items-center gap-3">
                <label
                  htmlFor={imageInputId}
                  className="text-dark-grey/40 hover:text-indigo-500 cursor-pointer transition-colors"
                  title="Đính kèm ảnh"
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
                <button
                  type="button"
                  className="text-dark-grey/40 hover:text-indigo-500 cursor-pointer transition-colors"
                  title="Mention người dùng"
                  onClick={() => {
                    const pos = textareaRef.current?.selectionStart ?? comment.length;
                    const newVal = comment.slice(0, pos) + "@" + comment.slice(pos);
                    setComment(newVal);
                    setTimeout(() => {
                      textareaRef.current?.setSelectionRange(pos + 1, pos + 1);
                      textareaRef.current?.focus();
                    }, 10);
                  }}
                >
                  <i className="fi fi-rr-at text-lg leading-none"></i>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onEditCancel}
                className="px-4 py-2 rounded-full text-sm font-bold text-dark-grey hover:bg-grey transition-all"
              >
                Hủy
              </button>
            )}

            <button
              onClick={handleComment}
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                isSubmitting
                  ? "bg-indigo-300 text-white cursor-not-allowed"
                  : editMode
                    ? "bg-emerald-600 text-white hover:opacity-90 shadow-lg shadow-emerald-600/20"
                    : "bg-indigo-600 text-white hover:opacity-90 shadow-lg shadow-indigo-600/20"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  {editMode ? "Đang lưu..." : "Posting..."}
                </span>
              ) : editMode ? "Lưu thay đổi" : "Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentField;
