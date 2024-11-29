import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useContext, useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import SupportChat from "../components/support-chat.component";
import { getTranslations } from "../../translations";
import { UserContext } from "../App";

const HomePage = () => {
    const [blogs, setBlogs] = useState(null);
    const [trendingBlogs, setTrendingBlogs] = useState(null);
    const [adminBlogs, setAdminBlogs] = useState(null);
    const [pageState, setPageState] = useState("home");
    const { userAuth } = useContext(UserContext);
    const { language } = userAuth;
    const translations = getTranslations(language);
    const [tags, setTags] = useState([]);
    let { userAuth: { access_token } } = useContext(UserContext);
    const [adminAlert, setAdminAlert] = useState(null);

    useEffect(() => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/tags?limit=0")
            .then(response => {
                const fetchedTags = response.data.list || [];
                setTags(fetchedTags);
            })
            .catch(error => console.error("Failed to fetch tags:", error));
    }, []);


    const fetchAdminBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/admin-blogs")
            .then(({ data }) => setAdminBlogs(data.blogs))
            .catch(console.log);
    };

    const fetchLatestBlogs = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count",
                });
                setBlogs(formattedData);
            })
            .catch(console.log);
    };

    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
                tag: pageState,
                page,
            })
            .then(async ({ data }) => {
                const formattedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState },
                });
                setBlogs(formattedData);
            })
            .catch(console.log);
    };

    const fetchTrendingBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => setTrendingBlogs(data.blogs))
            .catch(console.log);
    };

    const loadBlogByCategory = (e) => {
        const category = e.target.innerText;
        setBlogs(null);
        setPageState(pageState === category ? "home" : category);
    };

    const loadBlogByTag = (e) => {
        const tag = e.target.value;
        setBlogs(null);
        setPageState(pageState === tag ? "home" : tag);
    };

    useEffect(() => {
        activeTabRef.current.click();
        if (pageState === "home") {
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 });
        }
        if (!trendingBlogs) fetchTrendingBlogs();
        if (!adminBlogs) fetchAdminBlogs();
    }, [pageState]);

    useEffect(() => {
        fetchAlert();
    }, []);

    // fecthing data alert from admin
    const fetchAlert = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/alert", {
            headers: { 'Authorization': `Bearer ${access_token}` },
        })
            .then(({ data }) => {
                if (data.list && data.list.length > 0) {
                    setAdminAlert(data.list[0].message); // Cập nhật thông báo từ API
                    setTimeout(() => {
                        setAdminAlert(null); // Tự động tắt thông báo sau 5 giây
                    }, 5000);
                }
            })
            .catch(console.log);
    };

    return (
        <AnimationWrapper>
            <section className="w-full min-h-screen flex flex-col lg:flex-row gap-6 py-8 px-4">
                {/*  Hiển thị thông báo nếu có */}
                {adminAlert && (
                    <div
                        role="alert"
                        className="fixed top-6 left-1/2 transform -translate-x-1/2 px-6 py-4 bg-yellow-100 border-l-4 border-yellow-500 shadow-lg rounded-md flex items-center justify-between z-50 transition-opacity duration-500 ease-in-out"
                        style={{ opacity: 1 }}
                        id="alert-box"
                    >
                        <div className="flex items-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-yellow-500 mr-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                            <span className="text-yellow-700 font-medium">{adminAlert}</span>
                        </div>
                        <button
                            className="text-yellow-700 hover:text-yellow-900 "
                            onClick={() => setAdminAlert(null)}
                        >
                            ✖
                        </button>
                    </div>
                )}

                {/* Admin Blogs */}
                <div className="hidden lg:block lg:w-1/4">
                    <h1 className="font-semibold text-lg mb-4 text-black">
                        {translations.adminPosts}
                    </h1>
                    {adminBlogs == null ? (
                        <Loader />
                    ) : adminBlogs.length ? (
                        <div className="space-y-4">
                            {adminBlogs.map((blog, i) => (
                                <AnimationWrapper
                                    transition={{
                                        duration: 1,
                                        delay: i * 0.1,
                                    }}
                                    key={i}
                                >
                                    <MinimalBlogPost blog={blog} />
                                </AnimationWrapper>
                            ))}
                        </div>
                    ) : (
                        <NoDataMessage message="No admin posts available" />
                    )}
                </div>

                {/* Latest Blogs */}
                <div className="w-full lg:w-1/2">
                    <InPageNavigation
                        routes={[pageState, "trendings", "news"]}
                        defaultHidden={["trendings", "news"]}
                    >
                        <div>
                        {blogs == null ? (
                        <Loader />
                        ) : blogs?.results?.length ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {blogs.results.map((blog, i) => (
                                    <AnimationWrapper
                                        transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                        }}
                                        key={i}
                                    >
                                        <BlogPostCard
                                            content={blog}
                                            author={blog.author.personal_info}
                                        />
                                    </AnimationWrapper>
                                ))}
                            </div>
                        ) : (
                            <NoDataMessage message="No blogs published" />
                        )}

                        {blogs?.results?.length > 0 ? (
                            <>
                                <LoadMoreDataBtn
                                    state={blogs}
                                    fetchDataFun={pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory}
                                />
                                <p className="text-dark-grey px-3 rounded-md flex justify-center items-center mt-8">
                                    {/* {translations.pageEnd} */}
                                </p>
                            </>
                        ) : null}
                        </div>
                        <div>
                            {trendingBlogs == null ? (
                        <Loader />
                            ) : trendingBlogs.length ? (
                                trendingBlogs.map((blog, i) => (
                                    <AnimationWrapper
                                        transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                        }}
                                        key={i}
                                    >
                                        <MinimalBlogPost blog={blog} />
                                    </AnimationWrapper>
                                ))
                            ) : (
                                <NoDataMessage
                                    message={translations.noTrendingBlogs}
                                />
                            )}
                        </div>
                        <div>
                            {adminBlogs == null ? (
                                <Loader />
                            ) : adminBlogs.length ? (
                                adminBlogs.map((blog, i) => (
                                    <AnimationWrapper
                                        transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                        }}
                                        key={i}
                                    >
                                        <MinimalBlogPost blog={blog} />
                                    </AnimationWrapper>
                                ))
                            ) : (
                                <NoDataMessage message="No admin posts available" />
                            )}
                        </div>
                    </InPageNavigation>
                </div>

                {/* Filters */}
                <div className="hidden lg:block lg:w-1/4">
                    <div className="space-y-8">
                        <div>
                            <h1 className="font-semibold text-black text-lg mb-4">
                                {translations.subjects}
                            </h1>
                            <div className="flex flex-wrap gap-2">
                                <select
                                    className="select select-bordered w-full text-black max-w-2xl mb-2 bg-white"
                                    defaultValue=""
                                    onChange={(e) => {
                                        loadBlogByTag(e);
                                        if (e.target.value === "All Subjects") {
                                            setPageState("home");
                                        }
                                    }}


                                >
                                    <option>
                                        All Subjects
                                    </option>
                                    {tags.map((tag, index) => (
                                        <option key={index} value={tag.tag_name}>
                                            {tag.tag_name}
                                        </option>
                                    ))}
                                </select>
                                {tags.slice(0, 10).map((tag, i) => (
                                    <button
                                        key={i}
                                        onClick={(e) => loadBlogByCategory(e, tag.tag_name)}
                                        className={`px-4 py-2 rounded-full border ${pageState === tag.tag_name
                                            ? "bg-black text-white"
                                            : "bg-white text-black border-gray-300"
                                            }`}
                                    >
                                        {tag.tag_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h1 className="font-semibold text-lg mb-4 text-black">
                                {translations.trending}
                                <i className="fi fi-rr-arrow-trend-up ml-2"></i>
                            </h1>
                            {trendingBlogs == null ? (
                                <Loader />
                            ) : trendingBlogs.length ? (
                                trendingBlogs.map((blog, i) => (
                                    <AnimationWrapper
                                        transition={{
                                            duration: 1,
                                            delay: i * 0.1,
                                        }}
                                        key={i}
                                    >
                                        <MinimalBlogPost blog={blog} />
                                    </AnimationWrapper>
                                ))
                            ) : (
                                <NoDataMessage
                                    message={translations.noTrendingBlogs}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <SupportChat />
            </section>
        </AnimationWrapper>
    );
};

export default HomePage;
