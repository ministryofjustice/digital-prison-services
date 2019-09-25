import React, { Component } from 'react'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import InputField from '@govuk-react/input-field'
import Button from '@govuk-react/button'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import '../govStyles/govuk_frontend/all.scss'
import PropTypes from 'prop-types'
import ReactRouterPropTypes from 'react-router-prop-types'
import { linkOnClick } from '../utils'
import DateOfBirthInput from '../DateOfBirthInput/DateOfBirthInput'
import { SearchContainer, SearchInput, StyledSelect } from './GlobalSearchForm.styles'

class GlobalSearchForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showFilters: false,
      // clearFilterCount is used as the value of the 'key' prop on the DateOfBirthInput component. When the 'Clear Filters'
      // link is clicked clearFilterCount is incremented by the 'clearFiltersInternal' function and a new DateOfBirthInput
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
      searchPerformed,
      handleSearch,
      history,
      genderFilter,
      locationFilter,
      handleSearchGenderFilterChange,
      handleSearchLocationFilterChange,
      handleDateOfBirthChange,
      showErrors,
    } = this.props

    const buttonText = searchPerformed ? 'Search again' : 'Search'

    const toggleDetails = (event, clear) => {
      event.preventDefault()
      const { showFilters } = this.state
      event.preventDefault()
      this.setState(state => ({ showFilters: !state.showFilters }))
      if (showFilters) {
        clear()
      }
    }

    const { showFilters, clearFilterCount } = this.state
    return (
      <form onSubmit={event => handleSearch(event, history)}>
        <GridRow>
          <GridCol setWidth="one-half">
            <SearchContainer>
              <SearchInput>
                <InputField
                  input={{
                    id: 'search-text',
                    name: 'searchText',
                    value: searchText,
                    onChange: handleSearchTextChange,
                  }}
                >
                  Enter prisoner name or ID
                </InputField>
              </SearchInput>
              <Button type="submit" id="search-again" mb={1}>
                {buttonText}
              </Button>
            </SearchContainer>
          </GridCol>
        </GridRow>

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
            <GridRow>
              <GridCol setWidth="one-half">
                <StyledSelect
                  label="Location status of prisoner"
                  mb={6}
                  input={{
                    id: 'location-select',
                    name: 'location-select',
                    value: locationFilter,
                    onChange: handleSearchLocationFilterChange,
                  }}
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
                </StyledSelect>

                <StyledSelect
                  label="Prisoner gender"
                  mb={6}
                  input={{
                    id: 'gender-select',
                    name: 'gender-select',
                    value: genderFilter,
                    onChange: handleSearchGenderFilterChange,
                  }}
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
                </StyledSelect>
              </GridCol>
            </GridRow>

            <DateOfBirthInput
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
      </form>
    )
  }
}

GlobalSearchForm.propTypes = {
  // props
  handleSearch: PropTypes.func.isRequired,
  handleSearchTextChange: PropTypes.func.isRequired,
  handleSearchGenderFilterChange: PropTypes.func.isRequired,
  handleSearchLocationFilterChange: PropTypes.func.isRequired,
  handleDateOfBirthChange: PropTypes.func.isRequired,
  showErrors: PropTypes.func.isRequired,
  clearFilters: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  locationFilter: PropTypes.string.isRequired,
  genderFilter: PropTypes.string.isRequired,
  searchPerformed: PropTypes.bool.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default GlobalSearchForm
