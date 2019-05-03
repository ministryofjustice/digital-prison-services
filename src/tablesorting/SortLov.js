import React from 'react'
import PropTypes from 'prop-types'
import { ASC, DESC } from './sortOrder'
import { ACTIVITY, CELL_LOCATION, LAST_NAME } from './sortColumns'

const SORT_OPTIONS = {
  [LAST_NAME]: { [ASC]: 'Name (A-Z)', [DESC]: 'Name (Z-A)' },
  [CELL_LOCATION]: { [ASC]: 'Location (1-X)', [DESC]: 'Location (X-1)' },
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
  <div>
    <label className="form-label" htmlFor="sort-select">
      Order the list
    </label>
    <select
      id="sort-select"
      name="sort-select"
      className="form-control"
      onChange={invokeColumnSortWithEventData(setColumnSort)}
      value={keyOrValue(sortColumn, sortOrder)}
    >
      {sortOptions(sortColumns)}
    </select>
  </div>
)

SortLov.propTypes = {
  sortColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  // setColumnSort function parameters are (sortColumn, sortOrder),  from sortColumns.js sortOrder.js respectively.
  setColumnSort: PropTypes.func.isRequired,
}

export default SortLov
