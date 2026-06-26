/* eslint-disable no-unused-vars */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageNotFound from "./404.page";
import useGetConversations from "../hook/useGetConversations";
import useConversation from "../zustand/useConversation";
import { toast } from "react-hot-toast";
import { getTranslations } from "../../translations.js";
import UserListModal from "../components/user-list-modal.component.jsx";
import { getFullDay } from "../common/date";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_blogs: 0,
  },
  social_links: {},
  joinedAt: " ",
};

const ProfilePage = () => {
  let { id: profileId } = useParams();

  let [profile, setProfile] = useState(profileDataStructure);
  let [loading, setLoading] = useState(true);
  let [blogs, setBlogs] = useState(null);
  let [profileLoaded, setProfileLoaded] = useState("");
  let [isFollowing, setIsFollowing] = useState(false);
  let [followingStatusLoaded, setFollowingStatusLoaded] = useState(false);

  let [modalConfig, setModalConfig] = useState({
    show: false,
    type: "",
    title: "",
  });

  let {
    _id: profile_id_internal,
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: {
      total_posts,
      total_reads,
      total_following,
      total_followers,
    },
    social_links,
    joinedAt,
  } = profile;

  let { userAuth: { username, access_token, language } = {} } =
    useContext(UserContext);
  const translations = getTranslations(language);

  const { conversations } = useGetConversations();
  const navigate = useNavigate();

  const { setSelectedConversation } = useConversation();

  const fetchFollowingStatus = (target_id) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/get-following-status",
        { target_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        setIsFollowing(data.followed_status);
        setFollowingStatusLoaded(true);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleFollow = () => {
    if (!access_token) {
      return toast.error("Please login to follow");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/users/follow-user",
        { target_id: profile._id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        setIsFollowing(data.followed_status);
        setProfile({
          ...profile,
          account_info: {
            ...profile.account_info,
            total_followers:
              profile.account_info.total_followers +
              (data.followed_status ? 1 : -1),
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/users/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        if (user != null) {
          setProfile(user);
          if (access_token && user.personal_info.username !== username) {
            fetchFollowingStatus(user._id);
          }
        }
        setProfileLoaded(profileId);
        getBlogs({ user_id: user._id });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getBlogs = ({ page = 1, user_id }) => {
    user_id = user_id == undefined ? blogs.user_id : user_id;

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        let formatedDate = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/blogs/search-blogs-count",
          data_to_send: { author: user_id },
        });

        formatedDate.user_id = user_id;
        setBlogs(formatedDate);
      });
  };

  useEffect(() => {
    resetStates();
    fetchUserProfile();
  }, [profileId]);

  const resetStates = () => {
    setProfile(profileDataStructure);
    setLoading(true);
    setProfileLoaded("");
    setFollowingStatusLoaded(false);
  };

  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <>
          {modalConfig.show && (
            <UserListModal
              type={modalConfig.type}
              userId={profile_id_internal}
              title={modalConfig.title}
              onClose={() => setModalConfig({ ...modalConfig, show: false })}
            />
          )}

          <section className="relative overflow-hidden min-h-[calc(100vh-80px)] bg-page-primary py-10 px-[5vw] transition-colors duration-500">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] rounded-full bg-purple/10 dark:bg-purple/5 blur-[120px] pointer-events-none animate-float"></div>
            <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[140px] pointer-events-none animate-bounce-slow"></div>

            <div className="relative w-full mx-auto z-10">
              
              {/* Glass Profile Panel Header */}
              <div className="bg-card-premium border border-subtle rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row gap-8 items-center justify-between transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full md:w-auto">
                  {/* Profile Avatar with Ambient Glow */}
                  <div className="relative group shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple to-emerald-400 rounded-full blur-md opacity-25 group-hover:opacity-40 transition-opacity duration-500 animate-pulse"></div>
                    <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-purple/35 to-emerald-500/35 shadow-inner">
                      <img
                        src={profile_img}
                        className="w-full h-full rounded-full bg-grey border border-white/20 object-cover shadow-2xl"
                        alt={fullname}
                      />
                    </div>
                  </div>

                  {/* Profile Info Details */}
                  <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                      <h1 className="text-2xl md:text-3xl font-extrabold font-outfit text-title tracking-tight">{fullname}</h1>
                      <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-purple/10 text-purple border border-purple/20 font-semibold font-inter">
                        @{profile_username}
                      </span>
                    </div>
                    
                    <p className="text-base text-body mt-2.5 max-w-md font-inter leading-relaxed">
                      {bio.length ? bio : "This user is keeping a low profile."}
                    </p>

                    {/* Meta info badges */}
                    <div className="flex flex-wrap gap-2.5 mt-4 text-xs font-semibold justify-center md:justify-start">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-grey/55 text-black border border-grey/30 dark:border-white/5 backdrop-blur-md">
                        <i className="fi fi-rr-calendar text-sm text-purple"></i>
                        <span>Joined {getFullDay(joinedAt)}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 backdrop-blur-md font-semibold">
                        <i className="fi fi-rr-stats text-sm"></i>
                        <span>{total_reads.toLocaleString()} Reads</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto justify-center">
                  {profileId === username ? (
                    <Link
                      to="/settings/edit-profile"
                      className="btn-light rounded-2xl flex items-center justify-center gap-2 w-full px-6 py-3 border border-grey/40 hover:bg-grey/85 hover:scale-[1.02] active:scale-[0.98] transition-all font-outfit text-sm"
                    >
                      <i className="fi fi-rr-edit text-sm"></i>
                      Edit Profile
                    </Link>
                  ) : (
                    <>
                      <button
                        className={`btn-${isFollowing ? "light" : "dark"} rounded-2xl flex items-center justify-center gap-2 w-full px-6 py-3 transition-all font-outfit text-sm hover:scale-[1.02] active:scale-[0.98] ${
                          isFollowing
                            ? "border border-grey/40 hover:bg-grey/85"
                            : "shadow-lg shadow-purple/20 hover:shadow-xl hover:shadow-purple/35"
                        }`}
                        onClick={handleFollow}
                      >
                        <i className={`fi ${isFollowing ? "fi-rr-delete-user" : "fi-rr-user-add"} text-sm`}></i>
                        {isFollowing ? "Following" : "Follow"}
                      </button>

                      <button
                        className="btn-light rounded-2xl flex items-center justify-center gap-2 w-full px-6 py-3 border border-grey/40 hover:bg-grey/85 hover:scale-[1.02] active:scale-[0.98] transition-all font-outfit text-sm"
                        onClick={() => {
                          const conversation = conversations.find(
                            (conv) =>
                              conv.personal_info.username === profile_username,
                          );
                          if (conversation) {
                            setSelectedConversation(conversation);
                            navigate("/chat");
                          } else {
                            toast.error("No conversation found with this user");
                          }
                        }}
                      >
                        <i className="fi fi-rr-envelope text-sm"></i>
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Grid Area for Bento Stats and Blogs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                
                {/* Stats & Info Sidebar */}
                <div className="md:col-span-1 flex flex-col gap-6">
                  <div className="bg-card-premium border border-subtle rounded-3xl p-6 shadow-sm flex flex-col gap-6">
                    <h3 className="text-lg font-bold font-jakarta text-title border-b border-grey/30 pb-3 flex items-center gap-2">
                      <i className="fi fi-rr-info text-base text-purple"></i>
                      Overview
                    </h3>
                    
                    {/* Stats Layout with Elegant Thin Dividers */}
                    <div className="flex justify-around items-center py-3 bg-grey/30 dark:bg-zinc-800/10 border border-grey/25 rounded-2xl">
                      <div className="text-center w-1/3 border-r border-grey/30 dark:border-white/5">
                        <span className="block text-lg md:text-xl font-bold font-outfit text-black">
                          {total_posts.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-dark-grey font-semibold uppercase tracking-wider">Blogs</span>
                      </div>

                      <button
                        className="text-center w-1/3 border-r border-grey/30 dark:border-white/5 hover:scale-105 transition-all group"
                        onClick={() =>
                          setModalConfig({
                            show: true,
                            type: "followers",
                            title: translations.followersLabel || "Followers",
                          })
                        }
                      >
                        <span className="block text-lg md:text-xl font-bold font-outfit text-black group-hover:text-purple transition-colors">
                          {(total_followers || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-dark-grey font-semibold uppercase tracking-wider group-hover:underline">Followers</span>
                      </button>

                      <button
                        className="text-center w-1/3 hover:scale-105 transition-all group"
                        onClick={() =>
                          setModalConfig({
                            show: true,
                            type: "following",
                            title: translations.followingLabel || "Following",
                          })
                        }
                      >
                        <span className="block text-lg md:text-xl font-bold font-outfit text-black group-hover:text-purple transition-colors">
                          {(total_following || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-dark-grey font-semibold uppercase tracking-wider group-hover:underline">Following</span>
                      </button>
                    </div>
                    
                    {/* Social profiles info */}
                    {social_links && Object.keys(social_links).some(key => social_links[key]) && (
                      <div className="flex flex-col gap-3 pt-4 border-t border-grey/30 dark:border-white/5">
                        <h4 className="text-sm font-semibold font-jakarta text-title">Social Profiles</h4>
                        <div className="flex gap-2.5 flex-wrap items-center">
                          {Object.keys(social_links).map((key) => {
                            let link = social_links[key];
                            return link ? (
                              <Link
                                to={link}
                                key={key}
                                target="_blank"
                                className="w-10 h-10 rounded-xl bg-grey/40 border border-grey/30 flex items-center justify-center text-dark-grey hover:text-purple hover:bg-purple/10 hover:border-purple/20 transition-all duration-300"
                              >
                                <i className={"fi " + (key !== 'website' ? "fi-brands-" + key : "fi-rr-globe") + " text-lg"}></i>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Blogs List Feed */}
                <div className="md:col-span-2">
                  <InPageNavigation
                    routes={[translations.blogs, translations.about]}
                    defaultHidden={["About"]}
                  >
                    <div className="flex flex-col gap-6">
                      {blogs === null ? (
                        <Loader />
                      ) : blogs.results.length ? (
                        blogs.results.map((blog, i) => {
                          return (
                            <AnimationWrapper
                              transition={{ duration: 0.5, delay: i * 0.05 }}
                              key={i}
                            >
                              <BlogPostCard content={blog} author={blog.author} />
                            </AnimationWrapper>
                          );
                        })
                      ) : (
                        <NoDataMessage message="No blogs published" />
                      )}
                      <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />

                      {blogs && blogs.totalDocs > 0 && blogs.results.length >= blogs.totalDocs && (
                        <p className="text-center text-dark-grey/60 text-sm font-medium py-6 mt-4 border-t border-grey/30 dark:border-white/5 font-inter">
                          {translations.pageEnd}
                        </p>
                      )}
                    </div>

                    <div className="bg-card-premium border border-subtle rounded-3xl p-6 shadow-sm">
                      <AboutUser
                        bio={bio}
                        social_links={social_links}
                        joinedAt={joinedAt}
                      />
                    </div>
                  </InPageNavigation>
                </div>
              </div>

            </div>
          </section>
        </>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
