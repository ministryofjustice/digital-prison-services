import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setSearchLocation, setSearchActivity, setSearchLocations, setSearchActivities, setSearchDate, setSearchPeriod } from '../redux/actions/index';
import { connect } from 'react-redux';
import Error from '../Error';
import Search from "./Search";
import axios from 'axios';

class SearchContainer extends Component {
  componentWillMount () {
    this.getLocations();
  }

  async getLocations () {
    try {
      const response = await axios.get('/api/locations', {
        params: {
          agencyId: this.props.agencyId
        } });
      this.props.locationsDispatch(response.data);
      // Use the first location by default
      if (response.data && response.data[0]) {
        this.props.locationDispatch(response.data[0].locationPrefix);
      }
    } catch (error) {
      this.props.displayError(error);
    }
  }


  handleLocationChange (event) {
    this.props.locationDispatch(event.target.value);
  }

  handleActivityChange (event) {
    this.props.activityDispatch(event.target.value);
  }

  handleDateChange (event) {
    this.props.dateDispatch(event.target.value);
  }

  handlePeriodChange (event) {
    this.props.periodDispatch(event.target.value);
  }

  handleSearch (history) {
    history.push('/whereabouts/list');
  }

  render () {
    if (this.props.error) {
      return <Error {...this.props} />;
    }
    return (<Search
      handleLocationChange={(event) => this.handleLocationChange(event)}
      handleActivityChange={(event) => this.handleActivityChange(event)}
      handleDateChange={(event) => this.handleDateChange(event)}
      handlePeriodChange={(event) => this.handlePeriodChange(event)}
      handleSearch={(history) => this.handleSearch(history)} {...this.props}/>);
  }
}

SearchContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locationDispatch: PropTypes.func,
  activityDispatch: PropTypes.func,
  dateDispatch: PropTypes.func,
  periodDispatch: PropTypes.func
};

const mapStateToProps = state => {
  return {
    location: state.search.location,
    locations: state.search.locations,
    activity: state.search.activity,
    activities: state.search.activities,
    date: state.search.date,
    period: state.search.period,
    agencyId: state.app.user.activeCaseLoadId
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationDispatch: text => dispatch(setSearchLocation(text)),
    locationsDispatch: text => dispatch(setSearchLocations(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    activitiesDispatch: text => dispatch(setSearchActivities(text)),
    dateDispatch: text => dispatch(setSearchDate(text)),
    periodDispatch: text => dispatch(setSearchPeriod(text))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);

