import React from 'react'
import PropTypes from 'prop-types'

class ValidationErrors extends React.Component {
  render() {
    const { validationErrors, fieldName } = this.props

    if (validationErrors && validationErrors[fieldName]) {
      return (
        <span id="validation-message" className="error-message">
          {validationErrors[fieldName]}
        </span>
      )
    }

    return ''
  }
}

ValidationErrors.propTypes = {
  fieldName: PropTypes.string.isRequired,
  validationErrors: PropTypes.shape({ searchForm: PropTypes.string }),
}

ValidationErrors.defaultProps = {
  validationErrors: {},
}

export default ValidationErrors
