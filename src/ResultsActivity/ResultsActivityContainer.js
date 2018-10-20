import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Error from '../Error';
import ResultsActivity from "./ResultsActivity";
import { setSearchActivities, showPaymentReasonModal } from "../redux/actions";
import Spinner from "../Spinner";
import { getActivityListReasons } from "../ModalProvider/PaymentReasonModal/reasonCodes";

class ResultsActivityContainer extends Component {
  async componentWillMount () {
    const { activity, getActivityList, history } = this.props;

    try {
      this.handlePrint = this.handlePrint.bind(this);
      if (activity) {
        getActivityList();
      } else {
        history.push('/whereaboutssearch');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handlePrint () {
    const { raiseAnalyticsEvent } = this.props;

    raiseAnalyticsEvent({
      category: 'Activity list',
      action: 'Print list'
    });
    window.print();
  }

  render () {
    const { loaded } = this.props;

    if (!loaded) {
      return <Spinner/>;
    }
    return (<div><Error {...this.props} />
      <ResultsActivity handlePrint={this.handlePrint} {...this.props}/>
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
  loaded: PropTypes.bool,
  raiseAnalyticsEvent: PropTypes.func
};

const mapStateToProps = state => ({
    activities: state.search.activities,
    activityData: state.events.activityData,
    loaded: state.app.loaded
  });

const mapDispatchToProps = dispatch => ({
    activitiesDispatch: text => dispatch(setSearchActivities(text)),
    showPaymentReasonModal: (event, browserEvent) => dispatch(showPaymentReasonModal({ event, browserEvent, reasons: getActivityListReasons() }))
  });

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsActivityContainer));
