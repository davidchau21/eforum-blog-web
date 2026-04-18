import { useContext, useState, useEffect } from "react";
import { UserContext } from "../App";
import { EditorContext, blogStructure } from "../contexts/EditorContext";
import BlogEditor from "./blog-editor.component";
import PublishForm from "./publish-form.component";
import { motion, AnimatePresence } from "framer-motion";
import { getTranslations } from "../../translations";

const WriteModal = ({ isOpen, onClose }) => {
    const { userAuth: { access_token, profile_img, fullname, language } } = useContext(UserContext);
    const translations = getTranslations(language);

    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor");
    const [textEditor, setTextEditor] = useState({ isReady: false });

    // Local handlers for children to register
    const [actions, setActions] = useState({
        handlePublishEvent: null,
        handleSaveDraft: null,
        publishBlog: null
    });

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Container */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white dark:bg-zinc-900 w-full max-w-3xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-subtle bg-page-secondary/30">
                        <div className="flex items-center gap-3">
                            <img src={profile_img} className="w-10 h-10 rounded-full border border-subtle" alt="Avatar" />
                            <div>
                                <h4 className="font-bold text-title text-sm">{fullname}</h4>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                                    {editorState === "editor" ? translations.write : "Preview & Publish"}
                                </p>
                            </div>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <i className="fi fi-rr-cross-small text-xl text-body"></i>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto p-6 scrollbar-hide">
                        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor, ...actions, setActions }}>
                            {
                                editorState === "editor" 
                                ? <BlogEditor isModal={true} /> 
                                : <PublishForm isModal={true} />
                            }
                        </EditorContext.Provider>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-subtle bg-page-secondary/30 flex justify-between items-center">
                        <p className="text-xs text-body font-medium">
                            {editorState === "editor" 
                                ? "Auto-saving as draft..." 
                                : "Check your tags before posting"}
                        </p>
                        
                        <div className="flex gap-3">
                            {editorState === "editor" ? (
                                <>
                                    <button 
                                        onClick={actions.handleSaveDraft}
                                        className="px-6 py-2.5 rounded-full border border-subtle text-title font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                    >
                                        Save Draft
                                    </button>
                                    <button 
                                        onClick={actions.handlePublishEvent}
                                        className="px-8 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Next
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={() => setEditorState("editor")}
                                        className="px-6 py-2.5 rounded-full border border-subtle text-title font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={actions.publishBlog}
                                        className="px-8 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Publish
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default WriteModal;
