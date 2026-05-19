import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Form, Modal } from "antd";
import PropTypes from "prop-types";
import { useEffect } from "react";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import tagApi from "../../../api/tag";
import { motion, AnimatePresence } from "framer-motion";
import { Tags, X } from "lucide-react";

const CreateCategoryModal = ({ isOpen, onClose }) => {
  const handleResponseError = useHandleResponseError();
  const [form] = Form.useForm();
  const [pendingCreate, createCategory] = useHandleAsyncRequest(
    async (data) => {
      const { ok, errors } = await tagApi.createTag(data);
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
          boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.1)",
        },
        mask: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <div className="relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={pendingCreate}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors z-10 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-10 pb-8 flex flex-col items-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 p-0.5 shadow-lg shadow-emerald-500/30 mb-6 relative group">
            <div className="w-full h-full bg-white rounded-[1.1rem] flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-50 group-hover:bg-emerald-100 transition-colors duration-500" />
              <Tags size={28} className="text-emerald-500 relative z-10" />
            </div>
          </div>

          {/* Content */}
          <h3 className="text-2xl font-black text-slate-800 mb-2 font-exo-2 tracking-tight">
            Thêm danh mục mới
          </h3>
          <p className="text-slate-500 text-[14px] font-medium leading-relaxed mb-8 text-center px-4">
            Tạo thẻ tag để phân loại và nhóm các bài viết có cùng chủ đề lại với nhau.
          </p>

          {/* Form */}
          <Form
            form={form}
            layout="vertical"
            className="w-full m-0"
            onFinish={createCategory}
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
              text="Thêm danh mục"
              className="w-full mt-6 h-12 bg-emerald-500 hover:!bg-emerald-600 text-white font-bold text-[15px] rounded-2xl shadow-md shadow-emerald-500/20 transition-all font-exo-2 border-none"
              loading={pendingCreate}
            />
          </Form>
        </div>
      </div>
    </Modal>
  );
};

CreateCategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateCategoryModal;
