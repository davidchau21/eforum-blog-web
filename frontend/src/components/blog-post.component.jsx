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

const BlogPostCard = ({ content, author }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onlineUsers } = useContext(SocketContext) || { onlineUsers: [] };
  const { userAuth: { access_token } = {} } = useContext(UserContext) || {};
  let {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes, total_comments, total_share },
    blog_id: id,
  } = content;
  let { fullname, profile_img, username, _id: authorId } = author;
  const isOnline = onlineUsers?.includes(authorId);

  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/blog/${id}?comment=1`);
  };

  const [localLikes, setLocalLikes] = useState(total_likes);
  const [localShares, setLocalShares] = useState(total_share);
  const [isLikedByUser, setLikedByUser] = useState(false);
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
    }
  }, [access_token, content._id]);

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
      toast.error("Vui lòng đăng nhập để thích bài viết này");
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareOptions((prev) => !prev);
  };

  const handleShare = (shareType) => {
    if (!access_token) {
      toast.error("Vui lòng đăng nhập để chia sẻ bài viết");
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
          toast.success("Đã chia sẻ thành công!");
        }
      })
      .catch((err) => toast.error("Chia sẻ thất bại"));
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
        return `vừa xong`;
      } else if (diffHours < 1) {
        return `${diffMinutes} phút trước`;
      } else {
        return `${diffHours} giờ trước`;
      }
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    } else {
      return publishedDate.toLocaleDateString("en-GB");
    }
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-grey/50 overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] hover:border-purple/20 transition-all duration-300 hover:-translate-y-1 mb-6">
      {/* Banner Image */}
      {!isDefaultBanner && (
        <Link to={`/blog/${id}`} className="block w-full h-48 overflow-hidden">
          <img
            src={banner || bannerDefault}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={handleBannerError}
          />
        </Link>
      )}

      <div className="p-5">
        {/* Author Info */}
        <div className="flex gap-3 items-center mb-4">
          <Link
            to={`/user/${username}`}
            className="flex items-center gap-3 group/author"
          >
            <div className="relative">
              <img
                src={profile_img}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-purple/20 group-hover/author:ring-purple/60 transition-all duration-300"
              />
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-semibold text-black line-clamp-1 group-hover/author:text-purple transition-colors duration-200">
                {fullname}
              </p>
              <p className="text-xs text-dark-grey">
                @{username} · {getDisplayDate(publishedAt)}
              </p>
            </div>
          </Link>
        </div>

        {/* Title & Description */}
        <Link to={`/blog/${id}`} className="block group/title mb-4">
          <p className="text-xl font-bold text-black leading-snug line-clamp-2 group-hover/title:text-purple transition-colors duration-200 mb-2">
            {title}
          </p>
          <p
            className={`text-sm text-dark-grey leading-relaxed ${isDefaultBanner ? "line-clamp-3" : "line-clamp-2"}`}
          >
            {des}
          </p>
        </Link>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags
              .slice(0, window.innerWidth < 640 ? 2 : 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple/10 text-purple hover:bg-purple/20 transition-colors duration-200"
                >
                  #{tag}
                </span>
              ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-grey">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 text-dark-grey transition-colors duration-200 cursor-pointer"
              onClick={handleLike}
            >
              <button
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${isLikedByUser ? "text-rose-500 bg-rose-50" : "hover:text-rose-500 hover:bg-grey"}`}
              >
                <i
                  className={`fi ${isLikedByUser ? "fi-sr-heart" : "fi-rr-heart"} text-base leading-none`}
                ></i>
                <span className="text-xs font-medium">{localLikes}</span>
              </button>
            </div>
            <button className="flex items-center gap-1.5 text-dark-grey hover:text-blue-500 hover:bg-grey px-2 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer" onClick={handleCommentClick}>
              <i className="fi fi-rr-comment text-base leading-none"></i>
              <span className="text-xs font-medium">{total_comments}</span>
            </button>
            <div className="relative">
              <button
                className="flex items-center gap-1.5 text-dark-grey hover:text-emerald-500 hover:bg-grey px-2 py-1.5 rounded-lg transition-colors duration-200 cursor-pointer"
                onClick={handleShareClick}
              >
                <i className="fi fi-rr-share text-base leading-none"></i>
                <span className="text-xs font-medium">{localShares}</span>
              </button>
              {showShareOptions && (
                <div
                  className="absolute bottom-full mb-1 -left-10 bg-white border border-grey rounded-xl shadow-lg p-2 flex gap-2 share-options-feed z-30 min-w-max"
                  onClick={(e) => e.stopPropagation()}
                >
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
                      <i className="fi fi-brands-twitter text-sky-500 text-sm leading-none"></i>
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
                      <i className="fi fi-brands-facebook text-blue-600 text-sm leading-none"></i>
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
                      <i className="fi fi-brands-linkedin text-blue-700 text-sm leading-none"></i>
                    </div>
                  </LinkedinShareButton>
                </div>
              )}
            </div>
          </div>
          <Link
            to={`/blog/${id}`}
            className="text-xs font-semibold text-purple hover:text-purple/70 transition-colors duration-200 flex items-center gap-1"
          >
            Đọc thêm{" "}
            <i className="fi fi-rr-arrow-right text-xs leading-none"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
