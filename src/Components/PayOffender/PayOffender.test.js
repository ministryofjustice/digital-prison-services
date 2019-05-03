// Disabled temporarily while switching to PayOptions

import React from 'react'
import { shallow } from 'enzyme'
import * as axios from 'axios'

import PayOffender from '.'

jest.mock('axios')

describe.skip('<PayOffender />', () => {
  let wrapper
  let radio

  describe('without all props', () => {
    it('should render without crashing', () => {
      wrapper = shallow(<PayOffender />)

      expect(wrapper).toHaveLength(1)
    })

    it('should not render a radio when missing an eventId', () => {
      wrapper = shallow(<PayOffender offenderNo="A123" />)

      expect(wrapper.find('Radio')).toHaveLength(0)
    })

    it('should not render a radio when missing an offenderNo', () => {
      wrapper = shallow(<PayOffender eventId={456} />)

      expect(wrapper.find('Radio')).toHaveLength(0)
    })
  })

  describe('with all props', () => {
    const props = { offenderNo: 'A123', eventId: 456 }

    beforeEach(() => {
      wrapper = shallow(<PayOffender {...props} />)
      radio = wrapper.find('Radio')
    })

    it('should render a radio', () => {
      expect(radio).toHaveLength(1)
    })

    describe('when radio IS NOT checked and then clicked', () => {
      it('should mark the radio as checked', () => {
        expect(wrapper.state().checked).toBe(false)
        radio.simulate('change')
        expect(wrapper.state().checked).toBe(true)
      })

      it('should call updateAttendance endpoint with correct parameters', () => {
        radio.simulate('change')
        expect(axios.put).toBeCalledWith(
          `/api/updateAttendance?offenderNo=${props.offenderNo}&activityId=${props.eventId}`,
          { eventOutcome: 'ATT', outcomeComment: '', performance: 'STANDARD' }
        )
        axios.put.mockClear()
      })
    })

    describe('when radio IS checked and then clicked', () => {
      beforeEach(() => {
        wrapper.setState({ checked: true })
        radio = wrapper.find('Radio')
        radio.simulate('change')
      })

      it('should mark the radio as unchecked', () => {
        expect(wrapper.state().checked).toBe(false)
      })

      it('should not call updateAttendance endpoint', () => {
        expect(axios.put).not.toBeCalled()
      })
    })
  })
})
