import React from 'react'
import { shallow } from 'enzyme'
import GlobalSearchForm from './GlobalSearchForm'

const mockHistory = {
  push: jest.fn(),
  action: 'PUSH',
  block: jest.fn(),
  createHref: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  listen: jest.fn(),
  location: { hash: '', pathname: '', search: '' },
  replace: jest.fn(),
}

describe('Global search container', () => {
  it('should render button label when no search has been performed', async () => {
    const component = shallow(
      <GlobalSearchForm
        handleSearch={() => {}}
        handleSearchTextChange={() => {}}
        handleSearchGenderFilterChange={() => {}}
        handleSearchLocationFilterChange={() => {}}
        clearFilters={() => {}}
        searchText=""
        locationFilter="loc"
        genderFilter="m"
        history={mockHistory}
        searchPerformed={false}
      />
    )
    expect(component.find('#search-again').text()).toEqual('Search')
  })

  it('should render button label for search performed', async () => {
    const component = shallow(
      <GlobalSearchForm
        handleSearch={() => {}}
        handleSearchTextChange={() => {}}
        handleSearchGenderFilterChange={() => {}}
        handleSearchLocationFilterChange={() => {}}
        clearFilters={() => {}}
        searchText="Smith"
        locationFilter="loc"
        genderFilter="m"
        history={mockHistory}
        searchPerformed
      />
    )
    expect(component.find('#search-again').text()).toEqual('Search again')
  })
})
