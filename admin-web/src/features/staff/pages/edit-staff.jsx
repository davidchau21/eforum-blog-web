import staffApi from "@/api/staffApi";
import NumberField from "@/components/form/number-field";
import TextField from "@/components/form/text-field";
import { ERole } from "@/enums/staff";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import { RoleMapper } from "@/mappers/staff";
import { decrementLoading, incrementLoading } from "@/redux/globalSlice";
import { Button, Form, Select, ConfigProvider } from "antd";
import { ArrowLeft, UserCog, Mail, User, ShieldCheck, Calendar, Type, Save, Hash, Eye } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import userApi from "../../../api/userApi";
import { formatDate } from "../../../utils/dateUtils";
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

const EditStaff = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const handleResponseError = useHandleResponseError();
  const handleResponseSuccess = useHandleResponseSuccess();

  const [staff, setStaff] = useState(undefined);

  const convertToBody = useCallback(
    (data) => ({
      fullname: data.fullname,
      role: data.role,
    }),
    []
  );

  const onGet = useCallback(async () => {
    const { ok, errors, body } = await userApi.getUserDetail(id);

    if (ok && body) {
      setStaff(body);
    }

    if (errors) {
      handleResponseError(errors, () => navigate("/users"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, handleResponseError]);
  const [pendingGetDetail, getUserDetail] = useHandleAsyncRequest(onGet);

  const onUpdate = useCallback(
    async (data) => {
      const { ok, errors } = await userApi.updateUser(id, convertToBody(data));

      if (ok) {
        handleResponseSuccess("Cập nhật thông tin tài khoản thành công");
      }

      if (errors) {
        handleResponseError(errors);
      }
    },
    [id, handleResponseError, handleResponseSuccess, convertToBody]
  );
  const [pendingUpdate, updateStaff] = useHandleAsyncRequest(onUpdate);

  useEffect(() => {
    if (pendingGetDetail) {
      dispatch(incrementLoading());
    } else {
      dispatch(decrementLoading());
    }
    if (pendingUpdate) {
      dispatch(incrementLoading());
    } else {
      dispatch(decrementLoading());
    }
  }, [pendingGetDetail, dispatch, pendingUpdate]);

  useEffect(() => {
    if (!id) {
      navigate("/users");
    } else {
      getUserDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getUserDetail]);

  useEffect(() => {
    if (staff) {
      form.setFieldsValue({
        email: staff.personal_info.email,
        fullname: staff.personal_info.fullname,
        firstName: staff.firstName,
        joinedAt: formatDate(staff.joinedAt),
        username: staff.personal_info.username,
        role: staff.personal_info.role,
        google_auth: staff.google_auth ? "Có" : "Không",
        total_posts: staff.account_info.total_posts,
        total_reads: staff.account_info.total_reads,
      });
    }
  }, [staff, form]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6', // Use blue theme for editing to differentiate from creating
          borderRadius: 12,
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto p-8 font-exo-2"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner">
              <UserCog size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Chi tiết tài khoản</h1>
              <p className="text-slate-500 font-medium mt-1">Xem và chỉnh sửa thông tin người dùng</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="default"
              icon={<ArrowLeft size={18} />}
              className="h-11 px-6 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all shadow-sm"
              onClick={() => navigate("/users")}
            >
              QUAY LẠI
            </Button>
          </motion.div>
        </div>

        <Form
          className="w-full"
          layout="vertical"
          form={form}
          onFinish={updateStaff}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Editable Fields */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <User size={20} className="text-blue-500"/> Thông tin cơ bản
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                  <TextField
                    name="fullname"
                    label={<span className="font-bold text-slate-700">Họ và tên</span>}
                    variant="filled"
                    placeholder="Nhập họ tên"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên",
                      },
                    ]}
                  />
                  
                  <Form.Item
                    label={<span className="font-bold text-slate-700 flex items-center gap-2"> Phân quyền</span>}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn phân quyền",
                      },
                    ]}
                    name="role"
                  >
                    <Select
                      options={Object.values(ERole).map((role) => ({
                        label: RoleMapper[role],
                        value: role,
                      }))}
                      placeholder="Chọn phân quyền"
                      className="h-12"
                      variant="filled"
                      dropdownStyle={{ borderRadius: '12px' }}
                    />
                  </Form.Item>

                  <TextField
                    name="email"
                    label={<span className="font-bold text-slate-700">Email (Chỉ xem)</span>}
                    variant="filled"
                    disabled
                  />

                  <TextField
                    name="username"
                    label={<span className="font-bold text-slate-700">Username (Chỉ xem)</span>}
                    variant="filled"
                    disabled
                  />
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-slate-100">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={pendingUpdate}
                    icon={<Save size={18} />}
                    className="h-12 px-8 bg-blue-500 hover:!bg-blue-600 border-none rounded-2xl shadow-lg shadow-blue-500/30 text-base font-black transition-all active:scale-95"
                  >
                    LƯU THAY ĐỔI
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Read-only Stats */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="bg-slate-50 rounded-[2.5rem] border border-slate-200 shadow-inner p-8 h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Eye size={20} className="text-slate-400"/> Thông số hoạt động
                </h3>
                
                <div className="space-y-4">
                  <TextField
                    name="joinedAt"
                    label={<span className="font-bold text-slate-500 flex items-center gap-2"><Calendar size={14}/> Ngày tham gia</span>}
                    variant="filled"
                    disabled
                  />
                  
                  <TextField
                    name="google_auth"
                    label={<span className="font-bold text-slate-500 flex items-center gap-2"><ShieldCheck size={14}/> Đăng nhập bằng Google</span>}
                    variant="filled"
                    disabled
                  />
                  
                  <TextField
                    name="total_posts"
                    label={<span className="font-bold text-slate-500 flex items-center gap-2"><Type size={14}/> Tổng bài viết</span>}
                    variant="filled"
                    disabled
                  />
                  
                  <TextField
                    name="total_reads"
                    label={<span className="font-bold text-slate-500 flex items-center gap-2"><Eye size={14}/> Lượt đọc</span>}
                    variant="filled"
                    disabled
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </Form>
      </motion.div>
    </ConfigProvider>
  );
};

export default EditStaff;
