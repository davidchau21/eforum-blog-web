import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { StatusColorMapper } from "@/mappers/staff";
import { Button, Tag, Input } from "antd";
import { FlagIcon, LockIcon, Pencil, Plus, Trash2, UnlockIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import blogApi from "../../api/blogApi";
import DeleteModal from "./modals/delete-modal";
import ActiveModal from "./modals/active-modal";
import DeleteReportModal from "./modals/deleteReportModal";

const BlogManagement = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({  page: 1,
    limit: 10, });
  const [blogList, setBlogList] = useState({ total: 0, items: [] });
  const [total, setTotal] = useState(0);
  const [seletedActive, setSelectedActive] = useState(undefined);
  const [selectedDelete, setSelectedDelete] = useState(undefined);
  const [selectedRemoveReport, setSelectedRemoveReport] = useState(undefined);
  const [isReport, setIsReport] = useState(false);
  const [filteredBlogs, setFilteredBlogs] = useState([]); // Danh sách sau khi lọc
  const [searchKeyword, setSearchKeyword] = useState("");

  const onGet = useCallback(async () => {
    const { ok, body } = await blogApi.getAllBlogs({
      limit: pagination.limit,
      page: pagination.page - 1,
      isReport: isReport ? isReport : null,
    });
    if (ok && body) {
      setBlogList({ items: body.list, total: body.total ?? 0 });
      setFilteredBlogs(body.list); // Đồng bộ danh sách lọc
    }
  }, [pagination.limit, pagination.page, isReport]);

  

  const [pendingIngredients, getAllIngredients] = useHandleAsyncRequest(onGet);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const [pendingBlogs, getAllBlogs] = useHandleAsyncRequest(onGet);
  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);
  
      if (keyword.trim()) {
        // Gọi API để lấy toàn bộ danh sách nếu cần thiết
        const { ok, body } = await blogApi.getAllBlogs({
          limit: 1000, // Lấy đủ dữ liệu cần tìm
          page: 0,
        });
  
        if (ok && body) {
          const filtered = body.list.filter((blog) =>
            blog.title.toLowerCase().includes(keyword.toLowerCase()) ||
            blog.author.personal_info.username.toLowerCase().includes(keyword.toLowerCase())
          );
          setFilteredBlogs(filtered); // Hiển thị tất cả kết quả trên một trang
        }
      } else {
        // Hiển thị toàn bộ dữ liệu của trang hiện tại nếu không tìm kiếm
        setFilteredBlogs(blogList.items);
      }
    },
    [blogList.items]
  );
  
  const displayedBlogs = useMemo(() => {
    if (searchKeyword.trim()) {
      return filteredBlogs; // Hiển thị danh sách tìm kiếm
    }
    return blogList.items; // Hiển thị danh sách phân trang
  }, [searchKeyword, filteredBlogs, blogList.items]);
  
  useEffect(() => {
    getAllIngredients();
  }, [pagination.page, isReport]);
  

  const columns = useMemo(
    () => [
      {
        dataIndex: "blog_id",
        title: <TableHeaderColumn label="ID" />,
        render: (_, record) => <TableDataColumn label={record.blog_id} />,
      },
      {
        dataIndex: "title",
        title: <TableHeaderColumn label="Tiêu đề" />,
        render: (_, record) => <TableDataColumn label={record.title} />,
      },
      {
        dataIndex: "status",
        title: <TableHeaderColumn label="Trạng thái" />,
        render: (_, record) => (
          <Tag
            bordered={false}
            color={
              record.isActive
                ? StatusColorMapper["ACTIVE"]
                : StatusColorMapper["INACTIVE"]
            }
            className="text-sm font-exo-2"
          >
            {record.isActive ? "Kích hoạt" : "Chưa kích hoạt"}
          </Tag>
        ),
      },
      {
        title: <TableHeaderColumn label="Tác giả" />,
        render: (_, record) => (
          <TableDataColumn label={`${record.author.personal_info.username}`} />
        ),
      },
      {
        title: <TableHeaderColumn label="Ngày tạo" />,
        render: (_, record) => (
          <TableDataColumn label={`${formatDate(record.publishedAt)}`} />
        ),
      },
      {
        title: <TableHeaderColumn label="Người báo cáo" />,
        render: (_, record) => (
          <TableDataColumn
            label={
              record.reportUser
                ? record.reportUser.personal_info.username
                : "--"
            }
          />
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        render: (_, record) => (
          <div className="flex items-center gap-2">
            <Button
              type="primary"
              htmlType="button"
              icon={<Pencil size={20} />}
              className="min-w-[44px] min-h-[44px]"
              onClick={() => navigate(`/blogs/${record.blog_id}`)}
            />
            <Button
              type="primary"
              htmlType="button"
              icon={
                record.isActive ? (
                  <UnlockIcon size={20} />
                ) : (
                  <LockIcon size={20} />
                )
              }
              className="min-w-[44px] min-h-[44px]"
              danger={record.isActive}
              onClick={() => setSelectedActive(record)}
            />
            <Button
              type="primary"
              htmlType="button"
              icon={<Trash2 size={20} />}
              className="min-w-[44px] min-h-[44px]"
              danger
              onClick={() => setSelectedDelete(record)}
            />
            {record.isReport && (
              <Button
                type="primary"
                htmlType="button"
                icon={<FlagIcon size={20} />}
                className="min-w-[44px] min-h-[44px] bg-green-300 hover:!bg-green-500"
                color="default"
                onClick={() => setSelectedRemoveReport(record)}
              />
            )}
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    getAllBlogs();
  }, [pagination.page, getAllBlogs]);

  const onCloseModal = useCallback(
    (type, isReload = false) => {
      switch (type) {
        case "active":
          setSelectedActive(undefined);
          break;
        case "delete":
          setSelectedDelete(undefined);
          break;
        case "remove":
          setSelectedRemoveReport(undefined);
          break;
        default:
          break;
      }
      if (isReload) {
        onGet();
      }
    },
    [isReport]
  );

  const handleChangeIsReport = (e) => {
    setIsReport(e.target.checked);
  };

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="items-left">
        <h3 className="text-xl font-semibold">Danh sách blog</h3>
          <Input
            placeholder="Tìm kiếm"
            value={searchKeyword}
            onChange={onSearchChange}
            allowClear
            className="w-full mt-2"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 ">
            <input
              type="checkbox"
              checked={isReport}
              onChange={handleChangeIsReport}
            />
            <label className="font-bold">Blog bị báo cáo</label>
            <br></br>
          </div>
          <Button
            type="primary"
            icon={<Plus size={24} />}
            className="h-9 bg-emerald-500 hover:!bg-emerald-600 duration-300 text-sm font-medium"
            onClick={() => navigate("/blogs/create")}
          >
            Thêm blog
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={pendingBlogs}
        data={displayedBlogs} // Hiển thị dữ liệu tùy theo chế độ tìm kiếm
        total={searchKeyword.trim() ? filteredBlogs.length : blogList.total} // Tổng kết quả tìm kiếm hoặc phân trang
        onPageChange={!searchKeyword.trim() ? onPageChange : undefined} // Tắt phân trang khi tìm kiếm
        page={pagination.page}
      />

      <DeleteModal
        isOpen={!!selectedDelete}
        blog={selectedDelete}
        onClose={onCloseModal}
      />
      <DeleteReportModal
        isOpen={!!selectedRemoveReport}
        blog={selectedRemoveReport}
        onClose={onCloseModal}
      />
      <ActiveModal
        isOpen={!!seletedActive}
        blog={seletedActive}
        onClose={onCloseModal}
      />
    </div>
  );
};

export default BlogManagement;
