import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { setSearchLocations } from '../redux/actions/index';
import { connect } from 'react-redux';
import Error from '../Error';
import Search from "./Search";
import axios from "axios/index";

class SearchContainer extends Component {
  componentWillMount () {
    this.getLocations();
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
      this.handleError(error);
    }
  }

  render () {
    if (this.props.error) {
      return <Error {...this.props} />;
    }
    return (<Search {...this.props}/>);
  }
}

SearchContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  locationDispatch: PropTypes.func,
  locationsDispatch: PropTypes.func,
  activityDispatch: PropTypes.func,
  dateDispatch: PropTypes.func,
  periodDispatch: PropTypes.func,
  handleError: PropTypes.func
};

const mapStateToProps = state => {
  return {
    locations: state.search.locations
  };
};

const mapDispatchToProps = dispatch => {
  return {
    locationsDispatch: text => dispatch(setSearchLocations(text))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer);
