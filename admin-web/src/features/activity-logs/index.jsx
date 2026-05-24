import { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Tag, Avatar, Select, ConfigProvider, Tooltip } from "antd";
import { motion } from "framer-motion";
import { 
  Clock, 
  User, 
  ShieldAlert, 
  Info,
  Calendar,
  Terminal,
  Activity
} from "lucide-react";
import activityLogApi from "../../api/activityLog";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { useDispatch } from "react-redux";
import { incrementLoading, decrementLoading } from "@/redux/globalSlice";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Map action keys to premium Ant Design colors
const actionColors = {
  // Roles
  ROLE_CREATE: "purple",
  ROLE_UPDATE: "magenta",
  ROLE_DELETE: "volcano",
  
  // Users
  USER_CREATE: "cyan",
  USER_UPDATE: "geekblue",
  USER_BLOCK: "red",
  USER_DELETE: "orange",
  
  // Categories
  CATEGORY_CREATE: "green",
  CATEGORY_UPDATE: "lime",
  CATEGORY_DELETE: "gold",
  
  // Blogs
  BLOG_CREATE: "blue",
  BLOG_EDIT: "purple",
  BLOG_DISABLE: "orange",
  BLOG_DELETE: "red",
  BLOG_REPORT_RESOLVE: "green",
  
  // Comments
  COMMENT_DELETE: "red",
  COMMENT_REPORT_RESOLVE: "green",
  
  // Alerts
  ALERT_PUBLISH: "gold",
  ALERT_DELETE: "orange"
};

