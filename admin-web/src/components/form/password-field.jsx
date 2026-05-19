import { Form, Input } from "antd";
import clsx from "clsx";
import PropTypes from "prop-types";

const PasswordField = ({
  name,
  label = null,
  autoComplete = "off",
  className = "",
  variant = "outlined",
  placeholder = "",
  rules = [],
  prefix = null,
}) => {
  return (
    <Form.Item
      name={name}
      label={<span className="text-base">{label}</span>}
      className={clsx("password-field", className)}
      rules={rules}
    >
      <Input.Password
        autoComplete={autoComplete}
        variant={variant}
        placeholder={placeholder}
        className="h-10 text-base"
        prefix={prefix}
      />
    </Form.Item>
  );
};

PasswordField.propTypes = {
  autoComplete: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.string,
  placeholder: PropTypes.string,
  rules: PropTypes.array,
  prefix: PropTypes.node,
};

export default PasswordField;
