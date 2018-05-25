import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Error from '../Error';
import ResultsHouseblock from "./ResultsHouseblock";

class ResultsHouseblockContainer extends Component {
  componentWillMount () {
  //    this.props.getHouseblockLocations();
    this.props.getHouseblockList();
  }

  render () {
    return (<div><Error {...this.props} />
      <ResultsHouseblock {...this.props}/>
    </div>);
  }
}

ResultsHouseblockContainer.propTypes = {
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  currentLocation: PropTypes.string.isRequired,
  getHouseblockList: PropTypes.func,
  houseblockDataDispatch: PropTypes.func
};

const mapStateToProps = state => {
  return {
    houseblockData: state.houseblock.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ResultsHouseblockContainer);
