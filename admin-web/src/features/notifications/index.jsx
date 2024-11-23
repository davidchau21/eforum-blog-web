import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CreateNotificationModal from "./modals/create-notification-modal";
// import UpdateNotificationModal from "./modals/update-notification-modal";
import notificationApi from "../../api/notification";
import DeleteNotificationModal from "./modals/delete-notification-modal";

const NotificationManagement = () => {
  const [pagination, setPagination] = useState({
    page: 1,
  });
  const [notificationList, setNotificationList] = useState({ total: 0, items: [] });
  const [isShowCreateModal, setShowCreateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(undefined);
  const [selectedDeleteNotification, setSelectedDeleteNotification] = useState(undefined);

  const columns = useMemo(
    () => [
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        render: (_id) => <TableDataColumn label={_id} />,
      },
      {
        dataIndex: "message",
        title: <TableHeaderColumn label="Nội dung thông báo" />,
        render: (name) => <TableDataColumn label={name} />,
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            {/* <Button
              type="primary"
              htmlType="button"
              icon={<Pencil size={20} />}
              className="min-w-[44px] min-h-[44px]"
              onClick={() => setSelectedNotification(record)}
            /> */}
            <Button
              type="primary"
              htmlType="button"
              icon={<Trash2 size={20} />}
              className="min-w-[44px] min-h-[44px]"
              danger
              onClick={() => setSelectedDeleteNotification(record)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onCloseModal = useCallback((type, isReload = false) => {
    switch (type) {
      case "create":
        setShowCreateModal(false);
        break;
      // case "update":
      //   setSelectedCategory(undefined);
      //   break;
      case "delete":
        setSelectedDeleteNotification(undefined);
        break;
      default:
        break;
    }
    if (isReload) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, []);

  const onGet = useCallback(async () => {
    const { ok, body } = await notificationApi.getAllNotification({
      limit: 10,
      page: pagination.page - 1,
    });
    if (ok && body) {
      setNotificationList({ items: body.list, total: body.total ?? 0 });
    }
  }, [pagination.page]);

  const [pendingNotification, getAllNotifications] = useHandleAsyncRequest(onGet);

  useEffect(() => {
    getAllNotifications(pagination.page);
  }, [pagination, getAllNotifications]);

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xl font-semibold">Danh sách thông báo</h3>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<Plus size={24} />}
            className="h-9 bg-emerald-600 hover:!bg-emerald-600 duration-300 text-sm font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            Thêm thông báo
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={pendingNotification}
        data={notificationList.items}
        total={notificationList.total}
        onPageChange={onPageChange}
        page={pagination.page}
      />

      <CreateNotificationModal isOpen={isShowCreateModal} onClose={onCloseModal} />
      {/* <UpdateNotificationModal
        isOpen={!!selectedNotification}
        category={selectedNotification}
        onClose={onCloseModal}
      /> */}
      <DeleteNotificationModal
        isOpen={!!selectedDeleteNotification}
        alert={selectedDeleteNotification}
        onClose={onCloseModal}
      />
    </div>
  );
};

export default NotificationManagement;
