import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback, useEffect } from "react";
import tagApi from "../../../api/tag";
import useHandleResponseError from "../../../hooks/useHandleResponseError";

const UpdateCategoryModal = ({ isOpen, onClose, category }) => {
  const [form] = Form.useForm();
  const handleResponseError = useHandleResponseError();

  const onUpdate = useCallback(
    async (data) => {
      const { ok, errors } = await tagApi.updateTag(category?._id ?? "", data);
      if (ok) {
        onClose("update", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    },
    [category, onClose]
  );

  const [pendingUpdate, updateCategory] = useHandleAsyncRequest(onUpdate);

  const handleClose = () => {
    if (pendingUpdate) return;
    onClose("update", false);
  };

  useEffect(() => {
    if (!isOpen) {
      form.resetFields();
    } else {
      form.setFieldValue("tag_name", category?.tag_name ?? "");
    }
  }, [isOpen, form, category]);

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center justify-center w-full">
          <span className="text-base font-medium font-exo-2">
            Cập nhật thông tin thẻ tag
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
        onFinish={updateCategory}
      >
        <TextField
          name="tag_name"
          label="Tên thẻ tag"
          variant="filled"
          placeholder="Nhập tên thẻ tag"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên thẻ tag",
            },
          ]}
        />
        <SubmitButton text="Lưu" className="mt-2" loading={pendingUpdate} />
      </Form>
    </Modal>
  );
};

UpdateCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default UpdateCategoryModal;
