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
  prefix = null,
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
        prefix={prefix}
      />
    </Form.Item>
  );
};

TextField.propTypes = {
  autoComplete: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  className: PropTypes.string,
  variant: PropTypes.string,
  placeholder: PropTypes.string,
  rules: PropTypes.array,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool,
  prefix: PropTypes.node,
};

export default TextField;
