import { Form } from "antd";
import clsx from "clsx";
import PropTypes from "prop-types";
import { NumericFormat } from "react-number-format";

const NumberField = ({
  name,
  isError,
  label = null,
  autoComplete = "off",
  className = "",
  placeholder = "",
  rules = [],
  readOnly = false,
  thousandSeparator = ",",
  maxLength = 100,
  disabled = false,
}) => {
  return (
    <Form.Item
      name={name}
      label={<span className="text-base">{label}</span>}
      className={clsx("text-field", className)}
      rules={rules}
    >
      <NumericFormat
        disabled={disabled}
        readOnly={readOnly}
        thousandSeparator={thousandSeparator}
        autoComplete={autoComplete}
        placeholder={placeholder}
        allowNegative={false}
        maxLength={maxLength}
        className={`${
          isError
            ? "bg-[#fff2f0] focus:border-red-2 focus-within:border-red-2"
            : "bg-black/[0.06] focus:border-brown-1 focus-within:border-brown-1"
        } w-full text-base font-exo-2 border border-solid border-transparent outline-none h-10 px-[11px] py-[4px] rounded-md focus:bg-transparent duration-300 disabled:border-[#d9d9d9] disabled:text-disabled-1 disabled:bg-disabled-2`}
      />
    </Form.Item>
  );
};

NumberField.propTypes = {
  autoComplete: PropTypes.string,
  name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.oneOf([null])]),
  className: PropTypes.string,
  placeholder: PropTypes.string,
  rules: PropTypes.array,
  isError: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool,
  thousandSeparator: PropTypes.string,
  maxLength: PropTypes.number,
  disabled: PropTypes.bool,
};

export default NumberField;
