import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';
import axios from "axios/index";
import { setSearchLocation, setSearchLocations } from '../redux/actions/index';
import Error from '../Error';
import Search from "./Search";
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
    const { dateDispatch, periodDispatch, getActivityLocations } = this.props;
    this.getLocations();
    const today = 'Today';
    dateDispatch(today);
    const currentPeriod = defaultPeriod(moment());
    periodDispatch(currentPeriod);
    getActivityLocations(today, currentPeriod);
  }

  onActivityChange (event) {
    const { target: { value } } = event
    const { locationDispatch, activityDispatch } = this.props;

    if (value !== '--') locationDispatch('--');

    activityDispatch(event.target.value);
  }

  onLocationChange (event) {
    const { target: { value } } = event
    const { locationDispatch, activityDispatch } = this.props;

    if (value !== '--') activityDispatch('--');

    locationDispatch(event.target.value);
  }

  onSearch (history) {
    const { handleSearch } = this.props;

    if (!this.validate()) {
      return;
    }
    handleSearch(history);
  }

  async getLocations () {
    const { agencyId, locationsDispatch, handleError } = this.props;

    try {
      const response = await axios.get('/api/houseblockLocations', {
        params: {
          agencyId
        } });
      locationsDispatch(response.data);
    } catch (error) {
      handleError(error);
    }
  }

  validate () {
    const { activity, location, setValidationErrorDispatch, resetValidationErrorsDispatch } = this.props;

    if (activity === "--" && location === "--") {
      setValidationErrorDispatch("searchForm", "Please select location or activity");
      return false;
    }
    resetValidationErrorsDispatch();
    return true;
  }

  render () {
    const { error } = this.props;

    if (error) {
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

const mapStateToProps = state => ({
    locations: state.search.locations.map(l => l.name),
    activities: state.search.activities,
    activity: state.search.activity,
    location: state.search.location,
    loaded: state.app.loaded,
    validationErrors: state.app.validationErrors
  });

const mapDispatchToProps = dispatch => ({
    locationsDispatch: locations => dispatch(setSearchLocations(locations)),
    locationDispatch: text => dispatch(setSearchLocation(text)),
    activityDispatch: text => dispatch(setSearchActivity(text)),
    setValidationErrorDispatch: (fieldName, message) => dispatch(setValidationError(fieldName, message)),
    resetValidationErrorsDispatch: () => dispatch(resetValidationErrors())
  });

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
