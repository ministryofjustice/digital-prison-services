import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Error from '../Error';
import axios from 'axios';
import ResultsHouseblock from "./ResultsHouseblock";

class ResultsHouseblockContainer extends Component {
  componentWillMount () {
    //this.getList();
  }

  async getList () {
    try {
      const response = await axios.get('/api/houseblocklist', {
        headers: {
          'Sort-Fields': 'cellLocation',
          'Sort-Order': 'ASC',
        },
        params: {
          agencyId: this.props.agencyId,
          locationId: this.props.location,
          //date: this.props.date, // later; today only for now
          timeSlot: this.props.timeSlot
        } });
      this.props.houseblockDataDispatch(response.data);
    } catch (error) {
      this.props.displayError(error);
    }
  }

  handleLocationChange (event) {
    this.props.locationDispatch(event.target.value);
  }

  render () {
    return (<div><Error {...this.props} />
      <ResultsHouseblock
        handleLocationChange={(event) => this.handleLocationChange(event)}
        handleActivityChange={(event) => this.handleActivityChange(event)}
        handleDateChange={(event) => this.handleDateChange(event)}
        handlePeriodChange={(event) => this.handlePeriodChange(event)}
        handleSearch={(history) => this.handleSearch(history)} {...this.props}/>
    </div>);
  }
}

ResultsHouseblockContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locationDispatch: PropTypes.func
};

const mapStateToProps = state => {
  return {
    location: state.search.location,
    activity: state.search.activity
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // locationDispatch: text => dispatch(setSearchLocation(text)),
    // periodDispatch: text => dispatch(setSearchPeriod(text))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer);

