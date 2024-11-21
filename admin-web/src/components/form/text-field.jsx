import { Form, Input } from "antd";
import clsx from "clsx";
import PropTypes from "prop-types";

const TextField = ({
  name,
  label = null,
  autoComplete = "off",
  className = "",
  variant = "outlined",
  placeholder = "",
  rules = [],
  readOnly = false,
  disabled = false,
}) => {
  return (
    <Form.Item
      name={name}
      label={<span className="text-base">{label}</span>}
      className={clsx("text-field", className)}
      rules={rules}
    >
      <Input
        autoComplete={autoComplete}
        variant={variant}
        placeholder={placeholder}
        className="h-10 text-base"
        readOnly={readOnly}
        disabled={disabled}
      />
    </Form.Item>
  );
};

TextField.propTypes = {
  autoComplete: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  className: PropTypes.string,
  variant: PropTypes.string,
  placeholder: PropTypes.string,
  rules: PropTypes.array,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default TextField;
