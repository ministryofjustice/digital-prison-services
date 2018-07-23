import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './index.scss';
import { properCaseName } from "../../stringUtils";

class NoneAttendanceModal extends Component {
  onReasonChange (event) {
    this.setState({
      ...this.state,
      reason: event.target.value
    });
  }

  onCommentChange (event) {
    this.setState({
      ...this.state,
      comment: event.target.value
    });
  }

  validationErrors () {
    const { reason, comment } = this.state || {};
    let error;

    if (!reason) {
      error = {
        ...error || {},
        reason: 'Please select a reason.'
      };
    }

    if (!comment) {
      error = {
        ...error || {},
        comment: 'Please select a comment.'
      };
    }

    return error;
  }


  onSubmit () {
    const error = this.validationErrors();

    if (error) {
      this.setState({
        ...this.state,
        error
      });
      return;
    }

    const { reason, comment } = this.state;

    this.setState({
      error: {},
      reason,
      comment
    });

    this.props.onConfirm({ reason, comment, event: this.props.event });
  }

  render () {
    const { reasons, onClose = [], event } = this.props;
    const { error } = this.state || {};

    const reasonFormGroupClass = error && error.reason && 'form-group form-group-error' || 'form-group';
    const commentFormGroupClass = (error && error.comment && 'form-group form-group-error') || 'form-group';

    const reasonSelectClass = (error && error.reason && 'form-control form-control-error') || 'form-control';
    const commentClass = (error && error.comment && 'form-control form-control-error') || 'form-control';

    return (<div key="attendance-modal">
      <div className="attendance-modal">

        <div className={reasonFormGroupClass}>
          <h2 className="heading-medium no-top-margin">
            {`${properCaseName(event.lastName)}, ${properCaseName(event.firstName)}`}
          </h2>

          {error && error.reason && <span className="error-message">{error.reason}</span> }

          <label className="form-label" htmlFor="reasons">
                      Select an option:
          </label>
          <select id="none-attendance-reason" name="reasons" className={reasonSelectClass} onChange={event => this.onReasonChange(event)} defaultValue={'default'}>
            <option value="default" disabled hidden>Select option</option>
            {reasons.map(reason => <option key={reason}>{reason}</option>)}
          </select>
        </div>

        <div className={commentFormGroupClass}>
          {error && error.reason && <span className="error-message">{error.comment}</span> }
          <label className="form-label" htmlFor="comments">
               Comments:
          </label>
          <textarea id="none-attendance-comment" className={commentClass} name="comments" rows="5" onChange={event => this.onCommentChange(event)} />
        </div>

        <div>
          <button className="button margin-top-30 margin-right-15" onClick={this.onSubmit.bind(this)}>Confirm</button>
          <button className="greyButton margin-top-30" onClick={() => onClose()}>Cancel</button>
        </div>
      </div>
    </div>);
  }
}

NoneAttendanceModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
  reasons: PropTypes.array.isRequired
};

export default NoneAttendanceModal;
