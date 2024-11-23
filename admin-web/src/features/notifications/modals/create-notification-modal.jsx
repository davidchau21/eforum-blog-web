import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal, Select, Button } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import notificationApi from "../../../api/notification";
import userApi from "../../../api/userApi";

const CreateNotificationModal = ({ isOpen, onClose }) => {
  const handleResponseError = useHandleResponseError();
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]); 
  const [selectedUserIds, setSelectedUserIds] = useState([]); 
  const [pendingCreate, createNotification] = useHandleAsyncRequest(
    async (data) => {
      const { message, userIds } = data;
  
      const { ok, errors } = await notificationApi.createNotification({
        message,
        userIds, 
      });
  
      if (ok) {
        onClose("create", true);
      }
      if (errors) {
        handleResponseError(errors);
      }
    }
  );

  const handleClose = () => {
    if (pendingCreate) return;
    onClose("create", false);
  };

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
      setSelectedUserIds([]);
    } else {
      getAllUser();
    }
  }, [isOpen, form]);

  const getAllUser = async () => {
    const { ok, errors, body } = await userApi.getAllUser({ limit: 0 });
    if (ok) {
      setUsers(body.list);
    }
    if (errors) {
      handleResponseError(errors);
    }
  };

  const handleSelectChange = (selectedIds) => {
    setSelectedUserIds(selectedIds);
    form.setFieldsValue({ users: selectedIds }); 
  };

  const handleSelectAll = () => {
    const allUserIds = users.map((user) => user._id);
    setSelectedUserIds(allUserIds);
    form.setFieldsValue({ users: allUserIds });
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
    form.setFieldsValue({ users: [] });
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center justify-center w-full">
          <span className="text-base font-medium font-exo-2">
            Thêm thông báo mới
          </span>
        </div>
      }
      footer={null}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        className="w-full m-0"
        onFinish={() =>
          createNotification({
            message: form.getFieldValue("message"),
            userIds: form.getFieldValue("users"),
          })
        }
      >
        <TextField
          name="message"
          label="Nội dung thông báo"
          variant="filled"
          placeholder="Nhập thông báo"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập thông báo",
            },
          ]}
        />
        {/* Chọn danh sách user */}
        <div className="mt-4">
          <span className="text-sm font-medium font-exo-2">Gửi tới</span>
          <div className="flex items-center gap-2 mt-2">
            <Select
              mode="multiple"
              className="w-full"
              placeholder="Chọn người dùng"
              value={selectedUserIds} 
              onChange={handleSelectChange} 
              options={users.map((user) => ({
                key: user._id,
                label: user.personal_info.username, 
                value: user._id, 
              }))}
              allowClear
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={handleSelectAll} type="primary">
              Chọn tất cả
            </Button>
            <Button onClick={handleDeselectAll} type="default">
              Bỏ chọn tất cả
            </Button>
          </div>
        </div>
        <SubmitButton text="Lưu" className="mt-4" loading={pendingCreate} />
      </Form>
    </Modal>
  );
};

CreateNotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateNotificationModal;
