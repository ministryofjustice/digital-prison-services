import React from 'react'
import { shallow } from 'enzyme'
import { ResultsHouseblockContainer, extractSubLocations } from './ResultsHouseblockContainer'

describe('ResultsHouseblockContainer', () => {
  const props = {
    handleError: jest.fn(),
    raiseAnalyticsEvent: jest.fn(),
    handleDateChange: jest.fn(),
    handlePeriodChange: jest.fn(),
    showModal: jest.fn(),
    agencyId: 'LEI',
    currentLocation: 'Houseblock 1',
    wingStatus: 'all',
    currentSubLocation: '--',
    houseblockData: [],
    locations: [{ key: 'Houseblock 1', name: 'Houseblock 1' }],
    date: 'Today',
    period: 'AM',
    loaded: true,
    orderField: 'lastName',
    sortOrder: 'ASC',
    subLocations: [{ key: 'A-Wing', name: 'A-Wing' }],
    houseblockDataDispatch: jest.fn(),
    orderDispatch: jest.fn(),
    resetErrorDispatch: jest.fn(),
    setLoadedDispatch: jest.fn(),
    sortOrderDispatch: jest.fn(),
    subLocationDispatch: jest.fn(),
    wingStatusDispatch: jest.fn(),
    setOffenderPaymentDataDispatch: jest.fn(),
    getAbsentReasonsDispatch: jest.fn(),
    history: {
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
    },
  }

  describe('page title', () => {
    it('should have the correct page title when all is selected', () => {
      const wrapper = shallow(<ResultsHouseblockContainer {...props} />)

      expect(wrapper.find('Connect(Page)').prop('title')).toEqual('Houseblock 1 - All')
    })

    it('should have the correct page title when staying on wing is selected', () => {
      const wrapper = shallow(<ResultsHouseblockContainer {...props} wingStatus="staying" />)

      expect(wrapper.find('Connect(Page)').prop('title')).toEqual('Houseblock 1 - Staying')
    })

    it('should have the correct page title when leaving wing is selected', () => {
      const wrapper = shallow(<ResultsHouseblockContainer {...props} wingStatus="leaving" />)

      expect(wrapper.find('Connect(Page)').prop('title')).toEqual('Houseblock 1 - Leaving')
    })

    it('should have the correct page title when when a sub location is selected', () => {
      const wrapper = shallow(<ResultsHouseblockContainer {...props} currentSubLocation="A-Wing" />)

      expect(wrapper.find('Connect(Page)').prop('title')).toEqual('Houseblock 1 - A-Wing - All')
    })
  })

  describe('on unmount', () => {
    it('should reset the wing status filter', () => {
      const wrapper = shallow(<ResultsHouseblockContainer {...props} />)

      wrapper.unmount()

      expect(props.wingStatusDispatch).toBeCalledWith('all')
    })
  })
})

describe('extractSubLocations', () => {
  it('should handle no locations', () => {
    expect(extractSubLocations([], 'x')).toEqual([])
  })

  it('should handle absent location', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, no children field', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x' }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, undefined children field', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x', children: undefined }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, empty children', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x', children: [] }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location with children', () => {
    expect(
      extractSubLocations([{ key: 'a' }, { key: 'x', children: [{ key: 'xx' }, { key: 'yy' }] }, { key: 'b' }], 'x')
    ).toEqual([{ key: 'xx' }, { key: 'yy' }])
  })
})
