import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setSearchLocations } from '../redux/actions/index';
import { connect } from 'react-redux';
import Error from '../Error';
import Search from "./Search";
import axios from "axios/index";
import { setSearchActivities, setSearchActivity } from "../redux/actions";

class SearchContainer extends Component {
  componentWillMount () {
    this.getLocations();
    this.getActivityLocations();
  }

  async getLocations () {
    try {
      const response = await axios.get('/api/houseblockLocations', {
        params: {
          agencyId: this.props.agencyId
        } });
      this.props.locationsDispatch(response.data);
      // Use the first location by default
      if (response.data && response.data[0]) {
        this.props.locationDispatch(response.data[0]);
      }
    } catch (error) {
      this.props.handleError(error);
    }
  }

  async getActivityLocations () {
    try {
      const response = await axios.get('/api/activityLocations', {
        params: {
          agencyId: this.props.agencyId
        } });
      this.props.activitiesDispatch(response.data);
      // Use the first location by default
      if (response.data && response.data[0]) {
        this.props.activityDispatch(response.data[0].locationPrefix);
      }
    } catch (error) {
      this.props.handleError(error);
    }
  }


  handleActivityChange (event) {
    this.props.activityDispatch(event.target.value);
  }

  render () {
    if (this.props.error) {
      return <Error {...this.props} />;
    }
    return (<Search handleActivityChange={(event) => this.handleActivityChange(event)} {...this.props}/>);
  }
}

SearchContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locationDispatch: PropTypes.func,
  locationsDispatch: PropTypes.func,
  activitiesDispatch: PropTypes.func,
  activityDispatch: PropTypes.func,
  dateDispatch: PropTypes.func,
  periodDispatch: PropTypes.func,
  handleError: PropTypes.func,
  activities: PropTypes.array,
  locations: PropTypes.array,
  activity: PropTypes.string
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations,
    activities: state.search.activities,
    activity: state.search.activity
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationsDispatch: text => dispatch(setSearchLocations(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    activitiesDispatch: text => dispatch(setSearchActivities(text))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
