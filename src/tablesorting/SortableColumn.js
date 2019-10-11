import React from 'react'
import * as PropTypes from 'prop-types'
import { linkOnClick } from '../helpers'
import { ASC, DESC } from './sortOrder'

const SortableColumn = props => {
  const { heading, column, sortOrder, setColumnSort, sortColumn } = props
  let triangleImage = ''

  if (sortOrder === ASC) {
    triangleImage = (
      <span
        className="sortableLink"
        id={`${heading}-sort-asc`}
        {...linkOnClick(() => {
          setColumnSort(column, DESC)
        })}
      >
        <img src="/images/Triangle_asc.png" height="8" width="15" alt="Up arrow" />
      </span>
    )
  } else if (sortOrder === DESC) {
    triangleImage = (
      <span
        className="sortableLink"
        id={`${heading}-sort-desc`}
        {...linkOnClick(() => {
          setColumnSort(column, ASC)
        })}
      >
        <img src="/images/Triangle_desc.png" height="8" width="15" alt="Down arrow" />
      </span>
    )
  }

  return sortColumn !== column ? (
    <span
      className="sortableLink"
      id={`${heading}-sortable-column`}
      {...linkOnClick(() => {
        setColumnSort(column, ASC)
      })}
    >
      {heading}
    </span>
  ) : (
    <div>
      {heading} {triangleImage}
    </div>
  )
}

SortableColumn.propTypes = {
  heading: PropTypes.string.isRequired,
  column: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  sortColumn: PropTypes.string.isRequired,
}

export default SortableColumn
