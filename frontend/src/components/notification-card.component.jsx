import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-comment-field.component";
import { UserContext } from "../App";
import axios from "axios";
import { getTranslations } from "../../translations";

const NotificationCard = ({ data, index, notificationState }) => {
    const [isReplying, setReplying] = useState(false);

    const {
        seen, type, reply, createdAt, comment, replied_on_comment, user,
        user: { personal_info: { fullname, username, profile_img } },
        blog,
        _id: notification_id, metadata
    } = data;

    const blog_id = blog?.blog_id || null;
    const blog_title = blog?.title || "Blog no longer available";

    const {
        userAuth: { username: author_username, profile_img: author_profile_img, access_token, language },
    } = useContext(UserContext);

    const translations = getTranslations(language);

    const { notifications, notifications: { results, totalDocs }, setNotifications } = notificationState;

    const handleReplyClick = () => {
        setReplying(prevVal => !prevVal);
    };

    const handleDelete = (comment_id, type, target) => {
        target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id: comment_id }, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        })
        .then(() => {
            if (type === 'comment') {
                results.splice(index, 1);
            } else if (type === 'reply') {
                delete results[index].reply;
            } else if (type === 'share') {
                results.splice(index, 1);
            }

            target.removeAttribute("disabled");
            setNotifications({
                ...notifications,
                results,
                totalDocs: totalDocs - 1,
                deleteDocCount: notifications.deleteDocCount + 1
            });
        })
        .catch(err => {
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
            return publishedDate.toLocaleDateString('en-GB');
        }
    };

    return (
        <div className={"p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "")}>
            <div className="flex gap-5 mb-3">
                <img src={profile_img} className="w-14 h-14 flex-none rounded-full" />
                <div className="w-full">
                    <h1 className="font-medium text-xl text-dark-grey">
                        <span className="lg:inline-block hidden capitalize">{fullname}</span>
                        <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                        <span className="font-normal">
                            {type === 'like' ? translations.likedYourBlog :
                             type === 'comment' ? translations.commentedOn :
                             type === 'reply' ? translations.repliedOn :
                             type === 'share' ? translations.sharedYourBlog : ""}
                        </span>
                    </h1>

                    {type === "reply" ? 
                        <div className="p-4 mt-4 rounded-md bg-grey">
                            <Link to={`/blog/${blog_id}`} className="font-medium text-dark-grey hover:underline line-clamp-1">
                                {`"${blog_title}"`}
                            </Link>
                            <p>{replied_on_comment.comment}</p>
                        </div> :
                        blog_id ? (
                            <Link to={`/blog/${blog_id}`} className="font-medium text-dark-grey hover:underline line-clamp-1">
                                {`"${blog_title}"`}
                            </Link>
                        ) : (
                            <span className="font-medium text-red-500">{blog_title}</span>
                        )
                    }

                    {type === "share" && metadata ? (
                        <div className="p-4 mt-4 rounded-md bg-light-grey">
                            <p>{translations.sharedOn} {metadata.share_platform}</p>
                            {metadata.share_img && (
                                <img
                                    src={metadata.share_img}
                                    alt={translations.sharedContent}
                                    className="w-full mt-2 rounded-md"
                                />
                            )}
                            <a
                                href={metadata.share_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline mt-2 inline-block"
                            >
                                {translations.viewSharedPost}
                            </a>
                        </div>
                    ) : ""}
                </div>
            </div>

            {type !== 'like' && type !== 'share' && comment ? 
                <p className="ml-14 pl-5 font-gelasio text-xl my-5">{comment.comment}</p> : ""
            }

            <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
                <p>{getDisplayDate(createdAt)}</p>
                {type !== 'like' && type !== 'share' ? (
                    <>
                        {!reply && <button className="underline hover:text-black" onClick={handleReplyClick}>{translations.reply}</button>}
                        <button className="underline hover:text-black" onClick={(e) => handleDelete(comment._id, "comment", e.target)}>{translations.delete}</button>
                    </>
                ) : type === 'share' && type === 'like' ? (
                    <button className="underline hover:text-black" onClick={(e) => handleDelete(notification_id, "share", e.target)}>{translations.delete}</button>
                ) : ""}
            </div>

            {isReplying && (
                <div className="mt-8">
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
                <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
                    <div className="flex gap-3 mb-3">
                        <img src={author_profile_img} className="w-8 h-8 rounded-full" />
                        <div>
                            <h1 className="font-medium text-xl text-dark-grey">
                                <Link to={`/user/${author_username}`} className="mx-1 text-black underline">@{author_username}</Link>
                                <span className="font-normal">{translations.repliedTo}</span>
                                <Link to={`/user/${username}`} className="mx-1 text-black underline">@{username}</Link>
                            </h1>
                        </div>
                    </div>

                    <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>

                    <button className="underline hover:text-black ml-14 mt-2" onClick={(e) => handleDelete(reply._id, "reply", e.target)}>{translations.delete}</button>
                </div>
            )}
        </div>
    );
};

export default NotificationCard;
