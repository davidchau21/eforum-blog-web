/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";
import { getTranslations } from "../../translations";

const NotificationCard = ({ data, index, notificationState }) => {
  const [isReplying, setReplying] = useState(false);

  const {
    seen,
    type,
    reply,
    createdAt,
    comment,
    replied_on_comment,
    user,
    user: {
      personal_info: { fullname, username, profile_img },
    },
    blog,
    _id: notification_id,
    metadata,
  } = data;

  const blog_id = blog?.blog_id || null;
  const blog_title = blog?.title || "Blog no longer available";

  const {
    userAuth: {
      username: author_username,
      profile_img: author_profile_img,
      access_token,
      language,
    },
  } = useContext(UserContext);

  const translations = getTranslations(language);

  const {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const handleReplyClick = () => {
    setReplying((prevVal) => !prevVal);
  };

  const handleDelete = (target_id, type, target) => {
    target.setAttribute("disabled", true);

    const endpoint =
      type === "comment" || type === "reply"
        ? "/comments/delete"
        : "/notifications/delete";

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + endpoint,
        { _id: target_id },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      )
      .then(() => {
        if (type === "comment") {
          results.splice(index, 1);
        } else if (type === "reply") {
          delete results[index].reply;
        } else {
          results.splice(index, 1);
        }

        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

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

  const handleNotificationClick = () => {
    if (!seen) {
      results[index].seen = true;
      setNotifications({ ...notifications, results });
    }
  };

  return (
    <div
      onClick={handleNotificationClick}
      className={
        "p-6 border-b border-grey transition-all duration-300 hover:bg-grey/30 " +
        (!seen ? "border-l-4 border-l-indigo-600 bg-indigo-500/5" : "")
      }
    >
      <div className="flex gap-5 mb-4">
        <div className="relative flex-none">
          <img src={profile_img} className="w-14 h-14 rounded-full border-2 border-grey shadow-sm" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-grey flex items-center justify-center">
             <i className={`fi ${
                type === "like" ? "fi-sr-heart text-rose-500" : 
                type === "comment" ? "fi-sr-comment-dots text-indigo-500" : 
                type === "reply" ? "fi-sr-reply text-emerald-500" : 
                "fi-sr-share text-amber-500"
             } text-[10px]`}></i>
          </div>
        </div>
        
        <div className="w-full">
          <h1 className="font-bold text-sm text-black flex items-center flex-wrap gap-1">
            <span className="hidden sm:inline-block">{fullname}</span>
            <Link
              to={`/user/${username}`}
              className="text-indigo-600 hover:underline font-black"
            >
              @{username}
            </Link>
            <span className="font-medium text-dark-grey">
              {type === "like"
                ? translations.likedYourBlog
                : type === "comment"
                  ? translations.commentedOn
                  : type === "reply"
                    ? translations.repliedOn
                    : type === "share"
                      ? translations.sharedYourBlog
                      : type === "message"
                        ? translations.sentYouAMessage || "sent you a message"
                        : ""}
            </span>
          </h1>

          {type === "message" ? (
            <div className="p-4 mt-3 rounded-2xl bg-grey border border-grey/50">
              <Link
                to={`/chat`}
                className="text-xs font-bold text-black hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                <i className="fi fi-rr-envelope-open"></i>
                {translations.viewInChat || "Click here to view in Chat"}
              </Link>
            </div>
          ) : type === "reply" ? (
            <div className="p-4 mt-3 rounded-2xl bg-grey border border-grey/50">
              <Link
                to={`/blog/${blog_id}`}
                className="text-xs font-bold text-indigo-600 hover:underline line-clamp-1 mb-2"
              >
                {`"${blog_title}"`}
              </Link>
              <p className="text-sm text-black/70 italic line-clamp-2">"{replied_on_comment.comment}"</p>
            </div>
          ) : blog_id ? (
            <Link
              to={`/blog/${blog_id}`}
              className="text-xs font-bold text-black/60 hover:text-indigo-600 hover:underline transition-colors mt-1 inline-block"
            >
              {`on "${blog_title}"`}
            </Link>
          ) : (
            <span className="text-xs font-bold text-rose-500">{blog_title}</span>
          )}

          {type === "share" && metadata ? (
            <div className="p-4 mt-3 rounded-2xl bg-grey border border-grey/50">
              <p className="text-xs font-bold text-black mb-2">
                {translations.sharedOn} <span className="text-indigo-600">{metadata.share_type}</span>
              </p>
              {metadata.share_img && (
                <img
                  src={metadata.share_img}
                  alt={translations.sharedContent}
                  className="w-full mt-2 rounded-xl border border-grey shadow-sm"
                />
              )}
              <a
                href={metadata.share_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 underline mt-3 inline-block hover:opacity-80"
              >
                {translations.viewSharedPost}
              </a>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>

      {type !== "like" && type !== "share" && type !== "message" && comment ? (
        <div className="ml-14 pl-5 mb-4 border-l-2 border-grey">
          <p className="font-gelasio text-lg text-black leading-relaxed">
            {comment.comment}
          </p>
        </div>
      ) : (
        ""
      )}

      <div className="ml-14 pl-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-dark-grey uppercase tracking-wider">
                {getDisplayDate(createdAt)}
            </span>
            
            <div className="flex items-center gap-4">
                {type !== "like" && type !== "share" && type !== "message" ? (
                <>
                    {!reply && (
                    <button
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-500/10 px-2 py-1 rounded-md transition-all"
                        onClick={handleReplyClick}
                    >
                        {translations.reply}
                    </button>
                    )}
                    <button
                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all"
                    onClick={(e) => handleDelete(comment._id, "comment", e.target)}
                    >
                    {translations.delete}
                    </button>
                </>
                ) : type === "share" || type === "like" || type === "message" ? (
                <button
                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all"
                    onClick={(e) => handleDelete(notification_id, type, e.target)}
                >
                    {translations.delete}
                </button>
                ) : (
                ""
                )}
            </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-6 ml-14 pl-5">
          <NotificationCommentField
            _id={blog._id}
            blog_author={user}
            index={index}
            replyingTo={comment?._id}
            setReplying={setReplying}
            notification_id={notification_id}
            notificationData={notificationState}
          />
        </div>
      )}

      {reply && (
        <div className="ml-14 pl-5 mt-6 border-l-2 border-indigo-600/30">
          <div className="bg-grey/50 p-5 rounded-2xl border border-grey">
            <div className="flex gap-3 mb-4">
                <img src={author_profile_img} className="w-10 h-10 rounded-full border-2 border-white dark:border-grey shadow-sm" />
                <div className="flex flex-col justify-center">
                    <h1 className="text-xs font-bold text-black flex items-center gap-1">
                        <Link
                        to={`/user/${author_username}`}
                        className="text-indigo-600 hover:underline"
                        >
                        @{author_username}
                        </Link>
                        <span className="font-medium text-dark-grey">{translations.repliedTo}</span>
                        <Link
                        to={`/user/${username}`}
                        className="text-indigo-600 hover:underline"
                        >
                        @{username}
                        </Link>
                    </h1>
                </div>
            </div>

            <p className="font-gelasio text-lg text-black/80 leading-relaxed italic mb-4">"{reply.comment}"</p>

            <button
                className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 px-2 py-1 rounded-md transition-all"
                onClick={(e) => handleDelete(reply._id, "reply", e.target)}
            >
                {translations.delete}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
