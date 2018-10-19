import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './index.scss';
import { properCaseName } from "../../utils";

class PaymentReasonModal extends Component {
  onReasonChange (event, reasons) {
    this.setState({
      ...this.state,
      reason: { key: event.target.selectedIndex - 1, value: event.target.value },
      reasons
    });
  }

  onCommentChange (event) {
    this.setState({
      ...this.state,
      comment: event.target.value
    });
  }

  onSubmit () {
    const error = this.validationErrors();
    const { onConfirm, onClose, event, handleError } = this.props;

    if (error) {
      this.setState({
        ...this.state,
        error
      });
      return;
    }

    const { reason, comment, reasons } = this.state;

    this.setState({
      error: {},
      reason,
      comment
    });

    onConfirm({ reason, comment, reasons, event: event, handleError: handleError });
    onClose();
  }

  validationErrors () {
    const { reason, comment, reasons } = this.state || {};
    let error;

    if (!reason) {
      error = {
        ...error || {},
        reason: 'Please select a reason.'
      };
      return error;
    }

    if (!comment && reasons[reason.key].commentRequired) {
      error = {
        ...error || {},
        comment: 'Please select a comment.'
      };
    }

    return error;
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
          <select id="payment-reason-reason" name="reasons" className={reasonSelectClass} onChange={event => this.onReasonChange(event, reasons)} defaultValue={'default'}>
            <option value="default" disabled hidden>Select option</option>
            {reasons.map((reason) => <option key={reason.value}>{reason.value}</option>)}
          </select>
        </div>

        <div className={commentFormGroupClass}>
          {error && error.reason && <span className="error-message">{error.comment}</span> }
          <label className="form-label" htmlFor="comments">
               Comments:
          </label>
          <textarea id="payment-reason-comment" className={commentClass} name="comments" rows="5" onChange={event => this.onCommentChange(event)} />
        </div>

        <div>
          <button className="button margin-top-30 margin-right-15" onClick={this.onSubmit.bind(this)}>Confirm</button>
          <button className="greyButton margin-top-30" onClick={() => onClose()}>Cancel</button>
        </div>
      </div>
    </div>);
  }
}

PaymentReasonModal.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
  handleError: PropTypes.func.isRequired,
  reasons: PropTypes.array.isRequired
};

export default PaymentReasonModal;
