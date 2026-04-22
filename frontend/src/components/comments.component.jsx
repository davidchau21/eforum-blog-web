/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  let res;

  await axios
    .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      data.map((comment) => {
        comment.childrenLevel = 0;
      });

      setParentCommentCountFun((preVal) => preVal + data.length);

      if (comment_array == null) {
        res = { results: data };
      } else {
        res = { results: [...comment_array, ...data] };
      }
    });

  return res;
};

const CommentsContainer = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      comments: { results: commentsArr },
      activity: { total_parent_comments },
    },
    commentsWrapper,
    setCommentsWrapper,
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    try {
      let newCommentsArr = await fetchComments({
        skip: totalParentCommentsLoaded,
        blog_id: _id,
        setParentCommentCountFun: setTotalParentCommentsLoaded,
        comment_array: commentsArr,
      });
      setBlog({ ...blog, comments: newCommentsArr });
    } catch (error) {
      console.error("Error loading more comments:", error);
    }
  };

  return (
    <div id="comments-section" className="w-full">
      {/* Comment Field */}
      <div className="mb-8">
        <CommentField action="Comment" />
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {commentsArr && commentsArr.length ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
            {commentsArr.map((comment, i) => (
              <AnimationWrapper key={i}>
                <CommentCard
                  index={i}
                  leftVal={comment.childrenLevel * 4}
                  commentData={comment}
                  fetchComments={fetchComments}
                />
              </AnimationWrapper>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <i className="fi fi-rr-comment-slash text-xl text-slate-400"></i>
            </div>
            <p className="text-slate-600 font-medium">No comments yet</p>
            <p className="text-[13px] text-slate-400 mt-1">
              Be the first to join the conversation!
            </p>
          </div>
        )}

        {total_parent_comments > totalParentCommentsLoaded && (
          <button
            onClick={loadMoreComments}
            className="w-full mt-4 py-3 text-[13px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <i className="fi fi-rr-angle-down text-sm"></i>
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentsContainer;
