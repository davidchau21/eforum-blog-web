import Table from "@/components/table/table";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Tooltip, ConfigProvider } from "antd";
import { 
  Plus, 
  Trash2, 
  Bell, 
  Search, 
  MessageSquare, 
  Info,
  Calendar
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateNotificationModal from "./modals/create-notification-modal";
import notificationApi from "../../api/notification";
import DeleteNotificationModal from "./modals/delete-notification-modal";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const NotificationManagement = () => {
  const [pagination, setPagination] = useState({
    page: 1,
  });
  const [notificationList, setNotificationList] = useState({ total: 0, items: [] });
  const [isShowCreateModal, setShowCreateModal] = useState(false);
  const [selectedDeleteNotification, setSelectedDeleteNotification] = useState(undefined);

  const columns = useMemo(
    () => [
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        width: 100,
        render: (_id) => <span className="font-mono text-xs text-slate-400">#{_id.slice(-6)}</span>,
      },
      {
        dataIndex: "message",
        title: <TableHeaderColumn label="Nội dung thông báo" />,
        render: (message) => (
          <div className="flex items-start gap-3 py-2">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-xl mt-0.5">
              <Info size={16} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-slate-700 leading-relaxed max-w-[600px]">
                {message}
              </p>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                <Bell size={10} /> Hệ thống
              </span>
            </div>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        width: 120,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Xóa thông báo">
              <Button
                type="text"
                icon={<Trash2 size={18} />}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                onClick={() => setSelectedDeleteNotification(record)}
              />
            </Tooltip>
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
    if (type === "create") setShowCreateModal(false);
    if (type === "delete") setSelectedDeleteNotification(undefined);
    if (isReload) setPagination((prev) => ({ ...prev, page: 1 }));
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
    getAllNotifications();
  }, [pagination, getAllNotifications]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 12,
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 font-exo-2"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <Bell size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Hệ thống thông báo</h1>
            </div>
            <p className="text-slate-400 font-medium">Gửi thông báo đẩy và quản lý các bản tin cập nhật cho toàn bộ người dùng.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <Button
              type="primary"
              icon={<Plus size={20} />}
              className="h-11 px-6 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black transition-all active:scale-95"
              onClick={() => setShowCreateModal(true)}
            >
              TẠO THÔNG BÁO MỚI
            </Button>
          </motion.div>
        </div>

        {/* Table Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <Table
            columns={columns}
            loading={pendingNotification}
            data={notificationList.items}
            total={notificationList.total}
            onPageChange={onPageChange}
            page={pagination.page}
            rowClassName={() => "hover:bg-slate-50/80 transition-colors cursor-default"}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {isShowCreateModal && (
            <CreateNotificationModal isOpen={isShowCreateModal} onClose={onCloseModal} />
          )}
          {selectedDeleteNotification && (
            <DeleteNotificationModal
              isOpen={!!selectedDeleteNotification}
              alert={selectedDeleteNotification}
              onClose={onCloseModal}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default NotificationManagement;

