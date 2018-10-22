import React from 'react'
import { shallow } from 'enzyme'
import { Search } from './Search'

const locations = ['1', '2']
const activities = [{ locationId: '123456', userDescription: 'little room' }]

describe('Search component', () => {
  it('should render initial search page correctly', async () => {
    const component = shallow(
      <Search
        history={{ push: jest.fn() }}
        locations={locations}
        activities={activities}
        onSearch={jest.fn()}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
      />
    )
    expect(component.find('#housing-location-select option').get(0).props.value).toEqual('--')
    expect(component.find('#housing-location-select option').get(1).props.value).toEqual('1')

    expect(component.find('#activity-select option').get(0).props.value).toEqual('--')
    expect(component.find('#activity-select option').get(1).props.value).toEqual('123456')
  })

  it('should render validation error correctly', async () => {
    const component = shallow(
      <Search
        history={{ push: jest.fn() }}
        locations={locations}
        activities={activities}
        onSearch={jest.fn()}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        validationErrors={{ text: 'test' }}
        handleDateChange={jest.fn()}
      />
    )
    expect(component.find('ValidationErrors')).toHaveLength(1)
  })

  it('should handle search button correctly', async () => {
    const handleSearch = jest.fn()
    const component = shallow(
      <Search
        history={{ push: jest.fn() }}
        locations={locations}
        onSearch={handleSearch}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        date="27/02/2018"
        period="ED"
        currentLocation="BWing"
      />
    )

    component.find('#continue-housing').simulate('click')
    component.find('#continue-activity').simulate('click')
    expect(handleSearch.mock.calls.length).toBe(2)
  })
})
