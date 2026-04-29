/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useCallback, useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { getTranslations } from "../../translations";
import {
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TelegramShareButton,
  TwitterShareButton,
} from "react-share";

const BlogInteraction = () => {
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const blogContext = useContext(BlogContext);

  if (!blogContext || !blogContext.blog) {
    return null; // Or some fallback UI
  }

  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments, total_share },
      author: {
        personal_info: { username: author_username, role },
      },
      isReport,
    },
    setBlog,
    islikedByUser,
    setLikedByUser,
    setCommentsWrapper,
    isSavedByUser,
    setSavedByUser,
  } = blogContext;
  let { userAuth = {}, userAuth: { username, access_token, language } = {} } =
    useContext(UserContext) || {};

  const currentTranslations = getTranslations(language);

  let urlShare = window.location.href;

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/isliked-by-user",
          { _id },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .then(({ data: { result } }) => setLikedByUser(Boolean(result)))
        .catch((err) => console.log(err));

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/is-saved-by-user",
          { blog_id },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .then(({ data: { result } }) => setSavedByUser(Boolean(result)))
        .catch((err) => console.log(err));
    }
  }, [_id, blog_id, access_token]);

  const handleLike = () => {
    if (access_token) {
      setLikedByUser((preVal) => !preVal);
      !islikedByUser ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/like-blog",
          { _id, islikedByUser },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .catch((err) => console.log(err));
    } else {
      toast.error(currentTranslations.loggedInToLike);
    }
  };

  const handleSave = () => {
    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để lưu bài viết");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog",
        { blog_id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      )
      .then(({ data }) => {
        setSavedByUser(data.saved_status);
        toast.success(
          data.saved_status ? "Đã lưu bài viết" : "Đã bỏ lưu bài viết",
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Không thể lưu bài viết");
      });
  };

  const handleShare = (shareType) => {
    if (!access_token) {
      toast.error(currentTranslations.loggedInToShare);
      return;
    }
    const payload = {
      blog_id: _id,
      share_type: shareType,
      share_url: urlShare,
      share_img: blog.banner || "",
    };
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/share-blog", payload, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => {
        if (data.shared_by_user) {
          setBlog((prevBlog) => ({
            ...prevBlog,
            activity: {
              ...prevBlog.activity,
              total_share: prevBlog.activity.total_share + 1,
            },
          }));
          toast.success(currentTranslations.sharedByToast);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error(currentTranslations.sharedFailedToast);
      });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareOptions && !event.target.closest(".share-options")) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareOptions]);

  const report = useCallback(async () => {
    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + `/blogs/report/${blog_id}`,
        null,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );
      setBlog((prevBlog) => ({ ...prevBlog, isReport: true }));
      toast.success(currentTranslations.reportedSuccess);
    } catch (error) {
      console.error(error);
      toast.error(currentTranslations.reportedFailed);
    }
  }, [access_token, blog_id, setBlog, currentTranslations]);

  return (
    <>
      <Toaster />

      <div className="flex gap-2 items-center justify-between py-3 my-2 border-y border-grey">
        {/* Left: Reactions */}
        <div className="flex items-center gap-1">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              islikedByUser
                ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                : "text-dark-grey hover:bg-grey/60 hover:text-rose-500"
            }`}
          >
            <i
              className={`fi ${islikedByUser ? "fi-sr-heart" : "fi-rr-heart"} text-base leading-none`}
            ></i>
            <span>{total_likes}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => {
              const element = document.getElementById("comments-section");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-dark-grey hover:bg-grey/60 hover:text-blue-500 transition-all duration-200"
          >
            <i className="fi fi-rr-comment-dots text-base leading-none"></i>
            <span>{total_comments}</span>
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={() => setShowShareOptions((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-dark-grey hover:bg-grey/60 hover:text-emerald-500 transition-all duration-200"
            >
              <i className="fi fi-rr-share text-base leading-none"></i>
              <span>{total_share}</span>
            </button>

            {showShareOptions && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-grey rounded-2xl shadow-2xl p-3 flex gap-3 share-options z-30 min-w-max">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(urlShare);
                    toast.success("Đã sao chép link!");
                    handleShare("link");
                    setShowShareOptions(false);
                  }}
                  className="w-9 h-9 rounded-xl bg-grey/50 flex items-center justify-center hover:bg-grey transition-colors duration-200"
                >
                  <i className="fi fi-rr-link text-base leading-none"></i>
                </button>
                <TwitterShareButton
                  url={urlShare}
                  title={title}
                  hashtags={["blog", "eforum"]}
                  onClick={() => {
                    handleShare("twitter");
                    setShowShareOptions(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center hover:bg-sky-100 transition-colors duration-200">
                    <i className="fi fi-brands-twitter text-sky-500 text-base leading-none"></i>
                  </div>
                </TwitterShareButton>
                <FacebookShareButton
                  url={urlShare}
                  hashtag="#blog"
                  onClick={() => {
                    handleShare("facebook");
                    setShowShareOptions(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                    <i className="fi fi-brands-facebook text-blue-600 text-base leading-none"></i>
                  </div>
                </FacebookShareButton>
                <LinkedinShareButton
                  url={urlShare}
                  title={title}
                  summary="blog"
                  onClick={() => {
                    handleShare("linkedin");
                    setShowShareOptions(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                    <i className="fi fi-brands-linkedin text-blue-700 text-base leading-none"></i>
                  </div>
                </LinkedinShareButton>
                <RedditShareButton
                  url={urlShare}
                  title={title}
                  onClick={() => {
                    handleShare("reddit");
                    setShowShareOptions(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center hover:bg-orange-100 transition-colors duration-200">
                    <i className="fi fi-brands-reddit text-orange-500 text-base leading-none"></i>
                  </div>
                </RedditShareButton>
                <TelegramShareButton
                  url={urlShare}
                  title={title}
                  onClick={() => {
                    handleShare("telegram");
                    setShowShareOptions(false);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center hover:bg-sky-100 transition-colors duration-200">
                    <i className="fi fi-brands-telegram text-sky-500 text-base leading-none"></i>
                  </div>
                </TelegramShareButton>
              </div>
            )}
          </div>

          {/* Save/Bookmark */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isSavedByUser
                ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                : "text-dark-grey hover:bg-grey/60 hover:text-indigo-600"
            }`}
          >
            <i
              className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-base leading-none`}
            ></i>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Edit if author */}
          {username == author_username && (
            <Link
              to={`/editor/${blog_id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-dark-grey hover:bg-grey/60 hover:text-purple transition-all duration-200"
            >
              <i className="fi fi-rr-edit text-base leading-none"></i>
              <span>{currentTranslations.edit}</span>
            </Link>
          )}

          {/* Copy Link */}
          <div className="relative group">
            <button
              onClick={() => {
                navigator.clipboard.writeText(urlShare);
                toast.success(currentTranslations.copyLink + " 👍");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-dark-grey hover:bg-blue-50 hover:text-blue-500 transition-all duration-200"
            >
              <i className="fi fi-rr-link text-base leading-none"></i>
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
              {currentTranslations.copyLink}
            </span>
          </div>

          {/* Report */}
          {access_token &&
            !isReport &&
            username !== author_username &&
            role == "USER" && (
              <div className="relative group">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-dark-grey hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
                >
                  <i className="fi fi-rr-flag text-base leading-none"></i>
                </button>
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/80 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                  {currentTranslations.reportBlog}
                </span>

                {showConfirmModal && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fi fi-rr-flag text-rose-500 text-xl leading-none"></i>
                      </div>
                      <p className="text-base font-bold text-black text-center mb-1">
                        {currentTranslations.confirmReportTitle}
                      </p>
                      <p className="text-sm text-dark-grey text-center mb-6">
                        {currentTranslations.confirmReportMsg}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowConfirmModal(false)}
                          className="flex-1 py-2.5 px-4 bg-grey text-dark-grey rounded-xl text-sm font-medium hover:bg-grey/80 transition-colors duration-200"
                        >
                          {currentTranslations.cancel}
                        </button>
                        <button
                          onClick={() => {
                            report();
                            setShowConfirmModal(false);
                          }}
                          className="flex-1 py-2.5 px-4 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors duration-200"
                        >
                          {currentTranslations.report}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default BlogInteraction;
