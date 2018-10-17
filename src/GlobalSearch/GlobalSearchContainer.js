import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import queryString from 'query-string';
import Error from '../Error';
import Spinner from '../Spinner';
import GlobalSearch from './GlobalSearch';
import {
  setGlobalSearchResults,
  setGlobalSearchPageNumber,
  setGlobalSearchTotalRecords
} from '../redux/actions';

const axios = require('axios');

class GlobalSearchContainer extends Component {
  constructor (props) {
    super(props);
    this.doGlobalSearch = this.doGlobalSearch.bind(this);
    this.handlePageAction = this.handlePageAction.bind(this);
  }

  async componentWillMount () {
    this.props.setLoadedDispatch(false);
    try {
      await this.doGlobalSearch(0);
    } catch (error) {
      this.props.handleError(error);
    }
    this.props.setLoadedDispatch(true);
  }

  async doGlobalSearch (pageNumber) {
    const values = queryString.parse(this.props.location.search);
    const response = await axios.get('/api/globalSearch', {
      params: {
        searchText: values.searchText
      },
      headers: {
        'Page-Offset': this.props.pageSize * pageNumber,
        'Page-Limit': this.props.pageSize
      }
    });
    this.props.totalRecordsDispatch(parseInt(response.headers['total-records'], 10));
    this.props.dataDispatch(response.data);
    this.props.pageNumberDispatch(pageNumber);
    this.props.raiseAnalyticsEvent({
      category: 'Global search',
      action: "search page ${pageNumber} shown"
    });
  }

  async handlePageAction (pageNumber) {
    try {
      await this.doGlobalSearch(pageNumber);
    } catch (error) {
      this.props.handleError(error);
    }
  }

  render () {
    if (!this.props.loaded) {
      return <Spinner/>;
    }
    return (<div><Error {...this.props} />
      <GlobalSearch handlePageAction={this.handlePageAction} {...this.props}/>
    </div>);
  }
}

GlobalSearchContainer.propTypes = {
  history: PropTypes.object,
  // match: PropTypes.object,
  error: PropTypes.string,
  agencyId: PropTypes.string.isRequired,
  location: PropTypes.object,
  dataDispatch: PropTypes.func,
  totalRecordsDispatch: PropTypes.func,
  pageNumberDispatch: PropTypes.func,
  handleError: PropTypes.func,
  pageSize: PropTypes.number,
  loaded: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    loaded: state.app.loaded,
    data: state.globalSearch.data,
    pageNumber: state.globalSearch.pageNumber,
    pageSize: state.globalSearch.pageSize,
    totalRecords: state.globalSearch.totalRecords
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dataDispatch: data => dispatch(setGlobalSearchResults(data)),
    pageNumberDispatch: no => dispatch(setGlobalSearchPageNumber(no)),
    totalRecordsDispatch: no => dispatch(setGlobalSearchTotalRecords(no))
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GlobalSearchContainer));
