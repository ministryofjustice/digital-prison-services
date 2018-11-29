import React, { Component, Fragment } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import '../govStyles/govuk_frontend/all.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { linkOnClick } from '../utils'

class GlobalSearchForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showFilters: false,
    }
  }

  render() {
    const {
      handleSearchTextChange,
      searchText,
      handleSearch,
      history,
      genderFilter,
      locationFilter,
      handleSearchGenderFilterChange,
      handleSearchLocationFilterChange,
      clearFilters,
    } = this.props

    const toggleDetails = (event, clear) => {
      event.preventDefault()
      const { showFilters } = this.state
      this.setState({
        showFilters: !showFilters,
      })
      if (showFilters) {
        clear()
      }
    }

    const locationSelect = (
      <Fragment>
        <label className="form-label bold" htmlFor="location-select">
          Location status of prisoner
        </label>

        <select
          id="location-select"
          name="location-select"
          className="form-control width40"
          value={locationFilter}
          onChange={handleSearchLocationFilterChange}
        >
          <option key="ALL" value="ALL">
            All
          </option>
          <option key="IN" value="IN">
            Inside
          </option>
          <option key="EVENING" value="OUT">
            Outside
          </option>
        </select>
      </Fragment>
    )

    const genderSelect = (
      <Fragment>
        <label className="form-label bold" htmlFor="gender-select">
          Prisoner gender
        </label>

        <select
          id="gender-select"
          name="gender-select"
          className="form-control width40"
          value={genderFilter}
          onChange={handleSearchGenderFilterChange}
        >
          <option key="ALL" value="ALL">
            All
          </option>
          <option key="FEMALE" value="F">
            Female
          </option>
          <option key="MALE" value="M">
            Male
          </option>
          <option key="NOT_KNOWN" value="NK">
            Not known
          </option>
          <option key="NOT_SPECIFIED" value="NS">
            Not specified
          </option>
        </select>
      </Fragment>
    )

    const { showFilters } = this.state
    return (
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
            className="button margin-left"
            onClick={() => {
              handleSearch(history)
            }}
          >
            Search again
          </button>
        </div>
        <details className="govuk-details visible" open={showFilters}>
          <summary
            className="govuk-details__summary"
            onClick={event => toggleDetails(event, clearFilters)}
            onKeyDown={() => {}}
            tabIndex="0"
            role="switch"
            aria-checked={showFilters}
          >
            <span className="govuk-details__summary-text">{showFilters ? 'Hide filters' : 'Show filters'}</span>
          </summary>
          <div className="govuk-details__text">
            <div className="pure-u-md-1-4 padding-top padding-bottom-large">{locationSelect}</div>
            <div className="pure-u-md-1-4 padding-top padding-bottom-large padding-left">{genderSelect}</div>
            <div>
              <a className="clear-filters link clickable" {...linkOnClick(clearFilters)}>
                Clear filters
              </a>
            </div>
          </div>
        </details>
      </div>
    )
  }
}

GlobalSearchForm.propTypes = {
  // props
  handleSearch: PropTypes.func.isRequired,
  handleSearchTextChange: PropTypes.func.isRequired,
  handleSearchGenderFilterChange: PropTypes.func.isRequired,
  handleSearchLocationFilterChange: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  locationFilter: PropTypes.string.isRequired,
  genderFilter: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default GlobalSearchForm
