import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { UserContext, ThemeContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import { TrendingTopicsSkeleton, TopContributorsSkeleton } from "../components/skeleton.component";

const FriendListItem = ({ user, loggedInUsername, access_token }) => {
    const { personal_info: { fullname, username, profile_img, bio } } = user;
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (access_token && username !== loggedInUsername) {
            axios
                .post(
                    import.meta.env.VITE_SERVER_DOMAIN + "/users/get-following-status",
                    { target_id: user._id },
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                        },
                    }
                )
                .then(({ data }) => {
                    setIsFollowing(data.followed_status);
                })
                .catch((err) => console.log(err));
        }
    }, [access_token, username, loggedInUsername, user._id]);

    const handleFollow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!access_token) {
            return toast.error("Vui lòng đăng nhập để theo dõi");
        }
        setLoading(true);
        axios
            .post(
                import.meta.env.VITE_SERVER_DOMAIN + "/users/follow-user",
                { target_id: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            )
            .then(({ data }) => {
                setIsFollowing(data.followed_status);
                setLoading(false);
                toast.success(data.followed_status ? `Đã theo dõi @${username}` : `Đã bỏ theo dõi @${username}`);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    return (
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors duration-200">
            <Link to={`/user/${username}`} className="flex items-center gap-3.5 flex-1 min-w-0">
                <img 
                    src={profile_img} 
                    alt={fullname} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-200/20 shrink-0"
                />
                <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-1.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-[13px] hover:text-indigo-600 transition-colors truncate">
                            {fullname}
                        </p>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-light truncate">
                            @{username}
                        </span>
                    </div>
                    {bio && (
                        <p className="text-slate-550 dark:text-slate-400 text-xs truncate max-w-md font-light leading-normal">
                            {bio}
                        </p>
                    )}
                </div>
            </Link>

            <div className="shrink-0">
                {username !== loggedInUsername ? (
                    <button
                        onClick={handleFollow}
                        disabled={loading}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                            isFollowing
                                ? "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 border border-slate-200/20 dark:border-zinc-700/50"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        }`}
                    >
                        {loading ? "..." : isFollowing ? "Đang theo dõi" : "Theo dõi"}
                    </button>
                ) : (
                    <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-zinc-800/20 text-slate-400 dark:text-slate-600 rounded-full text-xs font-semibold border border-dashed border-slate-200 dark:border-zinc-800/80">
                        Bạn
                    </div>
                )}
            </div>
        </div>
    );
};

const FriendsPage = () => {
    const { theme } = useContext(ThemeContext);
    const { userAuth } = useContext(UserContext);
    const language = userAuth?.language || "vi";
    const access_token = userAuth?.access_token;
    const loggedInUsername = userAuth?.username;
    const isVi = language === "vi";

    const navigate = useNavigate();
    const [users, setUsers] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearchQuery, setActiveSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 20;

    const [trendingTopics, setTrendingTopics] = useState([]);
    const [topContributors, setTopContributors] = useState([]);

    const observer = useRef();
    const lastUserRef = useRef();
    const latestQueryRef = useRef("");

    const fetchUsers = (query = "", pageNumber = 1) => {
        setLoading(true);
        if (pageNumber === 1) {
            latestQueryRef.current = query;
        }

        const headers = {};
        if (access_token) {
            headers["Authorization"] = `Bearer ${access_token}`;
        }

        axios
            .post(
                import.meta.env.VITE_SERVER_DOMAIN + "/users/search-users",
                { 
                    query,
                    page: pageNumber,
                    limit
                },
                { headers }
            )
            .then(({ data: { users: newUsers } }) => {
                if (pageNumber === 1 && query !== latestQueryRef.current) {
                    return;
                }

                if (newUsers.length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }

                if (pageNumber === 1) {
                    setUsers(newUsers);
                } else {
                    setUsers((prev) => {
                        const existingIds = new Set(prev ? prev.map(u => u._id) : []);
                        const filteredNew = newUsers.filter(u => !existingIds.has(u._id));
                        return [...(prev || []), ...filteredNew];
                    });
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/trending-topics")
            .then(({ data }) => setTrendingTopics(data.topics || []))
            .catch(console.log);

        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/top-contributors")
            .then(({ data }) => setTopContributors(data.contributors || []))
            .catch(console.log);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setActiveSearchQuery(searchTerm);
            setPage(1);
            fetchUsers(searchTerm, 1);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, access_token]);

    useEffect(() => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchUsers(activeSearchQuery, nextPage);
            }
        });

        if (lastUserRef.current) {
            observer.current.observe(lastUserRef.current);
        }
    }, [loading, hasMore, page, activeSearchQuery, access_token]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setActiveSearchQuery(searchTerm);
        setPage(1);
        fetchUsers(searchTerm, 1);
    };

    return (
        <AnimationWrapper>
            <section className="home-section w-full flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-grey transition-colors duration-300 font-inter">
                
                {/* Left SideNavBar */}
                <aside className="home-sidebar hidden md:flex w-64 flex-shrink-0 h-[calc(100vh-80px)] sticky left-0 top-[80px] bg-white border-r border-grey flex-col overflow-y-auto scrollbar-hide">
                    {/* Brand Header */}
                    <div className="px-5 py-4 border-b border-grey">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500 flex-shrink-0">
                                <i className="fi fi-rr-graduation-cap text-base mt-0.5"></i>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-black dark:text-white leading-tight">
                                    EForum
                                </p>
                                <p className="text-[10px] text-dark-grey tracking-wide uppercase font-bold">
                                    Academic Community
                                </p>
                            </div>
                        </div>
                    </div>

                    <nav className="px-3 py-3 space-y-0.5">
                        <button
                            onClick={() => navigate("/feed")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white"
                        >
                            <i className="fi fi-rr-home text-base mt-0.5"></i>
                            Home
                        </button>
                        <button
                            onClick={() => navigate("/trending")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white"
                        >
                            <i className="fi fi-rr-arrow-trend-up text-base mt-0.5"></i>
                            Popular
                        </button>
                        <button
                            onClick={() => navigate("/friends")}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm bg-indigo-500/10 text-indigo-500 font-bold"
                        >
                            <i className="fi fi-sr-users text-base mt-0.5 text-indigo-500"></i>
                            {isVi ? "Bạn bè" : "Friends"}
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white">
                            <i className="fi fi-rr-users text-base mt-0.5"></i>
                            {isVi ? "Nhóm của tôi" : "My Groups"}
                        </button>
                        <button
                            onClick={() => {
                                if (!access_token) return navigate("/signin");
                                navigate("/feed/saved");
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white"
                        >
                            <i className="fi fi-rr-bookmark text-base mt-0.5"></i>
                            {isVi ? "Đã lưu" : "Saved"}
                        </button>
                    </nav>

                    <div className="mt-auto px-3 py-4 border-t border-grey space-y-0.5">
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white transition-colors">
                            <i className="fi fi-rr-time-past text-base mt-0.5"></i>
                            History
                        </button>
                        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-dark-grey hover:bg-grey hover:text-black dark:hover:text-white transition-colors">
                            <i className="fi fi-rr-settings text-base mt-0.5"></i>
                            Settings
                        </button>
                    </div>
                </aside>

                {/* Middle Content */}
                <main className="home-feed-main flex-1 min-w-0 pb-12 bg-grey relative">
                    {/* Subtle background grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

                    <div className="max-w-2xl mx-auto py-8 px-4 relative z-10">
                        {/* Compact Header Panel */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 dark:border-slate-800/80 pb-6 mb-8 gap-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.34em] text-indigo-600 dark:text-indigo-400 mb-2 block">
                                    {isVi ? "KHÁM PHÁ CỘNG ĐỒNG" : "DISCOVER PEOPLE"}
                                </span>
                                <h1 className="text-2xl font-extrabold tracking-tight font-jakarta dark:text-white">
                                    {isVi ? "Tìm Kiếm Bạn Bè" : "Find Friends"}
                                </h1>
                            </div>

                            {/* Inset Search Field */}
                            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-[240px] flex items-center">
                                <i className="fi fi-rr-search absolute left-3.5 text-slate-400 text-xs mt-0.5"></i>
                                <input
                                    type="text"
                                    placeholder={isVi ? "Tìm thành viên..." : "Search..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white dark:bg-[#121214] border border-slate-200 dark:border-slate-800 py-2.5 pl-10 pr-4 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-xs transition-all placeholder:text-slate-400 dark:text-white"
                                />
                            </form>
                        </div>

                        {/* Integrated User List Card */}
                        {users === null ? (
                            <Loader />
                        ) : users.length ? (
                            <>
                                <div className="bg-white dark:bg-[#121214] border border-slate-200/60 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 shadow-sm mb-6">
                                    {users.map((user, i) => (
                                        <FriendListItem 
                                            key={user._id || i}
                                            user={user} 
                                            loggedInUsername={loggedInUsername} 
                                            access_token={access_token} 
                                        />
                                    ))}
                                </div>
                                
                                {/* Observer target element */}
                                <div ref={lastUserRef} className="h-10 flex items-center justify-center">
                                    {loading && <Loader />}
                                </div>
                            </>
                        ) : (
                            <NoDataMessage message={isVi ? "Không tìm thấy thành viên nào." : "No members found."} />
                        )}
                    </div>
                </main>

                {/* Right SideNavBar */}
                <aside className="home-sidebar hidden lg:flex w-72 flex-shrink-0 h-[calc(100vh-80px)] sticky right-0 top-[80px] bg-white border-l border-grey flex-col overflow-y-auto scrollbar-hide">
                    {/* Trending Topics */}
                    <div className="px-5 pt-5 pb-4 border-b border-grey">
                        <p className="text-[10px] font-bold text-dark-grey dark:text-zinc-400 uppercase tracking-widest mb-4">
                            🔥 Trending Topics
                        </p>
                        <div className="space-y-3">
                            {trendingTopics.length ? (
                                trendingTopics.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="group cursor-pointer"
                                        onClick={() => navigate(`/search/${tag}`)}
                                    >
                                        <div className="text-[10px] text-black dark:text-white uppercase tracking-wider mb-0.5 font-bold opacity-40">
                                            Subject • Trending
                                        </div>
                                        <div className="font-bold text-black dark:text-zinc-200 text-sm capitalize group-hover:text-indigo-500 transition-colors">
                                            #{tag}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <TrendingTopicsSkeleton />
                            )}
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="px-5 py-4 border-b border-grey">
                        <p className="text-[10px] font-bold text-dark-grey dark:text-zinc-400 uppercase tracking-widest mb-4">
                            🏆 Top Contributors
                        </p>
                        <div className="space-y-3">
                            {topContributors.length ? (
                                topContributors.map((user, index) => {
                                    const getRankBadge = (idx) => {
                                        if (idx === 0) return "🥇";
                                        if (idx === 1) return "🥈";
                                        if (idx === 2) return "🥉";
                                        return null;
                                    };

                                    const getAvatarRing = (idx) => {
                                        if (idx === 0) return "ring-2 ring-amber-400 shadow-sm shadow-amber-400/20";
                                        if (idx === 1) return "ring-2 ring-slate-300 shadow-sm shadow-slate-300/10";
                                        if (idx === 2) return "ring-2 ring-amber-600/45 shadow-sm shadow-amber-600/10";
                                        return "ring-1 ring-grey";
                                    };

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-xl hover:bg-grey/30 dark:hover:bg-zinc-800/40 transition-colors"
                                            onClick={() =>
                                                navigate(`/user/${user.personal_info.username}`)
                                            }
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={user.personal_info.profile_img}
                                                    className={`w-8 h-8 rounded-full object-cover ${getAvatarRing(index)}`}
                                                    alt={user.personal_info.fullname}
                                                />
                                                {getRankBadge(index) && (
                                                    <span className="absolute -top-1.5 -right-1.5 text-xs drop-shadow-sm select-none">
                                                        {getRankBadge(index)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-black dark:text-zinc-200 text-sm truncate group-hover:text-indigo-500 transition-colors">
                                                    {user.personal_info.fullname}
                                                </div>
                                                <div className="text-xs text-dark-grey truncate">
                                                    @{user.personal_info.username}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <TopContributorsSkeleton />
                            )}
                        </div>
                    </div>
                </aside>

            </section>
        </AnimationWrapper>
    );
};

export default FriendsPage;
