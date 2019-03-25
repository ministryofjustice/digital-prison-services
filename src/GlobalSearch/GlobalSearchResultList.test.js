import React from 'react'
import { shallow } from 'enzyme'
import renderer from 'react-test-renderer'
import GlobalSearchResultList from './GlobalSearchResultList'

const response = [
  {
    offenderNo: 'A1234AC',
    firstName: 'FRED',
    lastName: 'QUIMBY',
    latestLocation: 'LEEDS HMP',
    dateOfBirth: '1977-10-15',
    latestLocationId: 'LEI',
    latestBookingId: 'FredBooking',
    currentlyInPrison: 'Y',
  },
  {
    offenderNo: 'A1234AA',
    firstName: 'ARTHUR',
    lastName: 'ANDERSON',
    latestLocation: 'Moorland HMP',
    dateOfBirth: '1976-09-15',
    latestLocationId: 'MDI',
    latestBookingId: 'ArthurBooking',
    currentlyInPrison: 'Y',
  },
  {
    offenderNo: 'A1234AB',
    firstName: 'PETER',
    lastName: 'RUNAWAY',
    latestLocation: 'Released From Leeds',
    dateOfBirth: '1970-09-15',
    latestLocationId: 'OUT',
    latestBookingId: '2342',
    currentlyInPrison: 'N',
  },
]

const props = {
  pageNumber: 1,
  pageSize: 20,
  totalRecords: 4,
  handlePageAction: () => {},
  handleResultsPerPageChange: () => {},
  data: response,
  licencesUrl: 'LICENCES/',
  licencesUser: false,
  licencesVaryUser: false,
  searchPerformed: true,
  viewInactivePrisoner: false,
  caseLoads: ['LEI', 'BXI'],
}

describe('Global search results component', () => {
  it('should render results correctly', async () => {
    const rendered = renderer.create(<GlobalSearchResultList {...props} />)
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  it('should render results when has inactive booking role', async () => {
    const rendered = renderer.create(
      <GlobalSearchResultList {...props} viewInactivePrisoner caseLoads={['LEI', 'MDI']} />
    )
    expect(rendered.toJSON()).toMatchSnapshot()
  })

  describe('empty results list', () => {
    it('should render correctly', () => {
      const component = shallow(<GlobalSearchResultList {...props} data={[]} />)
      const tr = component.find('tr')
      expect(tr.length).toEqual(1) // table header tr only
      expect(component.find('div.font-small').text()).toEqual('No prisoners found')
    })

    it('should render correctly if no search performed', () => {
      const component = shallow(<GlobalSearchResultList {...props} data={[]} searchPerformed={false} />)
      expect(component.find('div.font-small').text()).toEqual('Use the search box above')
    })
  })

  describe('licences links', () => {
    it('should render a link back if user is from licences', () => {
      const component = shallow(<GlobalSearchResultList {...props} licencesUser licencesVaryUser />)
      const licencesLinks = component.find('a.toLicences')
      expect(licencesLinks.length).toEqual(3)
      expect(licencesLinks.at(1).prop('href')).toEqual('LICENCES/hdc/taskList/ArthurBooking')
    })

    it('should only render a link back for active prisoners if not a vary user', () => {
      const component = shallow(<GlobalSearchResultList {...props} licencesUser />)
      const licencesLinks = component.find('a.toLicences')
      expect(licencesLinks.length).toEqual(2)
      expect(licencesLinks.at(0).prop('href')).toEqual('LICENCES/hdc/taskList/FredBooking')
      expect(licencesLinks.at(1).prop('href')).toEqual('LICENCES/hdc/taskList/ArthurBooking')
    })

    it('should not render a link back if user is not from licences', () => {
      const component = shallow(<GlobalSearchResultList {...props} />)
      const licencesLinks = component.find('a.toLicences')
      expect(licencesLinks.length).toEqual(0)
    })
  })
})