const ActivityLogs = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [logsData, setLogsData] = useState({ list: [], total: 0 });
  const [filterAction, setFilterAction] = useState(undefined);

  const onGetLogs = useCallback(async () => {
    dispatch(incrementLoading());
    try {
      const { ok, body } = await activityLogApi.getAllActivityLogs({
        page: pagination.page - 1,
        limit: pagination.limit
      });
      if (ok && body) {
        setLogsData({
          list: body.list,
          total: body.total || 0
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(decrementLoading());
    }
  }, [pagination.page, pagination.limit, dispatch]);

  const [pendingLogs, getLogs] = useHandleAsyncRequest(onGetLogs);

  useEffect(() => {
    getLogs();
  }, [pagination.page, pagination.limit, getLogs]);

  const onPageChange = (page, pageSize) => {
    setPagination({ page, limit: pageSize });
  };

  // Filter logs locally if an action type is selected
  const filteredList = useMemo(() => {
    if (!filterAction) return logsData.list;
    return logsData.list.filter(log => log.action === filterAction);
  }, [logsData.list, filterAction]);

  // Extract unique action codes for filter options
  const uniqueActions = useMemo(() => {
    const actions = logsData.list.map(log => log.action);
    return [...new Set(actions)];
  }, [logsData.list]);

  const columns = [
    {
      title: <TableHeaderLabel label={t("logs.col_stt", "STT")} />,
      width: 60,
      align: "center",
      render: (_, __, index) => (
        <span className="text-xs font-bold text-slate-400">
          {(pagination.page - 1) * pagination.limit + index + 1}
        </span>
      )
    },
    {
      title: <TableHeaderLabel label={t("logs.col_admin", "Quản trị viên")} />,
      width: 230,
      render: (_, record) => {
        const u = record.user;
        if (!u) {
          return (
            <div className="flex items-center gap-2 py-1">
              <Avatar size={32} className="bg-slate-100 text-slate-400">
                <Terminal size={14} />
              </Avatar>
              <Tag color="default" className="text-[10px] font-bold rounded-md px-2 py-0.5 m-0">
                {t("logs.badge_system", "Hệ thống")}
              </Tag>
            </div>
          );
        }
        return (
          <div className="flex items-center gap-3 py-1">
            <Avatar 
              src={u.personal_info?.profile_img} 
              size={32} 
              className="bg-emerald-500/10 text-emerald-500 border border-slate-100 shadow-sm flex-shrink-0"
            >
              {u.personal_info?.fullname?.charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-slate-700 text-xs truncate max-w-[130px]">
                {u.personal_info?.fullname}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                @{u.personal_info?.username}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: <TableHeaderLabel label={t("logs.col_action", "Hành động")} />,
      dataIndex: "action",
      width: 160,
      render: (action) => (
        <Tag 
          color={actionColors[action] || "blue"} 
          bordered={false}
          className="rounded-md px-2 py-0.5 font-bold text-[10px] tracking-wider uppercase m-0"
        >
          {action}
        </Tag>
      )
    },
    {
      title: <TableHeaderLabel label={t("logs.col_target", "Mô-đun đích")} />,
      dataIndex: "target_type",
      width: 140,
      render: (targetType) => (
        <Tag color="cyan" bordered={false} className="rounded-md px-2 py-0.5 font-bold text-[10px] m-0">
          {t(`modules.${targetType}`, { defaultValue: targetType })}
        </Tag>
      )
    },
    {
      title: <TableHeaderLabel label={t("logs.col_details", "Chi tiết nhật ký")} />,
      dataIndex: "details",
      render: (details) => (
        <span className="font-extrabold text-slate-700 text-xs tracking-tight leading-relaxed">
          {details}
        </span>
      )
    },
    {
      title: <TableHeaderLabel label={t("logs.col_ip", "Địa chỉ IP")} />,
      dataIndex: "ip_address",
      width: 130,
      render: (ip) => (
        <span className="font-mono text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          {ip || "127.0.0.1"}
        </span>
      )
    },
    {
      title: <TableHeaderLabel label={t("logs.col_time", "Thời gian")} />,
      dataIndex: "createdAt",
      width: 160,
      fixed: isMobile ? undefined : "right",
      render: (time) => (
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
          <Calendar size={13} /> {dayjs(time).format("DD/MM/YYYY HH:mm:ss")}
        </span>
      )
    }
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 16,
          colorBorderSecondary: "#f8fafc",
        },
        components: {
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#64748b",
            rowHoverBg: "#f1f5f9",
            cellPaddingBlock: 14,
            cellPaddingInline: 18,
            headerSplitColor: "transparent",
          }
        }
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 font-exo-2 max-w-[1250px] mx-auto space-y-6"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
                <Clock size={22} className="animate-spin-slow" />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {t("logs.title", "Nhật ký hoạt động hệ thống")}
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-12">
              {t("logs.subtitle", "Giám sát hoạt động vận hành của ban quản trị, thay đổi cấu hình phân quyền và bảo mật.")}
            </p>
          </motion.div>

          {/* Action Filter */}
          <motion.div variants={itemVariants} className="flex items-center gap-2">
            <Select
              allowClear
              placeholder={t("logs.filter_placeholder", "Lọc theo hành động...")}
              className="w-[200px] h-10 shadow-sm"
              onChange={(val) => setFilterAction(val)}
              options={uniqueActions.map(action => ({ label: action, value: action }))}
              dropdownStyle={{ borderRadius: "12px" }}
            />
          </motion.div>
        </div>

        {/* Security Alert Card */}
        <motion.div 
          variants={itemVariants}
          className="p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-start gap-3"
        >
          <ShieldAlert size={18} className="text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700/80 leading-relaxed font-bold">
            {t("logs.info_note", "Quy tắc kiểm tra an ninh: Mọi hoạt động quản trị (Thêm/Sửa/Xóa thành viên, điều chỉnh Ma trận phân quyền, gửi thông báo, v.v.) đều được hệ thống ghi nhận độc lập và mã hóa bảo mật. Nhật ký này không thể bị sửa đổi hoặc xóa bởi bất kỳ quản trị viên nào để đảm bảo tính minh bạch tối cao của hệ thống.")}
          </p>
        </motion.div>

        {/* Logs Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4"
        >
          <Table
            columns={columns}
            dataSource={filteredList.map(log => ({ ...log, key: log._id }))}
            loading={pendingLogs}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: logsData.total,
              onChange: onPageChange,
              showSizeChanger: true,
              className: "pt-4"
            }}
            bordered
            rowClassName={() => "hover:bg-slate-50/50 transition-colors cursor-default"}
            className="border border-slate-100 rounded-2xl overflow-hidden"
          />
        </motion.div>
      </motion.div>
    </ConfigProvider>
  );
};

const TableHeaderLabel = ({ label }) => (
  <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{label}</span>
);

export default ActivityLogs;
