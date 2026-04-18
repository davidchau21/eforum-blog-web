import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
import { MdCameraAlt } from "react-icons/md";

const CommentField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {
    let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);
    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);

    const [comment, setComment] = useState("");
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setImage(file);
    };

    const handleComment = () => {
        if (!access_token) return toast.error("Vui lòng đăng nhập để bình luận");
        if (!comment.length && !image) return toast.error("Hãy nhập nội dung hoặc chọn ảnh để bình luận");

        setIsSubmitting(true);

        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                if (!image) return resolve(null);
                axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
                    .then(response => {
                        const uploadURL = response.data.uploadURL;
                        axios.put(uploadURL, image, { headers: { 'Content-Type': image.type } })
                            .then(() => resolve(uploadURL.split('?')[0]))
                            .catch(err => { console.error(err); reject("Image upload failed"); });
                    })
                    .catch(err => { console.error(err); reject("Failed to get upload URL"); });
            });
        };

        uploadImage()
            .then(imageUrl => {
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
                    _id, blog_author, comment, replying_to: replyingTo, image: imageUrl
                }, {
                    headers: { 'Authorization': `Bearer ${access_token}` }
                })
                    .then(({ data }) => {
                        setComment("");
                        setImage(null);
                        setIsSubmitting(false);

                        data.commented_by = { personal_info: { username, profile_img, fullname } };
                        data.image = imageUrl;

                        let newCommentArr;

                        if (replyingTo) {
                            if (!commentsArr[index].children) commentsArr[index].children = [];
                            commentsArr[index].children.push(data._id);
                            data.childrenLevel = commentsArr[index].childrenLevel + 1;
                            data.parentIndex = index;
                            data.image = imageUrl;
                            commentsArr[index].isReplyLoaded = true;
                            commentsArr.splice(index + 1, 0, data);
                            newCommentArr = commentsArr;
                            setReplying(false);
                        } else {
                            data.childrenLevel = 0;
                            newCommentArr = [data, ...commentsArr];
                        }

                        let parentCommentIncrementval = replyingTo ? 0 : 1;
                        setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementval } });
                        setTotalParentCommentsLoaded(prevVal => prevVal + parentCommentIncrementval);
                    })
                    .catch(err => {
                        console.log(err);
                        setIsSubmitting(false);
                        toast.error("Tài khoản của bạn đã bị khóa bình luận.");
                    });
            })
            .catch(err => {
                console.log(err);
                setIsSubmitting(false);
                toast.error("Lỗi khi tải ảnh. Vui lòng thử lại.");
            });
    };

    const imageInputId = replyingTo ? "ReplyImageInput" : "ImageInput";

    return (
        <div className="flex flex-col gap-3">
            <Toaster />

            {/* Author display */}
            {profile_img && (
                <div className="flex items-center gap-2">
                    <img src={profile_img} className="w-7 h-7 rounded-full object-cover" alt={fullname} />
                    <span className="text-xs font-medium text-dark-grey">{fullname}</span>
                </div>
            )}

            {/* Textarea */}
            <div className="relative">
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={replyingTo ? "Viết trả lời..." : "Chia sẻ suy nghĩ của bạn..."}
                    rows={replyingTo ? 2 : 3}
                    className="w-full px-4 py-3 bg-white border border-grey rounded-2xl text-sm placeholder:text-dark-grey/60 resize-none focus:outline-none focus:border-purple/40 focus:ring-2 focus:ring-purple/10 transition-all duration-200"
                />
            </div>

            {/* Image preview */}
            {image && (
                <div className="relative inline-block">
                    <img
                        src={URL.createObjectURL(image)}
                        alt="Selected"
                        className="h-32 w-auto object-cover rounded-xl border border-grey"
                    />
                    <button
                        className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors duration-200"
                        onClick={() => setImage(null)}
                    >
                        <i className="fi fi-br-cross text-xs leading-none" style={{ fontSize: '8px' }}></i>
                    </button>
                </div>
            )}

            {/* Action row */}
            <div className="flex items-center justify-between">
                <label htmlFor={imageInputId} className="w-8 h-8 rounded-xl bg-grey/60 flex items-center justify-center cursor-pointer hover:bg-grey transition-colors duration-200 text-dark-grey hover:text-black">
                    <MdCameraAlt size={16} />
                </label>
                <input id={imageInputId} onChange={handleImageChange} className="hidden" type="file" accept="image/*" />

                <button
                    onClick={handleComment}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        isSubmitting
                            ? "bg-purple/40 text-white/60 cursor-not-allowed"
                            : "bg-purple text-white hover:bg-purple/80 shadow-md shadow-purple/20"
                    }`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-1.5">
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Đang gửi...
                        </span>
                    ) : (
                        <>
                            <i className="fi fi-rr-paper-plane-top text-xs leading-none"></i>
                            {action}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default CommentField;
