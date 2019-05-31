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
      offenderNo: 'ABC123',
      firstName: 'Test',
      lastName: 'Offender',
      eventId: 123,
      eventLocationId: 456,
      offenderIndex: 1,
    },
    updateOffenderAttendance: jest.fn(),
    absentReasons: {
      paidReasons: [{ value: 'AcceptableAbsence', name: 'Acceptable absence' }],
      unpaidReasons: [
        { value: 'UnacceptableAbsence', name: 'Unacceptable absence' },
        { value: 'Refused', name: 'Refused' },
      ],
    },
    initialValues: {},
  }

  let wrapper = {}
  let yesRadio = {}
  let noRadio = {}
  let reasonSelector = {}
  let commentInput = {}

  beforeEach(() => {
    wrapper = mount(<PayOtherForm {...props} />)
    yesRadio = wrapper.find('input[value="yes"]')
    noRadio = wrapper.find('input[value="no"]')
    reasonSelector = wrapper.find('select[name="reason"]')
    commentInput = wrapper.find('textarea[name="comments"]')
  })

  it('should display the correct offender name', () => {
    expect(wrapper.find('legend').text()).toEqual('Do you want to pay Offender, Test?')
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
      .find('select[name="reason"]')
      .getElement()
      .props.children[skipDefaultEntry].map(reason => reason.props)

    expect(reasons).toEqual([
      { value: 'UnacceptableAbsence', children: 'Unacceptable absence' },
      { value: 'Refused', children: 'Refused' },
    ])
  })

  it('should not display any absent reasons by default', () => {
    const skipDefaultEntry = 1
    const reasons = wrapper
      .find('select[name="reason"]')
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
      .find('select[name="reason"]')
      .getElement()
      .props.children[skipDefaultEntry].map(reason => reason.props)

    expect(reasons).toEqual([{ value: 'AcceptableAbsence', children: 'Acceptable absence' }])
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
        absentReason: 'AcceptableAbsence',
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
        absentReason: 'UnacceptableAbsence',
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
