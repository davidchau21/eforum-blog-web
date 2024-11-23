import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal } from "antd";
import PropTypes from "prop-types";
import { useEffect } from "react";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import notificationApi from "../../../api/notification";

const CreateNotificationModal = ({ isOpen, onClose }) => {
  const handleResponseError = useHandleResponseError();
  const [form] = Form.useForm();
  const [pendingCreate, createNotification] = useHandleAsyncRequest(
    async (data) => {
      const { ok, errors } = await notificationApi.createNotification(data);
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
    }
  }, [isOpen, form]);

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
        onFinish={createNotification}
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
        <SubmitButton text="Lưu" className="mt-2" loading={pendingCreate} />
      </Form>
    </Modal>
  );
};

CreateNotificationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateNotificationModal;
