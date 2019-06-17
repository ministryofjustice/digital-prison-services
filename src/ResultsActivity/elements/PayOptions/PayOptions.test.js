import React from 'react'
// We need to eventually use the async version of act, which is currently in 16.9.0-alpha.0 to avoid the test console errors
// https://github.com/facebook/react/issues/14769
import TestRenderer, { act } from 'react-test-renderer'
import Radio from '@govuk-react/radio'
import { Spinner } from '@govuk-react/icons'
import { UpdateLink } from './PayOptions.styles'
import PayOptions from '.'

describe('<PayOptions />', () => {
  Date.now = jest.fn(() => new Date(Date.UTC(2019, 0, 13)).valueOf())

  const props = {
    offenderDetails: {
      offenderNo: 'ABC123',
      eventId: 123,
      eventLocationId: 1,
      firstName: 'Test',
      lastName: 'Offender',
      offenderIndex: 1,
      attendanceInfo: {
        paid: false,
        comments: undefined,
        absentReason: undefined,
      },
    },
    updateOffenderAttendance: jest.fn(),
    date: 'Today',
    closeModal: jest.fn(),
    openModal: jest.fn(),
  }

  let testRenderer
  let testInstance
  let payRadio
  let otherRadio

  beforeEach(() => {
    testRenderer = TestRenderer.create(<PayOptions {...props} />)
    testInstance = testRenderer.root
    payRadio = testInstance.findByProps({ 'data-qa': 'pay-option' }).findByType(Radio)
    otherRadio = testInstance.findByProps({ 'data-qa': 'other-option' }).findByType(Radio)
  })

  it('should not have any radio buttons checked if offender has no pay status', () => {
    expect(payRadio.props.checked).toBe(false)
    expect(otherRadio.props.checked).toBe(false)
  })

  it('should call updateOffenderAttendance with the correct args when selecting pay', () => {
    act(() => payRadio.props.onChange())
    expect(props.updateOffenderAttendance).toHaveBeenCalledWith(
      { attended: true, eventId: 123, eventLocationId: 1, offenderNo: 'ABC123', paid: true },
      1
    )
  })

  it('should load the paying spinner when selecting pay', () => {
    act(() => payRadio.props.onChange())
    expect(testInstance.findByType(Spinner).props.title).toEqual('Paying')
  })

  it('should call openModal when selecting other', () => {
    act(() => otherRadio.props.onChange())
    expect(props.openModal).toHaveBeenCalled()
  })

  it('should check the correct radio button when user has been marked as paid and attended', () => {
    props.offenderDetails.attendanceInfo.pay = true
    act(() => testRenderer.update(<PayOptions {...props} />))
    expect(payRadio.props.checked).toBe(true)
    expect(otherRadio.props.checked).toBe(false)
  })

  it('should check the correct radio button when user has been marked as other', () => {
    props.offenderDetails.attendanceInfo.other = true
    act(() => testRenderer.update(<PayOptions {...props} />))
    expect(payRadio.props.checked).toBe(false)
    expect(otherRadio.props.checked).toBe(true)
  })

  it('should call openModal when clicking on update link', () => {
    props.offenderDetails.attendanceInfo.other = true
    act(() => testRenderer.update(<PayOptions {...props} />))
    const detailsLink = testInstance.findByType(UpdateLink)
    detailsLink.props.onClick()
    expect(props.openModal).toHaveBeenCalled()
  })

  it('should not display the details link select date is greater than 1 year', () => {
    props.date = '12/01/2018'
    act(() => testRenderer.update(<PayOptions {...props} />))
    const detailsLink = testInstance.findAllByType(UpdateLink)
    expect(detailsLink.length).toBe(0)
  })
})
