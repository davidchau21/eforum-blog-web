/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useCallback, useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";
import { Link } from "react-router-dom";
const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    repliesCount,
    level,
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
  const [showOptions, setShowOptions] = useState(false);

  const getParentIndex = () => {
    let startingPoint = index - 1;
    try {
      while (commentsArr[startingPoint].level >= commentData.level) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }
    return startingPoint;
  };

  const removeCommentsCards = (startingPoint, isDelete = false) => {
    if (commentsArr[startingPoint]) {
      while (commentsArr[startingPoint].level > commentData.level) {
        commentsArr.splice(startingPoint, 1);
        if (!commentsArr[startingPoint]) break;
      }
    }

    if (isDelete) {
      let parentIndex = getParentIndex();
      if (parentIndex != undefined) {
        commentsArr[parentIndex].repliesCount--;
        if (commentsArr[parentIndex].repliesCount <= 0) {
          commentsArr[parentIndex].isReplyLoaded = false;
        }
      }
      commentsArr.splice(index, 1);
    }

    if (commentData.level == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => Math.max(0, preVal - 1));
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_comments: activity.total_comments - (isDelete ? 1 : 0),
        total_parent_comments: Math.max(
          0,
          total_parent_comments - (commentData.level == 0 && isDelete ? 1 : 0),
        ),
      },
    });
  };

  const loadReplies = ({ page = 1, currentIndex = index, appending = false }) => {
    if (commentsArr[currentIndex].repliesCount > 0) {
      if (!appending) {
        hideReplies();
      }

      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/comments/get-replies", {
          _id: commentsArr[currentIndex]._id,
          page,
        })
        .then(({ data: { replies } }) => {
          commentsArr[currentIndex].isReplyLoaded = true;

          // Create a copy to avoid direct mutation
          let newCommentsArr = [...commentsArr];
          let skip = (page - 1) * 5;

          for (let i = 0; i < replies.length; i++) {
            newCommentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }
          setBlog({
            ...blog,
            comments: { ...comments, results: newCommentsArr },
          });
        })
        .catch((err) => console.log(err));
    }
  };

  const deleteComment = () => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/comments/delete",
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
        import.meta.env.VITE_SERVER_DOMAIN + "/comments/hide",
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

    if (level >= 2) return;

    setReplying((preVal) => !preVal);
  };

  const LoadMoreRepliesButton = () => {
    let parentIndex = getParentIndex();

    if (parentIndex !== undefined) {
      // Check if this is the last loaded reply for this parent
      let isLastReply = true;
      if (
        commentsArr[index + 1] &&
        commentsArr[index + 1].level > commentsArr[parentIndex].level
      ) {
        isLastReply = false;
      }

      if (!isLastReply) return null;

      // Calculate skip by counting ALL direct children of the parent currently loaded
      let currentLoadedRepliesCount = 0;
      for (let i = parentIndex + 1; i < commentsArr.length; i++) {
        if (commentsArr[i].level <= commentsArr[parentIndex].level) break;
        if (commentsArr[i].parent === commentsArr[parentIndex]._id) {
          currentLoadedRepliesCount++;
        }
      }

      if (currentLoadedRepliesCount < commentsArr[parentIndex].repliesCount) {
        return (
          <button
            onClick={() =>
              loadReplies({
                page: Math.floor(currentLoadedRepliesCount / 5) + 1,
                currentIndex: parentIndex,
                appending: true,
              })
            }
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ml-4 mt-2 font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
          >
            <i className="fi fi-rr-angle-down text-xs leading-none"></i>
            Tải thêm trả lời (
            {commentsArr[parentIndex].repliesCount - currentLoadedRepliesCount})
          </button>
        );
      }
    }
    return null;
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

  const isReply = commentData.level > 0;

  const canDelete =
    username === commented_by_username || username === blog_author;
  const canHide = username === blog_author;
  const canReport =
    access_token && username !== commented_by_username && !isReport;
  const hasOptions = canDelete || canHide || canReport;

  return (
    <div
      className={`w-full relative mb-6`}
      style={{ paddingLeft: isReply ? `${leftVal * 12}px` : "0" }}
    >
      {/* Thread line for nested comments */}
      {isReply && (
        <div className="absolute left-[2px] top-0 bottom-0 w-[2px] bg-grey hidden sm:block"></div>
      )}

      {/* Header */}
      <div
        className={`flex ${isReply ? "items-center gap-2 mb-2" : "items-start gap-3 mb-4"}`}
      >
        <Link to={`/user/${commented_by_username}`} className="flex-shrink-0">
          <img
            src={profile_img}
            className={`${isReply ? "w-6 h-6" : "w-10 h-10 mt-1"} rounded-full object-cover shadow-sm border border-grey`}
            alt={fullname}
          />
        </Link>
        <div className={`flex ${isReply ? "items-center gap-2" : "flex-col"}`}>
          <div className="flex items-center gap-2">
            <Link to={`/user/${commented_by_username}`}>
              <span
                className={`font-bold text-black hover:text-indigo-500 transition-colors line-clamp-1 ${isReply ? "text-[13px]" : "text-[14.5px]"}`}
              >
                {fullname}
              </span>
            </Link>
            {commented_by_username === blog_author && (
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                Tác giả
              </span>
            )}
          </div>
          <span
            className={`text-dark-grey opacity-60 font-medium whitespace-nowrap ${isReply ? "text-[12px]" : "text-[13px]"}`}
          >
            {getDisplayDate(commentedAt)}
          </span>
        </div>

        {/* Options Menu */}
        {hasOptions && (
          <div className="ml-auto relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              onBlur={() => setTimeout(() => setShowOptions(false), 200)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-dark-grey hover:text-black hover:bg-grey transition-all"
            >
              <i className="fi fi-br-menu-dots-vertical text-[13px]"></i>
            </button>

            {showOptions && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-grey rounded-xl shadow-2xl py-1.5 z-10 flex flex-col overflow-hidden">
                {/* Hide/Show for Blog Author */}
                {canHide && (
                  <button
                    onClick={() => {
                      toggleHideComment();
                      setShowOptions(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-dark-grey hover:bg-grey hover:text-black transition-colors w-full text-left"
                  >
                    <i
                      className={`fi ${isHidden ? "fi-rr-eye" : "fi-rr-eye-crossed"} w-4`}
                    ></i>
                    {isHidden ? "Show" : "Hide"}
                  </button>
                )}

                {/* Delete for Comment Author or Blog Author */}
                {canDelete && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowOptions(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors w-full text-left"
                  >
                    <i className="fi fi-rr-trash w-4"></i>
                    Delete
                  </button>
                )}

                {/* Report for Other Users */}
                {canReport && (
                  <button
                    onClick={() => {
                      setShowConfirmModal(true);
                      setShowOptions(false);
                    }}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] font-bold text-dark-grey hover:bg-grey hover:text-black transition-colors w-full text-left"
                  >
                    <i className="fi fi-rr-flag w-4"></i>
                    Report
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comment Content */}
      <div className={`${isReply ? "" : "pl-[52px]"}`}>
        {/* Comment text */}
        {isHidden && username !== blog_author ? (
          <div className="relative group/hidden mb-4">
            <div className="blur-md select-none opacity-40 pointer-events-none text-[14.5px] leading-relaxed text-black">
              {comment}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[12px] font-bold text-dark-grey bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-grey shadow-sm flex items-center gap-1.5">
                <i className="fi fi-rr-eye-crossed"></i>
                Hidden by author
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`whitespace-pre-wrap leading-relaxed text-black/80 mb-4 font-medium ${isReply ? "text-[14px]" : "text-[15px]"}`}
          >
            {comment}
          </div>
        )}

        {/* Comment image */}
        {image && (!isHidden || username === blog_author) && (
          <div
            className={`mb-4 rounded-xl overflow-hidden cursor-zoom-in transition-all border border-grey ${isHidden && username !== blog_author ? "blur-xl grayscale opacity-20 pointer-events-none" : isHidden ? "opacity-50 grayscale" : ""}`}
            onClick={() => setFullScreenImage(image)}
          >
            <img
              src={image}
              alt="comment image"
              className="max-h-64 w-auto object-cover rounded-xl"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-4 mt-1">
          <button className="flex items-center gap-1.5 text-[13px] font-bold text-dark-grey hover:text-rose-500 transition-colors">
            <i className="fi fi-rr-heart text-sm"></i>
            {0} {/* Placeholder for likes */}
          </button>

          {level < 2 && (
            <button
              className="flex items-center gap-1.5 text-[13px] font-bold text-dark-grey hover:text-indigo-500 transition-colors"
              onClick={handleReplyClick}
            >
              <i className="fi fi-rr-comment-dots text-sm"></i>
              Reply
            </button>
          )}

          {commentData.isReplyLoaded ? (
            <button
              className="text-[13px] font-bold text-dark-grey/60 hover:text-indigo-500 transition-colors"
              onClick={hideReplies}
            >
              Hide Replies
            </button>
          ) : (
            repliesCount > 0 && (
              <button
                className="text-[13px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                onClick={loadReplies}
              >
                {repliesCount} replies
              </button>
            )
          )}
        </div>

        {/* Reply field */}
        {isReplying && (
          <div className="mt-4">
            <CommentField
              action="Reply"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        )}

        <LoadMoreRepliesButton />
      </div>

      {/* Report Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-72 mx-4 border border-grey">
            <div className="w-10 h-10 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fi fi-rr-flag text-rose-500 text-sm"></i>
            </div>
            <p className="text-sm font-bold text-black text-center mb-1">
              Report Comment
            </p>
            <p className="text-xs text-dark-grey font-medium text-center mb-5 opacity-60">
              Are you sure you want to report this comment?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2 px-3 bg-grey text-dark-grey rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-grey/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  report();
                  setShowConfirmModal(false);
                }}
                className="flex-1 py-2 px-3 bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1001]">
          <div className="bg-white border border-grey rounded-[2rem] shadow-2xl p-8 w-80 mx-4">
            <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fi fi-rr-trash text-rose-500 text-lg"></i>
            </div>
            <h3 className="text-lg font-bold text-black text-center mb-2">
              Delete comment?
            </h3>
            <p className="text-sm text-dark-grey font-medium text-center mb-8 opacity-60">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 px-4 rounded-full bg-grey hover:bg-grey/80 text-dark-grey text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteComment();
                  setShowDeleteModal(false);
                }}
                className="flex-1 py-3 px-4 rounded-full bg-rose-500 text-white text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentCard;
