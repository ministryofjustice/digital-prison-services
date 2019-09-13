import React from 'react'
import { mount } from 'enzyme'
import AttendanceNotRequiredForm from './AttendanceNotRequiredForm'

describe('<AttendanceNotRequiredForm />', () => {
  const props = {
    showModal: jest.fn(),
    submitHandler: jest.fn(),
  }

  describe('by default', () => {
    const wrapper = mount(<AttendanceNotRequiredForm {...props} />)
    const confirmButton = wrapper.find('button[name="confirm"]')
    const cancelButton = wrapper.find('ButtonCancel')

    it('should have a disabled confirm/form submit button', () => {
      expect(confirmButton.prop('disabled')).toBe(true)
    })

    it('should close the modal when clicking cancel', () => {
      cancelButton.props().onClick()
      expect(props.showModal).toBeCalledWith(false)
    })
  })

  describe('with form values', () => {
    const wrapper = mount(<AttendanceNotRequiredForm {...props} />)
    wrapper.find('textarea[name="comments"]').simulate('change', { target: { value: 'A supporting comment.' } })
    const confirmButton = wrapper.find('button[name="confirm"]')

    it('should NOT have a disabled confirm/form submit button', () => {
      expect(confirmButton.prop('disabled')).toBe(false)
    })

    it('should trigger the submit handler when submitted', () => {
      confirmButton.simulate('submit')

      expect(props.submitHandler).toHaveBeenCalled()
    })
  })
})
