/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {
    
    let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

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
            return publishedDate.toLocaleDateString();
        }
    };

    return (
        <Link to={`/blog/${id}`} className="flex gap-5 mb-8">
            {/* <h1 className="blog-index">{ index < 10 ? "0" + (index + 1) : index}</h1> */}

            <div>
                <div className="flex gap-2 items-center mb-2">
                    <img src={profile_img} className="w-6 h-6 rounded-full" />
                    {/* <p className="line-clamp-1">{fullname} @{username}</p> */}
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap"> @{username} </p>
                    <p className="min-w-fit">{ getDisplayDate(publishedAt) }</p>
                </div>

                <h1 className="blog-title mb-4">{title}</h1>
            </div>
        </Link>
    )
}

export default MinimalBlogPost;