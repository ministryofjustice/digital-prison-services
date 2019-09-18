import React from 'react'
import PropTypes from 'prop-types'
import { mount } from 'enzyme'
import SortableDataSource from './SortableDataSource'

import { LAST_NAME } from './sortColumns'
import { ASC, DESC } from './sortOrder'
import { lastNameComparator } from './comparatorComposition'
import SortableColumn from './SortableColumn'

const ExampleComponent = ({ rows, sortOrder, setColumnSort }) => (
  <>
    <SortableColumn
      heading="Name"
      column={LAST_NAME}
      sortOrder={sortOrder}
      setColumnSort={setColumnSort}
      sortColumn={LAST_NAME}
    />
    {rows.map(row => (
      <div className="row" key={row.offenderNo}>
        <span> {row.firstName}</span>
        <span>{row.lastName}</span>
      </div>
    ))}
  </>
)
ExampleComponent.defaultProps = {
  rows: [],
  sortOrder: '',
  setColumnSort: () => {},
}
ExampleComponent.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object),
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
}

describe('Sortable Data Source', () => {
  const rows = [
    { offenderNo: 1, firstName: 'Lu', lastName: 'L' },
    { offenderNo: 2, firstName: 'Andrew', lastName: 'A' },
  ]

  it('should inject the correct props', () => {
    const wrapper = mount(
      <SortableDataSource sortOrder={ASC} rows={rows} comparator={lastNameComparator} agencyId="LEI">
        <ExampleComponent />
      </SortableDataSource>
    )

    const props = wrapper.children().props()

    expect(props.rows).toBe(rows)
    expect(props.sortOrder).toBe(ASC)
    expect(props.agencyId).toBe('LEI')
    expect(typeof props.setColumnSort).toBe('function')
  })

  it('should sort asc by default', () => {
    const wrapper = mount(
      <SortableDataSource sortOrder={ASC} rows={rows} comparator={lastNameComparator}>
        <ExampleComponent />
      </SortableDataSource>
    )
    expect(wrapper.children().props().rows[0].firstName).toBe('Andrew')
  })

  it('should sort desc by default', () => {
    const wrapper = mount(
      <SortableDataSource sortOrder={DESC} rows={rows} comparator={lastNameComparator}>
        <ExampleComponent />
      </SortableDataSource>
    )
    expect(wrapper.children().props().rows[0].firstName).toBe('Lu')
  })
  it('should change sort order', () => {
    const wrapper = mount(
      <SortableDataSource sortOrder={ASC} rows={rows} comparator={lastNameComparator}>
        <ExampleComponent />
      </SortableDataSource>
    )

    expect(wrapper.children().props().rows[0].firstName).toBe('Andrew')

    wrapper.find('#Name-sort-asc').simulate('click')

    expect(wrapper.children().props().rows[0].firstName).toBe('Lu')
  })
})
