import { Button, Form } from "antd";
import clsx from "clsx";
import PropTypes from "prop-types";

const SubmitButton = ({
  text,
  className = "",
  loading = false,
  disabled = false,
  formItemClassname = "",
}) => {
  return (
    <Form.Item className={clsx("w-full m-0", formItemClassname)}>
      <Button
        disabled={disabled}
        loading={loading}
        htmlType="submit"
        className={clsx(
          "w-full flex items-center justify-center bg-emerald-500 hover:!bg-emerald-600 duration-300 font-exo-2 transition-all",
          className
        )}
        type="primary"
      >
        {text}
      </Button>
    </Form.Item>
  );
};

SubmitButton.propTypes = {
  text: PropTypes.node.isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  formItemClassname: PropTypes.string,
};

export default SubmitButton;
