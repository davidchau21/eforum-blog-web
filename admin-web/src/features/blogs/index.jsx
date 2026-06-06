import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Tag, Input, Switch, Tooltip, ConfigProvider, DatePicker, message } from "antd";
import { 
  FlagIcon, 
  LockIcon, 
  Pencil, 
  Plus, 
  Trash2, 
  UnlockIcon, 
  Search,
  Filter,
  FileText,
  AlertTriangle,
  User,
  Calendar as CalendarIcon
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "../../utils/dateUtils";
import dayjs from "dayjs";
import blogApi from "../../api/blogApi";
import DeleteModal from "./modals/delete-modal";
import ActiveModal from "./modals/active-modal";
import DeleteReportModal from "./modals/deleteReportModal";

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

const BlogManagement = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [blogList, setBlogList] = useState({ total: 0, items: [] });
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedActive, setSelectedActive] = useState(undefined);
  const [selectedDelete, setSelectedDelete] = useState(undefined);
  const [selectedRemoveReport, setSelectedRemoveReport] = useState(undefined);
  const [isReport, setIsReport] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);



  const onGet = useCallback(async () => {
    const params = {
      limit: pagination.limit,
      page: pagination.page - 1,
      isReport: isReport ? isReport : null,
    };
    if (dateRange && dateRange[0]) {
      params.startDate = dateRange[0].startOf('day').toISOString();
    }
    if (dateRange && dateRange[1]) {
      params.endDate = dateRange[1].endOf('day').toISOString();
    }
    const { ok, body } = await blogApi.getAllBlogs(params);
    if (ok && body) {
      setBlogList({ items: body.list, total: body.total ?? 0 });
      setFilteredBlogs(body.list);
    }
  }, [pagination.limit, pagination.page, isReport, dateRange]);

  const [pendingBlogs, getAllBlogs] = useHandleAsyncRequest(onGet);

  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);

      if (keyword.trim()) {
        const { ok, body } = await blogApi.getAllBlogs({
          limit: 1000,
          page: 0,
        });
        if (ok && body) {
          const filtered = body.list.filter((blog) =>
            blog.title.toLowerCase().includes(keyword.toLowerCase()) ||
            blog.author.personal_info.username.toLowerCase().includes(keyword.toLowerCase())
          );
          setFilteredBlogs(filtered);
        }
      } else {
        setFilteredBlogs(blogList.items);
      }
    },
    [blogList.items]
  );

  const displayedBlogs = useMemo(() => {
    if (searchKeyword.trim()) {
      return filteredBlogs;
    }
    return blogList.items;
  }, [searchKeyword, filteredBlogs, blogList.items]);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onCloseModal = useCallback(
    (type, isReload = false) => {
      switch (type) {
        case "active": setSelectedActive(undefined); break;
        case "delete": setSelectedDelete(undefined); break;
        case "remove": setSelectedRemoveReport(undefined); break;
        default: break;
      }
      if (isReload) onGet();
    },
    [onGet]
  );

  const columns = useMemo(
    () => [
      {
        title: <TableHeaderColumn label="STT" />,
        width: 60,
        render: (_, __, index) => (
          <span className="font-bold text-slate-400">
            {(pagination.page - 1) * pagination.limit + index + 1}
          </span>
        ),
      },
      {
        dataIndex: "blog_id",
        title: <TableHeaderColumn label="ID" />,
        width: 80,
        render: (_, record) => <span className="font-mono text-xs text-slate-400">#{record.blog_id.slice(-6)}</span>,
      },
      {
        dataIndex: "title",
        title: <TableHeaderColumn label="Bài viết" />,
        render: (_, record) => (
          <div className="flex flex-col gap-0.5 max-w-[300px]">
            <span className="font-bold text-slate-700 truncate" title={record.title}>{record.title}</span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CalendarIcon size={10} /> {formatDate(record.publishedAt)}
            </span>
          </div>
        ),
        sorter: (a, b) => a.title.localeCompare(b.title),
      },
      {
        dataIndex: "status",
        title: <TableHeaderColumn label="Trạng thái" />,
        width: 150,
        render: (_, record) => (
          <Tag
            bordered={false}
            color={record.isActive ? "success" : "warning"}
            className="rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-wider"
          >
            {record.isActive ? "Hoạt động" : "Tạm khóa"}
          </Tag>
        ),
      },
      {
        dataIndex: "author",
        title: <TableHeaderColumn label="Tác giả" />,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <User size={16} />
            </div>
            <span className="font-medium text-slate-600">{record.author.personal_info.username}</span>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label="Báo cáo" />,
        width: 120,
        render: (_, record) => (
          record.isReport ? (
            <Tooltip title={`Báo cáo bởi: ${record.reportUser?.personal_info?.username || "Ẩn danh"}`}>
              <Tag color="error" className="flex items-center gap-1 w-fit rounded-full font-bold">
                <AlertTriangle size={12} /> Bị báo cáo
              </Tag>
            </Tooltip>
          ) : <span className="text-slate-300 text-xs italic">Không có</span>
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        width: 200,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<Pencil size={18} />}
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                onClick={() => navigate(`/blogs/${record.blog_id}`)}
              />
            </Tooltip>
            <Tooltip title={record.isActive ? "Khóa bài viết" : "Mở khóa bài viết"}>
              <Button
                type="text"
                icon={record.isActive ? <UnlockIcon size={18} /> : <LockIcon size={18} />}
                className={record.isActive ? "text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl" : "text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl"}
                onClick={() => setSelectedActive(record)}
              />
            </Tooltip>
            <Tooltip title="Xóa vĩnh viễn">
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
    [navigate, pagination.page, pagination.limit]
  );

  useEffect(() => {
    getAllBlogs();
  }, [pagination.page, getAllBlogs, isReport, dateRange]);

  // Bulk action handlers
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const handleBulkDelete = useCallback(async () => {
    if (!selectedRowKeys.length) return;
    setBulkLoading(true);
    let successCount = 0;
    for (const id of selectedRowKeys) {
      try {
        const blog = displayedBlogs.find(b => (b._id || b.blog_id) === id);
        if (blog) {
          await blogApi.deleteBlog(blog._id || blog.blog_id);
          successCount++;
        }
      } catch (e) { /* skip */ }
    }
    message.success(`Đã xóa ${successCount}/${selectedRowKeys.length} bài viết`);
    setSelectedRowKeys([]);
    setBulkLoading(false);
    onGet();
  }, [selectedRowKeys, displayedBlogs, onGet]);

  const handleBulkToggleActive = useCallback(async () => {
    if (!selectedRowKeys.length) return;
    setBulkLoading(true);
    let successCount = 0;
    for (const id of selectedRowKeys) {
      try {
        const blog = displayedBlogs.find(b => (b._id || b.blog_id) === id);
        if (blog) {
          await blogApi.activeBlog(blog.blog_id);
          successCount++;
        }
      } catch (e) { /* skip */ }
    }
    message.success(`Đã chuyển trạng thái ${successCount}/${selectedRowKeys.length} bài viết`);
    setSelectedRowKeys([]);
    setBulkLoading(false);
    onGet();
  }, [selectedRowKeys, displayedBlogs, onGet]);

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
                <FileText size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Quản lý bài đăng</h1>
            </div>
            <p className="text-slate-400 font-medium">Quản lý nội dung, kiểm duyệt và xử lý báo cáo từ người dùng.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/5">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm tiêu đề hoặc tác giả..."
                value={searchKeyword}
                onChange={onSearchChange}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-64"
              />
            </div>

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

            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/5">
              <CalendarIcon size={18} className="text-slate-400" />
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => {
                  setDateRange(dates);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                format="DD/MM/YYYY"
                placeholder={["Từ ngày", "Đến ngày"]}
                allowClear
                bordered={false}
                className="!bg-transparent !shadow-none !p-0 font-medium text-slate-600"
                style={{ width: 240 }}
              />
            </div>

            <Button
              type="primary"
              icon={<Plus size={20} />}
              className="h-11 px-6 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black transition-all active:scale-95"
              onClick={() => navigate("/blogs/create")}
            >
              TẠO BÀI VIẾT MỚI
            </Button>
          </motion.div>
        </div>



        {/* Bulk Action Bar */}
        <AnimatePresence>
          {selectedRowKeys.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
            >
              <span className="text-sm font-bold">Đã chọn {selectedRowKeys.length} bài viết</span>
              <div className="w-px h-6 bg-slate-600" />
              <Button
                size="small"
                loading={bulkLoading}
                icon={<LockIcon size={14} />}
                className="bg-amber-500 hover:!bg-amber-600 text-white border-none rounded-xl text-xs font-bold"
                onClick={handleBulkToggleActive}
              >
                Khóa/Mở khóa
              </Button>
              <Button
                size="small"
                loading={bulkLoading}
                danger
                icon={<Trash2 size={14} />}
                className="rounded-xl text-xs font-bold"
                onClick={handleBulkDelete}
              >
                Xóa hàng loạt
              </Button>
              <Button
                size="small"
                type="text"
                className="text-slate-300 hover:!text-white rounded-xl text-xs font-bold"
                onClick={() => setSelectedRowKeys([])}
              >
                Bỏ chọn
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <Table
            columns={columns}
            loading={pendingBlogs}
            data={displayedBlogs}
            total={searchKeyword.trim() ? filteredBlogs.length : blogList.total}
            onPageChange={!searchKeyword.trim() ? onPageChange : undefined}
            page={pagination.page}
            rowClassName={() => "hover:bg-slate-50/80 transition-colors cursor-default"}
            rowSelection={rowSelection}
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {selectedDelete && (
            <DeleteModal isOpen={!!selectedDelete} blog={selectedDelete} onClose={onCloseModal} />
          )}
          {selectedRemoveReport && (
            <DeleteReportModal isOpen={!!selectedRemoveReport} blog={selectedRemoveReport} onClose={onCloseModal} />
          )}
          {selectedActive && (
            <ActiveModal isOpen={!!selectedActive} blog={selectedActive} onClose={onCloseModal} />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default BlogManagement;

