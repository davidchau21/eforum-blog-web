import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";
import notificationApi from "../../../api/notification";

const DeleteAlertModal = ({ isOpen, onClose, alert }) => {
  const handleResponseError = useHandleResponseError();

  const onDelete = useCallback(async () => {
    const { ok, errors } = await notificationApi.deleteNotification(alert?._id ?? "");
    if (ok) {
      onClose("delete", true);
    }
    if (errors) {
      handleResponseError(errors.message);
    }
  }, [alert, onClose]);

  const [pendingDelete, deleteAlert] = useHandleAsyncRequest(onDelete);

  const handleClose = () => {
    if (pendingDelete) return;
    onClose("delete", false);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center justify-center w-full">
          <span className="text-base font-medium font-exo-2">Xoá thông báo</span>
        </div>
      }
      footer={null}
      centered
    >
      <div className="flex items-center justify-center w-full">
        <span className="text-base font-medium font-exo-2">
          Bạn có chắc chắn muốn xoá thông báo này không?
        </span>
      </div>
      <Button
        className={clsx(
          "w-full text-base bg-emerald-500 hover:!bg-emerald-600 duration-300 h-10 font-exo-2 text-white"
        )}
        loading={pendingDelete}
        onClick={deleteAlert}
      >
        Xoá
      </Button>
    </Modal>
  );
};

DeleteAlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  category: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default DeleteAlertModal;
