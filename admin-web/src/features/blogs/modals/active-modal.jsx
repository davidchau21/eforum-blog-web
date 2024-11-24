import useHandleAsyncRequest from "@/hooks/useHandleAsyncRequest";
import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import { useCallback } from "react";
import useHandleResponseError from "../../../hooks/useHandleResponseError";
import clsx from "clsx";
import blogApi from "../../../api/blogApi";

const ActiveModal = ({ isOpen, onClose, blog }) => {
  const handleResponseError = useHandleResponseError();

  const onActive = useCallback(async () => {
    if (blog) {
      const { ok, errors } = await blogApi.activeBlog(blog.blog_id);
      if (ok) {
        onClose("active", true);
      }
      if (errors) {
        handleResponseError(errors.message);
      }
    }
  }, [blog, onClose]);

  const [pendingDelete, deleteCategory] = useHandleAsyncRequest(onActive);

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
          <span className="text-base font-medium font-exo-2">
            {blog?.isActive ? "Vô hiệu hoá bài đăng" : "Kích hoạt bài đăng"}
          </span>
        </div>
      }
      footer={null}
      centered
    >
      <div className="flex items-center justify-center w-full">
        <span className="text-base font-medium font-exo-2">
          Bạn có chắc chắn muốn{" "}
          {blog?.isActive ? "Vô hiệu hoá bài đăng" : "Kích bài đăng"} này không?
        </span>
      </div>
      <Button
        text={blog?.isActive ? "Vô hiệu hoá" : "Kích hoạt"}
        className={clsx(
          "w-full text-base bg-emerald-500 hover:!bg-emerald-600 duration-300 h-10 font-exo-2 text-white"
        )}
        loading={pendingDelete}
        onClick={deleteCategory}
      >
        {blog?.isActive ? "Vô hiệu hoá" : "Kích hoạt"}
      </Button>
    </Modal>
  );
};

ActiveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blog: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([null, undefined]),
  ]),
};

export default ActiveModal;
