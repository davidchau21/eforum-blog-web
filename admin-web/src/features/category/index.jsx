import Table from "@/components/table/table";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Input, Tag as AntTag, Tooltip, ConfigProvider } from "antd";
import {
  Pencil,
  Plus,
  Trash2,
  Tags,
  Search,
  Hash,
  ArrowUpDown,
  Clock,
  Calendar,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateCategoryModal from "./modals/create-category-modal";
import UpdateCategoryModal from "./modals/update-category-modal";
import tagApi from "../../api/tag";
import DeleteCategoryModal from "./modals/delete-category-modal";
import { formatDate } from "../../utils/dateUtils";

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

const CategoryManagement = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [categoryList, setCategoryList] = useState({ total: 0, items: [] });
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isShowCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [selectedDeleteCategory, setSelectedDeleteCategory] =
    useState(undefined);

  const onSortChange = (pagination, filters, sorter) => {
    if (sorter.order) {
      const { order } = sorter;
      const sortedCategories = [...categoryList.items].sort((a, b) => {
        if (order === "ascend") return a.tag_name.localeCompare(b.tag_name);
        if (order === "descend") return b.tag_name.localeCompare(a.tag_name);
        return 0;
      });
      setFilteredCategories(sortedCategories);
    } else {
      setFilteredCategories(categoryList.items);
    }
  };

  const onGet = useCallback(async () => {
    const { ok, body } = await tagApi.getAllTags({
      limit: pagination.limit,
      page: pagination.page - 1,
    });
    if (ok && body) {
      setCategoryList({ items: body.list, total: body.total ?? 0 });
      setFilteredCategories(body.list);
    }
  }, [pagination.limit, pagination.page]);

  const [pendingCategories, getAllCategories] = useHandleAsyncRequest(onGet);

  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);

      if (keyword.trim()) {
        const { ok, body } = await tagApi.getAllTags({
          limit: 1000,
          page: 0,
        });

        if (ok && body) {
          const filtered = body.list.filter((category) =>
            category.tag_name.toLowerCase().includes(keyword.toLowerCase()),
          );
          setFilteredCategories(filtered);
        }
      } else {
        setFilteredCategories(categoryList.items);
      }
    },
    [categoryList.items],
  );

  const displayedCategories = useMemo(() => {
    if (searchKeyword.trim()) return filteredCategories;
    return categoryList.items;
  }, [searchKeyword, filteredCategories, categoryList.items]);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onCloseModal = useCallback(
    (type, isReload = false) => {
      switch (type) {
        case "create":
          setShowCreateModal(false);
          break;
        case "update":
          setSelectedCategory(undefined);
          break;
        case "delete":
          setSelectedDeleteCategory(undefined);
          break;
        default:
          break;
      }
      if (isReload) onGet();
    },
    [onGet],
  );

  const columns = useMemo(
    () => [
      {
        title: <TableHeaderColumn label="STT" />,
        width: 60,
        fixed: isMobile ? undefined : "left",
        render: (_, __, index) => (
          <span className="text-xs font-bold text-slate-400">
            {(pagination.page - 1) * pagination.limit + index + 1}
          </span>
        ),
      },
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        width: 100,
        render: (_id) => (
          <span className="font-mono text-xs text-slate-400">
            #{_id.slice(-6)}
          </span>
        ),
      },
      {
        dataIndex: "tag_name",
        title: <TableHeaderColumn label="Tên danh mục" />,
        render: (name) => (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg text-slate-400">
              <Hash size={14} />
            </div>
            <AntTag
              bordered={false}
              className="bg-emerald-50 text-emerald-600 font-black px-3 py-1 rounded-full text-sm"
            >
              {name}
            </AntTag>
          </div>
        ),
        sorter: (a, b) => a.tag_name.localeCompare(b.tag_name),
      },
      {
        dataIndex: "total_posts",
        title: <TableHeaderColumn label="Số bài viết" />,
        width: 140,
        render: (total) => (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 w-fit rounded-xl border border-blue-100">
            <span className="text-[13px] font-black text-blue-600">{total || 0}</span>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">bài viết</span>
          </div>
        ),
      },
      {
        title: <TableHeaderColumn label="Thời gian" />,
        width: 200,
        render: (_, record) => {
          const isUpdated = record.updatedAt && new Date(record.updatedAt).getTime() !== new Date(record.createdAt).getTime();
          return (
            <div className="flex flex-col gap-1.5 py-1">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                <Calendar size={12} className="text-slate-400" />
                <span>Tạo lúc: <span className="text-slate-600">{formatDate(record.createdAt)}</span></span>
              </div>
              {isUpdated && (
                <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg w-fit border border-amber-200/50 uppercase tracking-tight">
                  <Clock size={10} />
                  <span>Cập nhật: {formatDate(record.updatedAt)}</span>
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        width: 120,
        fixed: isMobile ? undefined : "right",
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<Pencil size={18} />}
                className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                onClick={() => setSelectedCategory(record)}
              />
            </Tooltip>
            <Tooltip title="Xóa vĩnh viễn">
              <Button
                type="text"
                icon={<Trash2 size={18} />}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                onClick={() => setSelectedDeleteCategory(record)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [pagination.page, pagination.limit, isMobile],
  );

  useEffect(() => {
    getAllCategories();
  }, [pagination.page, getAllCategories]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#10b981",
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
                <Tags size={24} />
              </div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Danh mục thẻ Tag
              </h1>
            </div>
            <p className="text-slate-400 font-medium">
              Quản lý các chủ đề và từ khóa để phân loại nội dung bài viết.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4"
          >
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all focus-within:border-emerald-500/50 focus-within:shadow-emerald-500/5">
              <Search size={18} className="text-slate-400" />
              <input
                placeholder="Tìm tên thẻ..."
                value={searchKeyword}
                onChange={onSearchChange}
                className="bg-transparent border-none outline-none text-sm font-medium text-slate-600 w-64"
              />
            </div>

            <Button
              type="primary"
              icon={<Plus size={20} />}
              className="h-11 px-6 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-2xl shadow-lg shadow-emerald-500/20 text-sm font-black transition-all active:scale-95"
              onClick={() => setShowCreateModal(true)}
            >
              THÊM DANH MỤC
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
            loading={pendingCategories}
            data={displayedCategories}
            total={
              searchKeyword.trim()
                ? filteredCategories.length
                : categoryList.total
            }
            onPageChange={!searchKeyword.trim() ? onPageChange : undefined}
            page={pagination.page}
            onChange={onSortChange}
            rowClassName={() =>
              "hover:bg-slate-50/80 transition-colors cursor-default"
            }
          />
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {isShowCreateModal && (
            <CreateCategoryModal
              isOpen={isShowCreateModal}
              onClose={onCloseModal}
            />
          )}
          {selectedCategory && (
            <UpdateCategoryModal
              isOpen={!!selectedCategory}
              category={selectedCategory}
              onClose={onCloseModal}
            />
          )}
          {selectedDeleteCategory && (
            <DeleteCategoryModal
              isOpen={!!selectedDeleteCategory}
              category={selectedDeleteCategory}
              onClose={onCloseModal}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

export default CategoryManagement;
