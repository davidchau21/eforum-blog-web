import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { StatusColorMapper } from "@/mappers/staff";
import { Button, Tag, Input } from "antd";
import { LockIcon, Pencil, Plus, UnlockIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import { formatDate } from "../../utils/dateUtils";
import BlockCommentModal from "./modals/block-comment-modal";

const StaffManagement = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
  });
  // const [ingredientList, setIngredientList] = useState([]);
  // const [filteredUsers, setFilteredUsers] = useState([]); // Danh sách sau khi lọc
  // const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [searchKeyword, setSearchKeyword] = useState(""); // Từ khóa tìm kiếm
  const [staffList, setStaffList] = useState({ total: 0, items: [] });
  const [filteredStaff, setFilteredStaff] = useState([]);


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

  // const [pendingIngredients, getAllIngredients] = useHandleAsyncRequest(onGet);
  const [pendingStaff, getAllStaff] = useHandleAsyncRequest(onGet);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onSearchChange = useCallback(
    async (e) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);
  
      if (keyword.trim()) {
        // Call API to fetch the entire staff list if necessary
        const { ok, body } = await userApi.getAllUser({
          limit: 1000, // Fetch enough data to search
          page: 0,
        });
  
        if (ok && body) {
          const filtered = body.list.filter((user) =>
            user.personal_info.username.toLowerCase().includes(keyword.toLowerCase()) ||
            user.personal_info.email.toLowerCase().includes(keyword.toLowerCase())
          );
          setFilteredStaff(filtered); // Display all results on one page
        }
      } else {
        // Display the full list of users for the current page if no search keyword
        setFilteredStaff(staffList.items);
      }
    },
    [staffList.items]
  );
  
  

  const columns = useMemo(
    () => [
      {
        dataIndex: "id",
        title: <TableHeaderColumn label="ID" />,
        render: (_, record) => <TableDataColumn label={record._id} />,
      },
      {
        dataIndex: "email",
        title: <TableHeaderColumn label="Email" />,
        render: (_, record) => (
          <TableDataColumn label={record.personal_info.email} />
        ),
      },
      {
        dataIndex: "username",
        title: <TableHeaderColumn label="Username" />,
        render: (_, record) => (
          <TableDataColumn label={record.personal_info.username} />
        ),
      },
      {
        title: <TableHeaderColumn label="Họ tên" />,
        render: (_, record) => (
          <TableDataColumn label={`${record.personal_info.fullname}`} />
        ),
      },
      {
        title: <TableHeaderColumn label="Vai trò" />,
        render: (_, record) => (
          <TableDataColumn label={record?.personal_info?.role || ""} />
        ),
      },
      {
        dataIndex: "status",
        title: <TableHeaderColumn label="Trạng thái" />,
        render: (_, record) => (
          <Tag
            bordered={false}
            color={
              record.verified
                ? StatusColorMapper["ACTIVE"]
                : StatusColorMapper["INACTIVE"]
            }
            className="text-sm font-exo-2"
          >
            {record.verified ? "Kích hoạt" : "Chưa kích hoạt"}
          </Tag>
        ),
      },
      {
        title: <TableHeaderColumn label="Ngày tạo" />,
        render: (_, record) => (
          <TableDataColumn label={`${formatDate(record.joinedAt)}`} />
        ),
      },
      {
        title: <TableHeaderColumn label="Khoá bình luận" />,
        render: (_, record) => (
          <TableDataColumn
            className={`text-sm font-exo-2  ${
              record.blocked_comment ? "text-red-500" : "text-green-500"
            }`}
            label={`${record.blocked_comment ? "Khoá" : "Mở"}`}
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
              onClick={() => navigate(`/users/${record._id}`)}
            />
            <Button
              type="primary"
              htmlType="button"
              icon={
                record.blocked_comment ? (
                  <UnlockIcon size={20} />
                ) : (
                  <LockIcon size={20} />
                )
              }
              className="min-w-[44px] min-h-[44px]"
              danger={record.blocked_comment}
              onClick={() => setSelectedUser(record)}
            />
          </div>
        ),
      },
    ],
    []
  );

  const displayedStaff = useMemo(() => {
    if (searchKeyword.trim()) {
      return filteredStaff;
    }
    return staffList.items;
  }, [searchKeyword, filteredStaff, staffList.items]);


  useEffect(() => {
    getAllStaff();
  }, [pagination.page]);

  const onCloseModal = useCallback((type, isReload = false) => {
    switch (type) {
      case "block":
        setSelectedUser(undefined);
        break;
      default:
        break;
    }
    if (isReload) {
      onGet();
    }
  }, []);

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        
        <div className="items-left">
          <h3 className="text-xl font-semibold">Danh sách người dùng</h3>
          <Input
              placeholder="Tìm kiếm"
              value={searchKeyword}
              onChange={onSearchChange}
              allowClear
              className="w-full mt-2"
            />
        </div>
        <div className="flex items-center gap-3">
          
          <Button
            type="primary"
            icon={<Plus size={24} />}
            className="h-9 bg-emerald-500 hover:!bg-emerald-600 duration-300 text-sm font-medium"
            onClick={() => navigate("/users/create")}
          >
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={pendingStaff}
        data={displayedStaff} // Sử dụng danh sách sau khi lọc
        onPageChange={!searchKeyword.trim() ? onPageChange : undefined}
        page={pagination.page}
        total={searchKeyword.trim() ? filteredStaff.length : staffList.total} // Tổng số kết quả tìm kiếm hoặc phân trang
      />
      <BlockCommentModal
        isOpen={!!selectedUser}
        onClose={onCloseModal}
        user={selectedUser}
      />
    </div>
  );
};

export default StaffManagement;
