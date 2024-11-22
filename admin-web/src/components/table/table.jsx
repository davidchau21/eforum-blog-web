import { Empty, Pagination, Table } from "antd";
import Proptypes from "prop-types";
import { useState, useEffect } from "react";

const CustomTable = ({
  columns,
  data,
  page = 1,
  loading = false,
  isShowPagination = true,
  total = 0,
  onPageChange = () => {},
  rowClassName = () => {},
}) => {
  const [isLoading, setIsLoading] = useState(loading);

  // Reset loading state whenever loading prop changes (such as on page reload)
  useEffect(() => {
    setIsLoading(loading); // Update loading state from prop
  }, [loading]);

  useEffect(() => {
    // Set a timeout to automatically stop the loading after 30 seconds
    const timer = setTimeout(() => {
      setIsLoading(false); // Stop loading after 30 seconds
    }, 30000); // 30000 ms = 30 seconds

    // Cleanup the timeout if loading is already completed before the 30 seconds
    return () => clearTimeout(timer); // Cleanup if component unmounts or loading state changes
  }, [loading]);

  return (
    <div className="flex flex-col items-start w-full">
      <Table
        className="w-full custom-table"
        loading={isLoading} // Use the state of loading to control the spinner
        columns={columns}
        dataSource={data}
        pagination={false}
        locale={{
          emptyText: (
            <Empty
              description={
                <span className="text-base font-exo-2">Không có dữ liệu</span>
              }
            />
          ),
        }}
        scroll={{ y: data.length > 6 ? 400 : undefined }}
        rowClassName={rowClassName}
      />

      {isShowPagination && !!total && (
        <div className="flex items-center justify-end w-full rounded-b-lg bg-gray-2 h-14">
          <Pagination
            disabled={isLoading}
            current={page}
            pageSize={10}
            showQuickJumper={false}
            showSizeChanger={false}
            showTotal={() => (
              <span className="font-exo-2">{`Tổng ${total} dòng`}</span>
            )}
            total={total}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

CustomTable.propTypes = {
  loading: Proptypes.bool,
  columns: Proptypes.array.isRequired,
  data: Proptypes.array.isRequired,
  isShowPagination: Proptypes.bool,
  page: Proptypes.number,
  total: Proptypes.oneOfType([Proptypes.number, Proptypes.string]),
  onPageChange: Proptypes.func,
  rowClassName: Proptypes.func,
};

export default CustomTable;
