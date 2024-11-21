import Table from "@/components/table/table";
import TableDataColumn from "@/components/table/table-data-column";
import TableHeaderColumn from "@/components/table/table-header-column";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button } from "antd";
import { FlagIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import commentApi from "../../api/comment";
import DeleteCommentModal from "./modals/delete-comment-modal";
import { formatDate } from "../../utils/dateUtils";
import DeleteReportModal from "./modals/delete-report-modal";

const CommentManagement = () => {
  const [pagination, setPagination] = useState({
    page: 1,
  });
  const [comments, setComments] = useState({ total: 0, items: [] });
  const [selectedDelete, setSelectedDelete] = useState(undefined);
  const [isReport, setIsReport] = useState(false);
  const [selectedRemoveReport, setSelectedRemoveReport] = useState(undefined);

  const columns = useMemo(
    () => [
      {
        dataIndex: "_id",
        title: <TableHeaderColumn label="ID" />,
        render: (_, record) => <TableDataColumn label={record._id} />,
      },
      {
        dataIndex: "username",
        title: <TableHeaderColumn label="Username" />,
        render: (_, record) => (
          <TableDataColumn
            label={record.commented_by?.personal_info?.username}
          />
        ),
      },
      {
        dataIndex: "comment",
        title: <TableHeaderColumn label="Nội dung" />,
        render: (_, record) => <TableDataColumn label={record.comment} />,
      },
      {
        title: <TableHeaderColumn label="Ngày tạo" />,
        render: (_, record) => (
          <TableDataColumn label={`${formatDate(record.commentedAt)}`} />
        ),
      },
      {
        title: <TableHeaderColumn label="Thao tác" />,
        render: (_, record) => (
          <div className="flex items-center gap-2">
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

  const onPageChange = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onCloseModal = useCallback((type, isReload = false) => {
    switch (type) {
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
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, []);

  const onGet = useCallback(async () => {
    const { ok, body } = await commentApi.getAlls({
      limit: 10,
      page: pagination.page - 1,
      isReport: isReport ? isReport : null,
    });
    if (ok && body) {
      setComments({ items: body.list, total: body.total ?? 0 });
    }
  }, [pagination.page, isReport]);

  const [pendingCategories, getAllCategories] = useHandleAsyncRequest(onGet);

  useEffect(() => {
    getAllCategories();
  }, [pagination, isReport]);

  const handleChangeIsReport = (e) => {
    setIsReport(e.target.checked);
  };

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xl font-semibold">Danh sách bình luận</h3>
        <div className="flex gap-2 ">
          <input
            type="checkbox"
            checked={isReport}
            onChange={handleChangeIsReport}
          />
          <label className="font-bold">Bình luận bị báo cáo</label>
          <br></br>
        </div>
      </div>

      <Table
        columns={columns}
        loading={pendingCategories}
        data={comments.items}
        onPageChange={onPageChange}
        page={pagination.page}
        total={comments.total}
      />
      <DeleteCommentModal
        isOpen={!!selectedDelete}
        category={selectedDelete}
        onClose={onCloseModal}
      />
      <DeleteReportModal
        isOpen={!!selectedRemoveReport}
        blog={selectedRemoveReport}
        onClose={onCloseModal}
      />
    </div>
  );
};

export default CommentManagement;
