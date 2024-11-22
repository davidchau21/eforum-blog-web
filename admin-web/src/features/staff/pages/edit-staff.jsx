import staffApi from "@/api/staffApi";
import NumberField from "@/components/form/number-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { ERole } from "@/enums/staff";
import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import useHandleResponseError from "@/hooks/useHandleResponseError";
import { RoleMapper } from "@/mappers/staff";
import { decrementLoading, incrementLoading } from "@/redux/globalSlice";
import { Button, Form, Select } from "antd";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useHandleResponseSuccess from "@/hooks/useHandleResponseSuccess";
import userApi from "../../../api/userApi";
import { formatDate } from "../../../utils/dateUtils";

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
        google_auth: staff.google_auth,
        total_posts: staff.account_info.total_posts,
        total_reads: staff.account_info.total_reads,
      });
    }
  }, [staff, form]);

  return (
    <div className="w-full p-5">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-xl font-semibold">Thông tin tài khoản</h3>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            icon={<ArrowLeft size={24} />}
            className="h-9 bg-emerald-500 hover:!bg-emerald-600 duration-300 text-sm font-medium"
            onClick={() => navigate("/users")}
          >
            Quay lại
          </Button>
        </div>
      </div>

      <Form
        className="grid w-full grid-cols-2 gap-3 p-5 bg-white rounded-md"
        layout="vertical"
        form={form}
        onFinish={updateStaff}
      >
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
        <TextField
          name="email"
          label="Email"
          variant="filled"
          placeholder="Nhập email"
          disabled
        />
        <TextField
          name="joinedAt"
          label="Ngày tạo"
          variant="filled"
          placeholder="Ngày tạo"
          disabled
        />
        <TextField
          name="username"
          label="Username"
          variant="filled"
          placeholder="Username"
          disabled
        />
        <TextField
          name="google_auth"
          label="Google Auth"
          variant="filled"
          placeholder="Google Auth"
          disabled
        />
        <TextField
          name="total_posts"
          label="Tổng bài đăng"
          variant="filled"
          placeholder="total_posts"
          disabled
        />
        <TextField
          name="total_reads"
          label="Tổng luợt đọc"
          variant="filled"
          placeholder="total_reads"
          disabled
        />
        <div className="flex items-center justify-center col-span-2">
          <div className="w-1/3">
            <SubmitButton text="Lưu" className="mt-2" />
          </div>
        </div>
      </Form>
    </div>
  );
};

export default EditStaff;
