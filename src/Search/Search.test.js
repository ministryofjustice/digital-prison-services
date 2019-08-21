import React from 'react'
import { shallow } from 'enzyme'
import { MemoryRouter } from 'react-router'
import testRenderer from 'react-test-renderer'
import { Search } from './Search'
import { ConnectedFlagsProvider } from '../flags'

const locations = [{ name: '1', key: 'K1' }, { name: '2', key: 'K2' }]
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
  Date.now = jest.fn(() => new Date(Date.UTC(2017, 0, 1)).valueOf())
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
    expect(component.find('#housing-location-select option').get(1).props.value).toEqual('K1')

    expect(component.find('#activity-select option').get(0).props.value).toEqual('--')
    expect(component.find('#activity-select option').get(1).props.value).toEqual(123456)
  })

  it('should render validation error correctly', async () => {
    const component = shallow(
      <Search
        history={mockHistory}
        locations={locations}
        activities={activities}
        onSearch={jest.fn()}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        validationErrors={{ text: 'test' }}
        handleDateChange={jest.fn()}
        date="today"
        period="AM"
        loaded={false}
        currentLocation="cellLocation"
        activity="bob"
      />
    )
    expect(component.find('ValidationErrors')).toHaveLength(1)
  })

  it('should handle search button correctly', async () => {
    const handleSearch = jest.fn()
    const component = shallow(
      <Search
        history={mockHistory}
        activities={[]}
        locations={locations}
        onSearch={handleSearch}
        onActivityChange={jest.fn()}
        onLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        date="27/02/2018"
        period="ED"
        currentLocation="BWing"
        loaded={false}
        activity="bob"
      />
    )

    component.find('#continue-housing').simulate('click')
    component.find('#continue-activity').simulate('click')
    expect(handleSearch.mock.calls.length).toBe(2)
  })

  it('should render correctly with feature toggle enabled', () => {
    const store = {}
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    store.getState.mockReturnValue({
      flags: {
        updateAttendanceEnabled: true,
      },
    })

    const wrapper = testRenderer
      .create(
        <MemoryRouter>
          <ConnectedFlagsProvider store={store}>
            <Search
              history={mockHistory}
              locations={locations}
              activities={activities}
              onSearch={jest.fn()}
              onActivityChange={jest.fn()}
              onLocationChange={jest.fn()}
              handlePeriodChange={jest.fn()}
              validationErrors={{ text: 'test' }}
              handleDateChange={jest.fn()}
              date="today"
              period="AM"
              loaded={false}
              currentLocation="cellLocation"
              activity="bob"
            />
          </ConnectedFlagsProvider>
        </MemoryRouter>
      )
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
  it('should render correctly with feature toggle disabled', () => {
    const store = {}
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    store.getState.mockReturnValue({
      flags: {
        updateAttendanceEnabled: false,
      },
    })

    const wrapper = testRenderer
      .create(
        <MemoryRouter>
          <ConnectedFlagsProvider store={store}>
            <Search
              history={mockHistory}
              locations={locations}
              activities={activities}
              onSearch={jest.fn()}
              onActivityChange={jest.fn()}
              onLocationChange={jest.fn()}
              handlePeriodChange={jest.fn()}
              validationErrors={{ text: 'test' }}
              handleDateChange={jest.fn()}
              date="today"
              period="AM"
              loaded={false}
              currentLocation="cellLocation"
              activity="bob"
            />
          </ConnectedFlagsProvider>
        </MemoryRouter>
      )
      .toJSON()

    expect(wrapper).toMatchSnapshot()
  })
})
