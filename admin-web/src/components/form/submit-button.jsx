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
          "w-full text-base bg-brown-1 hover:!bg-brown-3 duration-300 h-10 font-exo-2",
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
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  formItemClassname: PropTypes.string,
};

export default SubmitButton;
