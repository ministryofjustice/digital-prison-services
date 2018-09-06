import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { setSearchLocation, setSearchLocations } from '../redux/actions/index';
import { connect } from 'react-redux';
import Error from '../Error';
import Search from "./Search";
import axios from "axios/index";
import { setSearchActivity, resetValidationErrors, setValidationError } from "../redux/actions";
import { defaultPeriod } from "../redux/reducers";

class SearchContainer extends Component {
  constructor () {
    super();
    this.onActivityChange = this.onActivityChange.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.validate = this.validate.bind(this);
    this.onSearch = this.onSearch.bind(this);
  }

  componentWillMount () {
    this.getLocations();
    const today = 'Today';
    this.props.dateDispatch(today);
    const currentPeriod = defaultPeriod(moment());
    this.props.periodDispatch(currentPeriod);
    this.props.getActivityLocations(today, currentPeriod);
  }

  async getLocations () {
    try {
      const response = await axios.get('/api/houseblockLocations', {
        params: {
          agencyId: this.props.agencyId
        } });
      this.props.locationsDispatch(response.data);
    } catch (error) {
      this.props.handleError(error);
    }
  }

  onActivityChange (event) {
    const value = event.target.value;
    if (value !== '--') {
      this.props.locationDispatch('--');
    }
    this.props.activityDispatch(value);
  }

  onLocationChange (event) {
    const value = event.target.value;
    if (value !== '--') {
      this.props.activityDispatch('--');
    }
    this.props.locationDispatch(value);
  }

  onSearch (history) {
    if (!this.validate()) {
      return;
    }
    this.props.handleSearch(history);
  }

  validate () {
    if (this.props.activity === "--" && this.props.location === "--") {
      this.props.setValidationErrorDispatch("searchForm", "Please select location or activity");
      return false;
    }
    this.props.resetValidationErrorsDispatch();
    return true;
  }

  render () {
    if (this.props.error) {
      return <Error {...this.props} />;
    }
    return (<Search
      onSearch={this.onSearch}
      onLocationChange={this.onLocationChange}
      onActivityChange={this.onActivityChange}
      {...this.props}/>);
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
  handleSearch: PropTypes.func,
  activities: PropTypes.array,
  locations: PropTypes.array,
  activity: PropTypes.string,
  location: PropTypes.string,
  setValidationErrorDispatch: PropTypes.func,
  resetValidationErrorsDispatch: PropTypes.func,
  getActivityLocations: PropTypes.func,
  validationErrors: PropTypes.object
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations.map(l => l.name),
    activities: state.search.activities,
    activity: state.search.activity,
    location: state.search.location,
    loaded: state.app.loaded,
    validationErrors: state.app.validationErrors
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationsDispatch: locations => dispatch(setSearchLocations(locations)),
    locationDispatch: text => dispatch(setSearchLocation(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    setValidationErrorDispatch: (fieldName, message) => dispatch(setValidationError(fieldName, message)),
    resetValidationErrorsDispatch: message => dispatch(resetValidationErrors())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
