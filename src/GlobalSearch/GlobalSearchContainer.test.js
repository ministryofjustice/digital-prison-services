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
  caseLoadOptions: [{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }],
  searchText: 's',
  genderFilter: 'gf',
  locationFilter: 'lf',
  dateOfBirthFilter: { blank: false, valid: true, isoDate: 'd' },
  data: [{ offenderNo: '1', lastName: 'ln', firstName: 'fn', dateOfBirth: 'dob', latestLocation: 'll' }],
  pageNumber: 1,
  pageSize: 1,
  totalRecords: 1,
  licencesUrl: 'http://licences/',
  userRoles: ['SOMETHING'],
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
  searchPerformed: true,
}

describe('Global search container', () => {
  it('should pass Global search results as page title if there is a searchText', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)

    expect(component.find({ title: 'Global search results' })).toHaveLength(1)
  })

  it('should pass licenceUrl and whether a search has been performed to Global search', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)

    expect(
      component.find({ searchPerformed: true, licencesUrl: 'http://licences/', licencesUser: false })
    ).toHaveLength(1)
  })

  it('should pass licencesUser true if roles includes LICENCE_RO', async () => {
    const licencesProps = { ...standardProps, userRoles: ['SOMETHING', 'LICENCE_RO'] }
    const component = shallow(<GlobalSearchContainer {...licencesProps} />)

    expect(component.find('GlobalSearch').props().licencesUser).toEqual(true)
  })

  it('should pass viewInactivePrisoner true if roles includes INACTIVE_BOOKINGS', async () => {
    const inactiveProps = { ...standardProps, userRoles: ['SOMETHING', 'INACTIVE_BOOKINGS'] }
    const component = shallow(<GlobalSearchContainer {...inactiveProps} />)

    expect(component.find('GlobalSearch').props().viewInactivePrisoner).toEqual(true)
  })

  it('should map user caseloads to a list of caseload Ids', async () => {
    const caseloadProps = {
      ...standardProps,
      caseLoadOptions: [{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }, { caseLoadId: 'BXI' }],
    }
    const component = shallow(<GlobalSearchContainer {...caseloadProps} />)

    expect(component.find('GlobalSearch').props().caseLoads).toHaveLength(3)
    expect(component.find('GlobalSearch').props().caseLoads).toEqual(['MDI', 'LEI', 'BXI'])
  })

  it('should pass Global search as page title if serchPerformed is false', async () => {
    const noSearchTextProps = { ...standardProps, searchPerformed: false }
    const component = shallow(<GlobalSearchContainer {...noSearchTextProps} />)

    expect(component.find({ title: 'Global search results' })).toHaveLength(0)
    expect(component.find({ title: 'Global search' })).toHaveLength(1)
  })

  it('should pass licenceUrl and that search has not been performed to Global search', async () => {
    const noSearchTextProps = { ...standardProps, searchPerformed: false }
    const component = shallow(<GlobalSearchContainer {...noSearchTextProps} />)

    expect(component.find({ searchPerformed: false, licencesUrl: 'http://licences/' })).toHaveLength(1)
  })

  it('should not pass a backLink to Page if no referrer query', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)
    expect(component.find('Connect(Page)').props().backLink).toEqual(undefined)
  })

  it('should show breadcrumbs if no referrer query', async () => {
    const component = shallow(<GlobalSearchContainer {...standardProps} />)
    expect(component.find('Connect(Page)').props().showBreadcrumb).toEqual(true)
  })

  it('should not pass a backLink to Page if unrecognised referrer query', async () => {
    const unknownReferrer = {
      hash: 'h',
      key: 'k',
      pathname: 'pn',
      search: '?referrer=something',
      state: 'st',
    }
    const component = shallow(<GlobalSearchContainer {...standardProps} location={unknownReferrer} />)
    expect(component.find('Connect(Page)').props().backLink).toEqual(undefined)
  })

  it('should pass a backLink to Page if recognised referrer query', async () => {
    const knownReferrer = {
      hash: 'h',
      key: 'k',
      pathname: 'pn',
      search: '?referrer=licences',
      state: 'st',
    }
    const component = shallow(<GlobalSearchContainer {...standardProps} location={knownReferrer} />)
    expect(component.find('Connect(Page)').props().backLink).toEqual('http://licences/')
  })

  it('should not show breadcrumbs if recognised referrer query', async () => {
    const knownReferrer = {
      hash: 'h',
      key: 'k',
      pathname: 'pn',
      search: '?referrer=licences',
      state: 'st',
    }
    const component = shallow(<GlobalSearchContainer {...standardProps} location={knownReferrer} />)
    expect(component.find('Connect(Page)').props().showBreadcrumb).toEqual(false)
  })

  it('should include referrer on redirect url after search', async () => {
    const historyMock = { replace: jest.fn() }
    const knownReferrer = {
      hash: 'h',
      key: 'k',
      pathname: 'pn',
      search: '?referrer=licences',
      state: 'st',
    }

    const component = shallow(<GlobalSearchContainer {...standardProps} location={knownReferrer} />)
    component
      .find('GlobalSearch')
      .props()
      .handleSearch(historyMock)

    expect(historyMock.replace).toBeCalled()
    expect(historyMock.replace).toBeCalledWith('/global-search-results?searchText=s&referrer=licences')
  })

  it('should not include referrer on redirect url after search if no referrer in query', async () => {
    const historyMock = { replace: jest.fn() }
    const knownReferrer = {
      hash: 'h',
      key: 'k',
      pathname: 'pn',
      search: '?oldSearch',
      state: 'st',
    }

    const component = shallow(<GlobalSearchContainer {...standardProps} location={knownReferrer} />)
    component
      .find('GlobalSearch')
      .props()
      .handleSearch(historyMock)

    expect(historyMock.replace).toBeCalled()
    expect(historyMock.replace).toBeCalledWith('/global-search-results?searchText=s')
  })
})
