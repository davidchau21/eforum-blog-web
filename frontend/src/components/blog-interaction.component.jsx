import { useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { FacebookShareButton, LinkedinShareButton, RedditShareButton, TelegramShareButton, TwitterShareButton } from "react-share";

const BlogInteraction = () => {
    const [showShareOptions, setShowShareOptions] = useState(false);

    let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments, total_share }, author: { personal_info: { username: author_username } } }, setBlog, islikedByUser, setLikedByUser, setCommentsWrapper } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);

    let urlShare = window.location.href;

    useEffect(() => {

        if (access_token) {
            // make request to server to get like information
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data: { result } }) => {
                    setLikedByUser(Boolean(result))
                })
                .catch(err => {
                    console.log(err);
                })
        }

    }, [])

    const handleLike = () => {

        if (access_token) {
            // like the blog
            setLikedByUser(preVal => !preVal);

            !islikedByUser ? total_likes++ : total_likes--;

            setBlog({ ...blog, activity: { ...activity, total_likes } })

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, islikedByUser }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    console.log(data);
                })
                .catch(err => {
                    console.log(err);
                })

        }
        else {
            // not logged in
            toast.error("please login to like this blog")
        }

    }

    const handleShare = (shareType) => {
        if (!access_token) {
            toast.error("Please login to share this blog");
            return;
        }

        const payload = {
            blog_id: _id,
            share_type: shareType,
            share_url: urlShare,
            share_img: blog.banner || "",
        };

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/share-blog", payload, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {
                if (data.shared_by_user) {
                    setBlog(prevBlog => ({
                        ...prevBlog,
                        activity: {
                            ...prevBlog.activity,
                            total_share: prevBlog.activity.total_share + 1,
                        }
                    }));
                    toast.success("Blog shared successfully!");
                }
            })
            .catch(err => {
                console.error(err);
                toast.error("Failed to share the blog");
            });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showShareOptions && !event.target.closest('.share-options')) {
                setShowShareOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareOptions]);

    return (
        <>
            <Toaster />
            
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + (islikedByUser ? "bg-red/20 text-red" : "bg-grey/80")}
                    >
                        <i className={"fi " + (islikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_likes}</p>

                    <button
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                    >
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-dark-grey">{total_comments}</p>

                    <div className="relative">
                        <button
                            onClick={() => setShowShareOptions(prev => !prev)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                        >
                            <i className="fi fi-rr-share"></i>
                        </button>
                        {showShareOptions && (
                            <div className="absolute right-0 bg-white border rounded shadow-lg p-4 flex flex-col gap-2 share-options">
                                <TwitterShareButton
                                    url={urlShare}
                                    title={title}
                                    hashtags={["blog", title, "efurum"]}
                                    onClick={() => {
                                        handleShare("twitter");
                                        setShowShareOptions(false);
                                    }}>
                                    <i className="fi fi-brands-twitter text-xl hover:text-twitter"></i>
                                </TwitterShareButton>
                                <FacebookShareButton
                                    url={urlShare}
                                    hashtag="#blog"
                                    onClick={() => {
                                        handleShare("facebook");
                                        setShowShareOptions(false);
                                    }}>
                                    <i className="fi fi-brands-facebook text-xl hover:text-facebook"></i>
                                </FacebookShareButton>
                                <LinkedinShareButton
                                    url={urlShare}
                                    title={title}
                                    summary="blog"
                                    onClick={() => {
                                        handleShare("linkedin");
                                        setShowShareOptions(false);
                                    }}>
                                    <i className="fi fi-brands-linkedin text-xl hover:text-linkedin"></i>
                                </LinkedinShareButton>
                                <RedditShareButton
                                    url={urlShare}
                                    title={title}
                                    onClick={() => {
                                        handleShare("reddit");
                                        setShowShareOptions(false);
                                    }}>
                                    <i className="fi fi-brands-reddit text-xl hover:text-reddit"></i>
                                </RedditShareButton>
                                <TelegramShareButton
                                    url={urlShare}
                                    title={title}
                                    onClick={() => {
                                        handleShare("telegram");
                                        setShowShareOptions(false);
                                    }}>
                                    <i className="fi fi-brands-telegram text-xl hover:text-telegram"></i>
                                </TelegramShareButton>
                            </div>
                        )}
                    </div>
                    <p className="text-xl text-dark-grey">{total_share}</p>
                </div>

                <div className="flex gap-6 items-center">
                    {
                        username == author_username ?
                            <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link> : ""
                    }
                    <div className="relative group">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(urlShare);
                                toast.success("Link copied to clipboard!");
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 group-hover:bg-blue-500"
                        >
                            <i className="fi fi-rr-link"></i>
                        </button>
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Sao chép liên kết
                        </span>
                    </div>
                </div>
            </div>

            <hr className="border-grey my-2" />
        </>
    )
}

export default BlogInteraction;
