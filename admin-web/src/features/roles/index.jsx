import { useCallback, useEffect, useState } from "react";
import { Button, Switch, Tooltip, Input, Modal, Form, message, ConfigProvider, Tag, Select, Checkbox } from "antd";
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
  Settings,
  Edit,
  ChevronDown,
  ChevronUp,
  Shield
} from "lucide-react";
import roleApi from "../../api/role";
import { useDispatch } from "react-redux";
import { incrementLoading, decrementLoading } from "@/redux/globalSlice";
import { useTranslation } from "react-i18next";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -15 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 120 } }
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
  const [createRoleForm] = Form.useForm();
  const [createPermForm] = Form.useForm();
  const [editPermForm] = Form.useForm();
  
  const [roles, setRoles] = useState([]);
  const [permissionsGrouped, setPermissionsGrouped] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [isCreatePermModalOpen, setIsCreatePermModalOpen] = useState(false);
  const [isEditPermModalOpen, setIsEditPermModalOpen] = useState(false);
  const [editingPerm, setEditingPerm] = useState(null);
  
  const [isCustomModuleCreate, setIsCustomModuleCreate] = useState(false);
  const [isCustomModuleEdit, setIsCustomModuleEdit] = useState(false);

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
        
        // Collapse all modules by default for a clean, compact view
        setExpandedModules({});
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

  // Set default selected role
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0]._id);
    }
  }, [roles, selectedRoleId]);

  const activeRole = roles.find(r => r._id === selectedRoleId) || roles[0];

  const toggleModule = (moduleName) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
  };

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
      const res = await roleApi.updateRolePermissions(roleId, { permissions: updatedPermissions });
      if (res.ok && res.body) {
        setRoles(prev => prev.map(r => r._id === roleId ? res.body : r));
        message.success(t("roles.msg_update_success", { name: role.role_name, defaultValue: `Cập nhật quyền cho vai trò "${role.role_name}" thành công!` }));
      } else {
        const errorMsg = res.errors?.message || res.errors?.error || t("roles.msg_update_fail", "Cập nhật quyền hạn thất bại!");
        message.error(errorMsg);
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
        setIsCreateRoleModalOpen(false);
        createRoleForm.resetFields();
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
            // Reset selection to first role if active gets deleted
            if (selectedRoleId === roleId) {
              setSelectedRoleId(null);
            }
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

  // Permission CRUD actions
  const handleCreatePermission = async (values) => {
    try {
      const { ok, body, errors } = await roleApi.createPermission(values);
      if (ok && body) {
        message.success("Tạo quyền hệ thống mới thành công!");
        setIsCreatePermModalOpen(false);
        createPermForm.resetFields();
        setIsCustomModuleCreate(false);
        onGetData();
      } else {
        message.error(errors?.message || "Tạo quyền hệ thống thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi thêm quyền hệ thống!");
    }
  };

  const handleEditPermission = async (values) => {
    if (!editingPerm) return;
    try {
      const { ok, body, errors } = await roleApi.updatePermission(editingPerm._id, values);
      if (ok && body) {
        message.success("Cập nhật thông tin quyền hạn thành công!");
        setIsEditPermModalOpen(false);
        editPermForm.resetFields();
        setEditingPerm(null);
        setIsCustomModuleEdit(false);
        onGetData();
      } else {
        message.error(errors?.message || "Cập nhật quyền hạn thất bại!");
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi chỉnh sửa quyền hạn!");
    }
  };

  const handleDeletePermission = async (permissionId, permName) => {
    Modal.confirm({
      title: "Xóa quyền hạn hệ thống",
      content: `Bạn có chắc chắn muốn xóa quyền "${permName}" vĩnh viễn khỏi cơ sở dữ liệu? Toàn bộ vai trò đang liên kết với quyền này sẽ bị hủy bỏ cấu hình tương ứng.`,
      okText: "Xác nhận xóa",
      okType: "danger",
      cancelText: "Hủy bỏ",
      centered: true,
      onOk: async () => {
        try {
          const { ok, errors } = await roleApi.deletePermission(permissionId);
          if (ok) {
            message.success("Xóa quyền hạn hệ thống thành công!");
            onGetData();
          } else {
            message.error(errors?.message || "Xóa quyền hạn thất bại!");
          }
        } catch (err) {
          console.error(err);
          message.error("Lỗi khi xóa quyền hạn!");
        }
      }
    });
  };

  const existingModules = Object.keys(permissionsGrouped);
  const totalPermissionsCount = Object.values(permissionsGrouped).reduce((acc, cur) => acc + cur.length, 0);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 16,
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full p-8 font-exo-2 max-w-[1300px] mx-auto"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
                <Lock size={22} />
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {t("roles.title", "Cấu hình Phân quyền & Vai trò")}
              </h1>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-12">
              {t("roles.subtitle", "Cấu hình mô hình đặc quyền động, phân tách nghiệp vụ chi tiết cho các nhóm quản trị viên.")}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <Button
              icon={<Plus size={16} />}
              className="h-10 px-4 hover:!text-emerald-500 border border-slate-200 hover:border-emerald-500 rounded-xl text-xs font-bold tracking-wide active:scale-95 transition-all bg-white text-slate-600 shadow-sm"
              onClick={() => setIsCreatePermModalOpen(true)}
            >
              THÊM QUYỀN HẠN MỚI
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="h-10 px-4 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-black tracking-wide active:scale-95 transition-all text-white"
              onClick={() => setIsCreateRoleModalOpen(true)}
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
          <Info size={16} className="text-emerald-500 mt-0.5 shrink-0 animate-pulse" />
          <p className="text-xs text-emerald-700/80 leading-relaxed font-bold">
            {t("roles.info_note", "Quy định phân quyền động: Bất cứ thay đổi gán quyền nào trên giao diện sẽ áp dụng lập tức. Nhóm Super Admin nắm quyền tối cao mặc định để bảo toàn hệ thống. Bạn có thể tự do thêm, chỉnh sửa hoặc xóa bỏ các quyền hạn riêng lẻ theo từng mô-đun nghiệp vụ.")}
          </p>
        </motion.div>

        {/* Main Role-Centric Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Roles Sidebar Selection (1/4 width) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-1 bg-white rounded-3xl border border-slate-150 p-4 shadow-md shadow-slate-100/40 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh sách Vai trò</span>
              <Tag color="cyan" className="font-extrabold rounded-full px-2 text-[9px] border-none scale-90">
                {roles.length} Nhóm
              </Tag>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              {roles.map((role) => {
                const isSelected = role._id === selectedRoleId;
                const isSystemDefault = ["Super Admin", "Admin", "Contributor", "User"].includes(role.role_name);
                const assignedCount = role.role_name === "Super Admin" ? totalPermissionsCount : role.permissions.length;
                
                return (
                  <motion.div
                    key={role._id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRoleId(role._id)}
                    className={`group relative rounded-2xl px-4 py-3 cursor-pointer flex items-center justify-between border transition-all duration-300 ${
                      isSelected 
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-50 text-slate-700 border-slate-200/50 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="font-black text-xs uppercase tracking-wider truncate">
                        {role.role_name}
                      </span>
                      <span className={`text-[9px] font-bold mt-1 truncate ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                        {assignedCount} / {totalPermissionsCount} Quyền
                      </span>
                    </div>

                    <div className="flex items-center shrink-0">
                      {isSystemDefault ? (
                        isSelected ? null : (
                          <Tag color="gold" className="text-[8px] font-black rounded-sm border-none scale-75 uppercase tracking-wide">
                            Mặc định
                          </Tag>
                        )
                      ) : (
                        <Tooltip title={t("roles.tooltip_delete", "Xóa vai trò này")}>
                          <Button 
                            type="text" 
                            size="small"
                            danger={!isSelected}
                            icon={<Trash2 size={12} className={isSelected ? "text-white hover:text-rose-200" : ""} />} 
                            className={`rounded-md p-1 scale-90 ${isSelected ? "hover:bg-emerald-600" : "hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"}`}
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering select
                              handleDeleteRole(role._id, role.role_name);
                            }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Dynamic Permissions Detail Workspace (3/4 width) */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-3 flex flex-col gap-6"
          >
            {activeRole ? (
              <div className="bg-white rounded-[2rem] border border-slate-150 p-6 shadow-md shadow-slate-100/40">
                
                {/* Active Role Header Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-3xl shadow-inner shrink-0 mt-0.5">
                      <Shield size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                          {activeRole.role_name}
                        </h2>
                        {["Super Admin", "Admin", "Contributor", "User"].includes(activeRole.role_name) ? (
                          <Tag color="gold" className="text-[9px] font-black rounded-md border-none px-2 py-0.5 uppercase tracking-wide">
                            Vai trò hệ thống mặc định
                          </Tag>
                        ) : (
                          <Tag color="blue" className="text-[9px] font-black rounded-md border-none px-2 py-0.5 uppercase tracking-wide">
                            Vai trò tùy chỉnh
                          </Tag>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {activeRole.description || "Không có mô tả chi tiết cho vai trò này."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-center shrink-0 min-w-[120px] self-start sm:self-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Trạng thái gán</span>
                    <span className="text-xl font-black text-emerald-500 mt-1 block">
                      {activeRole.role_name === "Super Admin" ? totalPermissionsCount : activeRole.permissions.length} <span className="text-xs text-slate-400 font-bold">/ {totalPermissionsCount}</span>
                    </span>
                  </div>
                </div>

                {/* Modules Grouped Accordions list */}
                <div className="flex flex-col gap-4">
                  {Object.entries(permissionsGrouped).map(([moduleName, perms]) => {
                    const isExpanded = expandedModules[moduleName];
                    const isSuperAdmin = activeRole.role_name === "Super Admin";
                    
                    // Count how many permissions in this module are granted for the active role
                    const activeCountInModule = isSuperAdmin
                      ? perms.length
                      : perms.filter(p => activeRole.permissions.some(rp => (rp._id || rp) === p._id)).length;

                    return (
                      <div 
                        key={moduleName}
                        className="border border-slate-150/70 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm"
                      >
                        {/* Accordion Header */}
                        <div 
                          onClick={() => toggleModule(moduleName)}
                          className="bg-slate-50/50 hover:bg-slate-50 px-5 py-4 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white border border-slate-100 rounded-xl shadow-sm shrink-0">
                              {moduleIcons[moduleName] || <Settings size={14} className="text-slate-400" />}
                            </div>
                            <span className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                              {t(`modules.${moduleName}`, { defaultValue: moduleName })}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <Tag color={activeCountInModule > 0 ? "emerald" : "default"} className="font-extrabold rounded-full px-2 py-0.5 text-[9px] border-none shadow-sm">
                              {activeCountInModule} / {perms.length}
                            </Tag>
                            {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                        </div>

                        {/* Accordion Content with Custom Framer Motion Height Transition */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                              className="overflow-hidden bg-white"
                            >
                              <div className="px-5 py-2 flex flex-col divide-y divide-slate-50">
                                {perms.map((perm) => {
                                  const isGranted = isSuperAdmin || activeRole.permissions.some(p => (p._id || p) === perm._id);
                                  
                                  return (
                                    <div 
                                      key={perm._id}
                                      className="group py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/30 px-2 rounded-xl transition-all duration-300"
                                    >
                                      {/* Left: Permission detail */}
                                      <div className="flex items-start gap-3 min-w-[200px] flex-1">
                                        <div className="flex flex-col">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-bold text-slate-700 text-xs tracking-wide">
                                              {t(`permissions.${perm.permission_code}`, { defaultValue: perm.permission_name })}
                                            </span>
                                            
                                            {/* Hover Actions */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 duration-300">
                                              <Tooltip title="Chỉnh sửa thông tin quyền">
                                                <Button
                                                  type="text"
                                                  size="small"
                                                  className="h-6 w-6 p-0 flex items-center justify-center hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-lg"
                                                  icon={<Edit size={10} />}
                                                  onClick={() => {
                                                    setEditingPerm(perm);
                                                    setIsCustomModuleEdit(false);
                                                    editPermForm.setFieldsValue({
                                                      permission_name: perm.permission_name,
                                                      permission_code: perm.permission_code,
                                                      module_name: perm.module_name
                                                    });
                                                    setIsEditPermModalOpen(true);
                                                  }}
                                                />
                                              </Tooltip>
                                              {perm.permission_code !== "ROLE_MANAGE" && (
                                                <Tooltip title="Xóa vĩnh viễn quyền này">
                                                  <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    className="h-6 w-6 p-0 flex items-center justify-center hover:bg-rose-50 rounded-lg"
                                                    icon={<Trash2 size={10} />}
                                                    onClick={() => handleDeletePermission(perm._id, perm.permission_name)}
                                                  />
                                                </Tooltip>
                                              )}
                                            </div>
                                          </div>
                                          <span className="text-[9px] text-slate-400 font-mono tracking-tight mt-0.5">{perm.permission_code}</span>
                                        </div>
                                      </div>

                                      {/* Right: Toggle Assignment Switch */}
                                      <div className="shrink-0 flex items-center">
                                        <Switch
                                          size="small"
                                          checked={isGranted}
                                          disabled={isSuperAdmin}
                                          onChange={(checked) => handleTogglePermission(activeRole._id, perm._id, checked)}
                                          className={isGranted && !isSuperAdmin ? "bg-emerald-500 shadow-sm shadow-emerald-500/20" : ""}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-150 p-12 text-center shadow-md shadow-slate-100/40">
                <ShieldAlert size={48} className="text-slate-300 mx-auto mb-4 animate-bounce" />
                <span className="text-sm font-bold text-slate-400 block">Vui lòng lựa chọn một vai trò bên trái để bắt đầu cấu hình phân quyền!</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Create Role Modal */}
        <AnimatePresence>
          {isCreateRoleModalOpen && (
            <Modal
              title={
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 font-exo-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  <span className="text-lg font-black text-slate-800 tracking-tight">
                    {t("roles.modal_create_title", "Thêm vai trò quản trị mới")}
                  </span>
                </div>
              }
              open={isCreateRoleModalOpen}
              onCancel={() => {
                setIsCreateRoleModalOpen(false);
                createRoleForm.resetFields();
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
                form={createRoleForm}
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
                      setIsCreateRoleModalOpen(false);
                      createRoleForm.resetFields();
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

        {/* Create Permission Modal */}
        <AnimatePresence>
          {isCreatePermModalOpen && (
            <Modal
              title={
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 font-exo-2">
                  <Lock size={20} className="text-emerald-500" />
                  <span className="text-lg font-black text-slate-800 tracking-tight">
                    Thêm quyền hạn hệ thống mới
                  </span>
                </div>
              }
              open={isCreatePermModalOpen}
              onCancel={() => {
                setIsCreatePermModalOpen(false);
                createPermForm.resetFields();
                setIsCustomModuleCreate(false);
              }}
              footer={null}
              centered
              styles={{
                content: {
                  borderRadius: "24px",
                  padding: "24px",
                }
              }}
              width={440}
            >
              <Form
                form={createPermForm}
                layout="vertical"
                onFinish={handleCreatePermission}
                className="mt-4 font-exo-2"
              >
                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">Tên quyền hạn</span>}
                  name="permission_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên mô tả quyền hạn!" }]}
                >
                  <Input placeholder="Ví dụ: Xuất danh sách bài viết PDF" className="h-10 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">Mã quyền hạn (Unique Code)</span>}
                  name="permission_code"
                  rules={[{ required: true, message: "Vui lòng nhập mã quyền hạn viết hoa!" }]}
                >
                  <Input placeholder="Ví dụ: BLOG_EXPORT_PDF" className="h-10 rounded-xl uppercase font-mono text-xs" />
                </Form.Item>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 text-xs">Nhóm chức năng (Module)</span>
                  <Checkbox 
                    checked={isCustomModuleCreate} 
                    onChange={(e) => {
                      setIsCustomModuleCreate(e.target.checked);
                      createPermForm.setFieldValue("module_name", "");
                    }}
                    className="text-[11px] font-bold text-emerald-500"
                  >
                    Nhập nhóm mới
                  </Checkbox>
                </div>

                {isCustomModuleCreate ? (
                  <Form.Item
                    name="module_name"
                    rules={[{ required: true, message: "Vui lòng nhập tên nhóm chức năng mới!" }]}
                  >
                    <Input placeholder="Nhập tên nhóm mới, ví dụ: Thống kê" className="h-10 rounded-xl" />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="module_name"
                    rules={[{ required: true, message: "Vui lòng lựa chọn nhóm chức năng!" }]}
                  >
                    <Select placeholder="Lựa chọn nhóm chức năng..." className="h-10 rounded-xl select-field-custom">
                      {existingModules.map(mod => (
                        <Select.Option key={mod} value={mod}>{mod}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 mt-6">
                  <Button
                    onClick={() => {
                      setIsCreatePermModalOpen(false);
                      createPermForm.resetFields();
                      setIsCustomModuleCreate(false);
                    }}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none text-xs"
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none text-xs shadow-lg shadow-emerald-500/20"
                  >
                    TẠO QUYỀN HẠN
                  </Button>
                </div>
              </Form>
            </Modal>
          )}
        </AnimatePresence>

        {/* Edit Permission Modal */}
        <AnimatePresence>
          {isEditPermModalOpen && (
            <Modal
              title={
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3 font-exo-2">
                  <Edit size={18} className="text-emerald-500" />
                  <span className="text-lg font-black text-slate-800 tracking-tight">
                    Chỉnh sửa quyền hạn hệ thống
                  </span>
                </div>
              }
              open={isEditPermModalOpen}
              onCancel={() => {
                setIsEditPermModalOpen(false);
                editPermForm.resetFields();
                setEditingPerm(null);
                setIsCustomModuleEdit(false);
              }}
              footer={null}
              centered
              styles={{
                content: {
                  borderRadius: "24px",
                  padding: "24px",
                }
              }}
              width={440}
            >
              <Form
                form={editPermForm}
                layout="vertical"
                onFinish={handleEditPermission}
                className="mt-4 font-exo-2"
              >
                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">Tên quyền hạn</span>}
                  name="permission_name"
                  rules={[{ required: true, message: "Vui lòng nhập tên mô tả quyền hạn!" }]}
                >
                  <Input className="h-10 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-slate-700 text-xs">Mã quyền hạn (Unique Code)</span>}
                  name="permission_code"
                  rules={[{ required: true, message: "Vui lòng nhập mã quyền hạn viết hoa!" }]}
                >
                  <Input className="h-10 rounded-xl uppercase font-mono text-xs" />
                </Form.Item>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 text-xs">Nhóm chức năng (Module)</span>
                  <Checkbox 
                    checked={isCustomModuleEdit} 
                    onChange={(e) => {
                      setIsCustomModuleEdit(e.target.checked);
                      editPermForm.setFieldValue("module_name", "");
                    }}
                    className="text-[11px] font-bold text-emerald-500"
                  >
                    Nhập nhóm mới
                  </Checkbox>
                </div>

                {isCustomModuleEdit ? (
                  <Form.Item
                    name="module_name"
                    rules={[{ required: true, message: "Vui lòng nhập tên nhóm chức năng mới!" }]}
                  >
                    <Input className="h-10 rounded-xl" />
                  </Form.Item>
                ) : (
                  <Form.Item
                    name="module_name"
                    rules={[{ required: true, message: "Vui lòng lựa chọn nhóm chức năng!" }]}
                  >
                    <Select className="h-10 rounded-xl select-field-custom">
                      {existingModules.map(mod => (
                        <Select.Option key={mod} value={mod}>{mod}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 mt-6">
                  <Button
                    onClick={() => {
                      setIsEditPermModalOpen(false);
                      editPermForm.resetFields();
                      setEditingPerm(null);
                      setIsCustomModuleEdit(false);
                    }}
                    className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none text-xs"
                  >
                    HỦY BỎ
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none text-xs shadow-lg shadow-emerald-500/20"
                  >
                    LƯU THAY ĐỔI
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

export default RoleManagement;
