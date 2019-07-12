import React from 'react'
import { mount } from 'enzyme'
import { PayOtherForm } from './PayOtherForm'

describe('<PayOtherForm />', () => {
  const submitForm = formWrapper => {
    formWrapper.find('form').simulate('submit')
    formWrapper.update()
  }

  const sharedProps = {
    cancelHandler: jest.fn(),
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
      paidReasons: [{ value: 'AcceptableAbsence', name: 'Acceptable' }],
      unpaidReasons: [{ value: 'UnacceptableAbsence', name: 'Unacceptable' }, { value: 'Refused', name: 'Refused' }],
    },
  }

  let wrapper = {}
  let yesRadio = {}
  let noRadio = {}
  let reasonSelector = {}
  let commentInput = {}

  const buildWrapper = wrappedComponent => {
    wrapper = wrappedComponent
    yesRadio = wrappedComponent.find('input[value="yes"]')
    noRadio = wrappedComponent.find('input[value="no"]')
    reasonSelector = wrappedComponent.find('select[name="absentReason"]')
    commentInput = wrappedComponent.find('textarea[name="comments"]')
  }

  describe('with no initial values', () => {
    const props = { ...sharedProps }
    beforeEach(() => buildWrapper(mount(<PayOtherForm {...props} />)))

    it('should display the correct offender name', () => {
      expect(wrapper.find('legend').text()).toEqual('Do you want to pay Test Offender?')
    })

    it('should trigger the cancel handler when clicking cancel', () => {
      const cancelButton = wrapper.find('ButtonCancel')

      cancelButton.props().onClick()
      expect(props.cancelHandler).toHaveBeenCalled()
    })

    it('should display paid reasons when "pay" is selected', () => {
      noRadio.instance().checked = true
      noRadio.simulate('change', noRadio)
      wrapper.update()

      const skipDefaultEntry = 1
      const reasons = wrapper
        .find('select[name="absentReason"]')
        .getElement()
        .props.children[skipDefaultEntry].map(reason => reason.props)

      expect(reasons).toEqual([
        { value: 'UnacceptableAbsence', children: 'Unacceptable' },
        { value: 'Refused', children: 'Refused' },
      ])
    })

    it('should not display any absent reasons by default', () => {
      const skipDefaultEntry = 1
      const reasons = wrapper
        .find('select[name="absentReason"]')
        .getElement()
        .props.children[skipDefaultEntry].map(reason => reason.props)

      expect(reasons).toEqual([])
    })

    it('should display paid reasons when "other" is selected', () => {
      yesRadio.instance().checked = true
      yesRadio.simulate('change', noRadio)
      wrapper.update()

      const skipDefaultEntry = 1
      const reasons = wrapper
        .find('select[name="absentReason"]')
        .getElement()
        .props.children[skipDefaultEntry].map(reason => reason.props)

      expect(reasons).toEqual([{ value: 'AcceptableAbsence', children: 'Acceptable' }])
    })

    describe('on error', () => {
      it('should display correct errors for missing values', () => {
        submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')

        expect(errors.at(0).text()).toEqual('Select a pay option')
        expect(errors.at(1).text()).toEqual('Select a reason')
        expect(errors.at(2).text()).toEqual('Enter comments')
      })

      it('should change error message if a case note is required', () => {
        noRadio.instance().checked = true
        noRadio.simulate('change', noRadio)
        wrapper.update()
        reasonSelector.instance().value = 'UnacceptableAbsence'
        reasonSelector.simulate('change', reasonSelector)

        submitForm(wrapper)

        const errors = wrapper.find('ErrorSummary').find('li')
        expect(errors.at(0).text()).toEqual('Enter case note')
      })
    })

    describe('on success', () => {
      beforeEach(() => {
        commentInput.instance().value = 'A supporting comment.'
        commentInput.simulate('change', commentInput)

        submitForm(wrapper)
      })

      it('should submit with the correct, paid information', () => {
        const expectedPayload = {
          absentReason: {
            name: 'Acceptable',
            value: 'AcceptableAbsence',
          },
          attended: false,
          comments: 'A supporting comment.',
          eventId: 123,
          eventLocationId: 456,
          offenderNo: 'ABC123',
        }

        yesRadio.instance().checked = true
        yesRadio.simulate('change', noRadio)
        wrapper.update()

        reasonSelector.instance().value = 'AcceptableAbsence'
        reasonSelector.simulate('change', reasonSelector)

        submitForm(wrapper)

        expect(props.updateOffenderAttendance).toHaveBeenCalledWith({ ...expectedPayload, paid: true }, 1)
      })

      it('should submit with the correct, unpaid information', () => {
        const expectedPayload = {
          absentReason: {
            value: 'UnacceptableAbsence',
            name: 'Unacceptable',
          },
          attended: false,
          comments: 'A supporting comment.',
          eventId: 123,
          eventLocationId: 456,
          offenderNo: 'ABC123',
        }

        noRadio.instance().checked = true
        noRadio.simulate('change', noRadio)
        wrapper.update()

        reasonSelector.instance().value = 'UnacceptableAbsence'
        reasonSelector.simulate('change', reasonSelector)

        submitForm(wrapper)

        expect(props.updateOffenderAttendance).toHaveBeenCalledWith({ ...expectedPayload, paid: false }, 1)
      })
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
        comments: 'Acceptable reason comment',
      }
      buildWrapper(mount(<PayOtherForm {...props} />))
      expect(yesRadio.props().checked).toBe(true)
      expect(noRadio.props().checked).toBe(false)
      expect(reasonSelector.props().value).toBe('AcceptableAbsence')
      expect(commentInput.props().value).toBe('Acceptable reason comment')
    })

    it('should have the correct initial values if user has not been paid', () => {
      props.offender.attendanceInfo = {
        id: 2,
        paid: false,
        absentReason: {
          value: 'UncceptableAbsence',
          name: 'Unacceptable',
        },
        comments: 'Uncceptable reason comment',
      }
      buildWrapper(mount(<PayOtherForm {...props} />))
      expect(yesRadio.props().checked).toBe(false)
      expect(noRadio.props().checked).toBe(true)
      expect(reasonSelector.props().value).toBe('UncceptableAbsence')
      expect(commentInput.props().value).toBe('Uncceptable reason comment')
    })
  })
})
