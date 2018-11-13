import React from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'

const GlobalSearchForm = ({ searchText, handleSearchTextChange, handleSearch, history }) => (
  <div>
    <div className="pure-u-md-11-12 searchForm padding-top padding-bottom-large padding-left-30">
      <label className="form-label" htmlFor="search-text">
        Enter prisoner name or ID
      </label>
      <input
        type="text"
        className="width40 form-control"
        id="search-text"
        name="searchText"
        value={searchText}
        onChange={handleSearchTextChange}
      />
      <button
        type="button"
        id="search-again"
        className="button margin-left margin-top-large"
        onClick={() => {
          handleSearch(history)
        }}
      >
        Search again
      </button>
    </div>
  </div>
)

GlobalSearchForm.propTypes = {
  // props
  handleSearch: PropTypes.func.isRequired,
  handleSearchTextChange: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default GlobalSearchForm
