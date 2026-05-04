import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import NotificationCard from "../components/notification-card.component";
import { getTranslations } from "../../translations";

const Notifications = () => {
  const {
    userAuth,
    userAuth: { access_token, new_notification_available },
    setUserAuth,
  } = useContext(UserContext);
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = userAuth;
  const translations = getTranslations(language);

  const filters = ["all", "like", "comment", "reply", "share"];

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    setIsLoading(true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications/list",
        { page, filter, deletedDocCount },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      )
      .then(async ({ data: { notifications: data, totalDocs } }) => {
        if (new_notification_available > 0) {
          setUserAuth({ ...userAuth, new_notification_available: 0 });
        }

        const formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/notifications/count",
          data_to_send: { filter },
          user: access_token,
        });

        setNotifications({ ...formatedData, totalDocs });
        setIsLoading(false);
      })
      .catch((err) => {
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
          document.documentElement.offsetHeight - 200 &&
        notifications &&
        notifications.totalDocs > notifications.results.length &&
        !isLoading
      ) {
        fetchNotifications({
          page: notifications.page + 1,
          deletedDocCount: notifications.deletedDocCount,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [notifications, isLoading]);

  const handleFilter = (filterName) => {
    setFilter(filterName); // Cập nhật bộ lọc
    setNotifications(null); // Xóa thông báo cũ
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-grey">
        <h1 className="text-2xl font-bold text-black tracking-tight">
          {translations.recentNotifications}
        </h1>
      </div>

      <div className="my-8 flex gap-3 overflow-x-auto scrollbar-hide py-1">
        {filters.map((filterName, i) => (
          <button
            key={i}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-300 whitespace-nowrap ${
              filter === filterName
                ? "bg-black text-white shadow-lg shadow-black/10 scale-105"
                : "bg-grey text-black hover:bg-black/5"
            }`}
            onClick={() => handleFilter(filterName)}
          >
            {translations[filterName] || filterName}
          </button>
        ))}
      </div>

      {notifications == null ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {notifications.results.length ? (
            notifications.results.map((notification, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.05 }}>
                <NotificationCard
                  data={notification}
                  index={i}
                  notificationState={{ notifications, setNotifications }}
                />
              </AnimationWrapper>
            ))
          ) : (
            <div className="py-12 bg-grey/30 rounded-3xl border border-dashed border-grey flex items-center justify-center">
              <NoDataMessage message={translations.noDataMessage} />
            </div>
          )}
          {isLoading && (
            <div className="py-8 flex justify-center">
              <Loader />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
