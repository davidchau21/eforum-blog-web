// importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

import { uploadImage, uploadVideo } from "../common/aws";

const uploadImageByFile = (e) => {
    return uploadImage(e).then(url => {
        if(url) {
            return {
                success: 1,
                file: { url }
            }
        }
    })
}

const uploadImageByURL = (e) => {
    let link = new Promise(( resolve, reject ) => {
        try {
            resolve(e)
        }
        catch(err) {
            reject(err)
        }
    })

    return link.then(url => {
        return {
            success: 1,
            file: { url }
        }
    })
}

// Custom Video Upload Tool for EditorJS
class VideoTool {
    static get toolbox() {
        return {
            title: 'Video',
            icon: '<svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 4.5V2C12.5 1.45 12.05 1 11.5 1H1.5C0.95 1 0.5 1.45 0.5 2V12C0.5 12.55 0.95 13 1.5 13H11.5C12.05 13 12.5 12.55 12.5 12V9.5L16.5 13.5V1.5L12.5 4.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
    }

    constructor({ data, api, config }) {
        this.data = data;
        this.api = api;
        this.config = config;
        this.wrapper = undefined;
    }

    render() {
        const container = document.createElement('div');
        container.classList.add('cdx-video-container', 'my-4', 'p-4', 'border', 'border-dashed', 'border-slate-300', 'dark:border-zinc-800', 'rounded-2xl', 'bg-slate-50/50', 'dark:bg-white/[0.02]', 'flex', 'flex-col', 'items-center', 'gap-3');

        if (this.data && this.data.file && this.data.file.url) {
            this.showVideoPlayer(container, this.data.file.url, this.data.caption || '');
        } else {
            this.showUploadPlaceholder(container);
        }

        this.wrapper = container;
        return container;
    }

    showUploadPlaceholder(container) {
        container.innerHTML = '';
        
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('w-12', 'h-12', 'rounded-xl', 'bg-rose-500/10', 'text-rose-500', 'flex', 'items-center', 'justify-center', 'text-xl');
        iconDiv.innerHTML = '<i class="fi fi-rr-play-alt"></i>';

        const label = document.createElement('label');
        label.classList.add('text-xs', 'font-black', 'text-slate-700', 'dark:text-slate-350', 'cursor-pointer', 'bg-indigo-600', 'hover:bg-indigo-700', 'text-white', 'py-2', 'px-4', 'rounded-xl', 'transition-all');
        label.innerText = 'Tải video lên (MP4/WEBM)';

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm';
        input.style.display = 'none';

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                label.innerText = 'Đang tải lên...';
                label.style.pointerEvents = 'none';
                
                try {
                    const url = await this.config.uploader(file);
                    if (url) {
                        this.data = {
                            file: { url },
                            caption: file.name
                        };
                        this.showVideoPlayer(container, url, file.name);
                    } else {
                        label.innerText = 'Tải video lên (MP4/WEBM)';
                        label.style.pointerEvents = 'auto';
                        alert('Tải video thất bại.');
                    }
                } catch (err) {
                    label.innerText = 'Tải video lên (MP4/WEBM)';
                    label.style.pointerEvents = 'auto';
                    alert('Lỗi tải video: ' + err.message);
                }
            }
        });

        label.appendChild(input);
        container.appendChild(iconDiv);
        container.appendChild(label);
        
        const hint = document.createElement('p');
        hint.classList.add('text-[10px]', 'text-slate-400');
        hint.innerText = 'Hỗ trợ video MP4, WEBM tối đa 50MB';
        container.appendChild(hint);
    }

    showVideoPlayer(container, url, captionText = '') {
        container.innerHTML = '';
        container.classList.remove('border-dashed', 'p-4', 'bg-slate-50/50', 'dark:bg-white/[0.02]');
        container.classList.add('p-0', 'border-none');

        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.classList.add('w-full', 'aspect-video', 'rounded-2xl', 'shadow-md', 'bg-black');

        const caption = document.createElement('input');
        caption.type = 'text';
        caption.placeholder = 'Nhập chú thích video...';
        caption.value = captionText;
        caption.classList.add('w-full', 'text-center', 'mt-3', 'text-sm', 'text-dark-grey', 'dark:text-slate-400', 'bg-transparent', 'border-none', 'outline-none');
        
        caption.addEventListener('input', (e) => {
            this.data.caption = e.target.value;
        });

        container.appendChild(video);
        container.appendChild(caption);
    }

    save(blockContent) {
        return {
            file: this.data.file,
            caption: this.data.caption || ''
        };
    }
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile,
            }
        }
    },
    video: {
        class: VideoTool,
        config: {
            uploader: uploadVideo
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading....",
            levels: [2, 3],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode
}