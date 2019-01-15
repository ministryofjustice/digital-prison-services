import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { DESC } from './sortOrder'

class SortableDataSource extends Component {
  constructor(props) {
    super(props)
    const { rows, sortOrder } = props
    this.state = {
      sortOrder,
      rows,
    }
    this.setColumnSort = this.setColumnSort.bind(this)
    this.sortOffenders = this.sortOffenders.bind(this)
  }

  setColumnSort(sortColumn, sortOrder) {
    this.setState(currentState => {
      const copy = currentState.rows.slice()

      return { sortOrder, rows: this.sortOffenders(copy, sortOrder) }
    })
  }

  sortOffenders(offenders, sortOrder) {
    const { comparator } = this.props

    offenders.sort(comparator)

    if (sortOrder === DESC) {
      offenders.reverse()
    }
    return offenders
  }

  render() {
    const { rows, sortOrder } = this.state
    const { children } = this.props

    const cloneWithProps = child =>
      React.cloneElement(child, {
        ...this.props,
        rows: this.sortOffenders(rows, sortOrder),
        sortOrder,
        setColumnSort: this.setColumnSort,
      })

    if (children.length) return children.map(child => cloneWithProps(child))

    return cloneWithProps(children)
  }
}

SortableDataSource.propTypes = {
  sortOrder: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object).isRequired, PropTypes.object.isRequired])
    .isRequired,
  comparator: PropTypes.func.isRequired,
}

export default SortableDataSource
