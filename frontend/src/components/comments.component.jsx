import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {

    let res;

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", { blog_id, skip })
    .then(({ data }) => {

        data.map(comment => {
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + data.length)

        if(comment_array == null){
            res = { results: data }
        } else{
            res = { results: [ ...comment_array, ...data ] }
        }

    })

    return res;

}

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments: { results : commentsArr }, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } = useContext(BlogContext)

    const loadMoreComments = async () => {
        try {
            let newCommentsArr = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr });
            setBlog({ ...blog, comments: newCommentsArr });
        } catch (error) {
            console.error("Error loading more comments:", error);
        }
    }

    return (
        <div id="comments-section" className="mt-12 bg-white border-t border-grey pt-8 px-0 sm:px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1 h-7 bg-gradient-to-b from-purple to-emerald-500 rounded-full flex-shrink-0"></div>
                <p className="font-bold text-black text-xl">
                    Bình luận ({total_parent_comments})
                </p>
            </div>

            {/* Comment Field */}
            <div className="px-6 py-4 border-b border-grey bg-grey/20">
                <CommentField action="Bình luận" />
            </div>

            {/* Comments List */}
            <div className="px-4 py-4">
                {commentsArr && commentsArr.length ? (
                    <>
                        <p className="text-xs font-semibold text-dark-grey mb-4 px-2">
                            {total_parent_comments} bình luận
                        </p>
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
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-grey/50 rounded-full flex items-center justify-center mb-4">
                            <i className="fi fi-rr-comment-slash text-2xl text-dark-grey leading-none"></i>
                        </div>
                        <p className="text-dark-grey font-medium">Chưa có bình luận nào</p>
                        <p className="text-xs text-dark-grey/60 mt-1">Hãy là người đầu tiên bình luận!</p>
                    </div>
                )}

                {total_parent_comments > totalParentCommentsLoaded && (
                    <button
                        onClick={loadMoreComments}
                        className="w-full mt-4 py-2.5 text-sm font-medium text-purple hover:text-purple/70 hover:bg-purple/5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <i className="fi fi-rr-angle-down text-sm leading-none"></i>
                        Tải thêm bình luận
                    </button>
                )}
            </div>
        </div>
    )
}

export default CommentsContainer;