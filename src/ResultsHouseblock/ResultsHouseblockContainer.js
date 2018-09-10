import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import moment from 'moment';
const axios = require('axios');
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";
import {
  resetError,
  setLoaded,
  setHouseblockData,
  setOrderField,
  setSearchSubLocation,
  setSortOrder,
  showPaymentReasonModal
} from "../redux/actions";
import Spinner from "../Spinner";
import { getHouseBlockReasons } from "../ModalProvider/PaymentReasonModal/reasonCodes";


class ResultsHouseblockContainer extends Component {
  constructor (props) {
    super(props);
    this.handleSubLocationChange = this.handleSubLocationChange.bind(this);
    this.getHouseblockList = this.getHouseblockList.bind(this);
    this.handlePrint = this.handlePrint.bind(this);
    this.update = this.update.bind(this);
    this.state = {
      previousSubLocation: null
    };
  }

  async componentWillMount () {
    try {
      if (this.props.currentLocation) {
        this.getHouseblockList('lastName', 'ASC');
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

  update () {
    if (this.props.currentSubLocation === '--') {
      if (this.state.previousSubLocation !== '--') {
        this.getHouseblockList('lastName', 'ASC');
      } else {
        this.getHouseblockList(this.props.orderField, this.props.sortOrder);
      }
    } else if (this.state.previousSubLocation === '--') {
      this.getHouseblockList('cellLocation', 'ASC');
    } else {
      this.getHouseblockList(this.props.orderField, this.props.sortOrder);
    }
  }

  async getHouseblockList (orderField, sortOrder) {
    try {
      this.setState(state => (
        {
          ...state,
          previousSubLocation: this.props.currentSubLocation
        }
      ));
      this.props.resetErrorDispatch();
      this.props.setLoadedDispatch(false);

      this.props.orderDispatch(orderField);
      this.props.sortOrderDispatch(sortOrder);

      let date = this.props.date;
      if (date === 'Today') { // replace placeholder text
        date = moment().format('DD/MM/YYYY');
      }

      const compoundGroupName = (location, subLocation) => (subLocation && subLocation !== '--') ? `${location}_${subLocation}` : location;

      const config = {
        params: {
          agencyId: this.props.agencyId,
          groupName: compoundGroupName(this.props.currentLocation, this.props.currentSubLocation),
          date: date,
          timeSlot: this.props.period
        },
        headers: {
          'Sort-Fields': orderField,
          'Sort-Order': sortOrder
        }
      };

      const response = await axios.get('/api/houseblocklist', config);
      this.props.houseblockDataDispatch(response.data);
    } catch (error) {
      this.props.handleError(error);
    }
    this.props.setLoadedDispatch(true);
  }

  render () {
    if (!this.props.loaded) {
      return <Spinner/>;
    }
    return (<div><Error {...this.props} />
      <ResultsHouseblock
        handlePrint={this.handlePrint}
        handleSubLocationChange={this.handleSubLocationChange}
        getHouseblockList={this.getHouseblockList}
        update={this.update}
        {...this.props}
      />
    </div>);
  }
}

ResultsHouseblockContainer.propTypes = {
  agencyId: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  currentSubLocation: PropTypes.string.isRequired,
  date: PropTypes.string,
  error: PropTypes.string,
  handleError: PropTypes.func.isRequired,
  houseblockDataDispatch: PropTypes.func,
  history: PropTypes.object,
  loaded: PropTypes.bool,
  orderDispatch: PropTypes.func.isRequired,
  orderField: PropTypes.string,
  period: PropTypes.string,
  raiseAnalyticsEvent: PropTypes.func,
  resetErrorDispatch: PropTypes.func.isRequired,
  setLoadedDispatch: PropTypes.func.isRequired,
  sortOrder: PropTypes.string,
  sortOrderDispatch: PropTypes.func.isRequired,
  subLocationDispatch: PropTypes.func.isRequired,
  subLocations: PropTypes.array
};

const extractSubLocations = (locations, currentLocation) => {
  if (!locations) return [];
  if (!currentLocation) return [];
  const subLocations = locations.filter(l => l.name === currentLocation).map(l => l.children);
  return subLocations ? subLocations[0].map(l => l.name) : [];
};

const mapStateToProps = state => {
  return {
    currentLocation: state.search.location,
    currentSubLocation: state.search.subLocation,
    date: state.search.date,
    houseblockData: state.events.houseBlockData,
    loaded: state.app.loaded,
    orderField: state.events.orderField,
    paymentReasonReasons: state.events.paymentReasonReasons,
    sortOrder: state.events.sortOrder,
    subLocations: extractSubLocations(state.search.locations, state.search.location)
  };
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    houseblockDataDispatch: data => dispatch(setHouseblockData(data)),
    orderDispatch: field => dispatch(setOrderField(field)),
    resetErrorDispatch: () => dispatch(resetError()),
    setLoadedDispatch: (status) => dispatch(setLoaded(status)),
    showPaymentReasonModal: (event, browserEvent) => dispatch(showPaymentReasonModal({ event, browserEvent, reasons: getHouseBlockReasons() })),
    sortOrderDispatch: field => dispatch(setSortOrder(field)),
    subLocationDispatch: text => dispatch(setSearchSubLocation(text))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer));
