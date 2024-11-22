import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";
import userApi from "../../../api/userApi";

const BlockCommentModal = ({ isOpen, onClose, user }) => {
  const handleResponseError = useHandleResponseError();

  const onBlock = useCallback(async () => {
    const { ok, errors } = await userApi.blockComment(user?._id ?? "");
    if (ok) {
      onClose("block", true);
    }
    if (errors) {
      handleResponseError(errors.message);
    }
  }, [user, onClose]);

  const [pendingBlock, blockComment] = useHandleAsyncRequest(onBlock);

  const handleClose = () => {
    if (pendingBlock) return;
    onClose("block", false);
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={
        <div className="flex items-center justify-center w-full">
          <span className="text-base font-medium font-exo-2">
            Khóa bình luận
          </span>
        </div>
      }
      footer={null}
      centered
    >
      <div className="flex items-center justify-center w-full">
        <span className="text-base font-medium font-exo-2">
          Bạn có chắc chắn muốn khóa bình luận của người dùng này không?
        </span>
      </div>
      <Button
        text={user?.blocked_comment ? "Mở khóa" : "Khóa"}
        className={clsx(
          "w-full text-base bg-emerald-500 hover:!bg-emerald-600 duration-300 h-10 font-exo-2 text-white"
        )}
        loading={pendingBlock}
        onClick={blockComment}
      >
        {user?.blocked_comment ? "Mở khóa" : "Khóa"}
      </Button>
    </Modal>
  );
};

BlockCommentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default BlockCommentModal;
