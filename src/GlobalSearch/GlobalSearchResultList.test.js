import React from 'react'
import { shallow } from 'enzyme'
import GlobalSearchResultList from './GlobalSearchResultList'

const PHOTO_COLUMN = 0
const OFFENDER_NAME_COLUMN = 1
const NOMS_ID_COLUMN = 2
const DOB_COLUMN = 3
const LOCATION_COLUMN = 4

const response = [
  {
    offenderNo: 'A1234AC',
    firstName: 'FRED',
    lastName: 'QUIMBY',
    latestLocation: 'LEEDS HMP',
    dateOfBirth: '1977-10-15',
    latestLocationId: 'LEI',
  },
  {
    offenderNo: 'A1234AA',
    firstName: 'ARTHUR',
    lastName: 'ANDERSON',
    latestLocation: 'Moorland HMP',
    dateOfBirth: '1976-09-15',
    latestLocationId: 'MDI',
    latestBookingId: 'BOOKING',
  },
]

describe('Global search results component', () => {
  it('should render results correctly', async () => {
    const component = shallow(
      <GlobalSearchResultList
        agencyId="LEI"
        pageNumber={1}
        pageSize={20}
        totalRecords={3}
        handlePageAction={() => {}}
        data={response}
        licencesUrl="LICENCES/"
        licencesUser={false}
        searchPerformed
      />
    )
    const tr = component.find('tr')
    expect(tr.length).toEqual(3) // 2 plus table header tr
    expect(tr.at(0).contains('Prison no.'))
    expect(
      tr
        .at(1)
        .find('td a')
        .at(OFFENDER_NAME_COLUMN)
        .text()
    ).toEqual('Quimby, Fred')
    expect(
      tr
        .at(1)
        .find('td')
        .at(NOMS_ID_COLUMN)
        .text()
    ).toEqual('A1234AC')
    expect(
      tr
        .at(1)
        .find('td')
        .at(LOCATION_COLUMN)
        .text()
    ).toEqual('LEEDS HMP')
    expect(
      tr
        .at(1)
        .find('td')
        .at(DOB_COLUMN)
        .text()
    ).toEqual('1977-10-15')

    expect(
      tr
        .at(2)
        .find('td')
        .at(OFFENDER_NAME_COLUMN)
        .text()
    ).toEqual('Anderson, Arthur')
    expect(
      tr
        .at(2)
        .find('td')
        .at(NOMS_ID_COLUMN)
        .text()
    ).toEqual('A1234AA')
    expect(
      tr
        .at(2)
        .find('td')
        .at(LOCATION_COLUMN)
        .text()
    ).toEqual('Moorland HMP')
    expect(
      tr
        .at(2)
        .find('td')
        .at(DOB_COLUMN)
        .text()
    ).toEqual('1976-09-15')
    expect(
      tr
        .at(2)
        .find('td')
        .at(PHOTO_COLUMN)
        .find('#imageLink-A1234AA').length
    ).toEqual(0)
    expect(
      tr
        .at(1)
        .find('td')
        .at(PHOTO_COLUMN)
        .find('#imageLink-A1234AC').length
    ).toEqual(1) // only link when user belongs to current agency
  })

  it('should render empty results list correctly', () => {
    const component = shallow(
      <GlobalSearchResultList
        data={[]}
        agencyId="1"
        pageNumber={2}
        pageSize={2}
        totalRecords={10}
        handlePageAction={() => {}}
        searchPerformed
        licencesUrl="LICENCES/"
        licencesUser={false}
      />
    )
    const tr = component.find('tr')
    expect(tr.length).toEqual(1) // table header tr only
    expect(component.find('div.font-small').text()).toEqual('No prisoners found')
  })

  it('should render empty results list correctly if no search performed', () => {
    const component = shallow(
      <GlobalSearchResultList
        data={[]}
        agencyId="1"
        pageNumber={2}
        pageSize={2}
        totalRecords={10}
        handlePageAction={() => {}}
        searchPerformed={false}
        licencesUrl="LICENCES/"
        licencesUser={false}
      />
    )
    expect(component.find('div.font-small').text()).toEqual('Use the search box above')
  })

  it('should render a link back to licences app if user is from licences', () => {
    const component = shallow(
      <GlobalSearchResultList
        data={response}
        agencyId="1"
        pageNumber={2}
        pageSize={2}
        totalRecords={10}
        handlePageAction={() => {}}
        searchPerformed={false}
        licencesUrl="LICENCES/"
        licencesUser
      />
    )
    const licencesLinks = component.find('a.toLicences')
    expect(licencesLinks.length).toEqual(2)
    expect(licencesLinks.at(1).prop('href')).toEqual('LICENCES/hdc/taskList/BOOKING')
  })

  it('should not render a link back to licences app if user is not from licences', () => {
    const component = shallow(
      <GlobalSearchResultList
        data={response}
        agencyId="1"
        pageNumber={2}
        pageSize={2}
        totalRecords={10}
        handlePageAction={() => {}}
        searchPerformed={false}
        licencesUrl="LICENCES/"
        licencesUser={false}
      />
    )
    const licencesLinks = component.find('a.toLicences')
    expect(licencesLinks.length).toEqual(0)
  })
})
