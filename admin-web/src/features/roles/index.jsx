import { useCallback, useEffect, useState } from "react";
import { Button, Table, Switch, Tooltip, Input, Modal, Form, message, ConfigProvider, Tag } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Info,
  ShieldCheck, 
  Lock, 
  BookOpen, 
  MessageSquare, 
  Bell, 
  Menu, 
  Users, 
  Settings 
} from "lucide-react";
import roleApi from "../../api/role";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { useDispatch } from "react-redux";
import { incrementLoading, decrementLoading } from "@/redux/globalSlice";
import { useTranslation } from "react-i18next";

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

// Module Icons Mapper
const moduleIcons = {
  "Bài viết": <BookOpen size={16} className="text-blue-500" />,
  "Bình luận": <MessageSquare size={16} className="text-purple-500" />,
  "Thông báo": <Bell size={16} className="text-amber-500" />,
  "Danh mục": <Menu size={16} className="text-pink-500" />,
  "Thành viên": <Users size={16} className="text-emerald-500" />,
  "Phân quyền": <Lock size={16} className="text-rose-500" />,
};

const RoleManagement = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const onGetData = useCallback(async () => {
    dispatch(incrementLoading());
    try {
      const rolesRes = await roleApi.getAllRoles();
      const permsRes = await roleApi.getAllPermissions();
      
      if (rolesRes.ok && rolesRes.body) {
        setRoles(rolesRes.body);
      }
      if (permsRes.ok && permsRes.body) {
        setPermissionsGrouped(permsRes.body.grouped);
      }
    } catch (err) {
      console.error(err);
      message.error(t("roles.msg_update_fail", "Lỗi khi tải dữ liệu phân quyền."));
    } finally {
      dispatch(decrementLoading());
    }
  }, [dispatch, t]);

  useEffect(() => {
    onGetData();
  }, [onGetData]);

  // Flatten permissions for Antd Table dataSource
  const tableData = Object.entries(permissionsGrouped).flatMap(([moduleName, perms]) => {
    return perms.map((perm) => ({
      key: perm._id,
      _id: perm._id,
      permission_name: perm.permission_name,
      permission_code: perm.permission_code,
      module_name: moduleName,
    }));
  });

  const handleTogglePermission = async (roleId, permissionId, checked) => {
    const role = roles.find(r => r._id === roleId);
    if (!role) return;

    if (role.role_name === "Super Admin") {
      message.warning(t("roles.msg_super_admin_warning", "Không thể thay đổi quyền hạn của Super Admin tối cao!"));
      return;
    }

    let updatedPermissions = [];
    if (checked) {
      updatedPermissions = [...role.permissions.map(p => p._id || p), permissionId];
    } else {
      updatedPermissions = role.permissions.map(p => p._id || p).filter(id => id !== permissionId);
    }

    try {
      const { ok, body } = await roleApi.updateRolePermissions(roleId, { permissions: updatedPermissions });
      if (ok && body) {
        setRoles(prev => prev.map(r => r._id === roleId ? body : r));
        message.success(t("roles.msg_update_success", { name: role.role_name, defaultValue: `Cập nhật quyền cho vai trò "${role.role_name}" thành công!` }));
      }
    } catch (err) {
      console.error(err);
      message.error(t("roles.msg_update_fail", "Cập nhật quyền hạn thất bại!"));
    }
  };

  const handleCreateRole = async (values) => {
    try {
      const { ok, body, errors } = await roleApi.createRole(values);
      if (ok && body) {
        message.success(t("roles.msg_create_success", "Tạo vai trò mới thành công!"));
        setIsCreateModalOpen(false);
        form.resetFields();
        onGetData();
      }
      if (errors) {
        message.error(errors.message || t("roles.msg_create_fail", "Tạo vai trò thất bại!"));
      }
    } catch (err) {
      console.error(err);
      message.error(t("roles.msg_create_fail", "Lỗi hệ thống khi tạo vai trò!"));
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    Modal.confirm({
      title: t("roles.msg_delete_title", "Xóa vai trò tùy chỉnh"),
      content: t("roles.msg_delete_content", { name: roleName, defaultValue: `Bạn có chắc chắn muốn xóa vai trò "${roleName}"? Tài khoản gán vai trò này sẽ mất các đặc quyền.` }),
      okText: t("users.tooltip_delete_account", "Xác nhận xóa"),
      okType: "danger",
      cancelText: t("roles.modal_btn_cancel", "Hủy bỏ"),
      centered: true,
      onOk: async () => {
        try {
          const { ok, errors } = await roleApi.deleteRole(roleId);
          if (ok) {
            message.success(t("roles.msg_delete_success", "Xóa vai trò thành công!"));
            onGetData();
          }
          if (errors) {
            message.error(errors.message || t("roles.msg_delete_fail", "Xóa vai trò thất bại!"));
          }
        } catch (err) {
          console.error(err);
          message.error(t("roles.msg_delete_fail", "Lỗi khi xóa vai trò!"));
        }
      }
    });
  };

  // Build Antd table columns dynamically based on loaded roles
  const columns = [
    {
      title: <TableHeaderLabel label={t("roles.table_header_permission", "Quyền hạn hệ thống")} />,
      key: "permission",
      fixed: "left",
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700 text-xs tracking-wide">
            {t(`permissions.${record.permission_code}`, { defaultValue: record.permission_name })}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{record.permission_code}</span>
        </div>
      ),
    },
    {
      title: <TableHeaderLabel label={t("roles.table_header_module", "Nhóm chức năng")} />,
      dataIndex: "module_name",
      key: "module",
      width: 150,
      render: (moduleName) => (
        <div className="flex items-center gap-2">
          {moduleIcons[moduleName] || <Settings size={16} className="text-slate-400" />}
          <Tag color="cyan" className="font-bold rounded-md text-[10px] border-none px-2 py-0.5">
            {t(`modules.${moduleName}`, { defaultValue: moduleName })}
          </Tag>
        </div>
      ),
      onFilter: (value, record) => record.module_name === value,
      filters: Object.keys(permissionsGrouped).map(mod => ({ 
        text: t(`modules.${mod}`, { defaultValue: mod }), 
        value: mod 
      })),
    },
    // Dynamic Role Columns
    ...roles.map((role) => ({
      title: (
        <div className="flex flex-col items-center justify-center gap-1 min-w-[120px] text-center">
          <span className="font-extrabold text-slate-700 tracking-tight text-xs uppercase">{role.role_name}</span>
          {["Super Admin", "Admin", "Contributor", "User"].includes(role.role_name) ? (
            <Tag color="gold" className="text-[9px] font-bold rounded-sm border-none scale-90">
              {t("roles.badge_default", "Mặc định")}
            </Tag>
          ) : (
            <Tooltip title={t("roles.tooltip_delete", "Xóa vai trò này")}>
              <Button 
                type="text" 
                size="small"
                danger
                icon={<Trash2 size={12} />} 
                className="hover:bg-rose-50 rounded-md p-1 scale-90"
                onClick={() => handleDeleteRole(role._id, role.role_name)}
              />
            </Tooltip>
          )}
        </div>
      ),
      key: role._id,
      align: "center",
      width: 140,
      render: (_, record) => {
        const isSuperAdmin = role.role_name === "Super Admin";
        const hasPermission = isSuperAdmin || role.permissions.some(p => (p._id || p) === record._id);
        
        return (
          <Switch
            size="small"
            checked={hasPermission}
            disabled={isSuperAdmin}
            onChange={(checked) => handleTogglePermission(role._id, record._id, checked)}
            className={hasPermission && !isSuperAdmin ? "bg-emerald-500 shadow-md shadow-emerald-500/20" : ""}
          />
        );
      }
    }))
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 16,
        },
        components: {
          Table: {
            headerBg: "#f8fafc",
            headerColor: "#64748b",
            rowHoverBg: "#f8fafc",
            cellPaddingBlock: 12,
            cellPaddingInline: 16,
            headerSplitColor: "transparent",
          }
        }
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 font-exo-2 max-w-[1250px] mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
                <ShieldAlert size={22} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {t("roles.title", "Ma trận Phân quyền & Vai trò")}
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-12">
              {t("roles.subtitle", "Thiết lập cấu hình phân quyền hạn động, quản lý chức năng chi tiết cho từng nhóm quản trị.")}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="h-10 px-5 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-black tracking-wide active:scale-95 transition-all"
              onClick={() => setIsCreateModalOpen(true)}
            >
              {t("roles.btn_add_role", "THÊM VAI TRÒ MỚI")}
            </Button>
          </motion.div>
        </div>

        {/* Dashboard Matrix Info Card */}
        <motion.div 
          variants={itemVariants}
          className="mb-6 p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-start gap-3"
        >
          <Info size={16} className="text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-emerald-700/80 leading-relaxed font-bold">
            {t("roles.info_note", "Quy định phân quyền động: Bất cứ thay đổi gán quyền nào trên Ma trận sẽ có hiệu lực lập tức đối với người dùng thuộc vai trò đó. Vai trò Super Admin có quyền hệ thống tối cao mặc định và không thể thay đổi để tránh lỗi cô lập hệ thống.")}
          </p>
        </motion.div>

        {/* Permissions Grid Table Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-4 overflow-x-auto"
        >
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            bordered
            rowClassName={() => "hover:bg-slate-50/50 transition-colors"}
            className="border border-slate-100 rounded-2xl overflow-hidden"
          />
        </motion.div>

        {/* Create Role Modal */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <Modal
              title={
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 font-exo-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-lg font-black text-slate-800 tracking-tight">
                    {t("roles.modal_create_title", "Thêm vai trò quản trị mới")}
                  </span>
                </div>
              }
              open={isCreateModalOpen}
              onCancel={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}
              footer={null}
              centered
              styles={{
                content: {
                  borderRadius: "24px",
                  padding: "24px",
                }
              }}
              width={420}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleCreateRole}
                className="mt-4 font-exo-2"
              >
                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">{t("roles.modal_role_name", "Tên vai trò")}</span>}
                  name="role_name"
                  rules={[{ required: true, message: t("roles.modal_role_name_req", "Vui lòng nhập tên vai trò!") }]}
                >
                  <Input placeholder={t("roles.placeholder_role_name", "Ví dụ: Biên tập viên")} className="h-10 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">{t("roles.modal_role_desc", "Mô tả")}</span>}
                  name="description"
                >
                  <Input.TextArea placeholder={t("roles.placeholder_role_desc", "Mô tả tóm tắt vai trò...")} className="rounded-xl" rows={3} />
                </Form.Item>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => {
                      setIsCreateModalOpen(false);
                      form.resetFields();
                    }}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none text-xs"
                  >
                    {t("roles.modal_btn_cancel", "HỦY BỎ")}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none text-xs shadow-lg shadow-emerald-500/20"
                  >
                    {t("roles.modal_btn_submit", "TẠO VAI TRÒ")}
                  </Button>
                </div>
              </Form>
            </Modal>
          )}
        </AnimatePresence>
      </motion.div>
    </ConfigProvider>
  );
};

const TableHeaderLabel = ({ label }) => (
  <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">{label}</span>
);

export default RoleManagement;
