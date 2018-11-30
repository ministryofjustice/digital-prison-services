import React, { Component, Fragment } from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import '../govStyles/govuk_frontend/all.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { linkOnClick } from '../utils'
import DateOfBirth from './DateOfBirth'

class GlobalSearchForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showFilters: false,
      // clearFilterCount is used as the value of the 'key' prop on the DateOfBirth component. When the 'Clear Filters'
      // link is clicked clearFilterCount is incremented by the 'clearFiltersInternal' function and a new DateOfBirth
      // instance is created by react.  The effect is to clear the component's fields and publish its initial state.
      // Follows a pattern from
      // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key
      clearFilterCount: 0,
    }
    this.clearFiltersInternal = this.clearFiltersInternal.bind(this)
  }

  clearFiltersInternal() {
    const { clearFilters } = this.props
    this.setState(state => ({ clearFilterCount: state.clearFilterCount + 1 }))
    clearFilters()
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
      handleDateOfBirthChange,
      showErrors,
    } = this.props

    const toggleDetails = (event, clear) => {
      event.preventDefault()
      const { showFilters } = this.state
      event.preventDefault()
      this.setState(state => ({ showFilters: !state.showFilters }))
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
          <option key="MALE" value="M">
            Male
          </option>
          <option key="FEMALE" value="F">
            Female
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

    const { showFilters, clearFilterCount } = this.state
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
            onClick={event => toggleDetails(event, this.clearFiltersInternal)}
            onKeyDown={() => {}}
            tabIndex="0"
            role="switch"
            aria-checked={showFilters}
          >
            <span id="showFiltersLink" className="govuk-details__summary-text">
              {showFilters ? 'Hide filters' : 'Show filters'}
            </span>
          </summary>
          <div className="govuk-details__text">
            <div className="pure-u-md-1-4 padding-top padding-bottom-large">{locationSelect}</div>
            <div className="pure-u-md-1-4 padding-top padding-bottom-large padding-left">{genderSelect}</div>
            <DateOfBirth
              handleDateOfBirthChange={handleDateOfBirthChange}
              key={clearFilterCount}
              showErrors={showErrors}
            />
            <div>
              <a id="clearFilters" className="clear-filters link clickable" {...linkOnClick(this.clearFiltersInternal)}>
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
