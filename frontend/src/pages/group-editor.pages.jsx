import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import GroupBlogEditor from "../components/groups/group-blog-editor.component";
import GroupPublishForm from "../components/groups/group-publish-form.component";
import Loader from "../components/loader.component";
import axios from "axios";

import { EditorContext, blogStructure } from "../contexts/EditorContext"; 

const GroupEditor = () => {
    let { blog_id } = useParams();
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get("groupId");

    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({ isReady: false });
    const [loading, setLoading] = useState(true);

    let { userAuth: { access_token } } = useContext(UserContext);

    useEffect(() => {
        if (!blog_id) {
            if (groupId) {
                setBlog((prev) => ({ ...prev, group: groupId }));
            }
            return setLoading(false);
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/blogs/get-blog", { blog_id, draft: true, mode: 'edit' })
        .then(({ data: { blog: fetchedBlog } }) => {
            setBlog(fetchedBlog);
            setLoading(false);
        })
        .catch(err => {
            console.error("Failed to load blog draft for group edit", err);
            setBlog(blogStructure);
            setLoading(false);
        });
    }, [blog_id, groupId]);

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {
                access_token === null ? <Navigate to="/signin" />
                :
                loading ? <Loader /> :
                editorState === "editor" ? <GroupBlogEditor /> : <GroupPublishForm />
            }
        </EditorContext.Provider>
    );
};

export default GroupEditor;
