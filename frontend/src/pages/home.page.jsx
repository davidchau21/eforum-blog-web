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
    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlog] = useState(null);
    let [adminBlogs, setAdminBlogs] = useState(null); // Thêm state cho bài viết admin
    let [pageState, setPageState] = useState("home");
    const { userAuth } = useContext(UserContext);
    const { language } = userAuth;
    const translations = getTranslations(language);

    let categories = [
        "programming",
        "hollywood",
        "film making",
        "social media",
        "cooking",
        "tech",
        "finance",
        "travel",
    ];

    const fetchAdminBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/admin-blogs")
            .then(({ data }) => {
                setAdminBlogs(data.blogs);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchLatestBlogs = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then(async ({ data }) => {
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count",
                });

                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
                tag: pageState,
                page,
            })
            .then(async ({ data }) => {
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState },
                });

                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchTrendingBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlog(data.blogs);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();

        setBlog(null);

        if (pageState == category) {
            setPageState("home");
            return;
        }

        setPageState(category);
    };

    useEffect(() => {
        activeTabRef.current.click();

        if (pageState == "home") {
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 });
        }

        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

        if (!adminBlogs) {
            fetchAdminBlogs();
        }
    }, [pageState]);

    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-4">
                {/* Admin blog*/}
                <div className="min-w-[40%] lg:min-w-[200px] max-w-min border-r border-grey pr-8 pt-3 max-md:hidden">
                    <h1 className="font-medium text-xl mb-8">
                        {translations.adminPosts}
                    </h1>
                    {adminBlogs == null ? (
                        <Loader />
                    ) : adminBlogs.length ? (
                        <div className="flex flex-col gap-6">
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

                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation
                        routes={[pageState, "trending blogs"]}
                        defaultHidden={["trending blogs"]}
                    >
                        <>
                            {blogs == null ? (
                                <Loader />
                            ) : blogs.results.length ? (
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

                            <LoadMoreDataBtn
                                state={blogs}
                                fetchDataFun={
                                    pageState == "home"
                                        ? fetchLatestBlogs
                                        : fetchBlogsByCategory
                                }
                            />
                        </>

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
                                    <MinimalBlogPost blog={blog} index={i} />
                                </AnimationWrapper>
                            ))
                        ) : (
                            <NoDataMessage
                                message={translations.noTrendingBlogs}
                            />
                        )}
                    </InPageNavigation>
                </div>

                {/* filters and trending blogs */}
                <div className="min-w-[40%] lg:min-w-[200px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                {translations.subjects}
                            </h1>

                            <div className="flex gap-3 flex-wrap">
                                {categories.map((category, i) => (
                                    <button
                                        onClick={loadBlogByCategory}
                                        className={
                                            "tag " +
                                            (pageState == category
                                                ? " bg-black text-white "
                                                : " ")
                                        }
                                        key={i}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8">
                                {translations.trending}
                                <i className="fi fi-rr-arrow-trend-up"></i>
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
