/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import bannerDefault from "../imgs/banner-default.png";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useGetConversations from "../hook/useGetConversations";
import useConversation from "../zustand/useConversation";
import { SocketContext } from "../socket/SocketContext";
import { ThemeContext, UserContext } from "../App";
import { GroupMemberModal } from "./groups/group-member-modal.component";
import axios from "axios";
import { toast } from "react-hot-toast";
import { joinGroup } from "../services/group.service";

import {
  TwitterShareButton,
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TelegramShareButton,
} from "react-share";
import { getTranslations } from "../../translations";

const BlogPostCard = ({ content, author, members = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthorPopover, setShowAuthorPopover] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(
    "Spam hoặc quảng cáo không phép",
  );
  const [customReason, setCustomReason] = useState("");
  const { conversations } = useGetConversations();
  const { setSelectedConversation } = useConversation();
  const currentUsername = localStorage.getItem("username");

  const handleStartChat = (authorUser) => {
    const preloadedConv = (conversations || []).find(
      (c) => c._id === authorUser?._id,
    );
    setSelectedConversation(preloadedConv || authorUser);
    navigate("/chat");
  };

  const getRoleDetails = (role) => {
    switch (role) {
      case "OWNER":
        return {
          label: "Trưởng nhóm",
          icon: "fi-sr-crown",
          badgeStyle:
            "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        };
      case "DEPUTY":
        return {
          label: "Phó nhóm",
          icon: "fi-sr-star",
          badgeStyle:
            "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
        };
      case "MODERATOR":
        return {
          label: "Kiểm duyệt",
          icon: "fi-sr-shield",
          badgeStyle:
            "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        };
      default:
        return {
          label: "Thành viên",
          icon: "fi-rr-user",
          badgeStyle:
            "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5",
        };
    }
  };
  const { onlineUsers } = useContext(SocketContext) || { onlineUsers: [] };
  const { userAuth, userAuth: { access_token, language } = {} } =
    useContext(UserContext) || {};
  const { theme } = useContext(ThemeContext) || {};
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

  useEffect(() => {
    setLocalIsFollowing(content.isFollowingAuthor || false);
  }, [content.isFollowingAuthor]);

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

  useEffect(() => {
    setLocalLikes(total_likes);
  }, [total_likes]);

  useEffect(() => {
    setLocalShares(total_share);
  }, [total_share]);
  const [isLikedByUser, setLikedByUser] = useState(false);
  const [isSavedByUser, setSavedByUser] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [showNewCollectionInput, setShowNewCollectionInput] = useState(false);
  const [newColName, setNewColName] = useState("");

  const [groupMembership, setGroupMembership] = useState(
    content.group?.myMembership || null,
  );

  useEffect(() => {
    setGroupMembership(content.group?.myMembership || null);
  }, [content.group?.myMembership]);

  const handleJoinGroup = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!access_token) {
      toast.error(
        language === "vi"
          ? "Vui lòng đăng nhập để tham gia nhóm."
          : "Please log in to join the group.",
      );
      navigate("/signin");
      return;
    }

    joinGroup(content.group._id, access_token)
      .then((data) => {
        setGroupMembership({ status: data.status || "JOINED", role: "MEMBER" });
        toast.success(data.message || "Đã tham gia nhóm thành công!");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.response?.data?.error || "Không thể tham gia nhóm.");
      });
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để báo cáo bài viết");
    }

    setShowReportModal(true);
  };

  const submitReport = (e) => {
    e.preventDefault();

    if (!access_token) {
      return toast.error("Vui lòng đăng nhập để báo cáo bài viết");
    }

    const finalReason =
      selectedReason === "Khác"
        ? customReason.trim()
        : selectedReason +
          (customReason.trim() ? `: ${customReason.trim()}` : "");

    if (!finalReason.trim()) {
      return toast.error("Vui lòng cung cấp lý do báo cáo bài viết");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + `/blogs/report/${id}`,
        { reason: finalReason },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        toast.success(data.message || "Báo cáo bài viết thành công!");
        setShowReportModal(false);
        setSelectedReason("Spam hoặc quảng cáo không phép");
        setCustomReason("");
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Báo cáo bài viết thất bại");
      });
  };

  const [showMemberModal, setShowMemberModal] = useState(false);

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
          { headers: { Authorization: `Bearer ${access_token}` } },
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
          { headers: { Authorization: `Bearer ${access_token}` } },
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
        { headers: { Authorization: `Bearer ${access_token}` } },
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
    if (!newColName.trim())
      return toast.error("Tên bộ sưu tập không được để trống");

    try {
      const { data } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/blogs/collections",
        { name: newColName },
        { headers: { Authorization: `Bearer ${access_token}` } },
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
          <Link
            to={`/blog/${id}`}
            className="block h-48 w-full overflow-hidden shrink-0 border-b border-grey"
          >
            <img
              src={banner}
              alt={title}
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-500"
            />
          </Link>
        ) : (
          <Link
            to={`/blog/${id}`}
            className="block h-32 w-full bg-grey border-b border-grey shrink-0 flex items-center justify-center"
          >
            <i className="fi fi-rr-document text-3xl text-dark-grey/20"></i>
          </Link>
        )}

        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            {content.group ? (
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0 w-8 h-8">
                  <Link to={`/group/${content.group._id}`}>
                    <img
                      src={content.group.avatar || profile_img}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-grey"
                      alt={content.group.name}
                    />
                  </Link>
                  <Link
                    to={`/user/${username}`}
                    className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full overflow-hidden border border-white shadow-sm"
                  >
                    <img
                      src={profile_img}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                </div>
                <div className="flex flex-col">
                  <Link
                    to={`/group/${content.group._id}`}
                    className="text-[12.5px] font-extrabold text-black hover:text-indigo-500 transition-colors leading-none truncate max-w-[100px]"
                  >
                    {content.group.name}
                  </Link>
                  <div className="flex items-center gap-1 text-[10px] text-dark-grey mt-0.5 leading-none">
                    <span>By</span>
                    <Link
                      to={`/user/${username}`}
                      className="font-bold hover:text-indigo-500 truncate max-w-[60px]"
                    >
                      {fullname}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to={`/user/${username}`}
                className="flex items-center gap-2 group/author"
              >
                <img
                  src={profile_img}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-grey"
                  alt={fullname}
                />
                <span className="text-[13px] font-bold text-black group-hover/author:text-indigo-500 transition-colors line-clamp-1">
                  {fullname}
                </span>
              </Link>
            )}
            <div className="flex items-center gap-2">
              {content.group &&
                (!groupMembership || groupMembership.status !== "JOINED") && (
                  <button
                    onClick={handleJoinGroup}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  >
                    Tham gia
                  </button>
                )}
              <span className="text-dark-grey text-xs whitespace-nowrap opacity-60 font-medium">
                {getDisplayDate(publishedAt)}
              </span>
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
                <span
                  key={index}
                  className="bg-grey text-dark-grey text-[11px] px-2.5 py-1 rounded-md font-bold border border-grey hover:bg-indigo-500/10 hover:text-indigo-500 transition-all cursor-pointer truncate max-w-[100px] uppercase tracking-wider opacity-80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-dark-grey text-[13px] pt-4 border-t border-grey dark:border-zinc-800/80 mt-auto">
            <div className="flex gap-3">
              <button
                className={`flex items-center gap-2 group/btn transition-all py-1 px-2 rounded-xl hover:bg-rose-500/10 ${isLikedByUser ? "text-rose-500" : "hover:text-rose-500"}`}
                onClick={handleLike}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isLikedByUser ? "bg-rose-500/20 text-rose-500" : "bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-rose-500/20 group-hover/btn:text-rose-500"}`}
                >
                  <i
                    className={
                      isLikedByUser
                        ? "fi fi-sr-heart text-sm leading-none mt-0.5"
                        : "fi fi-br-heart text-sm leading-none mt-0.5"
                    }
                  ></i>
                </div>
                <span className="font-extrabold">{localLikes}</span>
              </button>
              <button
                className="flex items-center gap-2 group/btn transition-all py-1 px-2 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-500"
                onClick={handleCommentClick}
              >
                <div className="w-8 h-8 rounded-lg bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-indigo-500/20 group-hover/btn:text-indigo-500 flex items-center justify-center transition-all">
                  <i className="fi fi-br-comment text-sm leading-none mt-0.5"></i>
                </div>
                <span className="font-extrabold">{total_comments}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className={`flex items-center gap-2 group/btn transition-all py-1 px-2 rounded-xl hover:bg-amber-500/10 ${isSavedByUser ? "text-amber-500" : "hover:text-amber-500"}`}
                onClick={handleSaveClick}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSavedByUser ? "bg-amber-500/25 text-amber-500 shadow-sm shadow-amber-500/10" : "bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-amber-500/20 group-hover/btn:text-amber-500"}`}
                >
                  <i
                    className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-br-bookmark"} text-sm leading-none mt-0.5`}
                  ></i>
                </div>
              </button>
              <button
                className="flex items-center gap-2 group/btn transition-all py-1 px-2 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-500"
                onClick={handleShareClick}
              >
                <div className="w-8 h-8 rounded-lg bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-emerald-500/20 group-hover/btn:text-emerald-500 flex items-center justify-center transition-all">
                  <i className="fi fi-br-share text-sm leading-none mt-0.5"></i>
                </div>
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
        <div className="flex items-center justify-between mb-4">
          {content.group ? (
            <div className="flex items-center gap-3">
              <div className="relative shrink-0 w-10 h-10">
                <Link to={`/group/${content.group._id}`}>
                  <img
                    src={content.group.avatar || profile_img}
                    className="w-10 h-10 rounded-xl object-cover border border-grey"
                    alt={content.group.name}
                  />
                </Link>
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMemberModal(true);
                  }}
                >
                  <img
                    src={profile_img}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <Link
                  to={`/group/${content.group._id}`}
                  className="text-[14px] font-extrabold text-black hover:text-indigo-500 transition-colors leading-tight"
                >
                  {content.group.name}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-dark-grey mt-0.5 leading-none font-medium">
                  <span>Posted by</span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMemberModal(true);
                    }}
                    className="font-bold hover:text-indigo-500 transition-colors cursor-pointer"
                  >
                    {fullname}
                  </span>
                  <span>•</span>
                  <span className="opacity-75">
                    {getDisplayDate(publishedAt)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 group/author cursor-pointer relative"
                onMouseEnter={() => setShowAuthorPopover(true)}
                onMouseLeave={() => setShowAuthorPopover(false)}
              >
                <Link
                  to={`/user/${username}`}
                  className="flex items-center gap-2"
                >
                  <img
                    src={profile_img}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-grey"
                    alt={fullname}
                  />
                  <span className="text-[13.5px] font-bold text-black dark:text-white group-hover/author:text-indigo-500 transition-colors">
                    {fullname}
                  </span>
                </Link>

                {/* Popover Hover Card */}
                <AnimatePresence>
                  {showAuthorPopover &&
                    author &&
                    (() => {
                      const memberInfo = (members || []).find(
                        (m) => m.user?._id === authorId,
                      ) || {
                        role: "MEMBER",
                        user: {
                          ...author,
                          personal_info: {
                            ...author.personal_info,
                            bio: "Thành viên.",
                          },
                          account_info: {
                            total_followers: 0,
                            total_following: 0,
                          },
                        },
                      };
                      const roleInfo = getRoleDetails(memberInfo.role);
                      const isSelf =
                        memberInfo.user.personal_info?.username ===
                        currentUsername;

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                          className="absolute left-0 bottom-full mb-3.5 z-50 w-72 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-4 shadow-xl pointer-events-auto font-inter text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={
                                memberInfo.user.personal_info?.profile_img ||
                                profile_img
                              }
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 dark:border-white/5 bg-slate-100 dark:bg-zinc-800"
                              alt=""
                            />
                            <div className="min-w-0 flex-grow">
                              <h5 className="text-xs font-black text-slate-900 dark:text-white font-jakarta leading-snug truncate">
                                {memberInfo.user.personal_info?.fullname ||
                                  fullname}
                              </h5>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 truncate">
                                @
                                {memberInfo.user.personal_info?.username ||
                                  username}
                              </p>

                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider ${roleInfo.badgeStyle} leading-none mt-2`}
                              >
                                <i
                                  className={`fi ${roleInfo.icon} text-[7px]`}
                                ></i>
                                {roleInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Bio */}
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal mt-3 bg-slate-50 dark:bg-[#1f1f23] p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/45 italic line-clamp-2">
                            {memberInfo.user.personal_info?.bio ||
                              "Không có giới thiệu tiểu sử."}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/40 text-center">
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                {memberInfo.user.account_info
                                  ?.total_followers || 0}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                Theo dõi
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-white font-jakarta">
                                {memberInfo.user.account_info
                                  ?.total_following || 0}
                              </p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                Đang theo dõi
                              </p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="mt-4 flex gap-2">
                            <Link
                              to={`/user/${memberInfo.user.personal_info?.username}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                            >
                              <i className="fi fi-rr-user text-[10px]"></i>
                              Trang cá nhân
                            </Link>
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartChat(memberInfo.user);
                                }}
                                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
                              >
                                <i className="fi fi-rr-paper-plane text-[10px]"></i>
                                Nhắn tin
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })()}
                </AnimatePresence>
              </div>
              <span className="text-dark-grey text-xs opacity-60 font-medium ml-2">
                {getDisplayDate(publishedAt)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            {content.group &&
              (!groupMembership || groupMembership.status !== "JOINED") && (
                <button
                  onClick={handleJoinGroup}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  Tham gia
                </button>
              )}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className="text-dark-grey hover:text-black w-8 h-8 flex items-center justify-center rounded-xl transition-colors opacity-40 hover:opacity-100 hover:bg-grey/40 dark:hover:bg-zinc-800"
              >
                <i className="fi fi-rr-menu-dots text-sm"></i>
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-50 animate-fade-in"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={handleReportClick}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50/60 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-all"
                  >
                    <i className="fi fi-rr-info text-sm"></i> Báo cáo bài viết
                  </button>
                </div>
              )}
            </div>
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

        {/* Media Banner or Video Player */}
        {(() => {
          const firstVideoBlock = content.content?.blocks?.find(
            (block) => block.type === "video",
          );
          const firstEmbedBlock = content.content?.blocks?.find(
            (block) => block.type === "embed",
          );

          if (firstVideoBlock) {
            return (
              <div
                className="block mb-4 overflow-hidden rounded-xl border border-grey/80 dark:border-zinc-800/80 bg-black"
                onClick={(e) => e.stopPropagation()}
              >
                <video
                  src={firstVideoBlock.data.file.url}
                  controls
                  className="w-full aspect-video"
                ></video>
              </div>
            );
          }

          if (firstEmbedBlock) {
            return (
              <div
                className="block mb-4 overflow-hidden rounded-xl border border-grey/80 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#111113]"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={firstEmbedBlock.data.embed}
                  title={firstEmbedBlock.data.caption || "Embedded video"}
                  className="w-full aspect-video border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            );
          }

          if (banner && !isDefaultBanner) {
            return (
              <Link
                to={`/blog/${id}`}
                className="block mb-4 overflow-hidden rounded-xl border border-grey"
              >
                <img
                  src={banner}
                  alt={title}
                  className="w-full h-auto hover:scale-[1.02] transition-transform duration-500"
                />
              </Link>
            );
          }

          return null;
        })()}

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
        <div className="flex items-center gap-2 sm:gap-3 text-dark-grey text-[13px] pt-4 border-t border-grey/80 dark:border-zinc-800/80">
          <button
            className={`flex items-center gap-2 group/btn py-1.5 px-3 rounded-2xl transition-all ${isLikedByUser ? "text-rose-500 hover:bg-rose-500/5" : "hover:bg-rose-500/5 hover:text-rose-500"}`}
            onClick={handleLike}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isLikedByUser ? "bg-rose-500/25 text-rose-500 shadow-sm shadow-rose-500/10" : "bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-rose-500/20 group-hover/btn:text-rose-500"}`}
            >
              <i
                className={
                  isLikedByUser
                    ? "fi fi-sr-heart text-[15px] leading-none mt-0.5"
                    : "fi fi-br-heart text-[15px] leading-none mt-0.5"
                }
              ></i>
            </div>
            <span className="font-extrabold">
              {localLikes} <span className="hidden sm:inline">Likes</span>
            </span>
          </button>

          <button
            className="flex items-center gap-2 group/btn py-1.5 px-3 rounded-2xl hover:bg-indigo-500/5 hover:text-indigo-500 transition-all"
            onClick={handleCommentClick}
          >
            <div className="w-8 h-8 rounded-xl bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-indigo-500/20 group-hover/btn:text-indigo-500 flex items-center justify-center transition-all">
              <i className="fi fi-br-comment text-[15px] leading-none mt-0.5"></i>
            </div>
            <span className="font-extrabold">
              {total_comments}{" "}
              <span className="hidden sm:inline">Comments</span>
            </span>
          </button>

          <div className="relative">
            <button
              className="flex items-center gap-2 group/btn py-1.5 px-3 rounded-2xl hover:bg-emerald-500/5 hover:text-emerald-500 transition-all"
              onClick={handleShareClick}
            >
              <div className="w-8 h-8 rounded-xl bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-emerald-500/20 group-hover/btn:text-emerald-500 flex items-center justify-center transition-all">
                <i className="fi fi-br-share text-[15px] leading-none mt-0.5"></i>
              </div>
              <span className="font-extrabold">Share</span>
            </button>
            {showShareOptions && (
              <div
                className="absolute bottom-full mb-3 -left-4 bg-white border border-grey rounded-2xl shadow-xl p-2.5 flex gap-2 share-options-feed z-30 min-w-max animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(urlShare);
                    toast.success(translations.copyLink + " 👍");
                    handleShare("link");
                    setShowShareOptions(false);
                  }}
                  className="w-9 h-9 rounded-xl bg-grey flex items-center justify-center hover:bg-grey/80 transition-all text-black active:scale-90"
                >
                  <i className="fi fi-br-link text-sm leading-none"></i>
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
                  <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center hover:bg-sky-500/20 transition-all active:scale-90">
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
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-all active:scale-90">
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
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-all active:scale-90">
                    <i className="fi fi-brands-linkedin text-blue-700 text-sm leading-none"></i>
                  </div>
                </LinkedinShareButton>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveClick}
            className={`flex items-center gap-2 group/btn py-1.5 px-3 rounded-2xl transition-all ml-auto ${isSavedByUser ? "text-amber-500 hover:bg-amber-500/5" : "hover:bg-amber-500/5 hover:text-amber-500"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSavedByUser ? "bg-amber-500/25 text-amber-500 shadow-sm shadow-amber-500/10" : "bg-grey dark:bg-zinc-800/40 text-dark-grey group-hover/btn:bg-amber-500/20 group-hover/btn:text-amber-500"}`}
            >
              <i
                className={`fi ${isSavedByUser ? "fi-sr-bookmark" : "fi-br-bookmark"} text-[15px] leading-none mt-0.5`}
              ></i>
            </div>
            <span className="font-extrabold hidden sm:inline">
              {isSavedByUser ? "Saved" : "Save"}
            </span>
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
            onClick={(e) => e.stopPropagation()}
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
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCollectionId === null ? "border-indigo-500" : "border-grey"}`}
                >
                  {selectedCollectionId === null && (
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  )}
                </div>
              </div>

              {/* User Collections */}
              {collections.map((col, idx) => {
                const colors = [
                  "bg-blue-500/10 text-blue-500",
                  "bg-emerald-500/10 text-emerald-500",
                  "bg-pink-500/10 text-pink-500",
                  "bg-amber-500/10 text-amber-500",
                ];
                const colBg = colors[idx % colors.length];

                return (
                  <div
                    key={col._id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-grey cursor-pointer transition-colors"
                    onClick={() => setSelectedCollectionId(col._id)}
                  >
                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center border border-grey ${colBg}`}
                    >
                      <i className="fi fi-rr-folder text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-black truncate">
                        {col.name}
                      </h4>
                      <p className="text-sm text-dark-grey flex items-center gap-1 font-medium opacity-60">
                        <i className="fi fi-rr-lock text-xs"></i> Chỉ mình tôi
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedCollectionId === col._id ? "border-indigo-500" : "border-grey"}`}
                    >
                      {selectedCollectionId === col._id && (
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
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
                      onChange={(e) => setNewColName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateAndSave(e)
                      }
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

      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-6 animate-fade-in">
          <div className="bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-zinc-800 animate-in">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">
              Báo cáo bài viết
            </h3>
            <form onSubmit={submitReport} className="space-y-4">
              <div className="space-y-2">
                {[
                  "Spam hoặc quảng cáo không phép",
                  "Nội dung quấy rối, bắt nạt hoặc công kích cá nhân",
                  "Thông tin sai lệch, gây hiểu lầm hoặc xuyên tạc",
                  "Vi phạm bản quyền học liệu, tài liệu",
                  "Khác",
                ].map((reasonOption, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 cursor-pointer text-sm font-medium text-black dark:text-zinc-200"
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reasonOption}
                      checked={selectedReason === reasonOption}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1 accent-indigo-600"
                    />
                    <span>{reasonOption}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5 mt-4">
                <label className="text-[12px] font-bold text-dark-grey dark:text-zinc-400 uppercase tracking-wider">
                  {selectedReason === "Khác"
                    ? "Nhập lý do chi tiết (bắt buộc)"
                    : "Chi tiết thêm (tùy chọn)"}
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full min-h-[90px] p-4 bg-grey/30 dark:bg-zinc-800/40 border border-grey dark:border-zinc-800 rounded-2xl resize-none text-sm text-black dark:text-white placeholder:text-dark-grey focus:border-indigo-500/50 outline-none"
                  placeholder="Mô tả cụ thể hành vi vi phạm..."
                  required={selectedReason === "Khác"}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReason("Spam hoặc quảng cáo không phép");
                    setCustomReason("");
                  }}
                  className="flex-1 py-3 px-6 bg-grey dark:bg-zinc-800/40 text-black dark:text-white font-bold rounded-2xl hover:bg-black/5 dark:hover:bg-zinc-800 transition-all active:scale-95 text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95 text-xs"
                >
                  Gửi báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {content.group && showMemberModal && (
        <GroupMemberModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          member={{ role: "MEMBER", user: author }}
          groupId={content.group._id}
          token={access_token}
          theme={theme}
        />
      )}
    </div>
  );
};

export default BlogPostCard;
