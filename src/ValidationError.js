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
    // TODO: If there is any error, this helps with lining fields up, but this depends on layout!
    if (validationErrors) {
      return <span>&nbsp;</span>
    }
    return ''
  }
}

ValidationErrors.propTypes = {
  fieldName: PropTypes.string.isRequired,
  validationErrors: PropTypes.object,
}

ValidationErrors.defaultProps = {
  validationErrors: {},
}

export default ValidationErrors
