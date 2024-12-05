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

    const isDefaultBanner = banner === "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

    return (
        <div className="flex flex-col border border-grey shadow-lg p-4 rounded-lg mb-4">
            {/* Tác giả và ngày đăng */}
            <div className="flex gap-3 items-center mb-3">
                <Link to={`/user/${username}`} className="flex items-center gap-3">
                    <img src={profile_img} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex flex-col">
                        <p className="text-sm font-medium line-clamp-1">
                            {fullname} <span>@{username}</span>
                        </p>
                        <p className="text-xs">{new Date(publishedAt).toLocaleDateString('en-GB')}</p>
                    </div>
                </Link>
            </div>

            {/* Nội dung bài viết */}
            <div className="flex-1">
                {/* Banner */}
                {!isDefaultBanner && (
                    <Link to={`/blog/${id}`} className="block w-full h-full bg-grey mb-3">
                        <img
                            src={banner || bannerDefault}
                            className="w-full h-full object-cover rounded-lg"
                            onError={handleBannerError}
                        />
                    </Link>
                )}

                {/* Title và mô tả */}
                <Link to={`/blog/${id}`} className="block">
                    <h1 className="blog-title text-lg font-bold">{title}</h1>
                    <p className={`my-2 text-sm text-grey-dark ${isDefaultBanner ? "line-clamp-1" : "line-clamp-2"}`}>
                        {des}
                    </p>
                </Link>
                <Link to={`/blog/${id}`} className="block">
                    <div className="border-t border-b border-gray-300 my-4">
                        <div className="flex items-center justify-between mt-3 mb-2">

                            <span className="bg-gray-200 text-gray-600 text-xs py-1 px-3 rounded-full">
                                {tags.slice(0, window.innerWidth < 640 ? 3 : 5).map((tag, index) => (
                                    <span key={index} className="mr-1">#{tag} </span>
                                ))}
                            </span>

                            <div className="flex items-center gap-4 text-gray-500">

                                <div className="flex items-center gap-1">
                                    <i className="fi fi-rr-heart text-xl text-rose-600"></i>
                                    <span className="text-sm">{total_likes}</span>
                                </div>


                                <div className="flex items-center gap-1">
                                    <i className="fi fi-rr-comment text-xl text-blue-500"></i>
                                    <span className="text-sm">{total_comments}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <i className="fi fi-rr-share text-xl text-green-500"></i>
                                    <span className="text-sm">{total_share}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default BlogPostCard;
