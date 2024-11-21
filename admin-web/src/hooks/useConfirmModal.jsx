import { Button, Modal } from "antd";
import { ShieldAlert } from "lucide-react";
import { useCallback } from "react";

const useConfirmModal = () => {
  const showConfirmModal = useCallback(
    ({ message, onOk = undefined, title = "Thông báo" }) => {
      const instance = Modal.error({
        title: (
          <span className="text-base font-bold text-[#faad14] font-exo-2">
            {title}
          </span>
        ),
        content: <p className="text-base text-center font-exo-2">{message}</p>,
        onOk: () => {
          instance.destroy();
          if (onOk) {
            onOk();
          }
        },
        centered: true,
        footer: (
          <div className="flex items-center justify-center w-full gap-4 mt-3">
            <Button
              className="w-32 h-8 text-base font-medium uppercase !bg-green-1 hover:opacity-60 duration-300 font-exo-2"
              type="primary"
              onClick={() => {
                instance.destroy();
                if (onOk) {
                  onOk();
                }
              }}
            >
              OK
            </Button>
            <Button
              type="primary"
              onClick={() => instance.destroy()}
              className="w-32 h-8 text-base font-medium font-exo-2"
              danger
            >
              Hủy
            </Button>
          </div>
        ),
        className: "modal--success",
        icon: <ShieldAlert size={24} color="#faad14" />,
      });
    },
    []
  );

  return showConfirmModal;
};

export default useConfirmModal;
