import React from 'react'
import { shallow } from 'enzyme'
import { GlobalSearchContainer } from './GlobalSearchContainer'

const mockLocation = {
  hash: 'h',
  key: 'k',
  pathname: 'pn',
  search: 's',
  state: 'st',
}

const standardProps = {
  handleError: () => {},
  raiseAnalyticsEvent: () => {},
  setLoadedDispatch: () => {},
  loaded: true,
  agencyId: 'aId',
  searchText: 's',
  genderFilter: 'gf',
  locationFilter: 'lf',
  dateOfBirthFilter: { blank: false, valid: true, isoDate: 'd' },
  data: [{ offenderNo: '1', lastName: 'ln', firstName: 'fn', dateOfBirth: 'dob', latestLocation: 'll' }],
  pageNumber: 1,
  pageSize: 1,
  totalRecords: 1,
  licencesUser: false,
  homeLink: 'http://home/',
  dataDispatch: () => {},
  pageNumberDispatch: () => {},
  totalRecordsDispatch: () => {},
  searchTextDispatch: () => {},
  genderFilterDispatch: () => {},
  locationFilterDispatch: () => {},
  titleDispatch: () => {},
  dateOfBirthDispatch: () => {},
  resetErrorDispatch: () => {},
  location: mockLocation,
}

describe('Global search container', () => {
  it('should pass Global search results as page title if there is a searchText', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)

    expect(component.find({ title: 'Global search results', homeLink: 'http://home/' })).toHaveLength(1)
  })

  it('should pass licenceUrl and whether a search has been performed to Global search', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)

    expect(component.find({ searchPerformed: true, licencesUrl: 'http://home/' })).toHaveLength(1)
  })

  it('should pass Global search as page title if there is no searchText', async () => {
    const noSearchTextProps = { ...standardProps, searchText: null }
    const component = shallow(<GlobalSearchContainer {...noSearchTextProps} />)

    expect(component.find({ title: 'Global search results', homeLink: 'http://home/' })).toHaveLength(0)
    expect(component.find({ title: 'Global search', homeLink: 'http://home/' })).toHaveLength(1)
  })

  it('should pass licenceUrl and that search has not been performed to Global search', async () => {
    const noSearchTextProps = { ...standardProps, searchText: null }
    const component = shallow(<GlobalSearchContainer {...noSearchTextProps} />)

    expect(component.find({ searchPerformed: false, licencesUrl: 'http://home/' })).toHaveLength(1)
  })
})
