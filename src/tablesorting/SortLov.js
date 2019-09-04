import React from 'react'
import PropTypes from 'prop-types'
import Select from '@govuk-react/select'
import styled from 'styled-components'
import { ASC, DESC } from './sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from './sortColumns'

export const FullWidthSelect = styled(Select)`
  select {
    width: 100%;
  }

  @media print {
    display: none;
  }
`

const SORT_OPTIONS = {
  [LAST_NAME]: { [ASC]: 'Name (A-Z)', [DESC]: 'Name (Z-A)' },
  [CELL_LOCATION]: { [ASC]: 'Location (ascending)', [DESC]: 'Location (descending)' },
  [ACTIVITY]: { [ASC]: 'Activity name (A-Z)', [DESC]: 'Activity name (Z-A)' },
}

const keyOrValue = (sortColumn, sortOrder) => `${sortColumn}_${sortOrder}`

const columnSortOption = (sortColumn, sortOrder) => {
  const kv = keyOrValue(sortColumn, sortOrder)
  return (
    <option key={kv} value={kv}>
      {SORT_OPTIONS[sortColumn][sortOrder]}
    </option>
  )
}

const columnSortOptions = sortColumn => (
  <React.Fragment key={sortColumn}>
    {columnSortOption(sortColumn, ASC)}
    {columnSortOption(sortColumn, DESC)}
  </React.Fragment>
)

const sortOptions = sortColumns => sortColumns.map(sc => columnSortOptions(sc))

const invokeColumnSortWithEventData = setColumnSort => event => {
  event.preventDefault()
  const [field, order] = event.target.value.split('_')
  setColumnSort(field, order)
}

const SortLov = ({ sortColumns, sortColumn, sortOrder, setColumnSort }) => (
  <FullWidthSelect
    name="sort-select"
    label="Order the list"
    input={{
      id: 'sort-select',
      value: keyOrValue(sortColumn, sortOrder),
      onChange: invokeColumnSortWithEventData(setColumnSort),
    }}
    mb={6}
  >
    {sortOptions(sortColumns)}
  </FullWidthSelect>
)

SortLov.propTypes = {
  sortColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  // setColumnSort function parameters are (sortColumn, sortOrder),  from sortColumns.js sortOrder.js respectively.
  setColumnSort: PropTypes.func.isRequired,
}

export default SortLov
