import React from 'react'
import { mount } from 'enzyme'
import { AttendanceOtherForm } from './AttendanceOtherForm'
import IncentiveLevelCreated from '../../IncentiveLevelCreated'

describe('<AttendanceOtherForm />', () => {
  const submitForm = async (formWrapper) => {
    await formWrapper.find('form').simulate('submit')
    formWrapper.update()
  }

  const sharedProps = {
    offender: {
      offenderNo: 'ABC123',
      firstName: 'Test',
      lastName: 'Offender',
      eventId: 123,
      eventLocationId: 456,
      offenderIndex: 1,
    },
    updateOffenderAttendance: jest.fn(),
    absentReasons: {
      paidReasons: [
        { value: 'AcceptableAbsence', name: 'Acceptable' },
        { value: 'ApprovedCourse', name: 'Approved course' },
      ],
      unpaidReasons: [
        { value: 'UnacceptableAbsence', name: 'Unacceptable' },
        { value: 'Refused', name: 'Refused' },
        { value: 'RestDay', name: 'Rest day' },
      ],
      triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
      triggersAbsentSubReason: [
        'AcceptableAbsence',
        'Refused',
        'RefusedIncentiveLevelWarning',
        'SessionCancelled',
        'UnacceptableAbsence',
      ],
      paidSubReasons: [
        { value: 'Activities', name: 'Activities and education' },
        { value: 'Courses', name: 'Courses, programmes and interventions' },
      ],
      unpaidSubReasons: [
        { value: 'Activities', name: 'Activities and education' },
        { value: 'Behaviour', name: 'Behaviour' },
      ],
    },
    showModal: jest.fn(),
    activityName: 'Activity name',
    user: {
      name: 'Test User',
    },
    date: 'Today',
    period: 'PM',
    agencyId: 'LEI',
    setOffenderAttendance: jest.fn(),
    resetErrorDispatch: jest.fn(),
    setErrorDispatch: jest.fn(),
    reloadPage: jest.fn(),
    raiseAnalyticsEvent: jest.fn(),
    handleError: jest.fn(),
    setSelectedOption: jest.fn(),
  }

  let wrapper = {}
  let yesRadio = {}
  let noRadio = {}
  let reasonSelector = () => ({})
  let subReasonSelector = () => ({})
  let commentInput = {}

  const buildWrapper = (wrappedComponent) => {
    wrapper = wrappedComponent
    yesRadio = wrappedComponent.find('input[value="yes"]')
    noRadio = wrappedComponent.find('input[value="no"]')
    reasonSelector = () => wrappedComponent.find('select[name="absentReason"]')
    subReasonSelector = () => wrappedComponent.find('select[name="absentSubReason"]')
    commentInput = wrappedComponent.find('textarea[name="comments"]')
  }

  function simulatePay(pay) {
    if (pay) {
      yesRadio.instance().checked = true
      yesRadio.simulate('change', yesRadio)
    } else {
      noRadio.instance().checked = true
      noRadio.simulate('change', noRadio)
    }
    wrapper.update()
  }

  const simulateReason = (reason) => {
    reasonSelector().instance().value = reason
    reasonSelector().simulate('change', reasonSelector())
    wrapper.update()
  }

  const simulateSubReason = (subReason) => {
    subReasonSelector().instance().value = subReason
    subReasonSelector().simulate('change', subReasonSelector())
    wrapper.update()
  }

  describe('with no initial values', () => {
    const props = { ...sharedProps }
    beforeEach(() => {
      props.updateOffenderAttendance.mockReturnValue(true)
      buildWrapper(mount(<AttendanceOtherForm {...props} />))
    })

    it('should display the correct offender name', () => {
      expect(wrapper.find('legend').text()).toEqual('Do you want to pay Test Offender?')
    })

    it('should trigger the cancel handler when clicking cancel', () => {
      const cancelButton = wrapper.find('ButtonCancel')

      cancelButton.props().onClick()
      expect(props.showModal).toHaveBeenCalledWith(false)
    })

    it('should display paid reasons when "pay" is selected', () => {
      simulatePay(false)

      const skipDefaultEntry = 1
      const reasons = reasonSelector()
        .getElement()
        .props.children[skipDefaultEntry].map((reason) => reason.props)

      expect(reasons).toEqual([
        { value: 'UnacceptableAbsence', children: 'Unacceptable' },
        { value: 'Refused', children: 'Refused' },
        { value: 'RestDay', children: 'Rest day' },
      ])
    })

    it('should not display absent reasons by default', () => {
      expect(reasonSelector().getElements().length).toEqual(0)
    })

    it('should not display any absent sub reasons by default', () => {
      expect(subReasonSelector().getElements().length).toEqual(0)
    })

    it('should display paid reasons when "other" is selected', () => {
      simulatePay(true)

      const skipDefaultEntry = 1
      const reasons = reasonSelector()
        .getElement()
        .props.children[skipDefaultEntry].map((reason) => reason.props)

      expect(reasons).toEqual([
        { value: 'AcceptableAbsence', children: 'Acceptable' },
        { value: 'ApprovedCourse', children: 'Approved course' },
      ])
    })

    it('should display paid sub reasons when reason is selected', () => {
      simulatePay(true)
      simulateReason('AcceptableAbsence')

      const skipDefaultEntry = 1
      const subReasons = subReasonSelector()
        .getElement()
        .props.children[skipDefaultEntry].map((subReason) => subReason.props)

      expect(subReasons).toEqual([
        { value: 'Activities', children: 'Activities and education' },
        { value: 'Courses', children: 'Courses, programmes and interventions' },
      ])
    })

    it('should not display paid sub reasons if sub reason not necessary', () => {
      simulatePay(true)
      simulateReason('ApprovedCourse')

      expect(subReasonSelector().getElements().length).toEqual(0)
    })

    it('should reset the sub reason if a different reason is selected', async () => {
      simulatePay(true)
      simulateReason('AcceptableAbsence')
      simulateSubReason('Courses')

      // changing reason should then clear the sub reason
      simulateReason('ApprovedCourse')
      expect(subReasonSelector().getElements().length).toEqual(0)

      commentInput.instance().value = 'A comment'
      commentInput.simulate('change', commentInput)

      await submitForm(wrapper)

      expect(props.updateOffenderAttendance.mock.lastCall[0]).toEqual(
        expect.objectContaining({
          absentReason: {
            value: 'ApprovedCourse',
            name: 'Approved course',
          },
          absentSubReason: undefined,
          paid: true,
        })
      )
    })

    it('should reset the sub reason if a different reason with sub reason available', async () => {
      simulatePay(false)
      simulateReason('Refused')
      simulateSubReason('Behaviour')

      // changing reason should then clear the sub reason
      simulateReason('UnacceptableAbsence')
      expect(subReasonSelector().props().value).toBe('')

      commentInput.instance().value = 'A comment'
      commentInput.simulate('change', commentInput)

      await submitForm(wrapper)

      const errors = wrapper.find('ErrorSummary').find('li')
      expect(errors.at(0).text()).toEqual('Select an absence reason')
    })

    it('should reset the sub reason if a change in pay is selected', async () => {
      const expectedPayload = {
        absentReason: {
          value: 'ApprovedCourse',
          name: 'Approved course',
        },
        absentSubReason: undefined,
        attended: false,
        comments: 'A comment',
        eventId: 123,
        eventLocationId: 456,
        offenderNo: 'ABC123',
      }

      simulatePay(true)
      simulateReason('AcceptableAbsence')
      simulateSubReason('Courses')

      // changing reason should then clear the sub reason
      simulatePay(false)
      expect(reasonSelector().getElements().length).toEqual(1)
      simulateReason('RestDay')
      expect(subReasonSelector().getElements().length).toEqual(0)
      simulateReason('Refused')

      commentInput.instance().value = 'A comment'
      commentInput.simulate('change', commentInput)

      await submitForm(wrapper)

      expect(props.updateOffenderAttendance).toHaveBeenCalledWith(
        { ...expectedPayload, paid: true },
        1,
        'LEI',
        'PM',
        'Today',
        props.setOffenderAttendance,
        props.handleError,
        props.showModal,
        props.resetErrorDispatch,
        props.setErrorDispatch,
        props.setSelectedOption,
        props.raiseAnalyticsEvent,
        props.reloadPage
      )
    })

    describe('on error', () => {
      it('should display correct errors for missing values', async () => {
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select a pay option')
        expect(errors.at(1).text()).toEqual('Select a reason')
        expect(errors.at(2).text()).toEqual('Enter comment')
      })

      it('should display correct errors for missing sub reason value', async () => {
        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select an absence reason')
        expect(errors.at(1).text()).toEqual('Enter case note')
      })

      it('should change error message if a case note is required', async () => {
        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        simulateSubReason('Behaviour')

        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Enter case note')
      })

      it('should show validation message if the minimum amount of characters have not been entered', async () => {
        simulatePay(true)
        simulateReason('AcceptableAbsence')
        simulateSubReason('Courses')

        commentInput.instance().value = 'A '

        commentInput.simulate('change', commentInput)
        wrapper.update()

        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Enter a valid comment')
      })

      it('should show correct maximum length validation message for the comments text', async () => {
        simulatePay(true)
        simulateReason('ApprovedCourse')

        commentInput.instance().value = 'A'.repeat(241)

        commentInput.simulate('change', commentInput)
        wrapper.update()

        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Maximum length should not exceed 240 characters')
      })
    })

    describe('on success', () => {
      beforeEach(() => {
        commentInput.instance().value = 'A supporting comment.'
        commentInput.simulate('change', commentInput)

        submitForm(wrapper)
      })

      it('should submit with the correct, paid information', async () => {
        const expectedPayload = {
          absentReason: {
            name: 'Acceptable',
            value: 'AcceptableAbsence',
          },
          absentSubReason: 'Courses',
          attended: false,
          comments: 'A supporting comment.',
          eventId: 123,
          eventLocationId: 456,
          offenderNo: 'ABC123',
        }

        simulatePay(true)
        simulateReason('AcceptableAbsence')
        simulateSubReason('Courses')

        await submitForm(wrapper)

        expect(props.updateOffenderAttendance).toHaveBeenCalledWith(
          { ...expectedPayload, paid: true },
          1,
          'LEI',
          'PM',
          'Today',
          props.setOffenderAttendance,
          props.handleError,
          props.showModal,
          props.resetErrorDispatch,
          props.setErrorDispatch,
          props.setSelectedOption,
          props.raiseAnalyticsEvent,
          props.reloadPage
        )
      })

      it('should submit with the correct, unpaid information and trigger the Incentive Level created modal', async () => {
        const expectedPayload = {
          absentReason: {
            value: 'UnacceptableAbsence',
            name: 'Unacceptable',
          },
          absentSubReason: 'Behaviour',
          attended: false,
          comments: 'A supporting comment.',
          eventId: 123,
          eventLocationId: 456,
          offenderNo: 'ABC123',
        }

        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        simulateSubReason('Behaviour')

        await submitForm(wrapper)

        expect(props.updateOffenderAttendance).toHaveBeenCalledWith(
          { ...expectedPayload, paid: false },
          1,
          'LEI',
          'PM',
          'Today',
          props.setOffenderAttendance,
          props.handleError,
          props.showModal,
          props.resetErrorDispatch,
          props.setErrorDispatch,
          props.setSelectedOption,
          props.raiseAnalyticsEvent,
          props.reloadPage
        )
        expect(props.showModal).toHaveBeenCalledWith(
          true,
          <IncentiveLevelCreated
            activityName={props.activityName}
            iepValues={{
              caseNote: 'Unacceptable - Behaviour. A supporting comment.',
              pay: 'no',
            }}
            offender={props.offender}
            showModal={props.showModal}
            user={props.user}
          />
        )
      })
    })
  })

  describe('on error', () => {
    const props = { ...sharedProps }
    beforeEach(() => {
      props.showModal.mockClear()
      props.updateOffenderAttendance.mockReturnValue(false)
      buildWrapper(mount(<AttendanceOtherForm {...props} />))
    })

    it('should not trigger the Incentive Level created modal', async () => {
      simulatePay(false)
      simulateReason('UnacceptableAbsence')

      await submitForm(wrapper)

      expect(props.showModal).not.toHaveBeenCalled()
    })
  })

  describe('with initial values', () => {
    const props = { ...sharedProps }

    it('should have the correct initial values if user has been paid', () => {
      props.offender.attendanceInfo = {
        id: 1,
        paid: true,
        absentReason: {
          value: 'AcceptableAbsence',
          name: 'Acceptable',
        },
        absentSubReason: 'Courses',
        comments: 'Acceptable reason comment',
      }
      buildWrapper(mount(<AttendanceOtherForm {...props} />))
      expect(yesRadio.props().checked).toBe(true)
      expect(noRadio.props().checked).toBe(false)
      expect(reasonSelector().props().value).toBe('AcceptableAbsence')
      expect(subReasonSelector().props().value).toBe('Courses')
      expect(commentInput.props().value).toBe('Acceptable reason comment')
    })

    it('should have the correct initial values if user has not been paid', () => {
      props.offender.attendanceInfo = {
        id: 2,
        paid: false,
        absentReason: {
          value: 'UnacceptableAbsence',
          name: 'Unacceptable',
        },
        absentSubReason: 'Courses',
        comments: 'Uncceptable reason comment',
      }
      buildWrapper(mount(<AttendanceOtherForm {...props} />))
      expect(yesRadio.props().checked).toBe(false)
      expect(noRadio.props().checked).toBe(true)
      expect(reasonSelector().props().value).toBe('UnacceptableAbsence')
      expect(subReasonSelector().props().value).toBe('Courses')
      expect(commentInput.props().value).toBe('Uncceptable reason comment')
    })
  })
})
