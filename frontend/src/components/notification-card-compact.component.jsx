import { Link } from "react-router-dom";
import { getTranslations } from "../../translations";
import { useContext } from "react";
import { UserContext } from "../App";

const NotificationCardCompact = ({ data, onClick }) => {
  const {
    seen,
    type,
    createdAt,
    user: {
      personal_info: { fullname, username, profile_img },
    },
    blog,
  } = data;

  const {
    userAuth: { language },
  } = useContext(UserContext);
  const translations = getTranslations(language);

  const blog_id = blog?.blog_id || null;
  const blog_title = blog?.title || "";

  const getDisplayDate = (date) => {
    const now = new Date();
    const publishedDate = new Date(date);
    const diffTime = Math.abs(now - publishedDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (now.toDateString() === publishedDate.toDateString()) {
      if (diffMinutes === 0) return translations.justNow;
      if (diffHours < 1) return `${diffMinutes}${translations.minutesAgo[0]}`; // Short version e.g., 5m
      return `${diffHours}h`;
    }
    return publishedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  };

  const getActionText = () => {
    switch (type) {
      case "like":
        return translations.likedYourBlog;
      case "comment":
        return translations.commentedOn;
      case "reply":
        return translations.repliedOn;
      case "share":
        return translations.sharedYourBlog;
      case "message":
        return translations.sentYouAMessage || "sent a message";
      default:
        return "";
    }
  };

  return (
    <Link
      to={type === "message" ? "/chat" : `/blog/${blog_id}`}
      onClick={onClick}
      className={`flex gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-subtle last:border-0 ${!seen ? "bg-emerald-500/5" : ""}`}
    >
      <div className="relative flex-none">
        <img
          src={profile_img}
          className="w-12 h-12 rounded-full object-cover"
          alt={username}
        />
        {!seen && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm" />
        )}
      </div>

      <div className="flex flex-col gap-1 overflow-hidden">
        <p className="text-sm text-title leading-snug">
          <span className="font-bold">{fullname}</span>
          <span className="text-body ml-1">{getActionText()}</span>
        </p>

        {blog_title && (
          <p className="text-xs text-body font-medium truncate italic">
            "{blog_title}"
          </p>
        )}

        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
          {getDisplayDate(createdAt)}
        </p>
      </div>
    </Link>
  );
};

export default NotificationCardCompact;
