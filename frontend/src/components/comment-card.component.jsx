/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
    isReport,
    image,
    isHidden,
  } = commentData;

  let {
    blog,
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
    setFullScreenImage,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  let [showConfirmModal, setShowConfirmModal] = useState(false);
  let [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isReplying, setReplying] = useState(false);

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (
        commentsArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) break;
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex != undefined) {
        commentsArr[parentIndex].children = commentsArr[
          parentIndex
        ].children.filter((child) => child != _id);
        if (!commentsArr[parentIndex].children.length) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => Math.max(0, preVal - 1));
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments: Math.max(
          0,
          total_parent_comments -
            (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
        ),
      },
    });
  };

  const loadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentsArr[currentIndex].children.length) {
      hideReplies();
      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id: commentsArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentsArr[currentIndex].childrenLevel + 1;
            commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((err) => console.log(err));
    }
  };

  const deleteComment = () => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      )
      .then(() => {
        removeCommentsCards(index + 1, true);
        toast.success("Đã xóa bình luận");
      })
      .catch((err) => console.log(err));
  };

  const toggleHideComment = () => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/hide-comment",
        { _id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      )
      .then(({ data: { isHidden: newIsHidden } }) => {
        toast.success(newIsHidden ? "Đã ẩn bình luận" : "Đã hiện bình luận");
        commentsArr[index].isHidden = newIsHidden;
        setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Có lỗi xảy ra");
      });
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCards(index + 1);
  };

  const handleReplyClick = () => {
    if (!access_token)
      return toast.error("Vui lòng đăng nhập để trả lời bình luận");
    setReplying((preVal) => !preVal);
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();
    let button = (
      <button
        onClick={() =>
          loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })
        }
        className="text-xs text-purple hover:text-purple/70 flex items-center gap-1 ml-4 mt-1"
      >
        <i className="fi fi-rr-angle-down text-xs leading-none"></i>
        Tải thêm trả lời
      </button>
    );

    if (commentsArr[index + 1]) {
      if (
        commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentsArr[parentIndex].children.length)
          return button;
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentsArr[parentIndex].children.length)
          return button;
      }
    }
  };

  const report = useCallback(async () => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + `/comments/report/${_id}`,
        null,
        { headers: { Authorization: `Bearer ${access_token}` } },
      )
      .then(() => {
        toast.success("Đã báo cáo bình luận");
        isReport = true;
      })
      .catch(() => toast.error("Có lỗi xảy ra"));
  }, [access_token, _id]);

  const getDisplayDate = (date) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now - publishedDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (now.toDateString() === publishedDate.toDateString()) {
      if (diffMinutes === 0) return `vừa xong`;
      else if (diffHours < 1) return `${diffMinutes} phút trước`;
      else return `${diffHours} giờ trước`;
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    else return publishedDate.toLocaleDateString("en-GB");
  };

  const isReply = commentData.childrenLevel > 0;

  return (
    <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className={`mb-3 ${isReply ? "border-l-2 border-grey pl-3" : ""}`}>
        <div
          className={`p-4 rounded-2xl transition-colors duration-200 ${isReply ? "bg-grey/20 hover:bg-grey/40" : "bg-grey/30 hover:bg-grey/50"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() =>
                (window.location.href = `/user/${commented_by_username}`)
              }
            >
              <img
                src={profile_img}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-grey"
                alt={fullname}
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-black group-hover:text-purple transition-colors duration-200 line-clamp-1">
                    {fullname}
                  </p>
                  {isHidden && (
                    <span className="bg-grey text-dark-grey text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Đã ẩn
                    </span>
                  )}
                </div>
                <p className="text-xs text-dark-grey">
                  @{commented_by_username} · {getDisplayDate(commentedAt)}
                </p>
              </div>
            </div>

            {/* Report button */}
            {username !== commented_by_username && !isReport && (
              <div className="relative group/report">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-dark-grey/60 hover:text-rose-400 hover:bg-rose-50 transition-all duration-200"
                >
                  <i className="fi fi-rr-flag text-xs leading-none"></i>
                </button>
                <span className="absolute bottom-full right-0 mb-1 hidden group-hover/report:block bg-black/80 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                  Báo cáo
                </span>

                {showConfirmModal && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 mx-4">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fi fi-rr-flag text-rose-500 text-sm leading-none"></i>
                      </div>
                      <p className="text-sm font-bold text-black text-center mb-1">
                        Báo cáo bình luận
                      </p>
                      <p className="text-xs text-dark-grey text-center mb-5">
                        Bạn có chắc chắn muốn báo cáo bình luận này?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          className="flex-1 py-2 px-3 bg-grey text-dark-grey rounded-xl text-xs font-medium hover:bg-grey/80 transition-colors duration-200"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => {
                            report();
                            setShowConfirmModal(false);
                          }}
                          className="flex-1 py-2 px-3 bg-rose-500 text-white rounded-xl text-xs font-medium hover:bg-rose-600 transition-colors duration-200"
                        >
                          Báo cáo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment text */}
          {isHidden && username !== blog_author ? (
            <div className="relative group/hidden mb-3">
              <div className="blur-md select-none opacity-40 pointer-events-none font-gelasio text-sm">
                {comment}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs font-medium text-dark-grey bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-subtle shadow-sm flex items-center gap-2">
                  <i className="fi fi-rr-eye-crossed"></i>
                  Bình luận này đã bị chủ bài viết ẩn
                </p>
              </div>
            </div>
          ) : (
            <p
              className={`text-sm text-black leading-relaxed mb-3 font-gelasio transition-all duration-300 ${isHidden ? "opacity-50 grayscale" : ""}`}
            >
              {comment}
            </p>
          )}

          {/* Comment image */}
          {image && (!isHidden || username === blog_author) && (
            <div
              className={`mb-3 rounded-xl overflow-hidden cursor-zoom-in transition-all duration-300 ${isHidden && username !== blog_author ? "blur-xl grayscale opacity-20 pointer-events-none" : isHidden ? "opacity-50 grayscale" : ""}`}
              onClick={() => setFullScreenImage(image)}
            >
              <img
                src={image}
                alt="comment image"
                className="max-h-48 w-auto object-cover rounded-xl"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 mt-2">
            {commentData.isReplyLoaded ? (
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-grey hover:bg-white hover:text-black transition-all duration-200"
                onClick={hideReplies}
              >
                <i className="fi fi-rs-comment-dots text-xs leading-none"></i>
                Ẩn trả lời
              </button>
            ) : (
              children.length > 0 && (
                <button
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple hover:bg-white hover:text-purple/70 transition-all duration-200"
                  onClick={loadReplies}
                >
                  <i className="fi fi-rs-comment-dots text-xs leading-none"></i>
                  {children.length} trả lời
                </button>
              )
            )}

            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-grey hover:bg-white hover:text-purple transition-all duration-200"
              onClick={handleReplyClick}
            >
              <i className="fi fi-rr-reply text-xs leading-none"></i>
              Trả lời
            </button>

            {(username == commented_by_username || username == blog_author) && (
              <div className="flex items-center gap-1 ml-auto">
                {username == blog_author && (
                  <button
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isHidden ? "text-emerald-500 hover:bg-emerald-50" : "text-dark-grey hover:bg-grey"}`}
                    onClick={toggleHideComment}
                    title={isHidden ? "Hiện bình luận" : "Ẩn bình luận"}
                  >
                    <i
                      className={`fi ${isHidden ? "fi-rr-eye" : "fi-rr-eye-crossed"} text-xs leading-none`}
                    ></i>
                    {isHidden ? "Hiện" : "Ẩn"}
                  </button>
                )}
                <button
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-dark-grey hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
                  onClick={() => setShowDeleteModal(true)}
                  title="Xóa bình luận"
                >
                  <i className="fi fi-rr-trash text-xs leading-none"></i>
                  Xóa
                </button>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1001]">
              <div className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl p-8 w-80 mx-4 border border-subtle">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fi fi-rr-trash text-rose-500 text-lg"></i>
                </div>
                <h3 className="text-lg font-bold text-title text-center mb-2">
                  Xóa bình luận?
                </h3>
                <p className="text-sm text-body text-center mb-8">
                  Hành động này không thể hoàn tác. Bình luận sẽ bị xóa vĩnh
                  viễn.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 px-4 rounded-full bg-grey hover:bg-grey/80 text-dark-grey text-sm font-bold transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      deleteComment();
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-full bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reply field */}
          {isReplying && (
            <div className="mt-3 pt-3 border-t border-grey/60">
              <CommentField
                action="Trả lời"
                index={index}
                replyingTo={_id}
                setReplying={setReplying}
              />
            </div>
          )}
        </div>
      </div>

      <LoadMoreRepliesButton />
    </div>
  );
};

export default CommentCard;
