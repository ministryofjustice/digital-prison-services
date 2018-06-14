import React from 'react';
import PropTypes from 'prop-types';

class ValidationErrors extends React.Component {
  render () {
    if (this.props.validationErrors && this.props.validationErrors[this.props.fieldName]) {
      return <span id="validation-message" className="error-message">{this.props.validationErrors[this.props.fieldName]}</span>;
    }
    // TODO: If there is any error, this helps with lining fields up, but this depends on layout!
    if (this.props.validationErrors) {
      return <span>&nbsp;</span>;
    }
    return '';
  }
}

ValidationErrors.propTypes = {
  fieldName: PropTypes.string,
  validationErrors: PropTypes.object
};

export default ValidationErrors;
