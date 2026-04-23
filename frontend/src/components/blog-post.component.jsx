/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import bannerDefault from "../imgs/banner-default.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { SocketContext } from "../socket/SocketContext";
import { UserContext } from "../App";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TelegramShareButton,
} from "react-share";
import { getTranslations } from "../../translations";

const BlogPostCard = ({ content, author }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onlineUsers } = useContext(SocketContext) || { onlineUsers: [] };
  const { userAuth, userAuth: { access_token, language } = {} } =
    useContext(UserContext) || {};
  const translations = getTranslations(language);
  let {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes, total_comments, total_share } = {},
    blog_id: id,
  } = content || {};
  let {
    personal_info: { fullname, username, profile_img } = {},
    _id: authorId,
  } = author || {};
  const isOnline = onlineUsers?.includes(authorId);

  const [localIsFollowing, setLocalIsFollowing] = useState(
    content.isFollowingAuthor || false,
  );

  const handleFollowAuthor = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!access_token) {
      return toast.error("Please login to follow");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/follow-user",
        { target_id: authorId },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        setLocalIsFollowing(data.followed_status);
        toast.success(
          data.followed_status
            ? `Following ${fullname}`
            : `Unfollowed ${fullname}`,
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to update follow status");
      });
  };

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog/${id}?comment=1`);
  };

  const [localLikes, setLocalLikes] = useState(total_likes);
  const [localShares, setLocalShares] = useState(total_share);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [isSavedByUser, setSavedByUser] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  let urlShare = window.location.origin + `/blog/${id}`;

  useEffect(() => {
    if (access_token && content._id) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
          { _id: content._id },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .then(({ data: { result } }) => setLikedByUser(Boolean(result)))
        .catch((err) => console.log(err));

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/is-saved-by-user",
          { blog_id: id },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .then(({ data: { result } }) => setSavedByUser(Boolean(result)))
        .catch((err) => console.log(err));
    }
  }, [access_token, content._id, id]);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (access_token) {
      const newStatus = !isLikedByUser;
      setLikedByUser(newStatus);
      setLocalLikes((prev) => (newStatus ? prev + 1 : prev - 1));
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
          { _id: content._id, islikedByUser: isLikedByUser },
          {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        )
        .catch((err) => console.log(err));
    } else {
      toast.error(translations.loggedInToLike);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareOptions((prev) => !prev);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để lưu bài viết");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog",
        { blog_id: id },
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
      toast.error(translations.loggedInToShare);
      return;
    }
    const payload = {
      blog_id: content._id,
      share_type: shareType,
      share_url: urlShare,
      share_img: banner || "",
    };
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/share-blog", payload, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then(({ data }) => {
        if (data.shared_by_user) {
          setLocalShares((prev) => prev + 1);
          toast.success(translations.sharedByToast);
        }
      })
      .catch((err) => toast.error(translations.sharedFailedToast));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareOptions && !event.target.closest(".share-options-feed")) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareOptions]);

  const handleBannerError = (e) => {
    e.target.src = bannerDefault;
  };

  const isDefaultBanner =
    banner ===
    "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

  const getDisplayDate = (date) => {
    const now = new Date();
    const publishedDate = new Date(date);

    const diffTime = Math.abs(now - publishedDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (now.toDateString() === publishedDate.toDateString()) {
      if (diffMinutes === 0) {
        return translations.justNow;
      } else if (diffHours < 1) {
        return `${diffMinutes} ${translations.minutesAgo}`;
      } else {
        return `${diffHours} ${translations.hoursAgo}`;
      }
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} ${translations.daysAgo}`;
    } else {
      return publishedDate.toLocaleDateString("en-GB");
    }
  };

  const layout = content.layout || "list"; 

  if (layout === "grid") {
    return (
      <div className="blog-post-card bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col relative overflow-hidden h-full">
        {/* Top Banner */}
        {banner && !isDefaultBanner ? (
          <Link to={`/blog/${id}`} className="block h-48 w-full overflow-hidden shrink-0 border-b border-slate-100">
            <img src={banner} alt={title} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
          </Link>
        ) : (
          <Link to={`/blog/${id}`} className="block h-32 w-full bg-slate-50 border-b border-slate-100 shrink-0 flex items-center justify-center">
            <i className="fi fi-rr-document text-3xl text-slate-200"></i>
          </Link>
        )}

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Author Row */}
          <div className="flex items-center justify-between mb-3">
            <Link to={`/user/${username}`} className="flex items-center gap-2 group/author">
              <img src={profile_img} className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200" />
              <span className="text-[13px] font-semibold text-slate-600 group-hover/author:text-indigo-600 transition-colors line-clamp-1">{fullname}</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs whitespace-nowrap">{getDisplayDate(publishedAt)}</span>
            </div>
          </div>

          {/* Title */}
          <Link to={`/blog/${id}`} className="block group/title mb-2">
            <h3 className="font-bold text-[15.5px] text-slate-800 leading-[1.4] group-hover/title:text-indigo-600 transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Description */}
          <Link to={`/blog/${id}`} className="block mb-4">
            <p className="text-[13.5px] text-slate-500 line-clamp-2 leading-[1.6]">
              {des}
            </p>
          </Link>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
              {tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-slate-50 text-slate-500 text-[11px] px-2.5 py-1 rounded-md font-medium border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all cursor-pointer truncate max-w-[100px]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between text-slate-400 text-[12px] pt-4 border-t border-slate-100 mt-auto">
            <div className="flex gap-4">
              <button className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors ${isLikedByUser ? "text-rose-500" : ""}`} onClick={handleLike}>
                <i className={isLikedByUser ? "fi fi-sr-heart text-sm" : "fi fi-rr-heart text-sm"}></i>
                <span className="font-medium">{localLikes}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors" onClick={handleCommentClick}>
                <i className="fi fi-rr-comment-alt text-sm"></i>
                <span className="font-medium">{total_comments}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`transition-colors ${isSavedByUser ? "text-indigo-600" : "hover:text-indigo-500"}`}
                onClick={handleSave}
              >
                <i
                  className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-sm`}
                ></i>
              </button>
              <button
                className="hover:text-indigo-500 transition-colors"
                onClick={handleShareClick}
              >
                <i className="fi fi-rr-share text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT LIST LAYOUT
  return (
    <div className="blog-post-card bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:border-indigo-200 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] transition-all duration-300 relative mb-4">
      {/* Content */}
      <div className="w-full">
        {/* Author Row */}
        <div className="flex items-center justify-between mb-3">
          <Link
            to={`/user/${username}`}
            className="flex items-center gap-2 group/author"
          >
            <img
              src={profile_img}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
            />
            <span className="text-[13px] font-semibold text-slate-600 group-hover/author:text-indigo-600 transition-colors">
              {fullname}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">
              {getDisplayDate(publishedAt)}
            </span>
            <button className="text-slate-300 hover:text-slate-500 w-6 h-6 flex items-center justify-center rounded transition-colors">
              <i className="fi fi-rr-menu-dots text-sm"></i>
            </button>
          </div>
        </div>

        {/* Title */}
        <Link to={`/blog/${id}`} className="block group/title mb-1.5">
          <h3 className="font-bold text-[16px] text-slate-700 leading-snug group-hover/title:text-indigo-600 transition-colors duration-200">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <Link to={`/blog/${id}`} className="block mb-4">
          <p className="text-[14px] text-slate-500 line-clamp-2 leading-[1.6]">
            {des}
          </p>
        </Link>

        {/* Banner (Full width, hide if default) */}
        {banner && !isDefaultBanner && (
          <Link
            to={`/blog/${id}`}
            className="block mb-4 overflow-hidden rounded-xl border border-slate-100"
          >
            <img
              src={banner}
              alt={title}
              className="w-full h-auto max-h-[300px] object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </Link>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-slate-50 text-slate-500 text-[11.5px] px-2.5 py-1 rounded-md font-medium border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-1 sm:gap-2 text-slate-500 text-[13px] pt-3 border-t border-slate-100">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isLikedByUser ? "text-rose-500 bg-rose-50" : "hover:bg-slate-50 hover:text-rose-500"}`}
            onClick={handleLike}
          >
            <i className={isLikedByUser ? "fi fi-sr-heart text-[15px] leading-none" : "fi fi-rr-heart text-[15px] leading-none"}></i>
            <span className="font-medium">{localLikes} <span className="hidden sm:inline">Likes</span></span>
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all"
            onClick={handleCommentClick}
          >
            <i className="fi fi-rr-comment-alt text-[15px] leading-none"></i>
            <span className="font-medium">{total_comments} <span className="hidden sm:inline">Comments</span></span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-700 transition-all"
              onClick={handleShareClick}
            >
              <i className="fi fi-rr-share text-[15px] leading-none"></i>
              <span className="font-medium">Share</span>
            </button>
            {showShareOptions && (
              <div
                className="absolute bottom-full mb-2 -left-10 bg-white border border-slate-200 rounded-xl shadow-xl p-2 flex gap-2 share-options-feed z-30 min-w-max"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(urlShare);
                    toast.success(translations.copyLink + " 👍");
                    handleShare("link");
                    setShowShareOptions(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors duration-200 text-slate-600"
                >
                  <i className="fi fi-rr-link text-sm leading-none mt-0.5"></i>
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
                  <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center hover:bg-sky-100 transition-colors duration-200">
                    <i className="fi fi-brands-twitter text-sky-500 text-sm leading-none mt-0.5"></i>
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
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                    <i className="fi fi-brands-facebook text-blue-600 text-sm leading-none mt-0.5"></i>
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
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200">
                    <i className="fi fi-brands-linkedin text-blue-700 text-sm leading-none mt-0.5"></i>
                  </div>
                </LinkedinShareButton>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ml-auto font-medium ${isSavedByUser ? "bg-indigo-50 text-indigo-700" : "hover:bg-indigo-50 hover:text-indigo-600"}`}
          >
            <i className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-[15px] leading-none`}></i>
            <span className="hidden sm:inline">{isSavedByUser ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
