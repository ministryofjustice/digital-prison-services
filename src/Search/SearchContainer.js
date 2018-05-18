import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setSearchLocation, setSearchActivity, setSearchDate, setSearchPeriod, resetError } from '../../redux/actions/index';
import { connect } from 'react-redux';
import Error from '../../Error';

import Search from "../components/Search";

class SearchContainer extends Component {

  componentWillMount () {
    this.getLocations();
  }

  async getLocations () {  //HERE
    try {
      const response = await axiosWrapper.get('/api/userLocations');
      this.props.offenderSearchLocationsDispatch(response.data);
      // Use the first location by default
      if (this.props.initialSearch && response.data && response.data[0]) {
        this.props.offenderSearchHousingLocationDispatch(response.data[0].locationPrefix);
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

  handleSearch (history) {
    history.push('/whereabouts/list');
  }

  render () {
    if (this.props.error) {
      return <Error {...this.props} />;
    }
    return (<KeyworkerSearchPage
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
    activity: state.search.activity,
    date: state.search.date,
    period: state.search.period,
    agencyId: state.app.user.activeCaseLoadId,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationDispatch: text => dispatch(setSearchLocation(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    dateDispatch: text => dispatch(setSearchDate(text)),
    periodDispatch: text => dispatch(setSearchPeriod(text)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);

