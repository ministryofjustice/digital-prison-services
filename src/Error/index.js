import React, { Component } from 'react'
import PropTypes from 'prop-types'

class Error extends Component {
  render() {
    const { error } = this.props
    const reloadLink =
      error && error.showReload && error.reloadPage ? (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        <a href="#" onClick={error.reloadPage}>
          Please refresh the page.
        </a>
      ) : (
        ''
      )
    if (error) {
      return (
        <div className="error-summary">
          <div className="error-message">
            <div>
              {error.message || error} {reloadLink}
            </div>
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
