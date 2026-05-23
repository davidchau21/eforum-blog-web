import Table from "@/components/table/table";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Tag, Input, Tooltip, ConfigProvider, Avatar } from "antd";
import {
  Pencil,
  Plus,
  Users,
  Search,
  Mail,
  ShieldCheck,
  MessageSquareOff,
  MessageSquare,
  Calendar,
  X,
  ArrowDown,
  ArrowUp,
  UserX,
  UserCheck,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import userApi from "../../api/userApi";
import { formatDate } from "../../utils/dateUtils";
import ConfirmActionModal from "./modals/confirm-action-modal";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const StaffManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [staffList, setStaffList] = useState({ total: 0, items: [] });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    user: null,
    type: null,
  });

  const [filters, setFilters] = useState({
    role: undefined,
    startDate: undefined,
    endDate: undefined,
    sortOrder: "desc",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const onGet = useCallback(async () => {
    const { ok, body } = await userApi.getAllUser({
      limit: pagination.limit,
      page: pagination.page - 1,
      role: filters.role,
      startDate: filters.startDate,
      endDate: filters.endDate,
      sortOrder: filters.sortOrder,
      query: debouncedSearch || undefined,
    });
    if (ok && body) {
      setStaffList({ items: body.list, total: body.total ?? 0 });
    }
  }, [pagination.limit, pagination.page, filters, debouncedSearch]);

  const [pendingStaff, getAllStaff] = useHandleAsyncRequest(onGet);

  const onPageChange = (page, pageSize) => {
    setPagination((prev) => ({ ...prev, page, limit: pageSize }));
  };

  const columns = useMemo(
    () => [
      {
        title: <TableHeaderColumn label={t("users.col_stt", "STT")} />,
        width: 60,
        fixed: "left",
        render: (_, __, index) => (
          <span className="text-xs font-bold text-slate-400">
            {(pagination.page - 1) * pagination.limit + index + 1}
          </span>
        ),
      },
      {
        dataIndex: "fullname",
        title: <TableHeaderColumn label={t("users.col_user", "Người dùng")} />,
        fixed: "left",
        width: 250,
        render: (_, record) => (
          <div className="flex items-center gap-3 py-1">
            <Avatar
              src={record.personal_info.profile_img}
              size={40}
              className="bg-emerald-500/10 text-emerald-500 font-bold border-2 border-white shadow-sm flex-shrink-0"
            >
              {record.personal_info.fullname?.charAt(0)?.toUpperCase()}
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-slate-700 text-[14px] truncate max-w-[200px]">
                {record.personal_info.fullname}
              </span>
              <span className="text-[12px] text-slate-400 font-medium truncate max-w-[150px]">
                @{record.personal_info.username}
              </span>
            </div>
          </div>
        ),
      },
      {
        dataIndex: "email",
        title: <TableHeaderColumn label={t("users.col_contact", "Liên hệ")} />,
        width: 220,
        render: (_, record) => (
          <div className="flex items-center gap-2 text-[14px] text-slate-500 font-medium">
            <Mail size={14} className="text-slate-400" />
            <span className="truncate">{record.personal_info.email}</span>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label={t("users.col_role", "Vai trò")} />,
        width: 120,
        render: (_, record) => {
          const roleName = record?.role_id?.role_name || record?.personal_info?.role || "USER";
          const getRoleColor = (name) => {
            const lowerName = name.toLowerCase();
            if (lowerName === "super admin") return "red";
            if (lowerName === "admin") return "magenta";
            if (lowerName === "contributor") return "purple";
            if (lowerName === "user") return "blue";
            return "cyan";
          };
          return (
            <Tag
              color={getRoleColor(roleName)}
              bordered={false}
              className="rounded-md px-2 py-0.5 font-bold uppercase text-[10px] tracking-wider"
            >
              {roleName}
            </Tag>
          );
        },
      },
      {
        title: <TableHeaderColumn label={t("users.col_status", "Trạng thái")} />,
        width: 140,
        render: (_, record) =>
          record.blocked_comment ? (
            <Tag
              color="error"
              bordered={false}
              className="flex items-center gap-1 w-fit rounded-md px-2 font-bold text-[10px]"
            >
              <MessageSquareOff size={12} /> {t("users.status_blocked", "BỊ KHÓA")}
            </Tag>
          ) : (
            <Tag
              color="success"
              bordered={false}
              className="flex items-center gap-1 w-fit rounded-md px-2 font-bold text-[10px]"
            >
              <MessageSquare size={12} /> {t("users.status_normal", "BÌNH THƯỜNG")}
            </Tag>
          ),
      },
      {
        title: <TableHeaderColumn label={t("users.col_actions", "Thao tác")} />,
        width: 180,
        fixed: "right",
        render: (_, record) => (
          <div className="flex items-center gap-1">
            <Tooltip title={t("users.tooltip_edit", "Chỉnh sửa")}>
              <Button
                type="text"
                icon={<Pencil size={18} />}
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                onClick={() => navigate(`/users/${record._id}`)}
              />
            </Tooltip>
            <Tooltip
              title={
                record.blocked_comment 
                  ? t("users.tooltip_unmute_comment", "Mở khóa bình luận") 
                  : t("users.tooltip_mute_comment", "Khóa bình luận")
              }
            >
              <Button
                type="text"
                icon={
                  record.blocked_comment ? (
                    <MessageSquare size={18} />
                  ) : (
                    <MessageSquareOff size={18} />
                  )
                }
                className={
                  record.blocked_comment
                    ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl cursor-pointer"
                    : "text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl cursor-pointer"
                }
                onClick={() =>
                  setActionModal({
                    isOpen: true,
                    user: record,
                    type: "block_comment",
                  })
                }
              />
            </Tooltip>
            <Tooltip
              title={
                record.disabled 
                  ? t("users.tooltip_unlock_account", "Mở khóa tài khoản") 
                  : t("users.tooltip_lock_account", "Khóa tài khoản")
              }
            >
              <Button
                type="text"
                icon={
                  record.disabled ? (
                    <UserCheck size={18} />
                  ) : (
                    <UserX size={18} />
                  )
                }
                className={
                  record.disabled
                    ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl cursor-pointer"
                    : "text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl cursor-pointer"
                }
                onClick={() =>
                  setActionModal({
                    isOpen: true,
                    user: record,
                    type: "disable_account",
                  })
                }
              />
            </Tooltip>
            <Tooltip title={t("users.tooltip_delete_account", "Xóa tài khoản")}>
              <Button
                type="text"
                icon={<Trash2 size={18} />}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer"
                onClick={() =>
                  setActionModal({
                    isOpen: true,
                    user: record,
                    type: "delete_account",
                  })
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [navigate, pagination.page, pagination.limit, t],
  );

  const onCloseModal = useCallback(
    (isReload = false) => {
      setActionModal({ isOpen: false, user: null, type: null });
      if (isReload) onGet();
    },
    [onGet],
  );

  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [filters, debouncedSearch]);

  useEffect(() => {
    getAllStaff();
  }, [pagination.page, getAllStaff, filters, debouncedSearch]);

  const getAddNewText = () => {
    if (filters.role === "ADMIN") return t("users.add_admin", "Thêm quản trị viên");
    if (filters.role === "USER") return t("users.add_reader", "Thêm độc giả");
    return t("users.add_new", "Thêm mới");
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981",
          borderRadius: 16,
          colorBorderSecondary: "#f1f5f9",
        },
        components: {
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#64748b",
            headerBorderRadius: 16,
            rowHoverBg: "#f1f5f9",
            cellPaddingBlock: 16,
            cellPaddingInline: 24,
            headerSplitColor: "transparent",
          },
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl shadow-inner">
                <Users size={20} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {t("users.title", "Quản lý người dùng")}
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-11">
              {t("users.subtitle", "Theo dõi hoạt động, phân quyền và kiểm soát.")}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="h-10 px-5 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-black tracking-wide active:scale-95 transition-all cursor-pointer"
              onClick={() => navigate("/users/create")}
            >
              {getAddNewText()}
            </Button>
          </motion.div>
        </div>

        {/* Filters Bar */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm"
        >
          {/* Search Input */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-emerald-500/50 focus-within:bg-white transition-all flex-1 min-w-[200px]">
            <Search size={16} className="text-slate-400" />
            <input
              placeholder={t("users.search_placeholder", "Tìm tên, email hoặc username...")}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-full"
            />
          </div>

          {/* Premium Segmented Slider Role Tabs Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 shadow-inner">
            {[
              { key: undefined, label: t("users.tab_all", "Tất cả người dùng") },
              { key: "ADMIN", label: t("users.tab_admins", "Ban quản trị") },
              { key: "USER", label: t("users.tab_readers", "Độc giả") },
            ].map((tab) => {
              const isActive = filters.role === tab.key;
              return (
                <button
                  key={tab.key || "all"}
                  onClick={() => setFilters((prev) => ({ ...prev, role: tab.key }))}
                  type="button"
                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer relative duration-300 ${
                    isActive
                      ? "bg-white text-emerald-600 shadow-sm shadow-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-500/30 transition-all relative">
            <Calendar size={16} className="text-slate-400" />
            <div className="flex items-center gap-1">
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer"
                value={filters.startDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: e.target.value || undefined,
                  }))
                }
              />
              <span className="text-slate-300 text-xs">-</span>
              <input
                type="date"
                className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 cursor-pointer"
                value={filters.endDate || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    endDate: e.target.value || undefined,
                  }))
                }
              />
            </div>
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    startDate: undefined,
                    endDate: undefined,
                  }))
                }
                className="ml-1 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Xóa bộ lọc ngày"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Spacer to push sort button to the right */}
          <div className="flex-1" />

          {/* Sort Order Toggle */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
              }))
            }
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-500/30 text-slate-600 hover:text-emerald-600 transition-all cursor-pointer"
            title="Sắp xếp theo ngày tạo"
          >
            {filters.sortOrder === "asc" ? (
              <ArrowUp size={16} className="text-emerald-500" />
            ) : (
              <ArrowDown size={16} className="text-emerald-500" />
            )}
            <span className="text-sm font-bold">
              {filters.sortOrder === "asc" 
                ? t("users.sort_asc", "Cũ nhất trước") 
                : t("users.sort_desc", "Mới nhất trước")}
            </span>
          </button>
        </motion.div>

        {/* Table Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 overflow-hidden"
        >
          <Table
            columns={columns}
            loading={pendingStaff}
            data={staffList.items}
            total={staffList.total}
            onPageChange={onPageChange}
            page={pagination.page}
            limit={pagination.limit}
            rowClassName={() =>
              "hover:bg-emerald-50/30 transition-colors duration-300 cursor-default group"
            }
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {actionModal.isOpen && (
            <ConfirmActionModal
              isOpen={actionModal.isOpen}
              onClose={onCloseModal}
              user={actionModal.user}
              type={actionModal.type}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default StaffManagement;
