import { createContext } from 'react';

export const blogStructure = {
    title: '',
    banner: '',
    bannerFile: null, // To store raw File object for lazy upload
    content: [],
    tags: [],
    des: '',
    author: { personal_info: { } }
};

export const EditorContext = createContext({ 
    blog: {},
    setBlog: () => {},
    editorState: "editor",
    setEditorState: () => {},
    textEditor: { isReady: false },
    setTextEditor: () => {},
    // Triggers for Modal communication
    handlePublishEvent: null, 
    handleSaveDraft: null,
    publishBlog: null
}); 
