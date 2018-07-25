import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Error from '../Error';
import ResultsActivity from "./ResultsActivity";
import { setSearchActivities, showNoneAttendanceModal } from "../redux/actions";
import Spinner from "../Spinner";

import { getActivityListReasons } from "../ModalProvider/NoneAttendanceModal/reasonCodes";

class ResultsActivityContainer extends Component {
  async componentWillMount () {
    try {
      this.handlePrint = this.handlePrint.bind(this);
      this.handleSave = this.handleSave.bind(this);
      if (this.props.activity) {
        this.props.getActivityList();
      } else {
        this.props.history.push('/whereaboutssearch');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handlePrint () {
    window.print();
  }

  handleSave () {
    // TODO
  }

  render () {
    if (!this.props.loaded) {
      return <Spinner/>;
    }
    return (<div><Error {...this.props} />
      <ResultsActivity handlePrint={this.handlePrint} handleSave={this.handleSave} {...this.props}/>
    </div>);
  }
}

ResultsActivityContainer.propTypes = {
  history: PropTypes.object,
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  activities: PropTypes.array,
  activity: PropTypes.string.isRequired,
  activitiesDispatch: PropTypes.func.isRequired,
  getActivityList: PropTypes.func,
  activityDataDispatch: PropTypes.func,
  loaded: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    activities: state.search.activities,
    activityData: state.events.activityData,
    loaded: state.app.loaded
  };
};

const mapDispatchToProps = dispatch => {
  return {
    activitiesDispatch: text => dispatch(setSearchActivities(text)),
    showNoneAttendanceModal: event => dispatch(showNoneAttendanceModal({ event, reasons: getActivityListReasons() }))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsActivityContainer));
