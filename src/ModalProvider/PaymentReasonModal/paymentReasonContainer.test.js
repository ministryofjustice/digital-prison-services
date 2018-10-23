import React from 'react'
import { mount } from 'enzyme'
import PaymentReasonContainer from './PaymentReasonContainer'

const store = {
  getState: () => {},
  subscribe: () => {},
  dispatch: () => {},
}

describe('PaymentReasonContainer', () => {
  it('should pass the correct props down to PaymentReasonModal', () => {
    const props = {
      onClose: () => {},
      onConfirm: () => {},
      data: {
        reasons: [{ value: 'one' }, { value: 'two' }],
        event: { firstName: 'igor', lastName: 'balog' },
      },
      store,
      handleError: jest.fn(),
    }
    const container = mount(<PaymentReasonContainer {...props} />)
    const modal = container.find('PaymentReasonModal')

    expect(JSON.stringify(modal.props())).toEqual(
      JSON.stringify({
        onConfirm: props.onConfirm,
        onClose: props.onClose,
        reasons: props.data.reasons,
        event: props.data.event,
      })
    )
  })
})
