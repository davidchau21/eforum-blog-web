import { useContext, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";

const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }) => {

    let [ comment, setComment ] = useState('');

    let { _id: user_id } = blog_author;
    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, notifications: { results }, setNotifications } = notificationData;

    const handleComment = () => {

        if(!comment.length){
            return toast.error("Write something to leave a comment....")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id, image: null
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            
            setReplying(false);

            results[index].reply = { comment, _id: data._id, image: null }
            
            setNotifications({ ...notifications, results })

        })
        .catch(err => {
            console.log(err);
        })
    }

    console.log("NotificationCommentField", _id);

    return (
        <>
            <Toaster />
            <textarea value={comment} 
            onChange={(e) => setComment(e.target.value)}     
            placeholder="Nhập câu trả lời..." className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"></textarea>
            <button className="btn-dark mt-5 px-10" onClick={handleComment}
            >Trả lời</button>
        </>
    )
}

export default NotificationCommentField;