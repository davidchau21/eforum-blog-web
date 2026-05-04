/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import bannerDefault from "../imgs/banner-default.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
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
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newColName, setNewColName] = useState("");

  const shareMenuRef = useRef(null);
  const saveMenuRef = useRef(null);

  let urlShare = window.location.origin + `/blog/${id}`;

  useEffect(() => {
    if (access_token && content._id) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/isliked-by-user",
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
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/like-blog",
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

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để lưu bài viết");
    }

    if (isSavedByUser) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog",
          { blog_id: id },
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
        .then(({ data }) => {
          setSavedByUser(false);
          toast.success("Đã bỏ lưu bài viết");
        })
        .catch((err) => console.log(err));
    } else {
      try {
        const { data } = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + "/blogs/collections",
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        if (data.collections) {
          setCollections(data.collections);
          setShowSaveMenu(true);
          setSelectedCollectionId(null); // default to "Mục mặc định"
        } else {
          saveToCollection(null, e);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const saveToCollection = (collection_id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/save-blog",
        { blog_id: id, collection_id },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(({ data }) => {
        setSavedByUser(true);
        setShowSaveMenu(false);
        toast.success("Đã lưu bài viết");
      })
      .catch((err) => console.log(err));
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
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/share-blog", payload, {
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
      if (
        showShareOptions &&
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target)
      ) {
        setShowShareOptions(false);
      }
      if (
        showSaveMenu &&
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target)
      ) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareOptions, showSaveMenu]);

  const handleCreateAndSave = async (e) => {
    e.preventDefault();
    if (!newColName.trim()) return toast.error("Tên bộ sưu tập không được để trống");
    
    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/collections",
        { name: newColName },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      
      const newColId = data.collection._id;
      saveToCollection(newColId);
      setShowNewCollectionInput(false);
      setNewColName("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi khi tạo bộ sưu tập");
    }
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
      <div className="blog-post-card bg-white rounded-2xl border border-grey hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] transition-all duration-300 flex flex-col relative overflow-hidden h-full">
        {banner && !isDefaultBanner ? (
          <Link to={`/blog/${id}`} className="block h-48 w-full overflow-hidden shrink-0 border-b border-grey">
            <img src={banner} alt={title} className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500" />
          </Link>
        ) : (
          <Link to={`/blog/${id}`} className="block h-32 w-full bg-grey border-b border-grey shrink-0 flex items-center justify-center">
            <i className="fi fi-rr-document text-3xl text-dark-grey/20"></i>
          </Link>
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <Link to={`/user/${username}`} className="flex items-center gap-2 group/author">
              <img src={profile_img} className="w-6 h-6 rounded-full object-cover ring-1 ring-grey" />
              <span className="text-[13px] font-bold text-black group-hover/author:text-indigo-500 transition-colors line-clamp-1">{fullname}</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-dark-grey text-xs whitespace-nowrap opacity-60 font-medium">{getDisplayDate(publishedAt)}</span>
            </div>
          </div>

          <Link to={`/blog/${id}`} className="block group/title mb-2">
            <h3 className="font-bold text-[15.5px] text-black leading-[1.4] group-hover/title:text-indigo-500 transition-colors duration-200 line-clamp-2">
              {title}
            </h3>
          </Link>

          <Link to={`/blog/${id}`} className="block mb-4">
            <p className="text-[13.5px] text-dark-grey line-clamp-2 leading-[1.6]">
              {des}
            </p>
          </Link>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
              {tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="bg-grey text-dark-grey text-[11px] px-2.5 py-1 rounded-md font-bold border border-grey hover:bg-indigo-500/10 hover:text-indigo-500 transition-all cursor-pointer truncate max-w-[100px] uppercase tracking-wider opacity-80">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-dark-grey text-[12px] pt-4 border-t border-grey mt-auto">
            <div className="flex gap-4">
              <button className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors ${isLikedByUser ? "text-rose-500" : ""}`} onClick={handleLike}>
                <i className={isLikedByUser ? "fi fi-sr-heart text-sm" : "fi fi-rr-heart text-sm"}></i>
                <span className="font-bold">{localLikes}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors" onClick={handleCommentClick}>
                <i className="fi fi-rr-comment-alt text-sm"></i>
                <span className="font-bold">{total_comments}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                className={`transition-colors ${isSavedByUser ? "text-indigo-500" : "hover:text-indigo-500"}`}
                onClick={handleSaveClick}
              >
                <i
                  className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-[15px]`}
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
    <div className="blog-post-card bg-white rounded-2xl border border-grey p-5 sm:p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:shadow-[0_4px_24px_rgba(99,102,241,0.08)] transition-all duration-300 relative mb-4">
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
              className="w-6 h-6 rounded-full object-cover ring-1 ring-grey"
            />
            <span className="text-[13px] font-bold text-black group-hover/author:text-indigo-500 transition-colors">
              {fullname}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-dark-grey text-xs opacity-60 font-medium">
              {getDisplayDate(publishedAt)}
            </span>
            <button className="text-dark-grey hover:text-black w-6 h-6 flex items-center justify-center rounded transition-colors opacity-40 hover:opacity-100">
              <i className="fi fi-rr-menu-dots text-sm"></i>
            </button>
          </div>
        </div>

        {/* Title */}
        <Link to={`/blog/${id}`} className="block group/title mb-1.5">
          <h3 className="font-bold text-[16px] text-black leading-snug group-hover/title:text-indigo-500 transition-colors duration-200">
            {title}
          </h3>
        </Link>

        {/* Description */}
        <Link to={`/blog/${id}`} className="block mb-4">
          <p className="text-[14px] text-dark-grey line-clamp-2 leading-[1.6]">
            {des}
          </p>
        </Link>

        {/* Banner (Full width, hide if default) */}
        {banner && !isDefaultBanner && (
          <Link
            to={`/blog/${id}`}
            className="block mb-4 overflow-hidden rounded-xl border border-grey"
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
                className="bg-grey text-dark-grey text-[11.5px] px-2.5 py-1 rounded-md font-bold border border-grey hover:bg-indigo-500/10 hover:text-indigo-500 transition-all cursor-pointer uppercase tracking-wider opacity-80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center gap-1 sm:gap-2 text-dark-grey text-[13px] pt-3 border-t border-grey">
          <button
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${isLikedByUser ? "text-rose-500 bg-rose-500/10" : "hover:bg-grey hover:text-rose-500"}`}
            onClick={handleLike}
          >
            <i className={isLikedByUser ? "fi fi-sr-heart text-[15px] leading-none" : "fi fi-rr-heart text-[15px] leading-none"}></i>
            <span className="font-bold">{localLikes} <span className="hidden sm:inline">Likes</span></span>
          </button>

          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-grey hover:text-indigo-500 transition-all"
            onClick={handleCommentClick}
          >
            <i className="fi fi-rr-comment-alt text-[15px] leading-none"></i>
            <span className="font-bold">{total_comments} <span className="hidden sm:inline">Comments</span></span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-grey hover:text-black transition-all"
              onClick={handleShareClick}
            >
              <i className="fi fi-rr-share text-[15px] leading-none"></i>
              <span className="font-bold">Share</span>
            </button>
            {showShareOptions && (
              <div
                className="absolute bottom-full mb-2 -left-10 bg-white border border-grey rounded-xl shadow-xl p-2 flex gap-2 share-options-feed z-30 min-w-max"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(urlShare);
                    toast.success(translations.copyLink + " 👍");
                    handleShare("link");
                    setShowShareOptions(false);
                  }}
                  className="w-8 h-8 rounded-lg bg-grey flex items-center justify-center hover:bg-grey/50 transition-colors duration-200 text-black"
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
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center hover:bg-sky-500/20 transition-colors duration-200">
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
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors duration-200">
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
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors duration-200">
                    <i className="fi fi-brands-linkedin text-blue-700 text-sm leading-none mt-0.5"></i>
                  </div>
                </LinkedinShareButton>
              </div>
            )}
          </div>

          <button 
            onClick={handleSaveClick}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ml-auto font-bold ${isSavedByUser ? "bg-indigo-500/10 text-indigo-500" : "hover:bg-indigo-500/10 hover:text-indigo-500"}`}
          >
            <i className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-rr-bookmark"} text-[15px] leading-none`}></i>
            <span className="hidden sm:inline">{isSavedByUser ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Save Modal (Facebook Style) */}
      {showSaveMenu && (
        <div 
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowSaveMenu(false)}
        >
          <div 
            className="bg-white text-black rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-grey"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-grey flex items-center justify-between">
              <div className="w-10"></div> {/* Spacer */}
              <h3 className="text-lg font-bold text-black">Lưu vào</h3>
              <button 
                onClick={() => setShowSaveMenu(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-grey text-dark-grey transition-colors"
              >
                <i className="fi fi-rr-cross-small text-2xl"></i>
              </button>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
              {/* Default Collection */}
              <div 
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-grey cursor-pointer transition-colors group"
                onClick={() => setSelectedCollectionId(null)}
              >
                <div className="w-14 h-14 bg-grey rounded-lg flex items-center justify-center overflow-hidden border border-grey">
                  <i className="fi fi-sr-bookmark text-2xl text-indigo-500"></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-black">Mục mặc định</h4>
                  <p className="text-sm text-dark-grey flex items-center gap-1 font-medium opacity-60">
                    <i className="fi fi-rr-lock text-xs"></i> Chỉ mình tôi
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCollectionId === null ? 'border-indigo-500' : 'border-grey'}`}>
                  {selectedCollectionId === null && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
                </div>
              </div>

              {/* User Collections */}
              {collections.map((col, idx) => {
                const colors = ["bg-blue-500/10 text-blue-500", "bg-emerald-500/10 text-emerald-500", "bg-pink-500/10 text-pink-500", "bg-amber-500/10 text-amber-500"];
                const colBg = colors[idx % colors.length];
                
                return (
                  <div 
                    key={col._id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-grey cursor-pointer transition-colors"
                    onClick={() => setSelectedCollectionId(col._id)}
                  >
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center border border-grey ${colBg}`}>
                      <i className="fi fi-rr-folder text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-black truncate">{col.name}</h4>
                      <p className="text-sm text-dark-grey flex items-center gap-1 font-medium opacity-60">
                        <i className="fi fi-rr-lock text-xs"></i> Chỉ mình tôi
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCollectionId === col._id ? 'border-indigo-500' : 'border-grey'}`}>
                      {selectedCollectionId === col._id && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
                    </div>
                  </div>
                )
              })}

              {/* New Collection Row */}
              {showNewCollectionInput ? (
                <div className="p-3 animate-fade-in">
                  <div className="flex items-center gap-2 bg-grey rounded-xl p-2 px-3 border border-grey focus-within:border-indigo-500/50 transition-all">
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Tên bộ sưu tập..."
                      className="bg-transparent border-none outline-none flex-1 text-sm py-1 text-black placeholder:text-dark-grey/50"
                      value={newColName}
                      onChange={e => setNewColName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateAndSave(e)}
                    />
                    <button 
                      onClick={handleCreateAndSave}
                      className="text-xs font-bold text-indigo-500 hover:text-indigo-600"
                    >
                      Tạo
                    </button>
                    <button 
                      onClick={() => setShowNewCollectionInput(false)}
                      className="text-dark-grey hover:text-black"
                    >
                      <i className="fi fi-rr-cross-small"></i>
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setShowNewCollectionInput(true)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-grey transition-colors text-left"
                >
                  <div className="w-14 h-14 bg-grey rounded-lg flex items-center justify-center text-dark-grey border border-grey">
                    <i className="fi fi-rr-plus text-2xl"></i>
                  </div>
                  <span className="font-bold text-black">Bộ sưu tập mới</span>
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-grey flex justify-end">
              <button 
                onClick={() => saveToCollection(selectedCollectionId)}
                className="px-10 py-2.5 bg-black text-white font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostCard;
