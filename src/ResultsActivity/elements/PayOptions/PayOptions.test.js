import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import Radio from '@govuk-react/radio'
import PayOptions from '.'

describe('<PayOptions />', () => {
  const props = {
    offenderNo: 'ABC123',
    eventId: 123,
    eventLocationId: 1,
    updateOffenderAttendance: jest.fn(),
    otherHandler: jest.fn(),
    firstName: 'Test',
    lastName: 'Offender',
    offenderIndex: 1,
  }
  const testRenderer = TestRenderer.create(<PayOptions {...props} />)
  const testInstance = testRenderer.root
  const payRadio = testInstance.findByProps({ 'data-qa': 'pay-option' }).findByType(Radio)
  const otherRadio = testInstance.findByProps({ 'data-qa': 'other-option' }).findByType(Radio)

  it('should not have any radio buttons checked if offender has no pay status', () => {
    expect(payRadio.props.checked).toBe(false)
    expect(otherRadio.props.checked).toBe(false)
  })

  it('should call updateOffenderAttendance with the correct args when selecting pay', () => {
    payRadio.props.onChange()
    expect(props.updateOffenderAttendance).toHaveBeenCalledWith(
      { attended: true, eventId: 123, eventLocationId: 1, offenderNo: 'ABC123', paid: true },
      1
    )
  })

  it('should call otherHandler when selecting other', () => {
    otherRadio.props.onChange()
    expect(props.otherHandler).toHaveBeenCalled()
  })

  it('should check the correct radio button when user has been marked as paid and attended', () => {
    act(() => testRenderer.update(<PayOptions {...props} payStatus={{ pay: true }} />))
    expect(payRadio.props.checked).toBe(true)
    expect(otherRadio.props.checked).toBe(false)
  })

  it('should check the correct radio button when user has been marked as other', () => {
    act(() => testRenderer.update(<PayOptions {...props} payStatus={{ other: true }} />))
    expect(payRadio.props.checked).toBe(false)
    expect(otherRadio.props.checked).toBe(true)
  })

  it('should disable the pay radio element when the seletedOption has a value', () => {
    act(() => testRenderer.update(<PayOptions {...props} payStatus={{ pay: true }} />))
    expect(payRadio.props.disabled).toBe(true)
    expect(otherRadio.props.disabled).toBe(true)
  })
})
