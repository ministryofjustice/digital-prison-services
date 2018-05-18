import React, { Component } from 'react';
import '../index.scss';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class Search extends Component {
  render () {
    return (
      <div>
        <div className="pure-u-md-12-12 searchForm">
          <div className="padding-top padding-left padding-right padding-bottom-large">
            <label className="form-label" htmlFor="seachText">Manage offender whereabouts</label>

            <button className="button margin-left" onClick={() => { this.props.handleSearch(this.props.history);}}>Continue</button>
          </div>
        </div>
      </div>
    );
  }
}
Search.propTypes = {
  history: PropTypes.object,
  handleSearch: PropTypes.func.isRequired,
  handleSearchTextChange: PropTypes.func.isRequired
};

const SearchWithRouter = withRouter(Search);

export { Search };
export default SearchWithRouter;
