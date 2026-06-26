/* eslint-disable react/prop-types */
import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";

const Img = ({ url, caption }) => {

    let { setFullScreenImage } = useContext(BlogContext);

    return (
        <div className="cursor-zoom-in" onClick={() => setFullScreenImage(url)}>
            <img src={url} className="rounded-xl w-full" />
            { caption.length ? <p className="w-full text-center my-3 md:mb-12 text-base text-dark-grey">{caption}</p> : "" }
        </div>
    )
}

const Quote = ({ quote, caption }) => {
    return (
        <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
            <p className="text-xl leading-10 md:text-2xl">{quote}</p>
            {caption.length ? <p className="w-full text-purple text-base">{caption}</p> : ""}
        </div>
    )
}

const List = ({ style, items }) => {
    return (
        <ol className={`pl-5 ${ style == "ordered" ? " list-decimal" : " list-disc"}`}>

            {
               items.map((listItem, i) => {
                    return <li key={i} className="my-4" dangerouslySetInnerHTML={{ __html: listItem }}></li>
               }) 
            }

        </ol>
    )
}

const Embed = ({ embed, caption }) => {
    return (
        <div className="w-full my-6 flex flex-col items-center">
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-md border border-slate-200/60 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#111113]">
                <iframe
                    src={embed}
                    title={caption || "Embedded video"}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
            {caption && caption.length ? (
                <p className="w-full text-center my-3 text-sm text-dark-grey dark:text-slate-450">{caption}</p>
            ) : (
                ""
            )}
        </div>
    )
}

const Video = ({ url, caption }) => {
    return (
        <div className="w-full my-6 flex flex-col items-center">
            <video
                src={url}
                controls
                className="w-full aspect-video rounded-2xl shadow-md border border-slate-200/60 dark:border-zinc-800/80 bg-black"
            ></video>
            {caption && caption.length ? (
                <p className="w-full text-center my-3 text-sm text-dark-grey dark:text-slate-450">{caption}</p>
            ) : (
                ""
            )}
        </div>
    )
}

const BlogContent = ({ block }) => {
    
    let { type, data } = block;

    if(type == "paragraph"){
        return <p dangerouslySetInnerHTML={{ __html: data.text }}></p>
    } 

    if(type == "header"){
        if(data.level == 3){
            return <h3 className="text-3xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h3>
        }
        return <h2 className="text-4xl font-bold" dangerouslySetInnerHTML={{ __html: data.text }}></h2>
    }

    if(type == "image") {
        return <Img url={data.file.url} caption={data.caption} />
    }

    if(type == "quote"){
        return <Quote quote={data.text} caption={data.caption} />
    }
    
    if(type == "list"){
        return <List style={data.style} items={data.items} />
    }

    if(type == "embed") {
        return <Embed embed={data.embed} caption={data.caption} />
    }

    if(type == "video") {
        return <Video url={data.file.url} caption={data.caption} />
    }

}

export default BlogContent