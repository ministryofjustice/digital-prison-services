import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";
import { setHouseblockOrder, setSearchLocations } from "../redux/actions";
import axios from "axios/index";

class ResultsHouseblockContainer extends Component {
  componentWillMount () {
    if (!this.props.locations) {
      this.getLocations();
    }
    this.props.getHouseblockList(this.props.orderField);
    this.handlePrint = this.handlePrint.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  async getLocations () {
    try {
      const response = await axios.get('/api/houseblockLocations', {
        params: {
          agencyId: this.props.agencyId
        } });
      this.props.locationsDispatch(response.data);
      // Use the first location by default if not already set
      if (!this.props.currentLocation && response.data && response.data[0]) {
        this.props.locationDispatch(response.data[0]);
      }
    } catch (error) {
      this.displayError(error);
    }
  }

  handlePrint () {
    window.print();
  }

  handleSave () {
    // TODO
  }

  render () {
    return (<div><Error {...this.props} />
      <ResultsHouseblock handlePrint={this.handlePrint} handleSave={this.handleSave} {...this.props}/>
    </div>);
  }
}

ResultsHouseblockContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locations: PropTypes.array,
  currentLocation: PropTypes.string.isRequired,
  locationsDispatch: PropTypes.func.isRequired,
  locationDispatch: PropTypes.func.isRequired,
  getHouseblockList: PropTypes.func,
  houseblockDataDispatch: PropTypes.func,
  orderField: PropTypes.string
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations,
    houseblockData: state.houseblock.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationsDispatch: text => dispatch(setSearchLocations(text)),
    orderDispatch: field => dispatch(setHouseblockOrder(field))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer);
