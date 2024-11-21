import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";
import blogApi from "../../../api/blogApi";

const DeleteModal = ({ isOpen, onClose, blog }) => {
  const handleResponseError = useHandleResponseError();

  const onDelete = useCallback(async () => {
    if (blog) {
      const { ok, errors } = await blogApi.deleteBlog(blog.blog_id);
      if (ok) {
        onClose("delete", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    }
  }, [blog, onClose]);

  const [pendingDelete, deleteCategory] = useHandleAsyncRequest(onDelete);

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
          <span className="text-base font-medium font-exo-2">Xoá blog</span>
        </div>
      }
      footer={null}
      centered
    >
      <div className="flex items-center justify-center w-full">
        <span className="text-base font-medium font-exo-2">
          Bạn có chắc chắn muốn xoá blog này không?
        </span>
      </div>
      <Button
        text="Xoá"
        className={clsx(
          "w-full text-base bg-brown-1 hover:!bg-brown-3 duration-300 h-10 font-exo-2 text-white"
        )}
        loading={pendingDelete}
        onClick={deleteCategory}
      >
        Xoá
      </Button>
    </Modal>
  );
};

DeleteModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blog: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default DeleteModal;
