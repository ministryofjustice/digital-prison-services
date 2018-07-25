import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";
import { setSearchLocations, showPaymentReasonModal } from "../redux/actions";
import axios from "axios/index";
import Spinner from "../Spinner";
import { getHouseBlockReasons } from "../ModalProvider/PaymentReasonModal/reasonCodes";

class ResultsHouseblockContainer extends Component {
  async componentWillMount () {
    try {
      this.handlePrint = this.handlePrint.bind(this);
      this.handleSave = this.handleSave.bind(this);
      if (!this.props.locations) {
        await this.getLocations();
      }
      if (this.props.currentLocation) {
        this.props.getHouseblockList(this.props.orderField, this.props.sortOrder);
      } else {
        this.props.history.push('/whereaboutssearch');
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getLocations () {
    const response = await axios.get('/api/houseblockLocations', {
      params: {
        agencyId: this.props.agencyId
      } });
    this.props.locationsDispatch(response.data);
    // Use the first location by default if not already set
    if (!this.props.currentLocation && response.data && response.data[0]) {
      this.props.locationDispatch(response.data[0]);
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
      <ResultsHouseblock
        handlePrint={this.handlePrint}
        handleSave={this.handleSave}
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
  locationsDispatch: PropTypes.func.isRequired,
  locationDispatch: PropTypes.func.isRequired,
  getHouseblockList: PropTypes.func,
  houseblockDataDispatch: PropTypes.func,
  orderField: PropTypes.string,
  sortOrder: PropTypes.string,
  loaded: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations,
    houseblockData: state.houseblock.data,
    loaded: state.app.loaded,
    orderField: state.houseblock.orderField,
    sortOrder: state.houseblock.sortOrder,
    paymentReasonReasons: state.houseblock.paymentReasonReasons
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    locationsDispatch: text => dispatch(setSearchLocations(text)),
    showPaymentReasonModal: event => dispatch(showPaymentReasonModal({ event, reasons: getHouseBlockReasons() }))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer));
