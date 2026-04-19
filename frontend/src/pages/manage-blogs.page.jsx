import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import {
  ManageDraftBlogPost,
  ManagePublishedBlogCard,
} from "../components/manage-blogcard.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";
import { getTranslations } from "../../translations";

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [pending, setPending] = useState(null);
  const [query, setQuery] = useState("");

  const {
    userAuth: { access_token, language },
  } = useContext(UserContext);
  const translations = getTranslations(language);

  let activeTab = useSearchParams()[0].get("tab");

  const getBlogs = ({ page, draft, filter, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
        {
          page,
          draft,
          query,
          deletedDocCount,
          filter,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(async ({ data }) => {
        let stateToUpdate;
        if (filter === "pending") stateToUpdate = pending;
        else if (draft) stateToUpdate = drafts;
        else stateToUpdate = blogs;

        let formatedData = await filterPaginationData({
          state: stateToUpdate,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "/user-written-blogs-count",
          data_to_send: { draft, query, filter },
        });

        if (filter === "pending") {
          setPending(formatedData);
        } else if (draft) {
          setDrafts(formatedData);
        } else {
          setBlogs(formatedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs == null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts == null) {
        getBlogs({ page: 1, draft: true, filter: "draft" });
      }
      if (pending == null) {
        getBlogs({ page: 1, draft: false, filter: "pending" });
      }
    }
  }, [access_token, blogs, drafts, pending, query]);

  const handleSearch = (e) => {
    let searchQuery = e.target.value;

    setQuery(searchQuery);

    if (e.keyCode == 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
      setPending(null);
    }
  };

  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
      setPending(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden">{translations.manageBlogs}</h1>

      <Toaster />

      <div className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
          placeholder={translations.searchBlogs}
          onChange={handleChange}
          onKeyDown={handleSearch}
        />

        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey "></i>
      </div>

      <InPageNavigation
        routes={[
          translations.publishedBlogs,
          translations.drafts,
          translations.pendingBlogs,
        ]}
        defaultActiveIndex={
          activeTab === "draft" ? 1 : activeTab === "pending" ? 2 : 0
        }
      >
        {/* Published Blogs */}
        {blogs == null ? (
          <Loader />
        ) : blogs.results.length ? (
          <>
            {blogs.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManagePublishedBlogCard
                    blog={{ ...blog, index: i, setStateFunc: setBlogs }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={blogs}
              fetchDataFun={getBlogs}
              additionalParam={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message={translations.noPublishedBlogs} />
        )}

        {/* Draft Blogs */}
        {drafts == null ? (
          <Loader />
        ) : drafts.results.length ? (
          <>
            {drafts.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManageDraftBlogPost
                    blog={{ ...blog, index: i, setStateFunc: setDrafts }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={drafts}
              fetchDataFun={getBlogs}
              additionalParam={{
                draft: true,
                filter: "draft",
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message={translations.noDraftBlogs} />
        )}

        {/* Pending Blogs */}
        {pending == null ? (
          <Loader />
        ) : pending.results.length ? (
          <>
            {pending.results.map((blog, i) => {
              return (
                <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                  <ManagePublishedBlogCard
                    blog={{ ...blog, index: i, setStateFunc: setPending }}
                  />
                </AnimationWrapper>
              );
            })}

            <LoadMoreDataBtn
              state={pending}
              fetchDataFun={getBlogs}
              additionalParam={{
                draft: false,
                filter: "pending",
                deletedDocCount: pending.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message={translations.noPendingBlogs} />
        )}
      </InPageNavigation>
    </>
  );
};

export default ManageBlogs;
