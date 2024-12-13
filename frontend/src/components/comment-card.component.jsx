/* eslint-disable react/prop-types */
import { useCallback, useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {

    let { commented_by: { personal_info: { profile_img, fullname, username: commented_by_username } }, commentedAt, comment, _id, children, isReport, image } = commentData

    let { blog, blog: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: { username: blog_author } } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext)

    let { userAuth: { access_token, username } } = useContext(UserContext);

    let [showConfirmModal, setShowConfirmModal] = useState(false);

    const [isReplying, setReplying] = useState(false);
    

    const getParentIndex = () => {
        let startingPoint = index - 1;

        try {
            while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        } catch {
            startingPoint = undefined;
        }

        return startingPoint;
    }

    const removeCommentsCards = (startingPoint, isDelete = false) => {

        if (commentsArr[startingPoint]) {

            while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArr.splice(startingPoint, 1);

                if (!commentsArr[startingPoint]) {
                    break;
                }
            }

        }

        if (isDelete) {

            let parentIndex = getParentIndex();

            if (parentIndex != undefined) {
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child != _id)

                if (!commentsArr[parentIndex].children.length) {
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }

            commentsArr.splice(index, 1);
        }

        if (commentData.childrenLevel == 0 && isDelete) {
            setTotalParentCommentsLoaded(preVal => preVal - 1)
        }

        setBlog({ ...blog, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel == 0 && isDelete ? 1 : 0) } })

    }

    const loadReplies = ({ skip = 0, currentIndex = index }) => {

        if (commentsArr[currentIndex].children.length) {

            hideReplies();

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", { _id: commentsArr[currentIndex]._id, skip })
                .then(({ data: { replies } }) => {

                    commentsArr[currentIndex].isReplyLoaded = true;

                    for (let i = 0; i < replies.length; i++) {

                        replies[i].childrenLevel = commentsArr[currentIndex].childrenLevel + 1;

                        commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i])

                    }

                    setBlog({ ...blog, comments: { ...comments, results: commentsArr } })

                })
                .catch(err => {
                    console.log(err);
                })

        }

    }

    const deleteComment = (e) => {

        e.target.setAttribute("disabled", true);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment", { _id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.removeAttribute("disabled");
                removeCommentsCards(index + 1, true);
            })
            .catch(err => {
                console.log(err);
            })

    }

    const hideReplies = () => {

        commentData.isReplyLoaded = false;

        removeCommentsCards(index + 1)

    }

    const handleReplyClick = () => {
        if (!access_token) {
            return toast.error("login first to leave a reply")
        }

        setReplying(preVal => !preVal);
    }

    const LoadMoreRepliesButton = () => {

        let parentIndex = getParentIndex();

        let button = <button onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })} className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2">Load More Replies</button>;

        if (commentsArr[index + 1]) {
            if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
                if ((index - parentIndex) < commentsArr[parentIndex].children.length) {
                    return button;
                }
            }
        } else {
            if (parentIndex) {
                if ((index - parentIndex) < commentsArr[parentIndex].children.length) {
                    return button;
                }
            }
        }

    }

    const report = useCallback(async () => {
        axios
            .post(
                import.meta.env.VITE_SERVER_DOMAIN + `/comments/report/${_id}`,
                null,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            )
            .then(() => {
                toast.success("Report Comment successfully");
                isReport = true;
            })
            .catch((err) => {
                toast.error("Have Error");
            });
    }, [access_token, _id]);

    const getDisplayDate = (date) => {
        const now = new Date();
        const publishedDate = new Date(date);
    
        const diffTime = Math.abs(now - publishedDate);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
        if (now.toDateString() === publishedDate.toDateString()) {
            if (diffMinutes === 0) {
                return `vừa xong`;
            } else if (diffHours < 1) {
                return `${diffMinutes} phút trước`;
            } else {
                return `${diffHours} giờ trước`;
            }
        }
    
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
        if (diffDays <= 7) {
            return `${diffDays} ngày trước`;
        } else {
            return publishedDate.toLocaleDateString('en-GB');
        }
    };

    return (
        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                
            {/* Chuyển hướng đến trang cá nhân của người dùng */}
            <div className="flex gap-3 items-center mb-8">
                <img 
                    src={profile_img} 
                    className="w-6 h-6 rounded-full cursor-pointer" 
                    onClick={() => window.location.href = `/user/${commented_by_username}`} 
                    alt="User Profile" 
                />
                <p 
                    className="line-clamp-1 hover:underline cursor-pointer" 
                    onClick={() => window.location.href = `/user/${commented_by_username}`}
                >
                    {fullname} @{commented_by_username}
                </p>
                <p className="min-w-fit">{getDisplayDate(commentedAt)}</p>
                {username !== commented_by_username && !isReport && (
                    <div className="relative group">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-grey/80 group-hover:bg-blue-500"
                        >
                            <i className="fi fi-rr-flag text-rose-400"></i>
                        </button>

                        {/* Tooltip */}
                        <span className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2">
                            Report this comment
                        </span>

                        {/* Confirmation Modal */}
                        {showConfirmModal && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                                    {/* Modal title */}
                                    <p className="text-lg font-semibold text-black">Confirm Report</p>

                                    {/* Modal content */}
                                    <p className="text-sm text-black mt-2">
                                        Are you sure you want to report this comment? This action cannot be undone.
                                    </p>

                                    {/* Cancel and Report buttons */}
                                    <div className="mt-4 flex justify-center gap-8">
                                        <button
                                            onClick={() => setShowConfirmModal(false)}
                                            className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => {
                                                report(); // Call report function
                                                setShowConfirmModal(false);
                                            }}
                                            className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
                                        >
                                            Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

                <p className="font-gelasio text-xl ml-3">{comment}</p>  
                {image && <img src={image} alt="comment image" className="comment-image" />}

                <div className="flex gap-5 items-center mt-5">

                    {
                        commentData.isReplyLoaded ? (
                            <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={hideReplies}>
                                <i className="fi fi-rs-comment-dots"></i>Hide Reply
                            </button>) : (
                            <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={loadReplies}>
                                <i className="fi fi-rs-comment-dots"></i> {children.length} Reply
                            </button>
                        )
                    }

                    <button className="underline" onClick={handleReplyClick}>Reply</button>

                    {
                        username == commented_by_username || username == blog_author ? (
                            <button className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center" onClick={deleteComment}>
                                <i className="fi fi-rr-trash pointer-events-none"></i>
                            </button>) : ("")
                    }
                </div>

                {
                    isReplying ? (
                        <div className="mt-8">
                            <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
                        </div>) : ("")
                }
            </div>

            <LoadMoreRepliesButton />

        </div>
    )
}

export default CommentCard;