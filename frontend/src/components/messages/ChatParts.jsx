import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import useConversation from "../../zustand/useConversation"; // Import useConversation để lấy tin nhắn
import { UserContext } from "../../App"; // Import UserContext để gọi lightbox

const SOCIAL_ICONS = {
  facebook: { icon: "fi-brands-facebook", color: "text-[#1877F2]" },
  instagram: { icon: "fi-brands-instagram", color: "text-[#E4405F]" },
  twitter: { icon: "fi-brands-twitter", color: "text-[#1DA1F2]" },
  github: { icon: "fi-brands-github", color: "text-black" },
  youtube: { icon: "fi-brands-youtube", color: "text-[#FF0000]" },
};

// ─── ChatHeader ────────────────────────────────────────────────────────────────
export const ChatHeader = ({
  conversation,
  isOnline,
  showInfo,
  onToggleInfo,
}) => {
  const handleCallNotImplemented = () => {
    toast.error("Tính năng cuộc gọi thoại đang được phát triển!", {
      icon: "📞",
      style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
    });
  };

  const handleVideoNotImplemented = () => {
    toast.error("Tính năng cuộc gọi video đang được phát triển!", {
      icon: "📹",
      style: { borderRadius: "12px", background: "#09090b", color: "#fff" },
    });
  };

  return (
    <div className="h-[68px] bg-white/90 backdrop-blur-xl border-b border-grey px-5 flex items-center justify-between flex-shrink-0">
      {/* Left: avatar + name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <Link
          to={`/user/${conversation.personal_info.username}`}
          className="relative shrink-0"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-grey hover:ring-purple/30 transition-all duration-200">
            <img
              src={conversation.personal_info.profile_img}
              className="w-full h-full object-cover"
              alt={conversation.personal_info.fullname}
            />
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
            </span>
          )}
        </Link>

        <div className="flex flex-col min-w-0">
          <Link
            to={`/user/${conversation.personal_info.username}`}
            className="text-[14px] text-black font-bold hover:text-purple transition-colors duration-200 leading-tight truncate"
          >
            {conversation.personal_info.fullname}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[11px] font-medium flex items-center gap-1 ${
                isOnline ? "text-emerald-500" : "text-dark-grey"
              }`}
            >
              {isOnline && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              )}
              {isOnline ? "Active now" : "Offline"}
            </span>
            <span className="text-dark-grey/30 text-[11px]">·</span>
            <span className="text-dark-grey/60 text-[11px] truncate">
              @{conversation.personal_info.username}
            </span>
          </div>
        </div>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleCallNotImplemented}
          title="Voice call"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all duration-200"
        >
          <i className="fi fi-rr-phone-call text-[14px]"></i>
        </button>
        <button
          onClick={handleVideoNotImplemented}
          title="Video call"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-dark-grey hover:bg-grey hover:text-black transition-all duration-200"
        >
          <i className="fi fi-rr-video-camera text-[14px]"></i>
        </button>
        <button
          onClick={onToggleInfo}
          title="User info"
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
            showInfo
              ? "bg-purple/10 text-purple border border-purple/20"
              : "text-dark-grey hover:bg-grey hover:text-black"
          }`}
        >
          <i className="fi fi-rr-info text-[14px]"></i>
        </button>
      </div>
    </div>
  );
};

// ─── UserInfoPanel ─────────────────────────────────────────────────────────────
export const UserInfoPanel = ({ conversation, isOnline, onClose }) => {
  const [activeTab, setActiveTab] = useState("about"); // "about" hoặc "media"
  const [mediaTab, setMediaTab] = useState("images"); // "images", "files", "links"

  const [allMedia, setAllMedia] = useState([]); // Chứa toàn bộ media lấy từ API riêng
  const [loadingMedia, setLoadingMedia] = useState(false);

  const { userAuth } = useContext(UserContext);
  const { setFullScreenImage } = useContext(UserContext); // Dùng lightbox của app để xem ảnh to

  const hasSocialLinks =
    conversation.social_links &&
    Object.values(conversation.social_links).some(Boolean);

  // Fetch toàn bộ media từ API mới của backend khi chuyển sang tab Media hoặc thay đổi cuộc hội thoại
  useEffect(() => {
    if (activeTab !== "media" || !conversation?._id || !userAuth?.access_token)
      return;

    const fetchAllMedia = async () => {
      setLoadingMedia(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/message/media/${conversation._id}`,
          {
            headers: {
              Authorization: `Bearer ${userAuth.access_token}`,
            },
          },
        );
        setAllMedia(data || []);
      } catch (error) {
        console.error("Lỗi khi tải tệp đa phương tiện:", error);
        toast.error("Không thể tải toàn bộ tệp đa phương tiện");
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchAllMedia();
  }, [activeTab, conversation?._id, userAuth?.access_token]);

  // Phân loại tệp đa phương tiện từ toàn bộ lịch sử (allMedia) thay vì tin nhắn phân trang
  const mediaItems = allMedia.filter(
    (m) => m.type?.startsWith("image") || m.type?.startsWith("video"),
  );

  const fileItems = allMedia.filter((m) => m.type?.startsWith("application"));

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const linkItems = allMedia
    .filter((m) => m.type === "text" && urlRegex.test(m.message))
    .map((m) => {
      const urls = m.message.match(urlRegex) || [];
      return { ...m, urls };
    })
    .flatMap((m) => m.urls);

  return (
    <div className="w-full md:w-[288px] absolute md:static inset-y-0 right-0 bg-white border-l border-grey z-20 flex flex-col overflow-hidden shadow-xl md:shadow-none">
      {/* Panel header */}
      <div className="h-[68px] px-5 border-b border-grey flex items-center justify-between flex-shrink-0">
        <h3 className="text-[13px] font-bold text-black tracking-wide">
          User Info
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-dark-grey hover:bg-grey hover:text-black transition-all"
        >
          <i className="fi fi-rr-cross text-[10px]"></i>
        </button>
      </div>

      {/* User Basic Info */}
      <div className="p-5 pb-3 flex flex-col items-center text-center flex-shrink-0 gap-0 border-b border-grey">
        {/* Avatar */}
        <div className="relative mb-2.5">
          <div className="w-[64px] h-[64px] rounded-full p-[2px] bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
              <img
                src={conversation.personal_info.profile_img}
                className="w-full h-full object-cover"
                alt={conversation.personal_info.fullname}
              />
            </div>
          </div>
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
            </span>
          )}
        </div>

        {/* Name */}
        <h4 className="text-[14px] font-bold text-black leading-snug capitalize">
          {conversation.personal_info.fullname}
        </h4>
        <p className="text-[11px] text-dark-grey mt-0.5">
          @{conversation.personal_info.username}
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-grey bg-grey/30 p-1 mx-4 my-3 rounded-xl flex-shrink-0">
        <button
          onClick={() => setActiveTab("about")}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "about"
              ? "bg-white text-black shadow-sm"
              : "text-dark-grey hover:text-black"
          }`}
        >
          Thông tin
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
            activeTab === "media"
              ? "bg-white text-black shadow-sm"
              : "text-dark-grey hover:text-black"
          }`}
        >
          Tệp & Liên kết
        </button>
      </div>

      {/* Tab Contents Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
        {activeTab === "about" ? (
          <div className="flex flex-col gap-4">
            {/* Active state badge */}
            {isOnline && (
              <div className="flex justify-center">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold flex items-center gap-1.5 border border-emerald-500/15">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Active now
                </span>
              </div>
            )}

            {/* Bio */}
            <div className="w-full text-left">
              <h5 className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-1.5">
                About
              </h5>
              <p className="text-[12px] text-black leading-relaxed italic whitespace-pre-wrap">
                {conversation.personal_info.bio || (
                  <span className="text-dark-grey not-italic">No bio yet.</span>
                )}
              </p>
            </div>

            {/* Social links */}
            {hasSocialLinks && (
              <div className="w-full text-left pt-2 border-t border-grey">
                <h5 className="text-[10px] font-bold text-dark-grey uppercase tracking-widest mb-2.5">
                  Social
                </h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(conversation.social_links).map(
                    ([platform, link]) => {
                      if (!link) return null;
                      const meta = SOCIAL_ICONS[platform] ?? {
                        icon: "fi-rr-globe",
                        color: "text-dark-grey",
                      };
                      return (
                        <a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={platform}
                          className="w-8 h-8 rounded-lg bg-grey hover:bg-grey/60 flex items-center justify-center transition-all hover:scale-110"
                        >
                          <i
                            className={`fi ${meta.icon} ${meta.color} text-[14px]`}
                          ></i>
                        </a>
                      );
                    },
                  )}
                </div>
              </div>
            )}

            {/* View Profile CTA */}
            <div className="w-full pt-4 mt-auto">
              <Link
                to={`/user/${conversation.personal_info.username}`}
                className="w-full py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:opacity-90 text-white rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/20 hover:-translate-y-0.5"
              >
                <i className="fi fi-rr-user text-[12px]"></i>
                View Profile
              </Link>
            </div>
          </div>
        ) : (
          /* TAB ĐA PHƯƠNG TIỆN (MEDIA) */
          <div className="flex flex-col h-full min-h-0">
            {/* Sub-tabs selector */}
            <div className="flex gap-1.5 border-b border-grey pb-2.5 mb-3 flex-shrink-0">
              <button
                onClick={() => setMediaTab("images")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  mediaTab === "images"
                    ? "bg-purple/10 text-purple border border-purple/20"
                    : "text-dark-grey hover:bg-grey"
                }`}
              >
                Ảnh ({mediaItems.length})
              </button>
              <button
                onClick={() => setMediaTab("files")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  mediaTab === "files"
                    ? "bg-purple/10 text-purple border border-purple/20"
                    : "text-dark-grey hover:bg-grey"
                }`}
              >
                Tệp ({fileItems.length})
              </button>
              <button
                onClick={() => setMediaTab("links")}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                  mediaTab === "links"
                    ? "bg-purple/10 text-purple border border-purple/20"
                    : "text-dark-grey hover:bg-grey"
                }`}
              >
                Link ({linkItems.length})
              </button>
            </div>

            {/* Sub-tab Contents */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {loadingMedia ? (
                /* Skeleton loading cho media */
                <div className="flex flex-col gap-3 py-4 animate-pulse">
                  {mediaTab === "images" ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-grey rounded-xl"></div>
                      <div className="aspect-square bg-grey rounded-xl"></div>
                      <div className="aspect-square bg-grey rounded-xl"></div>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 bg-grey rounded-xl w-full"></div>
                      <div className="h-10 bg-grey rounded-xl w-full"></div>
                      <div className="h-10 bg-grey rounded-xl w-full"></div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {mediaTab === "images" &&
                    (mediaItems.length === 0 ? (
                      <p className="text-[11px] text-dark-grey/60 text-center py-6">
                        Không có hình ảnh/video nào.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {mediaItems.map((m) => (
                          <div
                            key={m._id}
                            onClick={() => {
                              if (m.type?.startsWith("image")) {
                                setFullScreenImage(m.message);
                              } else {
                                window.open(m.message, "_blank");
                              }
                            }}
                            className="aspect-square rounded-xl overflow-hidden border border-grey bg-grey group relative block cursor-zoom-in"
                          >
                            {m.type?.startsWith("image") ? (
                              <img
                                src={m.message}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-white gap-1">
                                <i className="fi fi-rr-video-camera text-[18px]"></i>
                                <span className="text-[8px] font-bold">
                                  VIDEO
                                </span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <i className="fi fi-rr-eye text-white text-[12px]"></i>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}

                  {mediaTab === "files" &&
                    (fileItems.length === 0 ? (
                      <p className="text-[11px] text-dark-grey/60 text-center py-6">
                        Không có tệp tin nào được chia sẻ.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {fileItems.map((m) => (
                          <div
                            key={m._id}
                            className="flex items-center justify-between p-2.5 bg-grey/50 hover:bg-grey border border-grey rounded-xl group transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                                <i className="fi fi-rr-file-pdf text-[14px]"></i>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-semibold text-black truncate max-w-[130px]">
                                  {m.fileName || "Tệp tin"}
                                </span>
                                <span className="text-[9px] text-dark-grey">
                                  PDF Document
                                </span>
                              </div>
                            </div>
                            <a
                              href={m.message}
                              download
                              className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-dark-grey hover:text-black border border-grey shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                            >
                              <i className="fi fi-rr-download text-[11px]"></i>
                            </a>
                          </div>
                        ))}
                      </div>
                    ))}

                  {mediaTab === "links" &&
                    (linkItems.length === 0 ? (
                      <p className="text-[11px] text-dark-grey/60 text-center py-6">
                        Không có liên kết nào.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {linkItems.map((link, idx) => (
                          <a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-grey/50 hover:bg-grey border border-grey rounded-xl transition-all group min-w-0 overflow-hidden"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                                <i className="fi fi-rr-link text-[13px]"></i>
                              </div>
                              <span className="text-[11px] text-blue-600 font-semibold truncate hover:underline flex-1">
                                {link}
                              </span>
                            </div>
                            <i className="fi fi-rr-arrow-up-right text-[10px] text-dark-grey/60 group-hover:text-black ml-1 flex-shrink-0"></i>
                          </a>
                        ))}
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NoChatSelected ────────────────────────────────────────────────────────────
export const NoChatSelected = () => (
  <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center relative overflow-hidden">
    {/* Decorative blobs */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl"></div>
    </div>

    <div className="max-w-[260px] flex flex-col items-center relative z-10">
      {/* Icon container */}
      <div className="w-20 h-20 rounded-2xl bg-purple/8 border border-purple/15 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/5">
        <i className="fi fi-rr-messages text-[32px] text-purple"></i>
      </div>

      <h3 className="text-[18px] font-bold text-black mb-2 tracking-tight">
        Your Messages
      </h3>
      <p className="text-dark-grey text-[12px] mb-7 leading-relaxed">
        Pick a conversation from the sidebar to start chatting.
      </p>

      {/* Feature pills */}
      <div className="flex flex-col gap-2 w-full">
        {[
          {
            icon: "fi-rr-shield-check",
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
            label: "Safe & Secure",
            sub: "End-to-end encrypted",
          },
          {
            icon: "fi-rr-bolt",
            iconBg: "bg-purple/10",
            iconColor: "text-purple",
            label: "Real-time",
            sub: "Instant message delivery",
          },
        ].map(({ icon, iconBg, iconColor, label, sub }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3 bg-grey/50 border border-grey rounded-xl text-left"
          >
            <div
              className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
            >
              <i className={`fi ${icon} ${iconColor} text-[14px]`}></i>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-black">{label}</p>
              <p className="text-[10px] text-dark-grey mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
