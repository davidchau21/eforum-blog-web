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

    // Handle image upload
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    // Handle comment submission
    const handleComment = () => {
        if (!access_token) {
            return toast.error("Login first to leave a comment");
        }

        if (!comment.length && !image) {
            return toast.error("Write something or upload an image to leave a comment");
        }

        // Step 1: Upload image if exists
        const uploadImage = () => {
            return new Promise((resolve, reject) => {
                if (!image) return resolve(null); // No image to upload, resolve with null

                // Get the presigned URL for image upload
                axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
                    .then(response => {
                        const uploadURL = response.data.uploadURL;

                        // Upload the image to the presigned URL
                        axios.put(uploadURL, image, {
                            headers: {
                                'Content-Type': image.type,
                            },
                        })
                            .then(() => {
                                const imageUrl = uploadURL.split('?')[0]; // Extract the file URL
                                resolve(imageUrl);
                            })
                            .catch(err => {
                                console.error("Image upload failed:", err);
                                reject("Image upload failed");
                            });
                    })
                    .catch(err => {
                        console.error("Failed to get upload URL:", err);
                        reject("Failed to get upload URL");
                    });
            });
        };

        // Step 2: Submit the comment
        uploadImage()
            .then(imageUrl => {
                // Proceed with comment submission
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
                    _id, blog_author, comment, replying_to: replyingTo, image: imageUrl
                }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(({ data }) => {
                        setComment(""); // Clear comment input
                        setImage(null); // Clear selected image

                        data.commented_by = { personal_info: { username, profile_img, fullname } };
                        data.image = imageUrl; // Attach image URL to comment

                        let newCommentArr;

                        if (replyingTo) {
                            if (!commentsArr[index].children) {
                                commentsArr[index].children = [];
                            }
                            commentsArr[index].children.push(data._id);
                            data.childrenLevel = commentsArr[index].childrenLevel + 1;
                            data.parentIndex = index;
                            data.image = imageUrl; // Attach image URL to reply comment
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
                        toast.error("Your account has been locked from commenting.");
                    });
            })
            .catch(err => {
                console.log(err);
                toast.error("Error uploading image. Please try again.");
            });
    };

    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[200px] overflow-auto"
            />
            <div className="flex items-center justify-between mt-3">
                {replyingTo && (
                    <label htmlFor="ReplyImageInput" className="btn btn-dark">
                        <MdCameraAlt />
                    </label>
                )}
                {!replyingTo && (
                    <label htmlFor="ImageInput" className="btn btn-dark">
                        <MdCameraAlt />
                    </label>
                )}
                <button className="btn-dark px-10" onClick={handleComment}>
                    {action}
                </button>
            </div>
            { replyingTo && (
                <input
                id="ReplyImageInput"
                onChange={handleImageChange}
                className="hidden"
                type="file"
                />
            )}
            <input
                id="ImageInput"
                onChange={handleImageChange}
                className="hidden"
                type="file"
            />
            {image && (
                <div className="mt-3 flex flex-col items-center">
                    <img
                        src={URL.createObjectURL(image)} 
                        alt="Selected"
                        className="w-48 h-48 object-cover rounded-md"
                    />
                    <button
                        className="btn btn-danger mt-2"
                        onClick={() => setImage(null)}
                    >
                        Remove Image
                    </button>
                </div>
            )}
        </>
    );
};

export default CommentField;
