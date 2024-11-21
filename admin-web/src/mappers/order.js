const StatusMapper = {
  ORDERING: "Đang gọi món",
  SERVE: "Đang phục vụ",
  PAY: "Đã thanh toán",
  CANCEL: "Đã hủy",
};

const StatusColorMapper = {
  ORDERING: "processing",
  SERVE: "green",
  PAY: "gold",
  CANCEL: "red",
};

export { StatusMapper, StatusColorMapper };
