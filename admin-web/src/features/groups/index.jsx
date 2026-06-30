import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, ConfigProvider, Switch, Tag, Tooltip, Avatar } from "antd";
import {
  Users2,
  Search,
  Filter,
  LockIcon,
  UnlockIcon,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../../utils/dateUtils";
import groupApi from "../../api/groupApi";
import ActiveModal from "./modals/active-modal";
import DeleteModal from "./modals/delete-modal";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const GroupManagement = () => {
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [groupList, setGroupList] = useState({
    total: 0,
    items: [],
    totalActive: 0,
    totalDisabled: 0,
    totalPrivate: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [filterDisabled, setFilterDisabled] = useState(false);
  const [selectedActive, setSelectedActive] = useState(undefined);
  const [selectedDelete, setSelectedDelete] = useState(undefined);

  const onGet = useCallback(async () => {
    const params = {
      limit: pagination.limit,
      page: pagination.page - 1,
      isDisabled: filterDisabled ? true : null,
    };
    const { ok, body } = await groupApi.getAllGroups(params);
    if (ok && body) {
      setGroupList({
        items: body.list,
        total: body.total ?? 0,
        totalActive: body.totalActive ?? 0,
        totalDisabled: body.totalDisabled ?? 0,
        totalPrivate: body.totalPrivate ?? 0,
      });
      setFilteredGroups(body.list);
    }
  }, [pagination.limit, pagination.page, filterDisabled]);

  const [pendingGroups, getAllGroups] = useHandleAsyncRequest(onGet);

  useEffect(() => {
    getAllGroups();
  }, [getAllGroups]);

  const onSearchChange = useCallback(
    (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);
      if (keyword.trim()) {
        const filtered = groupList.items.filter(
          (g) =>
            g.name?.toLowerCase().includes(keyword.toLowerCase()) ||
            g.creator?.personal_info?.fullname?.toLowerCase().includes(keyword.toLowerCase()) ||
            g.creator?.personal_info?.username?.toLowerCase().includes(keyword.toLowerCase())
        );
        setFilteredGroups(filtered);
      } else {
        setFilteredGroups(groupList.items);
      }
    },
    [groupList.items]
  );

  const onPageChange = (page, pageSize) => {
    setPagination({ page, limit: pageSize });
  };

  const onCloseModal = (type, success) => {
    if (type === "active") setSelectedActive(undefined);
    if (type === "delete") setSelectedDelete(undefined);
    if (success) getAllGroups();
  };

  const displayedGroups = useMemo(
    () => (searchKeyword.trim() ? filteredGroups : groupList.items),
    [searchKeyword, filteredGroups, groupList.items]
  );

  const columns = [
    {
      title: <TableHeaderColumn label="STT" />,
      width: 60,
      render: (_, __, idx) => (
        <TableDataColumn
          label={String((pagination.page - 1) * pagination.limit + idx + 1)}
        />
      ),
    },
    {
      title: <TableHeaderColumn label="Nhóm học tập" />,
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.avatar || undefined}
            size={40}
            shape="square"
            className="rounded-xl bg-indigo-100 text-indigo-600 font-bold text-base shrink-0"
          >
            {!record.avatar && record.name?.charAt(0).toUpperCase()}
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 text-sm truncate">{record.name}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5 line-clamp-1">{record.description || "Chưa có mô tả"}</p>
          </div>
        </div>
      ),
    },
    {
      title: <TableHeaderColumn label="Người tạo" />,
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <img
            src={record.creator?.personal_info?.profile_img}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
            alt=""
          />
          <div>
            <p className="text-xs font-bold text-slate-700 truncate">
              {record.creator?.personal_info?.fullname}
            </p>
            <p className="text-[11px] text-slate-400">
              @{record.creator?.personal_info?.username}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: <TableHeaderColumn label="Thành viên" />,
      width: 110,
      render: (_, record) => (
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <Users2 size={14} className="text-blue-500" />
          </div>
          <span className="font-bold text-slate-700 text-sm">{record.memberCount ?? 0}</span>
        </div>
      ),
    },
    {
      title: <TableHeaderColumn label="Bài đăng" />,
      width: 100,
      render: (_, record) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
          {record.postCount ?? 0} bài
        </span>
      ),
    },
    {
      title: <TableHeaderColumn label="Loại" />,
      width: 110,
      render: (_, record) => (
        <Tag
          className={`rounded-full text-[11px] font-bold px-3 border-none ${
            record.isPrivate
              ? "bg-purple-100 text-purple-600"
              : "bg-sky-100 text-sky-600"
          }`}
        >
          {record.isPrivate ? "🔒 Riêng tư" : "🌐 Công khai"}
        </Tag>
      ),
    },
    {
      title: <TableHeaderColumn label="Trạng thái" />,
      width: 130,
      render: (_, record) => (
        <Tag
          className={`rounded-full text-[11px] font-bold px-3 border-none ${
            record.isDisabled
              ? "bg-rose-100 text-rose-600"
              : "bg-emerald-100 text-emerald-600"
          }`}
        >
          {record.isDisabled ? "⛔ Vô hiệu hóa" : "✅ Đang hoạt động"}
        </Tag>
      ),
    },
    {
      title: <TableHeaderColumn label="Ngày tạo" />,
      width: 130,
      render: (_, record) => (
        <TableDataColumn label={formatDate(record.createdAt)} />
      ),
    },
    {
      title: <TableHeaderColumn label="Thao tác" />,
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Tooltip
            title={record.isDisabled ? "Kích hoạt lại nhóm" : "Vô hiệu hóa nhóm"}
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedActive(record)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                record.isDisabled
                  ? "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                  : "bg-amber-50 text-amber-500 hover:bg-amber-100"
              }`}
            >
              {record.isDisabled ? <UnlockIcon size={15} /> : <LockIcon size={15} />}
            </motion.button>
          </Tooltip>

          <Tooltip title="Xóa vĩnh viễn nhóm">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedDelete(record)}
              className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <Trash2 size={15} />
            </motion.button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#6366f1",
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                <Users2 size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Quản lý nhóm học tập
              </h1>
            </div>
            <p className="text-slate-400 font-medium">
              Giám sát toàn bộ nhóm học tập, vô hiệu hóa hoặc xóa nhóm vi phạm quy định hệ thống.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-indigo-500/50">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm tên nhóm hoặc người tạo..."
                value={searchKeyword}
                onChange={onSearchChange}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-64"
              />
            </div>

            {/* Filter disabled */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <Filter size={18} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-600">Bị vô hiệu hóa</span>
              <Switch
                size="small"
                checked={filterDisabled}
                onChange={(v) => {
                  setFilterDisabled(v);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className={filterDisabled ? "bg-indigo-500" : "bg-slate-200"}
              />
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Tổng nhóm",
              value: groupList.total,
              color: "bg-indigo-50 text-indigo-600",
            },
            {
              label: "Đang hoạt động",
              value: groupList.totalActive,
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Vô hiệu hóa",
              value: groupList.totalDisabled,
              color: "bg-rose-50 text-rose-600",
            },
            {
              label: "Riêng tư",
              value: groupList.totalPrivate,
              color: "bg-purple-50 text-purple-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-2xl px-5 py-4 flex flex-col gap-1`}
            >
              <span className="text-2xl font-black">{stat.value}</span>
              <span className="text-xs font-bold opacity-70">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <Table
            columns={columns}
            loading={pendingGroups}
            data={displayedGroups}
            total={searchKeyword.trim() ? filteredGroups.length : groupList.total}
            onPageChange={!searchKeyword.trim() ? onPageChange : undefined}
            page={pagination.page}
            rowClassName={() => "hover:bg-slate-50/80 transition-colors cursor-default"}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedActive && (
            <ActiveModal
              isOpen={!!selectedActive}
              group={selectedActive}
              onClose={onCloseModal}
            />
          )}
          {selectedDelete && (
            <DeleteModal
              isOpen={!!selectedDelete}
              group={selectedDelete}
              onClose={onCloseModal}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default GroupManagement;
