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

  describe('with less than the minimum permitted characters in the comments input', () => {
    const wrapper = mount(<AttendanceNotRequiredForm {...props} />)
    const comments = 'A'
    wrapper.find('textarea[name="comments"]').simulate('change', { target: { value: comments } })
    const confirmButton = wrapper.find('button[name="confirm"]')

    it('should display correct error and not trigger the submit handler when submitted', () => {
      confirmButton.simulate('submit')
      const errors = wrapper.find('ErrorSummary').find('li')

      expect(errors.first().text()).toEqual('Enter a valid comment')
      expect(props.submitHandler).not.toHaveBeenCalled()
    })
  })

  describe('with no characters in the comments input', () => {
    const wrapper = mount(<AttendanceNotRequiredForm {...props} />)
    const comments = '       '
    wrapper.find('textarea[name="comments"]').simulate('change', { target: { value: comments } })
    const confirmButton = wrapper.find('button[name="confirm"]')

    it('should display correct errors and not trigger the submit handler when submitted', () => {
      confirmButton.simulate('submit')
      const errors = wrapper.find('ErrorSummary').find('li')

      expect(errors.first().text()).toEqual('Enter comment')
      expect(props.submitHandler).not.toHaveBeenCalled()
    })
  })

  describe('with valid form values', () => {
    const wrapper = mount(<AttendanceNotRequiredForm {...props} />)
    const comments = 'A supporting comment.'
    wrapper.find('textarea[name="comments"]').simulate('change', { target: { value: comments } })
    const confirmButton = wrapper.find('button[name="confirm"]')

    it('should NOT have a disabled confirm/form submit button', () => {
      expect(confirmButton.prop('disabled')).toBe(false)
    })

    it('should trigger the submit handler when submitted', () => {
      confirmButton.simulate('submit')

      expect(props.submitHandler).toHaveBeenCalledWith({ comments })
    })
  })
})
