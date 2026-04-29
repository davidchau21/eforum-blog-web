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
    if (profileId != profileLoaded) {
      setBlogs(null);
      setFollowingStatusLoaded(false);
    }

    if (blogs == null) {
      resetStates();
      fetchUserProfile();
    }
  }, [profileId, blogs]);

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

          <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
            <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">
              <img
                src={profile_img}
                className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
              />

              <h1 className="text-2xl font-medium">@{profile_username}</h1>
              <p className="text-xl h-6">{fullname}</p>

              <div className="flex gap-4 text-dark-grey text-sm">
                <p>
                  <span className="text-black font-bold">
                    {total_posts.toLocaleString()}
                  </span>{" "}
                  Blogs
                </p>

                <button
                  className="hover:underline underline-offset-4 decoration-purple transition-all"
                  onClick={() =>
                    setModalConfig({
                      show: true,
                      type: "followers",
                      title: translations.followersLabel || "Followers",
                    })
                  }
                >
                  <span className="text-black font-bold">
                    {(total_followers || 0).toLocaleString()}
                  </span>{" "}
                  {translations.followersLabel || "Followers"}
                </button>

                <button
                  className="hover:underline underline-offset-4 decoration-purple transition-all"
                  onClick={() =>
                    setModalConfig({
                      show: true,
                      type: "following",
                      title: translations.followingLabel || "Following",
                    })
                  }
                >
                  <span className="text-black font-bold">
                    {(total_following || 0).toLocaleString()}
                  </span>{" "}
                  {translations.followingLabel || "Following"}
                </button>
              </div>
              <p className="text-dark-grey">
                {total_reads.toLocaleString()} Reads
              </p>

              <div className="flex gap-4 mt-2">
                {profileId == username ? (
                  <Link
                    to="/settings/edit-profile"
                    className="btn-light rounded-md"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button
                      className={
                        "btn-" +
                        (isFollowing ? "dark" : "light") +
                        " rounded-md"
                      }
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>

                    <button
                      className="btn-light rounded-md"
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
                      Message
                    </button>
                  </>
                )}
              </div>

              <AboutUser
                className="max-md:hidden"
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </div>

            <div className="max-md:mt-12 w-full">
              <InPageNavigation
                routes={[translations.blogs, translations.about]}
                defaultHidden={["About"]}
              >
                <>
                  {blogs == null ? (
                    <Loader />
                  ) : blogs.results.length ? (
                    blogs.results.map((blog, i) => {
                      return (
                        <AnimationWrapper
                          transition={{ duration: 1, delay: i * 0.1 }}
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
                </>

                <AboutUser
                  bio={bio}
                  social_links={social_links}
                  joinedAt={joinedAt}
                />
              </InPageNavigation>
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
