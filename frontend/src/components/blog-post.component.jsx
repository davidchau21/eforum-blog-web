/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import bannerDefault from "../imgs/banner-default.png";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {
    let { publishedAt, tags, title, des, banner, activity: { total_likes, total_comments, total_share }, blog_id: id } = content;
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
                    <p className="text-xs">{new Date(publishedAt).toLocaleDateString('en-GB')}</p>
                </div>
            </div>

            {/* Nội dung bài viết */}
            <div className="flex-1">
                <h1 className="blog-title text-lg font-bold">{title}</h1>
                <p className={`my-2 text-sm text-grey-dark ${isDefaultBanner ? "line-clamp-1" : "line-clamp-2"}`}>
                    {des}
                </p>

                {/* Banner */}
                {!isDefaultBanner && (
                    <div className="w-full h-full bg-grey mb-3">
                        <img
                            src={banner || bannerDefault}
                            className="w-full h-full object-cover rounded-lg"
                            onError={handleBannerError}
                        />
                    </div>
                )}

                {/* Tags và tương tác */}
                <div className="border-t border-b border-gray-300 my-4">
                    <div className="flex items-center justify-between mt-3 mb-2">
                        {/* Tags */}
                        <span className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
                            {
                                tags.slice(0, window.innerWidth < 640 ? 3 : 5).map((tag, index) => (
                                    <span key={index} className="mr-1">#{tag} </span>
                                ))
                            }
                        </span>

                        {/* Lượt thích, Comment, Share */}
                        <div className="flex items-center gap-4 text-gray-500">
                            {/* Lượt thích */}
                            <div className="flex items-center gap-1">
                                <i className="fi fi-rr-heart text-xl text-rose-600"></i>
                                <span className="text-sm">{total_likes}</span>
                            </div>

                            {/* Comment */}
                            <div className="flex items-center gap-1">
                                <i className="fi fi-rr-comment text-xl text-blue-500"></i>
                                <span className="text-sm">{total_comments}</span> {/* Dùng số thực tế từ dữ liệu */}
                            </div>

                            {/* Share */}
                            <div className="flex items-center gap-1">
                                <i className="fi fi-rr-share text-xl text-green-500"></i>
                                <span className="text-sm">{total_share}</span> {/* Dùng số thực tế từ dữ liệu */}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Link>
    );
};

export default BlogPostCard;
