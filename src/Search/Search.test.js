import React from 'react'
import { shallow, mount } from 'enzyme'
import { MemoryRouter } from 'react-router'
import testRenderer from 'react-test-renderer'
import { Search, PrisonersUnaccountedForCTA, AttendanceButtonsContainer } from './Search'
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
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

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

    expect(component.find('ErrorSummary')).toHaveLength(1)
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
      flags: {},
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
      flags: {},
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
  describe('prisoners unaccounted for button', () => {
    const store = {}
    store.getState = jest.fn()
    store.subscribe = jest.fn()
    store.dispatch = jest.fn()
    store.getState.mockReturnValue({
      flags: {
        updateAttendanceEnabled: true,
      },
    })

    const props = {
      history: mockHistory,
      activities: [],
      locations,
      onSearch: jest.fn(),
      onActivityChange: jest.fn(),
      onLocationChange: jest.fn(),
      handlePeriodChange: jest.fn(),
      handleDateChange: jest.fn(),
      currentLocation: 'BWing',
      loaded: false,
      activity: 'bob',
    }

    it('should render attendance links if caseload does have pay enabled', () => {
      store.getState.mockReturnValue({
        flags: {},
      })
      const component = mount(
        <MemoryRouter>
          <ConnectedFlagsProvider store={store}>
            <Search {...props} date="Today" period="AM" />
          </ConnectedFlagsProvider>
        </MemoryRouter>
      )
      expect(component.find(AttendanceButtonsContainer).length).toBe(1)
    })

    describe('when current period is AM', () => {
      it('should show the prisoners unaccounted for button for this morning', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="AM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should hide the prisoners unaccounted for button for "Today" afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="PM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })

      it('should hide the prisoners unaccounted for button for todays date afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="01/01/2017" period="PM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })

      it('should hide the prisoners unaccounted for button for "Today" evening', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="ED" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })

      it('should hide the prisoners unaccounted for button for todays date evening', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="01/01/2017" period="ED" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })
    })

    describe('when current period is PM', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1483272000000) // Sunday 2017-01-01T12:00:00.000Z
      })

      afterEach(() => {
        Date.now.mockRestore()
      })

      it('should show the prisoners unaccounted for button for this morning', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="AM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should show the prisoners unaccounted for button for this afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="PM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should hide the prisoners unaccounted for button for this evening', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="ED" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })
    })

    describe('when current period is ED', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1483290000000) // Sunday 2017-01-01T17:00:00.000Z
      })

      afterEach(() => {
        Date.now.mockRestore()
      })

      it('should show the prisoners unaccounted for button for this morning', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="AM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should show the prisoners unaccounted for button for this afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="PM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should show the prisoners unaccounted for button for this evening', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date="Today" period="ED" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })
    })

    describe('when the search date is in the past and the current period is in the morning', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z
      })

      const pastDate = '31/12/2016'

      it('should show the prisoners unaccounted for button for the afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date={pastDate} period="AM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )
        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should show the prisoners unaccounted for button for the afternoon', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date={pastDate} period="PM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })

      it('should show the prisoners unaccounted for button for the evening', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date={pastDate} period="ED" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(1)
      })
    })

    describe('when the search date is in the future', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z
      })

      const futureDate = '2/1/2017'

      it('should hide the prisoners unaccounted for button', async () => {
        const component = mount(
          <MemoryRouter>
            <ConnectedFlagsProvider store={store}>
              <Search {...props} date={futureDate} period="AM" />
            </ConnectedFlagsProvider>
          </MemoryRouter>
        )

        expect(component.find(PrisonersUnaccountedForCTA).length).toBe(0)
      })
    })
  })
})
