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
      eventId: '123',
      eventLocationId: '456',
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
        { value: 'UnacceptableAbsenceIncentiveLevelWarning', name: 'Unacceptable' },
        { value: 'Refused', name: 'Refused' },
        { value: 'RestDay', name: 'Rest day' },
      ],
      unpaidReasonsWithoutIep: [
        { value: 'UnacceptableAbsence', name: 'Unacceptable' },
        { value: 'Refused', name: 'Refused' },
        { value: 'RestDay', name: 'Rest day' },
      ],
      triggersIEP: ['UnacceptableAbsence', 'Refused'],
      triggersAbsentSubReason: [
        'AcceptableAbsence',
        'Refused',
        'RefusedIncentiveLevelWarning',
        'SessionCancelled',
        'UnacceptableAbsence',
        'UnacceptableAbsenceIncentiveLevelWarning',
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
  let payYesRadio = {}
  let payNoRadio = {}
  let iepYesRadio = () => ({})
  let iepNoRadio = () => ({})
  let reasonSelector = () => ({})
  let reasonsRadio = () => ({})
  let subReasonSelector = () => ({})
  let commentInput = {}

  const buildWrapper = (wrappedComponent) => {
    wrapper = wrappedComponent
    payYesRadio = wrappedComponent.find('input[name="pay"][value="yes"]')
    payNoRadio = wrappedComponent.find('input[name="pay"][value="no"]')
    reasonsRadio = (reason) => wrappedComponent.find(`input[name="absentReason"][value="${reason}"]`)
    reasonSelector = () => wrappedComponent.find('input[name="absentReason"]')
    subReasonSelector = () => wrappedComponent.find('select[name="absentSubReason"]')
    commentInput = wrappedComponent.find('textarea[name="comments"]')
    iepYesRadio = () => wrappedComponent.find('input[name="iep"][value="yes"]')
    iepNoRadio = () => wrappedComponent.find('input[name="iep"][value="no"]')
  }

  const simulatePay = (pay) => {
    if (pay) {
      payYesRadio.instance().checked = true
      payYesRadio.simulate('change', payYesRadio)
    } else {
      payNoRadio.instance().checked = true
      payNoRadio.simulate('change', payNoRadio)
    }
    wrapper.update()
  }

  const simulateIep = (iep) => {
    if (iep) {
      iepYesRadio().instance().checked = true
      iepYesRadio().simulate('change', iepYesRadio())
    } else {
      iepNoRadio().instance().checked = true
      iepNoRadio().simulate('change', iepNoRadio())
    }
    wrapper.update()
  }

  const simulateReason = (reason) => {
    reasonsRadio(reason).instance().checked = true
    reasonsRadio(reason).simulate('change', reasonsRadio(reason))
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

      const reasons = reasonSelector().map((reason) => reason.props().value)

      expect(reasons).toEqual(['UnacceptableAbsence', 'Refused', 'RestDay'])
    })

    it('should not display absent reasons by default', () => {
      expect(reasonSelector().length).toEqual(0)
    })

    it('should not display any absent sub reasons by default', () => {
      expect(subReasonSelector().getElements().length).toEqual(0)
    })

    it('should display paid reasons when "other" is selected', () => {
      simulatePay(true)

      const skipDefaultEntry = 1
      const reasons = reasonSelector().map((reason) => reason.props().value)

      expect(reasons).toEqual(['AcceptableAbsence', 'ApprovedCourse'])
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
        eventId: '123',
        eventLocationId: '456',
        offenderNo: 'ABC123',
      }

      simulatePay(true)
      simulateReason('AcceptableAbsence')
      simulateSubReason('Courses')

      // changing reason should then clear the sub reason
      simulatePay(false)
      reasonSelector().forEach((n) => {
        expect(n.props().checked).toEqual(false)
      })
      simulateReason('RestDay')
      expect(subReasonSelector().getElements().length).toEqual(0)
      simulateReason('Refused')
      simulateSubReason('Courses')
      simulateIep(true)

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

        expect(errors.at(0).text()).toEqual('Select if you want to pay Test Offender')
        expect(errors.at(1).text()).toEqual('Enter more details')
      })

      it('should display correct errors for missing pay reason value', async () => {
        simulatePay(true)
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select why you want to pay Test Offender')
        expect(errors.at(1).text()).toEqual('Enter more details')
      })

      it('should display correct errors for missing not pay reason value', async () => {
        simulatePay(false)
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select why Test Offender did not attend')
        expect(errors.at(1).text()).toEqual('Enter more details')
      })

      it('should display correct errors for missing sub reason value', async () => {
        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select an absence reason')
        expect(errors.at(1).text()).toEqual('Select if you want to add an incentive level warning')
        expect(errors.at(2).text()).toEqual('Enter more details')
      })

      it('should display correct errors for missing iep value', async () => {
        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        simulateSubReason('Behaviour')
        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select if you want to add an incentive level warning')
      })

      it('should display error message if more details are required', async () => {
        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        simulateSubReason('Behaviour')
        simulateIep(true)

        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Enter more details')
      })

      it('should show validation message if the minimum amount of characters have not been entered', async () => {
        simulatePay(true)
        simulateReason('AcceptableAbsence')
        simulateSubReason('Courses')

        commentInput.instance().value = 'AB '

        commentInput.simulate('change', commentInput)
        wrapper.update()

        await submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Enter more details using 3 or more characters')
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
          eventId: '123',
          eventLocationId: '456',
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
            value: 'UnacceptableAbsenceIncentiveLevelWarning',
            name: 'Unacceptable',
          },
          absentSubReason: 'Behaviour',
          attended: false,
          comments: 'A supporting comment.',
          eventId: '123',
          eventLocationId: '456',
          offenderNo: 'ABC123',
        }

        simulatePay(false)
        simulateReason('UnacceptableAbsence')
        simulateSubReason('Behaviour')
        simulateIep(true)

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
              caseNote: 'Unacceptable - incentive level warning - Behaviour. A supporting comment.',
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
      expect(payYesRadio.props().checked).toBe(true)
      expect(payNoRadio.props().checked).toBe(false)
      expect(reasonsRadio('AcceptableAbsence').props().checked).toEqual(true)
      expect(subReasonSelector().props().value).toBe('Courses')
      expect(commentInput.props().value).toBe('Acceptable reason comment')
    })

    it('should have the correct initial values if user has not been paid', () => {
      props.offender.attendanceInfo = {
        id: 2,
        paid: false,
        absentReason: {
          value: 'UnacceptableAbsenceIncentiveLevelWarning',
          name: 'Unacceptable',
        },
        absentSubReason: 'Courses',
        comments: 'Uncceptable reason comment',
      }
      buildWrapper(mount(<AttendanceOtherForm {...props} />))
      expect(payYesRadio.props().checked).toBe(false)
      expect(payNoRadio.props().checked).toBe(true)
      expect(reasonsRadio('UnacceptableAbsence').props().checked).toEqual(true)
      expect(subReasonSelector().props().value).toBe('Courses')
      expect(iepYesRadio().props().checked).toBe(true)
      expect(iepNoRadio().props().checked).toBe(false)
      expect(commentInput.props().value).toBe('Uncceptable reason comment')
    })
  })
})
