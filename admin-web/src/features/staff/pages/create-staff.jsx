import staffApi from "@/api/staffApi";
import NumberField from "@/components/form/number-field";
import PasswordField from "@/components/form/password-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { ERole } from "@/enums/staff";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import { RoleMapper } from "@/mappers/staff";
import { Button, Form, Select } from "antd";
import { ArrowLeft } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../../api/userApi";

const CreateStaff = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const handleResponseError = useHandleResponseError();
  const handleResponseSuccess = useHandleResponseSuccess();

  const onCreate = useCallback(
    async (data) => {
      const { ok, errors } = await userApi.createUser({
        ...data,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleResponseError, handleResponseSuccess]
  );
  const [pendingCreate, createCategory] = useHandleAsyncRequest(onCreate);

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xl font-semibold">Thêm tài khoản mới</h3>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<ArrowLeft size={24} />}
            className="h-9 bg-brown-1 hover:!bg-brown-3 duration-300 text-sm font-medium"
            onClick={() => navigate(-1)}
          >
            Quay lại
          </Button>
        </div>
      </div>

      <Form
        className="grid w-full grid-cols-2 gap-3 p-5 bg-white rounded-md"
        layout="vertical"
        onFinish={createCategory}
        form={form}
      >
        <TextField
          name="email"
          label="Email"
          variant="filled"
          placeholder="Nhập email"
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
          label="Mật khẩu"
          variant="filled"
          placeholder="Nhập mật khẩu"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu",
            },
          ]}
        />
        <TextField
          name="fullname"
          label="Họ Tên"
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
          label={<span className="text-base font-exo-2">Phân quyền</span>}
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
            className="h-10"
            variant="filled"
          />
        </Form.Item>
        <div className="flex items-center justify-center col-span-2">
          <div className="w-1/3">
            <SubmitButton text="Lưu" className="mt-2" loading={pendingCreate} />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default CreateStaff;
