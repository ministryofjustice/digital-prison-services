import React from 'react'
// We need to eventually use the async version of act, which is currently in 16.9.0-alpha.0 to avoid the test console errors
// https://github.com/facebook/react/issues/14769
import TestRenderer, { act } from 'react-test-renderer'
import Radio from '@govuk-react/radio'
import { Spinner } from '@govuk-react/icons'
import { UpdateLink, PayMessage, OtherMessage } from './AttendanceOptions.styles'
import AttendanceOptions, { updateOffenderAttendance } from './AttendanceOptions'

describe('<AttendanceOptions />', () => {
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
        pay: false,
        paid: false,
        comments: undefined,
        absentReason: undefined,
        locked: false,
        other: false,
      },
    },
    date: 'Today',
    agencyId: 'LEI',
    period: 'PM',
    showModal: jest.fn(),
    setOffenderAttendance: jest.fn(),
    resetErrorDispatch: jest.fn(),
    setErrorDispatch: jest.fn(),
    reloadPage: jest.fn(),
    raiseAnalyticsEvent: jest.fn(),
    handleError: jest.fn(),
    activityName: 'Activity name',
  }

  let testRenderer
  let testInstance

  let getPayRadio
  let getOtherRadio
  let getAbsentReason
  let getOtherMessage

  beforeEach(() => {
    testRenderer = TestRenderer.create(<AttendanceOptions {...props} />)
    testInstance = testRenderer.root
    getAbsentReason = () => testInstance.findAllByProps({ 'data-qa': 'absent-reason' })
    getPayRadio = () => testInstance.findByProps({ 'data-qa': 'pay-option' }).findByType(Radio)
    getOtherRadio = () => testInstance.findByProps({ 'data-qa': 'other-option' }).findByType(Radio)
    getOtherMessage = () => testInstance.findByProps({ 'data-qa': 'other-message' }).findByType(OtherMessage)
  })

  it('should not have any radio buttons checked if offender has no pay status', () => {
    expect(getPayRadio().props.checked).toBe(false)
    expect(getOtherRadio().props.checked).toBe(false)
    expect(getAbsentReason().length).toBe(0)
  })

  it('should successfully call updateOffenderAttendance', () => {
    act(() => getPayRadio().props.onChange())
    const paid = updateOffenderAttendance(
      { attended: true, eventId: 123, eventLocationId: 1, offenderNo: 'ABC123', paid: true },
      1,
      'LEI',
      'PM',
      'Today',
      props.setOffenderAttendance,
      props.handleError,
      props.showModal,
      props.resetErrorDispatch,
      props.setErrorDispatch,
      props.raiseAnalyticsEvent,
      props.reloadPage
    )
    expect(paid).toBeTruthy()
  })

  it('should load the paying spinner when selecting pay', () => {
    act(() => getPayRadio().props.onChange())
    expect(testInstance.findByType(Spinner).props.title).toEqual('Paying')
  })

  it('should call openModal when selecting other', () => {
    act(() => getOtherRadio().props.onChange())
    expect(props.showModal).toHaveBeenCalled()
  })

  it('should display radio buttons when attendance is not locked', () => {
    expect(getPayRadio().props.checked).toBe(false)
    expect(getOtherRadio().props.checked).toBe(false)
  })

  describe('when offender has been marked as non attended', () => {
    it('should only display the absent reason text', () => {
      props.offenderDetails.attendanceInfo.other = true
      props.offenderDetails.attendanceInfo.pay = false
      props.offenderDetails.attendanceInfo.absentReason = {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      }
      act(() => testRenderer.update(<AttendanceOptions {...props} />))

      expect(getPayRadio().props.checked).toBe(false)
      expect(getOtherMessage().props.children).toBe('Acceptable')
    })

    it('should display the absent reason cell used for printed lists', () => {
      props.offenderDetails.attendanceInfo.absentReason = {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      }
      act(() => testRenderer.update(<AttendanceOptions {...props} />))
      const absentReason = getAbsentReason()
      expect(absentReason[0].props.printOnly).toBe(true)
      expect(absentReason[0].props.children).toEqual('Acceptable')
    })

    it('should display the view/update link', () => {
      props.offenderDetails.attendanceInfo.other = true
      props.offenderDetails.attendanceInfo.absentReason = {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      }
      act(() => testRenderer.update(<AttendanceOptions {...props} />))
      const detailsLink = testInstance.findAllByType(UpdateLink)
      expect(detailsLink.length).toBe(1)
    })

    it('should call openModal when clicking on update link', () => {
      props.offenderDetails.attendanceInfo.other = true
      props.offenderDetails.attendanceInfo.absentReason = {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      }
      act(() => testRenderer.update(<AttendanceOptions {...props} />))
      const detailsLink = testInstance.findByType(UpdateLink)
      detailsLink.props.onClick()
      expect(props.showModal).toHaveBeenCalled()
    })

    it('should not display paid message when offender has been paid and the instance is not locked', () => {
      const PayConfirm = testInstance.findAllByType(PayMessage)
      expect(PayConfirm.length).toBe(0)
    })

    it('should display paid message when offender has been paid and the instance is locked', () => {
      props.offenderDetails.attendanceInfo.paid = true
      props.offenderDetails.attendanceInfo.locked = true

      act(() => testRenderer.update(<AttendanceOptions {...props} />))
      const PayConfirm = testInstance.findAllByType(PayMessage)
      expect(PayConfirm.length).toBe(1)
    })

    it('should not display radio button for non attendance when one has previously been recorded', () => {
      props.offenderDetails.attendanceInfo.paid = false
      props.offenderDetails.attendanceInfo.locked = false
      props.offenderDetails.attendanceInfo.other = true
      props.offenderDetails.attendanceInfo.absentReason = {
        value: 'AcceptableAbsence',
        name: 'Acceptable',
      }

      act(() => testRenderer.update(<AttendanceOptions {...props} />))
      expect(getOtherRadio).toThrow(new Error('No instances found with node type: "Radio"'))
    })
  })
})
