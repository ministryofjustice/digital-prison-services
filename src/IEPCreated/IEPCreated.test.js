import React from 'react'
import { shallow } from 'enzyme'
import Button from '@govuk-react/button'
import IEPCreated from '.'

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

describe('<IEPCreated />', () => {
  const wrapper = shallow(<IEPCreated {...props} />)

  it('should print when clicking print', () => {
    wrapper
      .find(Button)
      .props()
      .onClick()
    expect(global.print).toHaveBeenCalled()
  })

  it('should close the IEP created modal when cancelled', () => {
    wrapper
      .find('ButtonCancel')
      .props()
      .onClick()
    expect(props.showModal).toHaveBeenCalledWith(false)
  })

  it('close the IEP created modal when print dialog has been closed', () => {
    global.afterPrint()
    expect(props.showModal).toHaveBeenCalledWith(false)
  })
})
