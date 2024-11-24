import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { StatusColorMapper } from "@/mappers/staff";
import { Button, Tag } from "antd";
import {
  Flag,
  FlagIcon,
  LockIcon,
  Pencil,
  Plus,
  Trash2,
  UnlockIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import blogApi from "../../api/blogApi";
import DeleteModal from "./modals/delete-modal";
import ActiveModal from "./modals/active-modal";
import DeleteReportModal from "./modals/deleteReportModal";

const BlogManagement = () => {
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({
    page: 1,
  });
  const [ingredientList, setIngredientList] = useState([]);
  const [total, setTotal] = useState(0);
  const [seletedActive, setSelectedActive] = useState(undefined);
  const [selectedDelete, setSelectedDelete] = useState(undefined);
  const [selectedRemoveReport, setSelectedRemoveReport] = useState(undefined);
  const [isReport, setIsReport] = useState(false);

  const onGet = useCallback(async () => {
    const { ok, body } = await blogApi.getAllBlogs({
      limit: 10,
      page: pagination.page - 1,
      isReport: isReport ? isReport : null,
    });
    if (ok && body) {
      setIngredientList(body.list);
      setTotal(body.total);
    }
  }, [pagination.page, isReport]);

  const [pendingIngredients, getAllIngredients] = useHandleAsyncRequest(onGet);

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

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
          <TableDataColumn label={`${(record.author.personal_info.username)}`} />
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    getAllIngredients();
    console.log(isReport);
  }, [pagination.page, isReport]);

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
        <h3 className="text-xl font-semibold">Danh sách blog</h3>
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
        loading={pendingIngredients}
        data={ingredientList}
        onPageChange={onPageChange}
        page={pagination.page}
        total={total}
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
