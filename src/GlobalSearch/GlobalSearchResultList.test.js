import React from 'react'
import { shallow } from 'enzyme'
import GlobalSearchResultList from './GlobalSearchResultList'

const OFFENDER_NAME_COLUMN = 0
const NOMS_ID_COLUMN = 1
const DOB_COLUMN = 2
const LOCATION_COLUMN = 3

const response = [
  {
    offenderNo: 'A1234AC',
    firstName: 'FRED',
    lastName: 'QUIMBY',
    latestLocation: 'LEEDS HMP',
    dateOfBirth: '1977-10-15',
  },
  {
    offenderNo: 'A1234AA',
    firstName: 'ARTHUR',
    lastName: 'ANDERSON',
    latestLocation: 'Moorland HMP',
    dateOfBirth: '1976-09-15',
  },
]

describe('Global search results component', () => {
  it('should render results correctly', async () => {
    const component = shallow(<GlobalSearchResultList data={response} />)

    const tr = component.find('tr')
    expect(tr.length).toEqual(3) // 2 plus table header tr
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
        .find('td a')
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
  })

  it('should render empty results list correctly', async () => {
    const component = shallow(<GlobalSearchResultList data={[]} />)
    const tr = component.find('tr')
    expect(tr.length).toEqual(1) // table header tr only
    expect(component.find('div.font-small').text()).toEqual('No prisoners found')
  })
})
