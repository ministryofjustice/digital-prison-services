import React from 'react'
import { mount } from 'enzyme'
import { IncentiveLevelChangeForm } from './IncentiveLevelChangeForm'

describe('<IncentiveLevelChangeForm />', () => {
  const submitForm = formWrapper => {
    formWrapper.find('form').simulate('submit')
    formWrapper.update()
  }
  const props = {
    cancelHandler: jest.fn(),
    changeIepLevel: jest.fn(),
    levels: [{ title: 'Basic', value: 'BAS' }, { title: 'Enhanced', value: 'ENH' }],
    initialValues: {},
  }

  let wrapper = {}
  let basicRadio = {}
  let reasonInput = {}

  beforeEach(() => {
    wrapper = mount(<IncentiveLevelChangeForm {...props} />)
    basicRadio = wrapper.find('input[value="BAS"]')
    reasonInput = wrapper.find('textarea[name="reason"]')
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

      expect(errors.at(0).text()).toEqual('Enter reason for Incentive Level change')
      expect(errors.at(1).text()).toEqual('Select a level')
    })

    it('should change error message if reason is longer than 240 char', () => {
      basicRadio.instance().checked = true
      basicRadio.simulate('change', basicRadio)

      reasonInput.instance().value =
        'UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsence UnacceptableAbsenc UnacceptableAbsenc UnacceptableAbsenc UnacceptableAbsenc UnacceptableAbsence'
      reasonInput.simulate('change', reasonInput)

      wrapper.update()

      submitForm(wrapper)

      const errors = wrapper.find('ErrorSummary').find('li')
      expect(errors.at(0).text()).toEqual('Reason must be 240 characters or less')
    })
  })

  describe('on success', () => {
    it('should submit with the correct, paid information', () => {
      const expectedPayload = {
        level: 'BAS',
        reason: 'A supporting comment.',
      }

      reasonInput.instance().value = 'A supporting comment.'
      reasonInput.simulate('change', reasonInput)

      basicRadio.instance().checked = true
      basicRadio.simulate('change', basicRadio)
      wrapper.update()

      submitForm(wrapper)

      expect(props.changeIepLevel).toHaveBeenCalledWith({ ...expectedPayload })
    })
  })
})
