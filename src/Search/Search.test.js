import React from 'react'
import { shallow } from 'enzyme'
import { Search } from './Search'

const locations = ['1', '2']
const activities = [{ locationId: 123456, userDescription: 'little room' }]
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

describe('Search component', () => {
  it('should render initial search page correctly', async () => {
    const component = shallow(
      <Search
        history={mockHistory}
        locations={locations}
        activities={activities}
        onSearch={jest.fn()}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        date="today"
        period="AM"
        loaded={false}
        currentLocation="cellLocation"
        activity="bob"
      />
    )
    expect(component.find('#housing-location-select option').get(0).props.value).toEqual('--')
  })
})
