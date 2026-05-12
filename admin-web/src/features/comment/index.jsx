import Table from "@/components/table/table";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Tag, Switch, Tooltip, ConfigProvider, Avatar } from "antd";
import { 
  MessageSquare, 
  Trash2, 
  FlagIcon, 
  AlertTriangle, 
  User, 
  Calendar,
  Filter,
  MessageCircle
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import commentApi from "../../api/comment";
import DeleteCommentModal from "./modals/delete-comment-modal";
import { formatDate } from "../../utils/dateUtils";
import DeleteReportModal from "./modals/delete-report-modal";

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

const CommentManagement = () => {
  const [pagination, setPagination] = useState({
    page: 1,
  });
  const [comments, setComments] = useState({ total: 0, items: [] });
  const [selectedDelete, setSelectedDelete] = useState(undefined);
  const [isReport, setIsReport] = useState(false);
  const [selectedRemoveReport, setSelectedRemoveReport] = useState(undefined);

  const columns = useMemo(
    () => [
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        width: 80,
        render: (_, record) => <span className="font-mono text-xs text-slate-400">#{record._id.slice(-6)}</span>,
      },
      {
        dataIndex: "user",
        title: <TableHeaderColumn label="Người viết" />,
        width: 200,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">
              {record.commented_by?.personal_info?.fullname?.charAt(0) || "U"}
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-slate-700">@{record.commented_by?.personal_info?.username}</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar size={10} /> {formatDate(record.commentedAt)}
              </span>
            </div>
          </div>
        ),
      },
      {
        dataIndex: "comment",
        title: <TableHeaderColumn label="Nội dung bình luận" />,
        render: (_, record) => (
          <div className="py-2">
            <p className="text-sm text-slate-600 leading-relaxed max-w-[500px] bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
              "{record.comment}"
            </p>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label="Trạng thái" />,
        width: 120,
        render: (_, record) => (
          record.isReport ? (
            <Tag color="error" className="flex items-center gap-1 w-fit rounded-full font-bold px-2 py-0.5">
              <AlertTriangle size={12} /> Báo cáo
            </Tag>
          ) : (
            <Tag color="success" className="rounded-full px-2 py-0.5 font-bold">Ổn định</Tag>
          )
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        width: 120,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Xóa bình luận">
              <Button
                type="text"
                icon={<Trash2 size={18} />}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                onClick={() => setSelectedDelete(record)}
              />
            </Tooltip>
            {record.isReport && (
              <Tooltip title="Gỡ báo cáo">
                <Button
                  type="text"
                  icon={<FlagIcon size={18} />}
                  className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl"
                  onClick={() => setSelectedRemoveReport(record)}
                />
              </Tooltip>
            )}
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
    if (type === "delete") setSelectedDelete(undefined);
    if (type === "remove") setSelectedRemoveReport(undefined);
    if (isReload) setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const onGet = useCallback(async () => {
    const { ok, body } = await commentApi.getAlls({
      limit: 10,
      page: pagination.page - 1,
      isReport: isReport ? isReport : null,
    });
    if (ok && body) {
      setComments({ items: body.list, total: body.total ?? 0 });
    }
  }, [pagination.page, isReport]);

  const [pendingComments, getAllComments] = useHandleAsyncRequest(onGet);

  useEffect(() => {
    getAllComments();
  }, [pagination, isReport, getAllComments]);

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
                <MessageCircle size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý bình luận</h1>
            </div>
            <p className="text-slate-400 font-medium">Kiểm duyệt các tương tác, phản hồi và xử lý báo cáo từ cộng đồng.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Filter size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600">Bị báo cáo</span>
              <Switch
                size="small"
                checked={isReport}
                onChange={(checked) => setIsReport(checked)}
                className={isReport ? "bg-emerald-500" : "bg-slate-200"}
              />
            </div>
          </motion.div>
        </div>

        {/* Table Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <Table
            columns={columns}
            loading={pendingComments}
            data={comments.items}
            onPageChange={onPageChange}
            page={pagination.page}
            total={comments.total}
            rowClassName={() => "hover:bg-slate-50/80 transition-colors cursor-default"}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedDelete && (
            <DeleteCommentModal
              isOpen={!!selectedDelete}
              category={selectedDelete}
              onClose={onCloseModal}
            />
          )}
          {selectedRemoveReport && (
            <DeleteReportModal
              isOpen={!!selectedRemoveReport}
              blog={selectedRemoveReport}
              onClose={onCloseModal}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default CommentManagement;

