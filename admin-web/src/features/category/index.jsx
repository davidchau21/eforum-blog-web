import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Input } from "antd";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import CreateCategoryModal from "./modals/create-category-modal";
import UpdateCategoryModal from "./modals/update-category-modal";
import tagApi from "../../api/tag";
import DeleteCategoryModal from "./modals/delete-category-modal";

const CategoryManagement = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [categoryList, setCategoryList] = useState({ total: 0, items: [] });
  const [filteredCategories, setFilteredCategories] = useState([]); // Danh sách sau khi lọc
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [isShowCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [selectedDeleteCategory, setSelectedDeleteCategory] =
    useState(undefined);

  // Lấy danh sách danh mục
  const onGet = useCallback(async () => {
    const { ok, body } = await tagApi.getAllTags({
      limit: pagination.limit,
      page: pagination.page - 1,
    });
    if (ok && body) {
      setCategoryList({ items: body.list, total: body.total ?? 0 });
      setFilteredCategories(body.list); // Đồng bộ danh sách lọc
    }
  }, [pagination.limit, pagination.page]);

  const [pendingCategories, getAllCategories] = useHandleAsyncRequest(onGet);

  // Xử lý tìm kiếm
  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value; // Không loại bỏ khoảng trắng
      setSearchKeyword(keyword);
  
      if (keyword.trim()) {
        // Gọi API để lấy toàn bộ danh sách nếu cần thiết
        const { ok, body } = await tagApi.getAllTags({
          limit: 1000, // Lấy đủ dữ liệu cần tìm
          page: 0,
        });
  
        if (ok && body) {
          const filtered = body.list.filter((category) =>
            category.tag_name.toLowerCase().includes(keyword.toLowerCase())
          );
          setFilteredCategories(filtered); // Hiển thị tất cả kết quả trên một trang
        }
      } else {
        // Hiển thị toàn bộ dữ liệu của trang hiện tại nếu không tìm kiếm
        setFilteredCategories(categoryList.items);
      }
    },
    [categoryList.items]
  );

  const displayedCategories = useMemo(() => {
    if (searchKeyword.trim()) {
      return filteredCategories; // Hiển thị danh sách tìm kiếm
    }
    return categoryList.items; // Hiển thị danh sách phân trang
  }, [searchKeyword, filteredCategories, categoryList.items]);

  // Thay đổi trang
  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Đóng modal
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
      if (isReload) {
        onGet();
      }
    },
    [onGet]
  );

  // Cột hiển thị trong bảng
  const columns = useMemo(
    () => [
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        render: (_id) => <TableDataColumn label={_id} />,
      },
      {
        dataIndex: "tag_name",
        title: <TableHeaderColumn label="Tên thẻ danh mục" />,
        render: (name) => <TableDataColumn label={name} />,
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
              onClick={() => setSelectedCategory(record)}
            />
            <Button
              type="primary"
              htmlType="button"
              icon={<Trash2 size={20} />}
              className="min-w-[44px] min-h-[44px]"
              danger
              onClick={() => setSelectedDeleteCategory(record)}
            />
          </div>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    getAllCategories();
  }, [pagination.page, getAllCategories]);

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <div className="items-left">
        <h3 className="text-xl font-semibold">Danh sách thẻ tag</h3>
        <Input
            placeholder="Tìm kiếm"
            value={searchKeyword}
            onChange={onSearchChange} // Xử lý tìm kiếm
            allowClear
            className="w-full mt-2"
          />
        </div>
        <div className="flex items-center gap-3">
          
          <Button
            type="primary"
            icon={<Plus size={24} />}
            className="h-9 bg-emerald-600 hover:!bg-emerald-600 duration-300 text-sm font-medium"
            onClick={() => setShowCreateModal(true)}
          >
            Thêm thẻ danh mục
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={pendingCategories}
        data={displayedCategories} // Hiển thị dữ liệu tùy theo chế độ tìm kiếm
        total={searchKeyword.trim() ? filteredCategories.length : categoryList.total} // Tổng kết quả tìm kiếm hoặc phân trang
        onPageChange={!searchKeyword.trim() ? onPageChange : undefined} // Tắt phân trang khi tìm kiếm
        page={pagination.page}
      />


      <CreateCategoryModal isOpen={isShowCreateModal} onClose={onCloseModal} />
      <UpdateCategoryModal
        isOpen={!!selectedCategory}
        category={selectedCategory}
        onClose={onCloseModal}
      />
      <DeleteCategoryModal
        isOpen={!!selectedDeleteCategory}
        category={selectedDeleteCategory}
        onClose={onCloseModal}
      />
    </div>
  );
};

export default CategoryManagement;
