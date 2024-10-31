import { Link, useNavigate, useParams } from "react-router-dom";
import lightLogo from "../imgs/logo-light.png";
import darkLogo from "../imgs/logo-dark.png";
import AnimationWrapper from "../common/page-animation";
import lightBanner from "../imgs/blog banner light.png";
import darkBanner from "../imgs/blog banner dark.png";
import { uploadImage } from "../common/aws";
import { useContext, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { ThemeContext, UserContext } from "../App";
import { getTranslations } from "../../translations"; // Nhập hàm từ file translations.js

const BlogEditor = () => {
    const { blog, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext);
    const { userAuth: { access_token, language } } = useContext(UserContext);
    const { theme } = useContext(ThemeContext);
    const { blog_id } = useParams();
    const navigate = useNavigate();

    const currentTranslations = getTranslations(language); // Lấy bản dịch dựa trên ngôn ngữ

    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holderId: "textEditor",
                data: Array.isArray(blog.content) ? blog.content[0] : blog.content,
                tools: tools,
                placeholder: currentTranslations.writeContent, // Sử dụng bản dịch
            }));
        }
    }, []);

    const handleBannerUpload = (e) => {
        let img = e.target.files[0];

        if (img) {
            let loadingToast = toast.loading(currentTranslations.savingDraft); // Sử dụng bản dịch

            uploadImage(img).then((url) => {
                if (url) {
                    toast.dismiss(loadingToast);
                    toast.success(currentTranslations.uploaded); // Sử dụng bản dịch
                    setBlog({ ...blog, banner: url });
                }
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                return toast.error(err);
            });
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) { // enter key
            e.preventDefault();
        }
    };

    const handleTitleChange = (e) => {
        let input = e.target;

        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";

        setBlog({ ...blog, title: input.value });
    };

    const handleError = (e) => {
        let img = e.target;
        img.src = theme === "light" ? lightBanner : darkBanner;
    };

    const handlePublishEvent = () => {
        if (!blog.banner.length) {
            return toast.error(currentTranslations.uploadBanner); // Sử dụng bản dịch
        }

        if (!blog.title.length) {
            return toast.error(currentTranslations.writeTitle); // Sử dụng bản dịch
        }

        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish");
                } else {
                    return toast.error(currentTranslations.writeContent); // Sử dụng bản dịch
                }
            })
            .catch((err) => {
                console.log(err);
            });
        }
    };

    const handleSaveDraft = (e) => {
        if (e.target.className.includes("disable")) {
            return;
        }

        if (!blog.title.length) {
            return toast.error(currentTranslations.writeTitle); // Sử dụng bản dịch
        }

        let loadingToast = toast.loading(currentTranslations.savingDraft); // Sử dụng bản dịch
        e.target.classList.add('disable');

        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title: blog.title,
                    banner: blog.banner,
                    des: blog.des,
                    content,
                    tags: blog.tags,
                    draft: true,
                };

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    },
                })
                .then(() => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    toast.success(currentTranslations.saved); // Sử dụng bản dịch

                    setTimeout(() => {
                        navigate("/dashboard/blogs?tab=draft");
                    }, 500);
                })
                .catch(({ response }) => {
                    e.target.classList.remove('disable');
                    toast.dismiss(loadingToast);
                    return toast.error(response.data.error);
                });
            });
        }
    };

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={theme === "light" ? darkLogo : lightLogo} alt="logo" />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {blog.title.length ? blog.title : currentTranslations.newBlog} {/* Sử dụng bản dịch */}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublishEvent}>
                        {currentTranslations.publish} {/* Sử dụng bản dịch */}
                    </button>
                    <button className="btn-light py-2" onClick={handleSaveDraft}>
                        {currentTranslations.saveDraft} {/* Sử dụng bản dịch */}
                    </button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">
                        <div className="relative aspect-video hover:opacity-50 bg-white ">
                            <label htmlFor="uploadBanner">
                                <img 
                                    src={blog.banner}
                                    className="z-20"
                                    onError={handleError}
                                    alt="Blog Banner"
                                />
                                <input 
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png, .jpg, .jpeg"
                                    hidden
                                    onChange={handleBannerUpload}
                                />
                            </label>
                        </div>

                        <textarea
                            defaultValue={blog.title}
                            placeholder={currentTranslations.titlePlaceholder} // Sử dụng bản dịch cho placeholder
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 bg-white"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        ></textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <div id="textEditor" className="font-gelasio"></div>

                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;
