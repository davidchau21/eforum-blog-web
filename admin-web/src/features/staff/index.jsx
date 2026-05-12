import Table from "@/components/table/table";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Tag, Input, Tooltip, ConfigProvider, Avatar } from "antd";
import { 
  LockIcon, 
  Pencil, 
  Plus, 
  UnlockIcon, 
  Users, 
  Search, 
  Mail, 
  User, 
  ShieldCheck,
  MessageSquareOff,
  MessageSquare
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import userApi from "../../api/userApi";
import { formatDate } from "../../utils/dateUtils";
import BlockCommentModal from "./modals/block-comment-modal";

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

const StaffManagement = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [staffList, setStaffList] = useState({ total: 0, items: [] });
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState(undefined);

  const onGet = useCallback(async () => {
    const { ok, body } = await userApi.getAllUser({
      limit: pagination.limit,
      page: pagination.page - 1,
    });
    if (ok && body) {
      setStaffList({ items: body.list, total: body.total ?? 0 });
      setFilteredStaff(body.list);
    }
  }, [pagination.limit, pagination.page]);

  const [pendingStaff, getAllStaff] = useHandleAsyncRequest(onGet);

  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);

      if (keyword.trim()) {
        const { ok, body } = await userApi.getAllUser({
          limit: 1000,
          page: 0,
        });
        if (ok && body) {
          const filtered = body.list.filter((user) =>
            user.personal_info.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.personal_info.email.toLowerCase().includes(keyword.toLowerCase())
          );
          setFilteredStaff(filtered);
        }
      } else {
        setFilteredStaff(staffList.items);
      }
    },
    [staffList.items]
  );

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const columns = useMemo(
    () => [
      {
        dataIndex: "id",
        title: <TableHeaderColumn label="ID" />,
        width: 80,
        render: (_, record) => <span className="font-mono text-xs text-slate-400">#{record._id.slice(-6)}</span>,
      },
      {
        dataIndex: "user",
        title: <TableHeaderColumn label="Người dùng" />,
        render: (_, record) => (
          <div className="flex items-center gap-3">
            <Avatar 
              size={40} 
              className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold"
            >
              {record.personal_info.fullname?.charAt(0) || "U"}
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-700 truncate">{record.personal_info.fullname}</span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <User size={10} /> @{record.personal_info.username}
              </span>
            </div>
          </div>
        ),
      },
      {
        dataIndex: "email",
        title: <TableHeaderColumn label="Liên hệ" />,
        render: (_, record) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Mail size={14} className="text-slate-400" /> {record.personal_info.email}
            </span>
            <span className="text-[11px] text-slate-400 italic">Tham gia: {formatDate(record.joinedAt)}</span>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label="Vai trò" />,
        width: 120,
        render: (_, record) => (
          <Tag color="blue" bordered={false} className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-wider">
            {record?.personal_info?.role || "USER"}
          </Tag>
        ),
      },
      {
        dataIndex: "status",
        title: <TableHeaderColumn label="Trạng thái" />,
        width: 150,
        render: (_, record) => (
          <Tag
            bordered={false}
            color={record.verified ? "success" : "default"}
            className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-wider"
          >
            {record.verified ? "Đã xác thực" : "Chưa xác thực"}
          </Tag>
        ),
      },
      {
        title: <TableHeaderColumn label="Bình luận" />,
        width: 120,
        render: (_, record) => (
          record.blocked_comment ? (
            <Tag color="error" bordered={false} className="flex items-center gap-1 w-fit rounded-full px-2 font-bold text-[10px]">
              <MessageSquareOff size={12} /> BỊ KHÓA
            </Tag>
          ) : (
            <Tag color="success" bordered={false} className="flex items-center gap-1 w-fit rounded-full px-2 font-bold text-[10px]">
              <MessageSquare size={12} /> BÌNH THƯỜNG
            </Tag>
          )
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        width: 120,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<Pencil size={18} />}
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                onClick={() => navigate(`/users/${record._id}`)}
              />
            </Tooltip>
            <Tooltip title={record.blocked_comment ? "Mở khóa bình luận" : "Khóa bình luận"}>
              <Button
                type="text"
                icon={record.blocked_comment ? <UnlockIcon size={18} /> : <LockIcon size={18} />}
                className={record.blocked_comment ? "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl" : "text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"}
                onClick={() => setSelectedUser(record)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const displayedStaff = useMemo(() => {
    if (searchKeyword.trim()) {
      return filteredStaff;
    }
    return staffList.items;
  }, [searchKeyword, filteredStaff, staffList.items]);

  const onCloseModal = useCallback(
    (type, isReload = false) => {
      if (type === "block") setSelectedUser(undefined);
      if (isReload) onGet();
    },
    [onGet]
  );

  useEffect(() => {
    getAllStaff();
  }, [pagination.page, getAllStaff]);

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
                <Users size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý người dùng</h1>
            </div>
            <p className="text-slate-400 font-medium">Theo dõi hoạt động, phân quyền và kiểm soát tương tác cộng đồng.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/5">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm tên, email hoặc username..."
                value={searchKeyword}
                onChange={onSearchChange}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-64"
              />
            </div>

            <Button
              type="primary"
              icon={<Plus size={20} />}
              className="h-11 px-6 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black transition-all active:scale-95"
              onClick={() => navigate("/users/create")}
            >
              THÊM NGƯỜI DÙNG
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
            loading={pendingStaff}
            data={displayedStaff}
            total={searchKeyword.trim() ? filteredStaff.length : staffList.total}
            onPageChange={!searchKeyword.trim() ? onPageChange : undefined}
            page={pagination.page}
            rowClassName={() => "hover:bg-slate-50/80 transition-colors cursor-default"}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedUser && (
            <BlockCommentModal
              isOpen={!!selectedUser}
              onClose={onCloseModal}
              user={selectedUser}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default StaffManagement;

