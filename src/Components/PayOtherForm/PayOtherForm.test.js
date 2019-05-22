import React from 'react'
import { mount } from 'enzyme'
import { PayOtherForm } from './PayOtherForm'

describe('<PayOtherForm />', () => {
  const submitForm = formWrapper => {
    formWrapper.find('form').simulate('submit')
    formWrapper.update()
  }

  const props = {
    cancelHandler: jest.fn(),
    offender: {
      id: 'ABC123',
      firstName: 'Test',
      lastName: 'Offender',
      eventId: 123,
      eventLocationId: 456,
      offenderIndex: 1,
    },
    updateOffenderAttendance: jest.fn(),
    absentReasons: [
      { value: 'AcceptableAbsence', name: 'Acceptable absence' },
      { value: 'UnacceptableAbsence', name: 'Unacceptable absence' },
    ],
    initialValues: {},
  }

  const wrapper = mount(<PayOtherForm {...props} />)
  const yesRadio = wrapper.find('input[value="yes"]')
  const noRadio = wrapper.find('input[value="no"]')
  const reasonSelector = wrapper.find('select[name="reason"]')
  const commentInput = wrapper.find('textarea[name="comment"]')

  it('should display the correct offender name', () => {
    expect(wrapper.find('legend').text()).toEqual('Do you want to pay Offender, Test?')
  })

  it('should trigger the cancel handler when clicking cancel', () => {
    const cancelButton = wrapper.find('ButtonCancel')

    cancelButton.props().onClick()
    expect(props.cancelHandler).toHaveBeenCalled()
  })

  describe('on error', () => {
    it('should display correct errors for missing values', () => {
      submitForm(wrapper)

      const errors = wrapper.find('ErrorSummary').find('li')

      expect(errors.at(0).text()).toEqual('Select a pay option')
      expect(errors.at(1).text()).toEqual('Select a reason')
      expect(errors.at(2).text()).toEqual('Enter a comment')
    })

    it('should change error message if a case note is required', () => {
      reasonSelector.instance().value = 'UnacceptableAbsence'
      reasonSelector.simulate('change', reasonSelector)

      submitForm(wrapper)

      const errors = wrapper.find('ErrorSummary').find('li')

      expect(errors.at(1).text()).toEqual('Enter a case note')
    })
  })

  describe('on success', () => {
    beforeEach(() => {
      reasonSelector.instance().value = 'UnacceptableAbsence'
      reasonSelector.simulate('change', reasonSelector)

      commentInput.instance().value = 'A supporting comment.'
      commentInput.simulate('change', commentInput)

      submitForm(wrapper)
    })

    const expectedPayload = {
      absentReason: 'UnacceptableAbsence',
      attended: false,
      comment: 'A supporting comment.',
      eventId: 123,
      eventLocationId: 456,
      offenderNo: 'ABC123',
    }

    it('should submit with the correct, paid information', () => {
      yesRadio.instance().checked = true
      yesRadio.simulate('change', yesRadio)

      submitForm(wrapper)

      expect(props.updateOffenderAttendance).toHaveBeenCalledWith({ ...expectedPayload, paid: true }, 1)
    })

    it('should submit with the correct, unpaid information', () => {
      noRadio.instance().checked = true
      noRadio.simulate('change', noRadio)

      submitForm(wrapper)

      expect(props.updateOffenderAttendance).toHaveBeenCalledWith({ ...expectedPayload, paid: false }, 1)
    })
  })
})
