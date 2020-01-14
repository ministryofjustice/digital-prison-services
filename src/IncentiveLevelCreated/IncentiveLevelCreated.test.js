import React from 'react'
import { shallow } from 'enzyme'
import Button from '@govuk-react/button'
import { mockUserAgent } from 'jest-useragent-mock'
import IncentiveLevelCreated from '.'

const props = {
  offender: {
    firstName: 'Test',
    lastName: 'Offender',
    offenderNo: 'ABC123',
    cellLocation: 'LEI-123',
  },
  iepValues: {
    pay: 'false',
    absentReason: 'Refused',
    comments: 'Refused to attend',
  },
  activityName: 'Test activity',
  user: {
    activeCaseLoadId: 'LEI',
    name: 'Test User',
  },
  showModal: jest.fn(),
}

let wrapper

describe('<IncentiveLevelCreated />', () => {
  const setStorageSpy = jest.spyOn(Storage.prototype, 'setItem')
  wrapper = shallow(<IncentiveLevelCreated {...props} />)

  it('should handle clicking print', () => {
    wrapper
      .find(Button)
      .props()
      .onClick()
    expect(global.open).toHaveBeenCalled()
    expect(props.showModal).toHaveBeenCalledWith(false)
    expect(setStorageSpy).toHaveBeenCalled()
  })

  it('should close the Incentive Level created modal when cancelled', () => {
    wrapper
      .find('ButtonCancel')
      .props()
      .onClick()
    expect(props.showModal).toHaveBeenCalledWith(false)
  })

  it('close the Incentive Level created modal when print dialog has been closed', () => {
    global.afterPrint()
    expect(props.showModal).toHaveBeenCalledWith(false)
  })

  it('should display a close button on mobile devices', () => {
    mockUserAgent('Android')
    wrapper = shallow(<IncentiveLevelCreated {...props} />)
    expect(window.navigator.userAgent).toEqual('Android')

    const closeButton = wrapper.find(Button)
    closeButton.props().onClick()

    expect(closeButton.text()).toEqual('Close')
    expect(props.showModal).toHaveBeenCalledWith(false)
  })
})
