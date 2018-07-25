import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import PaymentReasonModal from './index';

const axios = require('axios');

const onConfirm = async (props) => {
  try {
    const data = {
      eventOutcome: props.reasons[props.reason.key].mapping.eventOutcome,
      performance: props.reasons[props.reason.key].mapping.performance,
      outcomeComment: props.comment
    };
    await axios.put(`/api/updateAttendance?offenderNo=${props.event.offenderNo}&activityId=${props.event.eventId}`, data);
  } catch (error) {
    props.setErrorDispatch(error.message);
  }
};

const PaymentReasonContainer = ({ onClose, data }) => (<PaymentReasonModal
  onConfirm={onConfirm}
  onClose={onClose}
  reasons={data.reasons}
  event={data.event}
/>);


PaymentReasonContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default connect(null, null)(PaymentReasonContainer);
