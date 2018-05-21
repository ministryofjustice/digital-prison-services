import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Error extends Component {
  render () {
    if (this.props.error) {
      return (<div className="error-summary">
        <div className="error-message">
          <div> {this.props.error.message || this.props.error} </div>
        </div>
      </div>);
    }
    return '';
  }
}

Error.propTypes = {
  error: PropTypes.string
};

export default Error;
