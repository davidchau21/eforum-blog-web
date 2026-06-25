import { Link } from "react-router-dom";

const UserCard = ({ user }) => {

    let { personal_info: { fullname, username, profile_img } } = user;

    return (
        <Link to={`/user/${username}`} className="flex gap-3.5 items-center mb-4">
            <img src={profile_img} className="w-10 h-10 rounded-full object-cover border border-slate-200/20" />

            <div>
                <h1 className="font-semibold text-sm text-slate-800 dark:text-slate-200 line-clamp-1">{ fullname }</h1>
                <p className="text-xs text-dark-grey"> @{username}</p>
            </div>
        </Link>
    )

}

export default UserCard;