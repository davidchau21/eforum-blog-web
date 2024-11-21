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
      />
    </Form.Item>
  );
};

PasswordField.propTypes = {
  autoComplete: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  className: PropTypes.string,
  variant: PropTypes.string,
  placeholder: PropTypes.string,
  rules: PropTypes.array,
};

export default PasswordField;
