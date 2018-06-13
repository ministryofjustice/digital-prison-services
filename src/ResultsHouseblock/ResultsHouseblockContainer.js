import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";
import { setSearchLocations } from "../redux/actions";
import axios from "axios/index";
import Spinner from "../Spinner";

class ResultsHouseblockContainer extends Component {
  async componentWillMount () {
    try {
      this.handlePrint = this.handlePrint.bind(this);
      this.handleSave = this.handleSave.bind(this);
      if (!this.props.locations) {
        await this.getLocations();
      }
      this.props.getHouseblockList(this.props.orderField, this.props.sortOrder);
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
    sortOrder: state.houseblock.sortOrder
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationsDispatch: text => dispatch(setSearchLocations(text))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer);
