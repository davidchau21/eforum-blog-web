import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal, Select, Button, Radio, Avatar, Spin, message } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState, useCallback } from "react";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import notificationApi from "../../../api/notification";
import userApi from "../../../api/userApi";
import roleApi from "../../../api/role";
import { Bell, Users, Shield, Target, Search, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

const CreateNotificationModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const handleResponseError = useHandleResponseError();
  const [form] = Form.useForm();
  
  const [targetGroup, setTargetGroup] = useState("all"); // "all" | "role" | "specific"
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(undefined);
  const [users, setUsers] = useState([]); // searched users for autocomplete
  const [selectedUserIds, setSelectedUserIds] = useState([]); 
  const [searching, setSearching] = useState(false);
  const [preparing, setPreparing] = useState(false);

  const [pendingCreate, createNotification] = useHandleAsyncRequest(
    async (data) => {
      const { messageText, userIds } = data;
      const { ok, errors } = await notificationApi.createNotification({
        message: messageText,
        userIds, 
      });
  
      if (ok) {
        message.success(t("roles.msg_create_success", "Gửi thông báo thành công!"));
        onClose("create", true);
      }
      if (errors) {
        handleResponseError(errors);
      }
    }
  );

  const handleClose = () => {
    if (pendingCreate || preparing) return;
    onClose("create", false);
  };

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedUserIds([]);
      setSelectedRoleId(undefined);
      setTargetGroup("all");
      setUsers([]);
    } else {
      // Pre-fetch dynamic roles
      roleApi.getAllRoles().then((res) => {
        if (res.ok && res.body) {
          setRoles(res.body);
        }
      });
      // Initial autocomplete search (empty)
      handleSearchUsers("");
    }
  }, [isOpen, form]);

  const handleSearchUsers = async (value) => {
    setSearching(true);
    try {
      const { ok, body } = await userApi.getAllUser({ query: value || undefined, limit: 10 });
      if (ok && body) {
        setUsers(body.list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectChange = (selectedIds) => {
    setSelectedUserIds(selectedIds);
  };

  const handleSubmit = async (values) => {
    setPreparing(true);
    let finalUserIds = [];

    try {
      if (targetGroup === "all") {
        // Lazy-fetch all user IDs on submission instead of blocking on load
        const { ok, body } = await userApi.getAllUser({ limit: 0 });
        if (ok && body && body.list) {
          finalUserIds = body.list.map((u) => u._id);
        }
      } else if (targetGroup === "role") {
        if (!selectedRoleId) {
          message.warning("Vui lòng chọn vai trò mục tiêu!");
          setPreparing(false);
          return;
        }
        const selectedRole = roles.find((r) => r._id === selectedRoleId);
        if (selectedRole) {
          const flatRole = (selectedRole.role_name === "Super Admin" || selectedRole.role_name === "Admin") ? "ADMIN" : "USER";
          const { ok, body } = await userApi.getAllUser({ role: flatRole, limit: 0 });
          if (ok && body && body.list) {
            finalUserIds = body.list
              .filter((u) => {
                const uRoleId = u.role_id?._id || u.role_id;
                return uRoleId === selectedRoleId;
              })
              .map((u) => u._id);
          }
        }
      } else {
        // Specific users chosen in autocomplete
        if (selectedUserIds.length === 0) {
          message.warning("Vui lòng chọn ít nhất một người nhận!");
          setPreparing(false);
          return;
        }
        finalUserIds = selectedUserIds;
      }

      if (finalUserIds.length === 0) {
        message.warning("Không tìm thấy người dùng phù hợp để gửi thông báo!");
        setPreparing(false);
        return;
      }

      // Submit final package
      await createNotification({
        messageText: values.message,
        userIds: finalUserIds,
      });
    } catch (err) {
      console.error(err);
      message.error("Lỗi hệ thống khi chuẩn bị tệp tin gửi đi.");
    } finally {
      setPreparing(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-3 border-b border-slate-50 pb-4 font-exo-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Bell size={20} className="animate-bounce" />
          </div>
          <span className="text-lg font-black text-slate-800 tracking-tight">
            Thêm thông báo hệ thống
          </span>
        </div>
      }
      footer={null}
      centered
      styles={{
        content: {
          borderRadius: "24px",
          padding: "24px",
        }
      }}
      width={500}
    >
      <Spin spinning={preparing} tip="Đang thu thập và đóng gói danh sách người nhận...">
        <Form
          form={form}
          layout="vertical"
          className="w-full mt-4 font-exo-2"
          onFinish={handleSubmit}
        >
          {/* Notification message */}
          <TextField
            name="message"
            label={<span className="font-bold text-slate-700 text-xs">Nội dung thông báo</span>}
            variant="filled"
            placeholder="Nhập thông tin quan trọng cần phát sóng..."
            rules={[
              {
                required: true,
                message: "Vui lòng nhập nội dung thông báo",
              },
            ]}
          />

          {/* Targeted audience section */}
          <div className="mt-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] p-5">
            <span className="font-extrabold text-slate-700 text-xs flex items-center gap-1.5 mb-3">
              <Target size={16} className="text-emerald-500" /> Chọn nhóm đối tượng nhận tin
            </span>

            {/* Audience Radios */}
            <Radio.Group 
              value={targetGroup} 
              onChange={(e) => setTargetGroup(e.target.value)} 
              className="grid grid-cols-3 gap-2 w-full mb-4"
            >
              <Radio.Button 
                value="all" 
                className={`h-11 flex items-center justify-center font-bold text-xs rounded-xl shadow-sm border-slate-200 cursor-pointer ${
                  targetGroup === "all" ? "!bg-emerald-50 !border-emerald-500 !text-emerald-600" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users size={14} /> Tất cả
                </div>
              </Radio.Button>
              <Radio.Button 
                value="role" 
                className={`h-11 flex items-center justify-center font-bold text-xs rounded-xl shadow-sm border-slate-200 cursor-pointer ${
                  targetGroup === "role" ? "!bg-emerald-50 !border-emerald-500 !text-emerald-600" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Shield size={14} /> Theo vai trò
                </div>
              </Radio.Button>
              <Radio.Button 
                value="specific" 
                className={`h-11 flex items-center justify-center font-bold text-xs rounded-xl shadow-sm border-slate-200 cursor-pointer ${
                  targetGroup === "specific" ? "!bg-emerald-50 !border-emerald-500 !text-emerald-600" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Search size={14} /> Tìm kiếm
                </div>
              </Radio.Button>
            </Radio.Group>

            {/* Broadcast Option Contexts */}
            {targetGroup === "all" && (
              <div className="flex items-start gap-2 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700/80 font-bold leading-relaxed m-0">
                  Thông báo phát sóng toàn hệ thống. Tự động liên kết tới tất cả tài khoản độc giả và ban quản trị hiện tại.
                </p>
              </div>
            )}

            {targetGroup === "role" && (
              <div className="space-y-2 animate-fadeIn">
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block">Chọn vai trò nhận tin</span>
                <Select
                  options={roles.map((role) => ({
                    label: role.role_name,
                    value: role._id,
                  }))}
                  placeholder="Chọn nhóm vai trò"
                  className="w-full h-10"
                  variant="filled"
                  dropdownStyle={{ borderRadius: '12px' }}
                  onChange={(val) => setSelectedRoleId(val)}
                  value={selectedRoleId}
                />
              </div>
            )}

            {targetGroup === "specific" && (
              <div className="space-y-2 animate-fadeIn">
                <span className="font-bold text-slate-500 text-[11px] uppercase tracking-wider block">Tìm & thêm tài khoản nhận tin</span>
                <Select
                  mode="multiple"
                  showSearch
                  filterOption={false}
                  onSearch={handleSearchUsers}
                  onChange={handleSelectChange}
                  value={selectedUserIds}
                  placeholder="Nhập tên hiển thị hoặc username..."
                  className="w-full min-h-[40px]"
                  variant="filled"
                  loading={searching}
                  dropdownStyle={{ borderRadius: '12px' }}
                  optionLabelProp="label"
                >
                  {users.map((user) => (
                    <Select.Option 
                      key={user._id} 
                      value={user._id} 
                      label={user.personal_info.username}
                    >
                      <div className="flex items-center gap-2 py-1">
                        <Avatar src={user.personal_info.profile_img} size={24} className="bg-slate-200">
                          {user.personal_info.fullname?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-xs">{user.personal_info.fullname}</span>
                          <span className="text-[10px] text-slate-400 font-medium">@{user.personal_info.username}</span>
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-slate-100">
            <Button
              onClick={handleClose}
              disabled={pendingCreate}
              className="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold border-none text-xs"
            >
              HỦY BỎ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={pendingCreate}
              className="h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-none text-xs shadow-lg shadow-emerald-500/20"
            >
              GỬI THÔNG BÁO
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

CreateNotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateNotificationModal;
