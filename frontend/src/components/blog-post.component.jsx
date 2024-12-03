/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import bannerDefault from "../imgs/banner-default.png";
import BlogInteraction from "../components/blog-interaction.component";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {
    let { publishedAt, tags, title, des, banner, activity: { total_likes }, blog_id: id } = content;
    let { fullname, profile_img, username } = author;

    const handleBannerError = (e) => {
        e.target.src = bannerDefault; 
    };

    const isDefaultBanner = banner === bannerDefault;

    return ( 
        <Link to={`/blog/${id}`} className="flex flex-col border border-grey shadow-lg p-4 rounded-lg mb-4">
            {/* Tác giả và ngày đăng */}
            <div className="flex gap-3 items-center mb-3">
                <img src={profile_img} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex flex-col">
                    <p className="text-sm font-medium line-clamp-1">{fullname} <span>@{username}</span></p>
                    <p className="text-xs">{getDay(publishedAt)}</p>
                </div>
            </div>

            {/* Banner */}
            {!isDefaultBanner && (
                <div className="w-full h-56 bg-grey mb-3">
                    <img 
                        src={banner || bannerDefault} 
                        className="w-full h-full object-cover rounded-lg" 
                        onError={handleBannerError} 
                    />
                </div>
            )}

            {/* Nội dung bài viết */}
            <div className="flex-1">
                <h1 className="blog-title text-lg font-bold">{title}</h1>
                <p className={`my-2 text-sm text-grey-dark ${isDefaultBanner ? "line-clamp-1" : "line-clamp-2"}`}>
                    {des}
                </p>

                {/* Tags và lượt thích */}
                <div className="flex items-center gap-4 mt-3">
                    <span className="btn-light py-1 px-4 text-sm bg-light-grey rounded-full">{tags[0]}</span>
                    <span className="ml-3 flex items-center gap-2 text-dark-grey">
                        <i className="fi fi-rr-heart text-lg"></i>
                        {total_likes}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default BlogPostCard;
