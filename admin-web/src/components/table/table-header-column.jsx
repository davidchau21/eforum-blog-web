import PropTypes from "prop-types";

const TableHeaderColumn = ({ label }) => (
  <span className="font-exo-2">{label}</span>
);

TableHeaderColumn.propTypes = {
  label: PropTypes.string.isRequired,
};

export default TableHeaderColumn;
