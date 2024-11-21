import clsx from "clsx";
import PropTypes from "prop-types";

const TableDataColumn = ({ label, className }) => (
  <span className={clsx("font-exo-2", className)}>{label}</span>
);

TableDataColumn.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default TableDataColumn;
