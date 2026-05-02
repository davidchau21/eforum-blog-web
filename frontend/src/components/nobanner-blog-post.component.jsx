/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const MinimalBlogPost = ({ blog, index }) => {
    
    let { title, blog_id: id, author, publishedAt } = blog || {};
    let { personal_info: { username, profile_img } = {} } = author || {};

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
            return publishedDate.toLocaleDateString('en-GB');
        }
    };

    return (
        <Link to={`/blog/${id}`} className="group flex gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all duration-200 mb-2">
            {index !== undefined && (
                <span className="text-2xl font-bold text-slate-200 dark:text-slate-800/40 group-hover:text-indigo-500 transition-colors duration-200 min-w-[2.5rem] leading-tight pt-0.5 font-jakarta">
                    {index < 9 ? "0" + (index + 1) : index + 1}
                </span>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex gap-2 items-center mb-1.5">
                    <img src={profile_img} className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 dark:ring-white/10" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">@{username}</p>
                    <span className="text-xs text-slate-300 dark:text-slate-600 ml-auto flex-shrink-0">• {getDisplayDate(publishedAt)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 line-clamp-2 leading-snug font-jakarta">
                    {title}
                </p>
            </div>
        </Link>
    )
}

export default MinimalBlogPost;