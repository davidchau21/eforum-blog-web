import { Button, Modal } from "antd";
import { CircleCheck } from "lucide-react";
import { useCallback } from "react";

const useHandleResponseSuccess = () => {
  const handleResponseSuccess = useCallback((message, onOk = undefined) => {
    const instance = Modal.error({
      title: (
        <span className="text-base font-bold text-[#49cc90] font-exo-2">
          Thông báo
        </span>
      ),
      content: <span className="text-base font-exo-2">{message}</span>,
      onOk: () => {
        instance.destroy();
        if (onOk) {
          onOk();
        }
      },
      centered: true,
      footer: (
        <div className="flex items-center justify-center w-full mt-3">
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
        </div>
      ),
      className: "modal--success",
      icon: <CircleCheck size={24} color="#49cc90" />,
    });
  }, []);

  return handleResponseSuccess;
};

export default useHandleResponseSuccess;
