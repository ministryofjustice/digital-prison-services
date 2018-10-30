import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Error extends Component {
  render() {
    const { error } = this.props
    if (error) {
      return (
        <div className="error-summary">
          <div className="error-message">
            <div> {error.message || error} </div>
          </div>
        </div>
      )
    }
    return ''
  }
}

Error.propTypes = {
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ message: PropTypes.string })]),
}

Error.defaultProps = {
  error: '',
}

export default Error
