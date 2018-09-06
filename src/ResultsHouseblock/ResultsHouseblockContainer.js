import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";
import { setSearchSubLocation, showPaymentReasonModal } from "../redux/actions";
import Spinner from "../Spinner";
import { getHouseBlockReasons } from "../ModalProvider/PaymentReasonModal/reasonCodes";


class ResultsHouseblockContainer extends Component {
  constructor () {
    super();
    this.handleSubLocationChange = this.handleSubLocationChange.bind(this);
  }

  async componentWillMount () {
    try {
      this.handlePrint = this.handlePrint.bind(this);
      // await this.getSubLocations();

      if (this.props.currentLocation) {
        this.props.getHouseblockList(this.props.orderField, this.props.sortOrder);
      } else {
        this.props.history.push('/whereaboutssearch');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleSubLocationChange (event) {
    this.props.subLocationDispatch(event.target.value);
  }

  handlePrint () {
    this.props.raiseAnalyticsEvent({
      category: 'House block list',
      action: 'Print list'
    });
    window.print();
  }

  render () {
    if (!this.props.loaded) {
      return <Spinner/>;
    }
    return (<div><Error {...this.props} />
      <ResultsHouseblock
        handlePrint={this.handlePrint}
        handleSubLocationChange={this.handleSubLocationChange}
        {...this.props}
      />
    </div>);
  }
}

ResultsHouseblockContainer.propTypes = {
  history: PropTypes.object,
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locations: PropTypes.array,
  currentLocation: PropTypes.string.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  subLocationDispatch: PropTypes.func.isRequired,
  getHouseblockList: PropTypes.func,
  houseblockDataDispatch: PropTypes.func,
  orderField: PropTypes.string,
  sortOrder: PropTypes.string,
  loaded: PropTypes.bool,
  raiseAnalyticsEvent: PropTypes.func
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations,
    currentLocation: state.search.location,
    currentSubLocation: state.search.subLocation,
    houseblockData: state.events.houseBlockData,
    loaded: state.app.loaded,
    orderField: state.events.orderField,
    sortOrder: state.events.sortOrder,
    paymentReasonReasons: state.events.paymentReasonReasons
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    subLocationDispatch: text => dispatch(setSearchSubLocation(text)),
    showPaymentReasonModal: (event, browserEvent) => dispatch(showPaymentReasonModal({ event, browserEvent, reasons: getHouseBlockReasons() }))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer));
