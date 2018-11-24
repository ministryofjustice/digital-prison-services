import React from 'react'
import * as PropTypes from 'prop-types'
import { linkOnClick } from '../helpers'

const SortableColumn = props => {
  const { heading, field, sortOrder, setColumnSort, orderField } = props
  let triangleImage = ''

  if (sortOrder === 'ASC') {
    triangleImage = (
      <span
        className="sortableLink"
        id={`${heading}-sort-asc`}
        {...linkOnClick(() => {
          setColumnSort(field, 'DESC')
        })}
      >
        <img src="/images/Triangle_asc.png" height="8" width="15" alt="Up arrow" />
      </span>
    )
  } else if (sortOrder === 'DESC') {
    triangleImage = (
      <span
        className="sortableLink"
        id={`${heading}-sort-desc`}
        {...linkOnClick(() => {
          setColumnSort(field, 'ASC')
        })}
      >
        <img src="/images/Triangle_desc.png" height="8" width="15" alt="Down arrow" />
      </span>
    )
  }

  return orderField !== field ? (
    <span
      className="sortableLink"
      id={`${heading}-sortable-column`}
      {...linkOnClick(() => {
        setColumnSort(field, 'ASC')
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
  field: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  setColumnSort: PropTypes.func.isRequired,
  orderField: PropTypes.string.isRequired,
}

export default SortableColumn
