import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import LoadMoreDataBtn from "../components/load-more.component";
import { getTranslations } from '../../translations';

const Notifications = () => {
    const { userAuth, userAuth: { access_token, new_notification_available }, setUserAuth } = useContext(UserContext);
    const [filter, setFilter] = useState('all');
    const [notifications, setNotifications] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Trạng thái tải dữ liệu
    const { language } = userAuth;
    const translations = getTranslations(language);

    const filters = ['all', 'like', 'comment', 'reply', 'share'];

    const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
        setIsLoading(true); 
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", { page, filter, deletedDocCount }, {
            headers: { 'Authorization': `Bearer ${access_token}` }
        })
        .then(async ({ data: { notifications: data, totalDocs } }) => {
            if (new_notification_available) {
                setUserAuth({ ...userAuth, new_notification_available: false });
            }

            const formatedData = await filterPaginationData({
                state: notifications,
                data,
                page,
                countRoute: "/all-notifications-count",
                data_to_send: { filter },
                user: access_token,
            });

            setNotifications({ ...formatedData, totalDocs });
            setIsLoading(false); 
        })
        .catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        if (access_token) {
            fetchNotifications({ page: 1 });
        }
    }, [access_token, filter]);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.offsetHeight - 200 && // Gần cuối trang
                notifications && notifications.totalDocs > notifications.results.length &&
                !isLoading
            ) {
                fetchNotifications({ page: notifications.page + 1, deletedDocCount: notifications.deletedDocCount });
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [notifications, isLoading]);

    const handleFilter = (e) => {
        const btn = e.target;
        setFilter(btn.innerHTML);
        setNotifications(null);
    };

    return (
        <div>
            <h1 className="max-md:hidden">{translations.recentNotifications}</h1>

            <div className="my-8 flex gap-6 overflow-x-auto scrollbar-hide">
                {filters.map((filterName, i) => (
                    <button 
                        key={i} 
                        className={`py-2 ${filter === filterName ? "btn-dark" : "btn-light"}`}
                        onClick={handleFilter}
                    >
                        {translations[filterName] || filterName} {/* Dịch tên các filter */}
                    </button>
                ))}
            </div>

            {notifications == null ? (
                <Loader />
            ) : (
                <>
                    {notifications.results.length ? (
                        notifications.results.map((notification, i) => (
                            <AnimationWrapper key={i} transition={{ delay: i * 0.08 }}>
                                <NotificationCard
                                    data={notification}
                                    index={i}
                                    notificationState={{ notifications, setNotifications }}
                                />
                            </AnimationWrapper>
                        ))
                    ) : (
                        <NoDataMessage message={translations.noDataMessage} /> 
                    )}
                    {isLoading && <Loader />}
                </>
            )}
        </div>
    );
};

export default Notifications;
