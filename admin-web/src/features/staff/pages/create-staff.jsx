import PasswordField from "@/components/form/password-field";
import TextField from "@/components/form/text-field";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import { Button, Form, Select, ConfigProvider } from "antd";
import { ArrowLeft, UserPlus, Mail, Lock, User, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";
import roleApi from "../../../api/role";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const CreateStaff = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const handleResponseError = useHandleResponseError();
  const handleResponseSuccess = useHandleResponseSuccess();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    roleApi.getAllRoles().then((res) => {
      if (res.ok && res.body) {
        setRoles(res.body);
      }
    });
  }, []);

  const onCreate = useCallback(
    async (data) => {
      // Map role_id to flat role string ("ADMIN" or "USER") for backward compatibility
      const selectedRole = roles.find((r) => r._id === data.role_id);
      const roleString = 
        selectedRole && 
        (selectedRole.role_name === "Super Admin" || selectedRole.role_name === "Admin") 
          ? "ADMIN" 
          : "USER";

      const { ok, errors } = await userApi.createUser({
        ...data,
        role: roleString,
      });

      if (ok) {
        handleResponseSuccess("Tạo tài khoản thành công", () => {
          navigate("/users");
        });
      }

      if (errors) {
        handleResponseError(errors.error);
      }
    },
    [navigate, roles, handleResponseError, handleResponseSuccess]
  );
  const [pendingCreate, createCategory] = useHandleAsyncRequest(onCreate);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#10b981',
          borderRadius: 12,
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-4xl mx-auto p-8 font-exo-2"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
              <UserPlus size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Thêm người dùng mới</h1>
              <p className="text-slate-500 font-medium mt-1">Cấp tài khoản và vai trò phân quyền vào hệ thống</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="default"
              icon={<ArrowLeft size={18} />}
              className="h-11 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
              onClick={() => navigate(-1)}
            >
              QUAY LẠI
            </Button>
          </motion.div>
        </div>

        {/* Form Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8"
        >
          <Form
            className="w-full"
            layout="vertical"
            onFinish={createCategory}
            form={form}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <TextField
                name="fullname"
                label={<span className="font-bold text-slate-700 flex items-center gap-2"><User size={16}/> Họ và tên</span>}
                variant="filled"
                placeholder="VD: Nguyễn Văn A"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ và tên",
                  },
                ]}
              />
              
              <TextField
                name="email"
                label={<span className="font-bold text-slate-700 flex items-center gap-2"><Mail size={16}/> Địa chỉ Email</span>}
                variant="filled"
                placeholder="VD: nguyenvana@gmail.com"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              />

              <PasswordField
                name="password"
                label={<span className="font-bold text-slate-700 flex items-center gap-2"><Lock size={16}/> Mật khẩu</span>}
                variant="filled"
                placeholder="Tối thiểu 8 ký tự"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu",
                  },
                ]}
              />

              <Form.Item
                label={<span className="font-bold text-slate-700 flex items-center gap-2"><ShieldCheck size={16}/> Vai trò hệ thống</span>}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn vai trò cho người dùng",
                  },
                ]}
                name="role_id"
              >
                <Select
                  options={roles.map((role) => ({
                    label: role.role_name,
                    value: role._id,
                  }))}
                  placeholder="Chọn vai trò gán quyền hạn"
                  className="h-10"
                  variant="filled"
                  dropdownStyle={{ borderRadius: '12px' }}
                />
              </Form.Item>
            </div>

            <motion.div 
              variants={itemVariants}
              className="flex justify-end mt-8 pt-8 border-t border-slate-100"
            >
              <Button
                type="primary"
                htmlType="submit"
                loading={pendingCreate}
                icon={<UserPlus size={18} />}
                className="h-12 px-8 bg-emerald-500 hover:!bg-emerald-600 border-none rounded-2xl shadow-lg shadow-emerald-500/30 text-base font-black transition-all active:scale-95 cursor-pointer"
              >
                TẠO TÀI KHOẢN
              </Button>
            </motion.div>
          </Form>
        </motion.div>
      </motion.div>
    </ConfigProvider>
  );
};

export default CreateStaff;
