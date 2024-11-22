import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { StatusColorMapper } from "@/mappers/staff";
import { Button, Tag } from "antd";
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
  const [ingredientList, setIngredientList] = useState([]);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(undefined);

  const onGet = useCallback(async () => {
    const { ok, body } = await userApi.getAllUser({
      limit: 10,
      page: pagination.page - 1,
    });
    if (ok && body) {
      setIngredientList(body.list);
      setTotal(body.total);
    }
  }, [pagination.page]);

  const [pendingIngredients, getAllIngredients] = useHandleAsyncRequest(onGet);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    getAllIngredients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <h3 className="text-xl font-semibold">Danh sách người dùng</h3>
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
        loading={pendingIngredients}
        data={ingredientList}
        onPageChange={onPageChange}
        page={pagination.page}
        total={total}
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
