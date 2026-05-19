import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";
import userApi from "../../../api/userApi";

const ConfirmActionModal = ({ isOpen, onClose, user, type }) => {
  const handleResponseError = useHandleResponseError();

  const getActionConfig = () => {
    switch (type) {
      case "block_comment":
        return {
          title: "Khóa bình luận",
          description: "Bạn có chắc chắn muốn khóa/mở khóa bình luận của người dùng này không?",
          apiCall: () => userApi.blockComment(user?._id),
          buttonText: user?.blocked_comment ? "Mở khóa bình luận" : "Khóa bình luận",
          buttonColor: "bg-amber-500 hover:!bg-amber-600",
        };
      case "disable_account":
        return {
          title: "Khóa tài khoản",
          description: "Bạn có chắc chắn muốn khóa/mở khóa tài khoản người dùng này không?",
          apiCall: () => userApi.disableUser(user?._id),
          buttonText: user?.disabled ? "Mở khóa tài khoản" : "Khóa tài khoản",
          buttonColor: "bg-orange-500 hover:!bg-orange-600",
        };
      case "delete_account":
        return {
          title: "Xóa tài khoản",
          description: "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản người dùng này không? Hành động này không thể hoàn tác.",
          apiCall: () => userApi.deleteUser(user?._id),
          buttonText: "Xóa tài khoản",
          buttonColor: "bg-rose-500 hover:!bg-rose-600",
        };
      default:
        return {
          title: "",
          description: "",
          apiCall: async () => ({ ok: false }),
          buttonText: "",
          buttonColor: "",
        };
    }
  };

  const config = getActionConfig();

  const onConfirm = useCallback(async () => {
    const { ok, errors } = await config.apiCall();
    if (ok) {
      onClose(true); // isReload = true
    }
    if (errors) {
      handleResponseError(errors.message);
    }
  }, [config, onClose, handleResponseError]);

  const [pendingAction, handleConfirm] = useHandleAsyncRequest(onConfirm);

  const handleClose = () => {
    if (pendingAction) return;
    onClose(false);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center justify-center w-full pb-2">
          <span className="text-xl font-bold font-exo-2 text-slate-800">
            {config.title}
          </span>
        </div>
      }
      footer={null}
      centered
      className="glass-modal"
    >
      <div className="flex flex-col items-center justify-center w-full py-4 gap-6">
        <p className="text-sm font-medium font-exo-2 text-slate-500 text-center px-4">
          {config.description}
        </p>
        
        <div className="flex gap-3 w-full mt-2">
          <Button
            className="flex-1 h-11 rounded-xl font-exo-2 font-bold text-slate-500 border-slate-200 hover:!border-slate-300 hover:!text-slate-600"
            disabled={pendingAction}
            onClick={handleClose}
          >
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            className={clsx(
              "flex-1 h-11 rounded-xl font-exo-2 font-bold border-none shadow-lg text-white transition-all",
              config.buttonColor,
              config.buttonColor.replace("bg-", "shadow-").split(" ")[0] + "/30"
            )}
            loading={pendingAction}
            onClick={handleConfirm}
          >
            {config.buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

ConfirmActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  type: PropTypes.oneOf(["block_comment", "disable_account", "delete_account"]),
};

export default ConfirmActionModal;
