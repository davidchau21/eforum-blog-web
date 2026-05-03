/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {
  return (
    <div className="flex gap-4 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
      {Object.keys(stats).map((key, i) => {
        return !key.includes("parent") ? (
          <div
            key={i}
            className={
              "flex flex-col items-center min-w-[80px] p-4 rounded-2xl bg-grey/30 border border-grey/50 " +
              (i !== 0 ? "" : "")
            }
          >
            <h1 className="text-[18px] font-bold text-black">
              {stats[key].toLocaleString()}
            </h1>
            <p className="text-[12px] text-dark-grey mt-1 capitalize">
              {key.split("_")[1]}
            </p>
          </div>
        ) : (
          ""
        );
      })}
    </div>
  );
};

export const ManagePublishedBlogCard = ({ blog }) => {
  let { banner, blog_id, title, publishedAt, activity } = blog;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let [showStat, setShowStat] = useState(false);
  let [showConfirmModal, setShowConfirmModal] = useState(false);

  const deleteBlogHandler = () => {
    deleteBlog(blog, access_token);
    setShowConfirmModal(false);
  };

  const getDisplayDate = (date) => {
    const now = new Date();
    const publishedDate = new Date(date);

    const diffTime = Math.abs(now - publishedDate);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (now.toDateString() === publishedDate.toDateString()) {
      if (diffHours < 1) {
        return `${diffMinutes} minutes ago`;
      } else {
        return `${diffHours} hours ago`;
      }
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return publishedDate.toLocaleDateString("en-GB");
    }
  };

  return (
    <>
      <div className="flex gap-6 border-b border-grey py-6 items-start group transition-all duration-300">
        <img
          src={banner}
          className="max-md:hidden lg:hidden xl:block w-32 h-32 flex-none rounded-2xl bg-grey object-cover border border-grey shadow-sm group-hover:shadow-md transition-shadow"
        />
        <div className="flex flex-col justify-between py-1 w-full">
          <div>
            <Link
              to={`/blog/${blog_id}`}
              className="text-[17px] font-semibold text-black leading-snug hover:text-indigo-600 transition-colors line-clamp-2 mb-2"
            >
              {title}
            </Link>
            <p className="text-[13px] text-dark-grey">
              Published {getDisplayDate(publishedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-5">
            <Link 
              to={`/editor/${blog_id}`} 
              className="text-[13px] font-medium text-indigo-600 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all"
            >
              Edit
            </Link>
            <button
              className="lg:hidden text-[13px] font-medium text-dark-grey hover:bg-black/5 px-3 py-1.5 rounded-lg transition-all"
              onClick={() => setShowStat((prevVal) => !prevVal)}
            >
              Stats
            </button>
            <button
              className="text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
              onClick={() => setShowConfirmModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="max-lg:hidden flex-shrink-0">
          <BlogStats stats={activity} />
        </div>
      </div>

      {showStat && (
        <div className="lg:hidden mt-4 animate-in">
          <BlogStats stats={activity} />
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-grey animate-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
               <i className="fi fi-rr-trash text-rose-500 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">Delete Blog Post?</h3>
            <p className="text-sm text-dark-grey text-center leading-relaxed mb-8">
              This action cannot be undone. All engagement data and comments will be permanently lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-6 bg-grey text-black font-bold rounded-2xl hover:bg-black/5 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={deleteBlogHandler}
                className="flex-1 py-3 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ManageDraftBlogPost = ({ blog }) => {
  let { title, des, blog_id, index } = blog;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  index++;

  const deleteBlogHandler = () => {
    deleteBlog(blog, access_token);
    setShowConfirmModal(false);
  };

  return (
    <>
      <div className="flex gap-5 lg:gap-10 py-6 border-b border-grey group transition-all duration-300">
        <div className="flex flex-col justify-between py-1 w-full">
          <div>
            <h1 className="text-[17px] font-semibold text-black leading-snug hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
               {title.length ? title : "Untitled Draft"}
            </h1>
            <p className="line-clamp-2 font-gelasio text-[16px] text-black/60 italic leading-relaxed">
              {des.length ? des : "No description provided for this draft."}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <Link 
              to={`/editor/${blog_id}`} 
              className="text-[13px] font-medium text-indigo-600 hover:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all"
            >
              Edit
            </Link>

            <button
              className="text-[13px] font-medium text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
              onClick={() => setShowConfirmModal(true)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Modal for confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border border-grey animate-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6 mx-auto">
               <i className="fi fi-rr-trash text-rose-500 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-black text-center mb-2">Delete Draft?</h3>
            <p className="text-sm text-dark-grey text-center leading-relaxed mb-8">
               Are you sure you want to delete this draft? This action is permanent and cannot be reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-6 bg-grey text-black font-bold rounded-2xl hover:bg-black/5 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={deleteBlogHandler}
                className="flex-1 py-3 px-6 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const deleteBlog = (blog, access_token) => {
  let { index, blog_id, setStateFunc } = blog;

  axios
    .post(
      `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/delete-blog`,
      { blog_id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
    .then(({ data }) => {
      setStateFunc((prevVal) => {
        let { deletedDocCount, totalDocs, results } = prevVal;

        results.splice(index, 1);

        if (!deletedDocCount) {
          deletedDocCount = 0;
        }

        if (!results.length && totalDocs - 1 > 0) {
          return null;
        }

        return {
          ...prevVal,
          totalDocs: totalDocs - 1,
          deleteDocCount: deletedDocCount + 1,
        };
      });
    })
    .catch((err) => {
      console.error("Error deleting blog:", err);
    });
};
