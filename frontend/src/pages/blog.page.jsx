import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { getDay } from "../common/date";
import BlogInteraction from "../components/blog-interaction.component";
import BlogPostCard from "../components/blog-post.component";
import BlogContent from "../components/blog-content.component";
import CommentsContainer, { fetchComments } from "../components/comments.component";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
// import bannerDefault from "../imgs/banner-default.png"; // Import ảnh banner mặc định

export const blogStructure = {
    title: '',
    des: '',
    conent: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: '',
}

export const BlogContext = createContext({});

const BlogPage = () => {

    let { blog_id } = useParams()

    const [blog, setBlog] = useState(blogStructure);
    const [similarBlogs, setSimilrBlogs] = useState(null);
    const [loading, setLoading] = useState(true);
    const [islikedByUser, setLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    const bannerDefault = "https://edublog.s3.ap-southeast-1.amazonaws.com/EEqYGj95LKSs4iZlzHeDi-1733239504104.jpeg";

    const handleBannerError = (e) => {
        e.target.src = bannerDefault; // Đổi sang ảnh mặc định nếu ảnh không tải được
    }

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt, isReport } = blog;

    let {
        userAuth: { username, access_token },
    } = useContext(UserContext);

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
            .then(async ({ data: { blog } }) => {

                blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded })
                setBlog(blog)

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
                    .then(({ data }) => {

                        setSimilrBlogs(data.blogs);
                    })

                setLoading(false); 
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            })
    }

    useEffect(() => {

        resetStates();

        fetchBlog();

    }, [blog_id])

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilrBlogs(null);
        setLoading(true);
        setLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader />
                    :
                    <BlogContext.Provider value={{ blog, setBlog, islikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>

                        <CommentsContainer />

                        <div className="max-w-[900px] center max-lg:px-[5vw]">

                            <hr className="border-grey" />
                            <div className="flex max-sm:flex-col justify-between my-8">
                                <div className="flex gap-5 items-start">
                                    <img src={profile_img} className="w-12 h-12 rounded-full" />

                                    <p className="capitalize">
                                        {fullname}
                                        <br />
                                        @
                                        <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                    </p>

                                </div>
                                <div className="flex items-center gap-1">
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">Đăng vào ngày {new Date(publishedAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                            <hr className="border-grey my-1" />

                            <div className="mt-12">
                                <h2>{title}</h2>
                                <hr className="border-grey my-2" />
                            </div>

                            {/* Ẩn banner khi không có giá trị banner hoặc sử dụng banner mặc định */}
                            <div className={`w-full aspect-video ${!banner || banner === bannerDefault ? 'hidden' : ''}`}>
                                <img
                                    src={banner || bannerDefault} // Dùng banner mặc định nếu không có banner từ blog
                                    className="w-full h-full object-cover"
                                    onError={handleBannerError} // Thêm onError để xử lý lỗi tải ảnh
                                    alt="Blog Banner"
                                />
                            </div>

                            {/* <BlogInteraction /> */}

                            <div className="my-12 font-gelasio blog-page-content">
                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div key={i} className="my-4 md:my-8">
                                            <BlogContent block={block} />
                                        </div>
                                    })
                                }
                            </div>

                            <BlogInteraction />

                            {
                                similarBlogs != null && similarBlogs.length ?
                                    <>
                                        <h1 className="text-2xl mt-14 mb-10 font-medium">Bài viết tương tự</h1>

                                        {
                                            similarBlogs.map((blog, i) => {

                                                let { author: { personal_info } } = blog;

                                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                                    <BlogPostCard content={blog} author={personal_info} />
                                                </AnimationWrapper>

                                            })
                                        }
                                    </>
                                    : " "
                            }

                        </div>
                    </BlogContext.Provider>
            }
        </AnimationWrapper>
    )
}

export default BlogPage;
