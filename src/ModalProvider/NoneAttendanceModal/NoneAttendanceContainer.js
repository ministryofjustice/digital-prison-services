import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import NoneAttendanceModal from './index';

const NoneAttendanceContainer = ({ onClose, onConfirm, data }) => (<NoneAttendanceModal
  onConfirm={onConfirm}
  onClose={onClose}
  reasons={data.reasons}
  event={data.event}
/>);

const mapDispatchToProps = dispatch => ({
  onConfirm: () => {}
});

NoneAttendanceContainer.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

export default connect(null, mapDispatchToProps)(NoneAttendanceContainer);
