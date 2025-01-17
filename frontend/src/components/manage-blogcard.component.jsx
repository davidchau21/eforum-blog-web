import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const BlogStats = ({ stats }) => {

    return (
        <div className="flex gap-2 max-lg:mb-6 max-lg:pb-6 border-grey max-lg:border-b">
            {
                Object.keys(stats).map((key, i) => {
                    return !key.includes("parent") ? <div key={i} className={"flex flex-col items-center w-full h-full justify-center p-4 px-6 " + (i !== 0 ? " border-grey border-l " : "")}>
                        <h1 className="text-xl lg:text-2xl mb-2">{stats[key].toLocaleString()}</h1>
                        <p className="max-lg:text-dark-grey capitalize">{key.split("_")[1]}</p>
                    </div> : ""
                })
            }
        </div>
    )

}

export const ManagePublishedBlogCard = ({ blog }) => {
    let { banner, blog_id, title, publishedAt, activity } = blog;
    let { userAuth: { access_token } } = useContext(UserContext);
    let [showStat, setShowStat] = useState(false);
    let [showConfirmModal, setShowConfirmModal] = useState(false);

    const deleteBlogHandler = () => {
        deleteBlog(blog, access_token); // Call the deleteBlog function
        setShowConfirmModal(false); // Close the modal after calling delete
    };

    const getDisplayDate = (date) => {
        const now = new Date();
        const publishedDate = new Date(date);
    
        const diffTime = Math.abs(now - publishedDate);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    
        if (now.toDateString() === publishedDate.toDateString()) {
            if (diffHours < 1) {
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
        <>
            <div className="flex gap-10 border-b mb-6 max-md:px-4 border-grey pb-6 items-center">
                <img src={banner} className="max-md:hidden lg:hidden xl:block w-28 h-28 flex-none bg-grey object-cover" />
                <div className="flex flex-col justify-between py-2 w-full min-w-[300px]">
                    <div>
                        <Link to={`/blog/${blog_id}`} className="blog-title mb-4 hover:underline">{title}</Link>
                        <p className="line-clamp-1">Đã đăng {getDisplayDate(publishedAt)}</p>
                    </div>
                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>
                        <button className="lg:hidden pr-4 py-2 underline" onClick={() => setShowStat(prevVal => !prevVal)}>Stats</button>
                        <button className="pr-4 py-2 underline text-red" onClick={() => setShowConfirmModal(true)}>Delete</button>
                    </div>
                </div>
                <div className="max-lg:hidden">
                    <BlogStats stats={activity} />
                </div>
            </div>

            {showStat && <div className="lg:hidden"><BlogStats stats={activity} /></div>}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <p className="text-lg font-semibold text-black">Confirm Deletion</p>
                        <p className="text-sm text-black mt-2">Are you sure you want to delete this blog post?</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteBlogHandler} // Call the deleteBlogHandler
                                className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
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
    let { userAuth: { access_token } } = useContext(UserContext);

    const [showConfirmModal, setShowConfirmModal] = useState(false); // Added state for modal

    index++;

    const deleteBlogHandler = () => {
        deleteBlog(blog, access_token); // Call the deleteBlog function
        setShowConfirmModal(false); // Close the modal after deletion
    };

    return (
        <>
            <div className="flex gap-5 lg:gap-10 pb-6 border-b mb-6 border-grey">
                {/* <h1 className="blog-index text-center pl-4 md:pl-6 flex-none">{ index < 10 ? "0" + index : index }</h1> */}

                <div>
                    <h1 className="blog-title mb-3">{title}</h1>
                    <p className="line-clamp-2 font-gelasio">{des.length ? des : "No Description"}</p>

                    <div className="flex gap-6 mt-3">
                        <Link to={`/editor/${blog_id}`} className="pr-4 py-2 underline">Edit</Link>

                        <button 
                            className="pr-4 py-2 underline text-red" 
                            onClick={() => setShowConfirmModal(true)} // Show modal
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for confirmation */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <p className="text-lg font-semibold text-black">Confirm Deletion</p>
                        <p className="text-sm text-black mt-2">Are you sure you want to delete this blog post?</p>
                        <div className="mt-4 flex justify-center gap-4">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={deleteBlogHandler} // Call deleteBlogHandler
                                className="py-2 px-4 bg-black rounded hover:bg-gray-300 text-white transition-all"
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

    axios.post(`${import.meta.env.VITE_SERVER_DOMAIN}/delete-blog`, { blog_id }, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    })
    .then(({ data }) => {
        setStateFunc(prevVal => {
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
    .catch(err => {
        console.error("Error deleting blog:", err);
    });
};
