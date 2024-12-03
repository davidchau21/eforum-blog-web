import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams } from "react-router-dom";
import bannerDefault from "../imgs/banner-default.png";

const PublishForm = () => {
    let characterLimit = 200;
    let tagLimit = 10;

    let { blog_id } = useParams();
    let { blog, blog: { banner, title, tags, des, content }, setEditorState, setBlog } = useContext(EditorContext);
    let { userAuth: { access_token } } = useContext(UserContext);

    const [availableTags, setAvailableTags] = useState([]);
    const [filteredTags, setFilteredTags] = useState([]);
    const [selectedClassTag, setSelectedClassTag] = useState("");  // Trạng thái để lưu tag mặc định đã chọn
    const [selectedSubjectTag, setSelectedSubjectTag] = useState("");  // Trạng thái để lưu tag môn học đã chọn

    let navigate = useNavigate();

    // Các tag mặc định bạn muốn thêm vào dropdown
    const defaultTagsClass = [
        "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12",
    ];

    const defaultTagsSubject = [
        "Toán", "Văn", "Anh", "Lý", "Hóa", "Sinh", "Sử", "Địa", "GDCD", "Công Nghệ", "Tin Học", "Môn học khác",
    ];

    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, title: input.value });
    }

    const handleBlogDesChange = (e) => {
        let input = e.target;
        setBlog({ ...blog, des: input.value });
    }

    const handleTitleKeyDown = (e) => {
        if (e.keyCode == 13) { // enter key
            e.preventDefault();
        }
    }

    const handleKeyDown = (e) => {
        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();

            let tag = e.target.value.trim();

            if (tags.length < tagLimit) {
                if (!tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...tags, tag] });
                }
            } else {
                toast.error(`You can add max ${tagLimit} Tags`);
            }

            e.target.value = "";
        }
    }

    const publishBlog = async (e) => {
        if (e.target.className.includes("disable")) {
            return;
        }

        if (!title.length) {
            return toast.error("Write blog title before publishing");
        }

        if (!des.length || des.length > characterLimit) {
            return toast.error(`Write a description about your blog within ${characterLimit} characters to publish`);
        }

        if (!tags.length) {
            return toast.error("Enter at least 1 tag to help us rank your blog");
        }

        // Kiểm tra nếu người dùng chưa chọn tag mặc định
        if (!selectedClassTag) {
            return toast.error("Please choose a default class before publishing");
        }

        if (!selectedSubjectTag) {
            return toast.error("Please choose a default subject before publishing");
        }

        let loadingToast = toast.loading("Publishing....");
        e.target.classList.add('disable');

        let blogObj = {
            title,
            banner: banner.length === 0 ? bannerDefault : banner,
            des,
            content,
            tags,
            draft: false,
        };

        try {
            await Promise.all(
                tags.map(async (tag) => {
                    try {
                        await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/tags", { tag_name: tag }, {
                            headers: { 'Authorization': `Bearer ${access_token}` },
                        });
                    } catch (error) {
                        console.error(`Failed to save tag: ${tag}`, error);
                    }
                })
            );

            await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            toast.dismiss(loadingToast);
            toast.success("Published 👍");

            setTimeout(() => {
                navigate("/dashboard/blogs");
            }, 500);
        } catch (error) {
            e.target.classList.remove('disable');
            toast.dismiss(loadingToast);
            toast.error(error.response?.data?.error || "An error occurred while publishing the blog");
        } finally {
            e.target.classList.remove('disable');
        }
    };

    useEffect(() => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/tags?limit=0",
            { headers: { 'Authorization': `Bearer ${access_token}` } }
        )
            .then(response => {
                const fetchedTags = response.data.list || [];
                setAvailableTags(fetchedTags);
                setFilteredTags({ list: fetchedTags, total: fetchedTags.length });
            })
            .catch(error => console.error("Failed to fetch tags:", error));
    }, []);

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">

                <Toaster />

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleCloseEvent}
                >
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center">
                    <p className="text-dark-grey mb-1">Preview</p>

                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
                        <img
                            src={banner || bannerDefault} // Nếu không có banner, dùng bannerDefault
                            alt="Preview Banner"
                            onError={(e) => e.target.src = bannerDefault} // Thay ảnh khi không tải được
                        />
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input type="text" placeholder="Blog Title" defaultValue={title} className="input-box pl-4" onChange={handleBlogTitleChange} />

                    <p className="text-dark-grey mb-2 mt-9">Short description about your blog</p>

                    <textarea
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4"
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    >
                    </textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{characterLimit - des.length} characters left</p>

                    {/* Dropdown cho các tag đã chọn từ server */}
                    <p className="text-dark-grey mb-2 mr-32 w-1/2">Choose from existing topics</p>
                    <select
                        className="select select-bordered w-full max-w-2xl mb-2"
                        defaultValue=""
                        onChange={(e) => {
                            const selectedTag = e.target.value;
                            if (selectedTag && !tags.includes(selectedTag) && tags.length < tagLimit) {
                                setBlog({ ...blog, tags: [...tags, selectedTag] });
                            } else if (tags.length >= tagLimit) {
                                toast.error(`You can add max ${tagLimit} Tags`);
                            }
                        }}
                    >
                        <option value="" disabled>
                            Choose a topic
                        </option>
                        {availableTags.map((tag, index) => (
                            <option key={index} value={tag.tag_name}>
                                {tag.tag_name}
                            </option>
                        ))}
                    </select>

                    {/* Thanh dropdown riêng cho các tag lớp mặc định */}
                    <p className="text-dark-grey mb-2 mr-32 w-1/2">Choose default subjects</p>
                    <select
                        className="select select-bordered w-full max-w-2xl mb-2"
                        onChange={(e) => {
                            const selectedTag = e.target.value;
                            setSelectedClassTag(selectedTag); // Lưu tag mặc định đã chọn
                            if (selectedTag && !tags.includes(selectedTag) && tags.length < tagLimit) {
                                setBlog({ ...blog, tags: [...tags, selectedTag] });
                            }
                        }}
                    >
                        <option value="" disabled>
                            Choose a default topic
                        </option>
                        {defaultTagsClass.map((defaultTag, index) => (
                            <option key={index} value={defaultTag}>
                                {defaultTag}
                            </option>
                        ))}
                    </select>

                    {/* Thanh dropdown riêng cho các tag môn mặc định */}
                    <p className="text-dark-grey mb-2 mr-32 w-1/2"> Choose default subjects</p>
                    <select
                        className="select select-bordered w-full max-w-2xl mb-2"
                        onChange={(e) => {
                            const selectedTag = e.target.value;
                            setSelectedSubjectTag(selectedTag); // Lưu tag mặc định đã chọn
                            if (selectedTag && !tags.includes(selectedTag) && tags.length < tagLimit) {
                                setBlog({ ...blog, tags: [...tags, selectedTag] });
                            }
                        }}
                    >
                        <option value="" disabled>
                            Choose a default topic
                        </option>
                        {defaultTagsSubject.map((defaultTag, index) => (
                            <option key={index} value={defaultTag}>
                                {defaultTag}
                            </option>
                        ))}
                    </select>

                    <p className="text-dark-grey mb-2 mr-32 w-1/2">Or create a new one topic</p>
                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="A new topic" className="sticky input-box bg-white top-0 left-0  pl-4 mb-3 focus:bg-white "
                            onKeyDown={handleKeyDown}
                        />

                        {
                            tags.map((tag, i) => {
                                return <Tag tag={tag} tagIndex={i} key={i} />
                            })
                        }
                    </div>

                    <p className="mt-1 mb-4 text-dark-grey text-right" >{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8"
                        onClick={publishBlog}
                    >Publish</button>

                </div>

            </section>
        </AnimationWrapper>
    );
}

export default PublishForm;



