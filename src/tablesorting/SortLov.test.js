import React from 'react'
import { shallow, mount } from 'enzyme'
import SortLov from './SortLov'
import { LAST_NAME, CELL_LOCATION, ACTIVITY } from './sortColumns'
import { ASC, DESC } from './sortOrder'

describe('SortLov', () => {
  let setColumnSort

  beforeEach(() => {
    setColumnSort = jest.fn()
  })

  afterEach(() => {
    setColumnSort.mockReset()
  })

  it('renders', () => {
    shallow(<SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={ASC} setColumnSort={setColumnSort} />)
  })

  it('renders two options', () => {
    const component = shallow(
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={ASC} setColumnSort={setColumnSort} />
    )
    expect(component.find('option')).toHaveLength(2)
  })

  it('renders two lastName options', () => {
    const component = shallow(
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={ASC} setColumnSort={setColumnSort} />
    )
    expect(
      component.contains(
        <option key="lastName_ASC" value="lastName_ASC">
          Name (A-Z)
        </option>
      )
    ).toEqual(true)

    expect(
      component.contains(
        <option key="lastName_DESC" value="lastName_DESC">
          Name (Z-A)
        </option>
      )
    ).toEqual(true)
  })

  it('renders two cellLocation options', () => {
    const component = shallow(
      <SortLov sortColumns={[CELL_LOCATION]} sortColumn={CELL_LOCATION} sortOrder={ASC} setColumnSort={setColumnSort} />
    )
    expect(
      component.contains(
        <option key="cellLocation_ASC" value="cellLocation_ASC">
          Location (ascending)
        </option>
      )
    ).toEqual(true)

    expect(
      component.contains(
        <option key="cellLocation_DESC" value="cellLocation_DESC">
          Location (descending)
        </option>
      )
    ).toEqual(true)
  })

  it('renders multiple options', () => {
    const component = shallow(
      <SortLov
        sortColumns={[LAST_NAME, CELL_LOCATION, ACTIVITY]}
        sortColumn={ACTIVITY}
        sortOrder={ASC}
        setColumnSort={setColumnSort}
      />
    )
    expect(component.find('option')).toHaveLength(6)
  })

  it('renders with the initial option selected', () => {
    const component = mount(
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={ASC} setColumnSort={setColumnSort} />
    )
    expect(
      component
        .find('select')
        .first()
        .props().value
    ).toEqual('lastName_ASC')
  })

  it('passes new selection values to the serColumnSort function when the selection changes', () => {
    const wrapper = mount(
      <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={ASC} setColumnSort={setColumnSort} />
    )
    wrapper
      .find('option')
      .at(1)
      .simulate('change', {})
    expect(setColumnSort).toHaveBeenCalledWith(LAST_NAME, DESC)
  })
})
