import React from 'react'
import { shallow } from 'enzyme'
import * as axios from 'axios'

import PayOffender from '.'

jest.mock('axios')

describe('<PayOffender />', () => {
  let wrapper
  let checkbox

  describe('without all props', () => {
    it('should render without crashing', () => {
      wrapper = shallow(<PayOffender />)

      expect(wrapper).toHaveLength(1)
    })

    it('should not render a checkbox when missing an eventId', () => {
      wrapper = shallow(<PayOffender offenderNo="A123" />)

      expect(wrapper.find('Checkbox')).toHaveLength(0)
    })

    it('should not render a checkbox when missing an offenderNo', () => {
      wrapper = shallow(<PayOffender eventId={456} />)

      expect(wrapper.find('Checkbox')).toHaveLength(0)
    })
  })

  describe('with all props', () => {
    const props = { offenderNo: 'A123', eventId: 456 }

    beforeEach(() => {
      wrapper = shallow(<PayOffender {...props} />)
      checkbox = wrapper.find('Checkbox')
    })

    it('should render a checkbox', () => {
      expect(wrapper.find('Checkbox')).toHaveLength(1)
    })

    describe('when checkbox IS NOT checked and then clicked', () => {
      it('should mark the checkbox as checked', () => {
        expect(wrapper.state().checked).toBe(false)
        checkbox.simulate('change')
        expect(wrapper.state().checked).toBe(true)
      })

      it('should call updateAttendance endpoint with correct parameters', () => {
        checkbox.simulate('change')
        expect(axios.put).toBeCalledWith(
          `/api/updateAttendance?offenderNo=${props.offenderNo}&activityId=${props.eventId}`,
          { eventOutcome: 'ATT', outcomeComment: '', performance: 'STANDARD' }
        )
        axios.put.mockClear()
      })
    })

    describe('when checkbox IS checked and then clicked', () => {
      it('should mark the checkbox as unchecked', () => {
        wrapper.setState({ checked: true })
        checkbox.simulate('change')
        expect(wrapper.state().checked).toBe(false)
      })

      it('should not call updateAttendance endpoint', () => {
        wrapper.setState({ checked: true })
        checkbox.simulate('change')
        expect(axios.put).not.toBeCalled()
      })
    })
  })
})
