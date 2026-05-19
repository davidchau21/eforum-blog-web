import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback, useEffect } from "react";
import tagApi from "../../../api/tag";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, X } from "lucide-react";

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
      footer={null}
      centered
      closable={false}
      width={480}
      className="premium-modal"
      styles={{
        content: {
          padding: 0,
          borderRadius: "2rem",
          overflow: "hidden",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.1)",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <div className="relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={pendingUpdate}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-10 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-blue-400 to-blue-600 p-0.5 shadow-lg shadow-blue-500/30 mb-6 relative group">
            <div className="w-full h-full bg-white rounded-[1.1rem] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-blue-50 group-hover:bg-blue-100 transition-colors duration-500" />
              <Pencil size={28} className="text-blue-500 relative z-10" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-black text-slate-800 mb-2 font-exo-2 tracking-tight">
            Chỉnh sửa danh mục
          </h3>
          <p className="text-slate-500 text-[14px] font-medium leading-relaxed mb-8 text-center px-4">
            Cập nhật tên thẻ tag. Các bài viết đang gắn thẻ này sẽ tự động được cập nhật theo.
          </p>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            className="w-full m-0"
            onFinish={updateCategory}
          >
            <TextField
              name="tag_name"
              label={
                <span className="font-bold text-slate-700">Tên thẻ tag</span>
              }
              variant="filled"
              placeholder="VD: Lập trình web, ReactJS,..."
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên thẻ tag",
                },
              ]}
            />
            <SubmitButton
              text="Lưu thay đổi"
              className="w-full mt-6 h-12 bg-blue-500 hover:!bg-blue-600 text-white font-bold text-[15px] rounded-2xl shadow-md shadow-blue-500/20 transition-all font-exo-2 border-none"
              loading={pendingUpdate}
            />
          </Form>
        </div>
      </div>
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
