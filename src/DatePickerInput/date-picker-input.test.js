import React from 'react'
import moment from 'moment'
import { shallow } from 'enzyme'
import DatePickerInput, { futureDateOnly, pastDateOnly } from './index'

describe('Date picker input', () => {
  describe('date picker input component', () => {
    it('should render correctly with default props', () => {
      const wrapper = shallow(
        <DatePickerInput
          handleDateChange={() => {}}
          inputId="date"
          label="date"
          placeholder="select date"
          value="2018-10-10"
        />
      )
      expect(wrapper.getElement().props.shouldShowDay).toBe(pastDateOnly)
      expect(wrapper).toMatchSnapshot()
    })

    it('should render with error', () => {
      const wrapper = shallow(<DatePickerInput error="there was an error" handleDateChange={() => {}} inputId="date" />)
      expect(wrapper).toMatchSnapshot()
    })

    it('should render with futureDates validator', () => {
      const wrapper = shallow(
        <DatePickerInput
          handleDateChange={() => {}}
          inputId="date"
          label="date"
          placeholder="select date"
          value="2018-10-10"
          futureOnly
        />
      )
      expect(wrapper.getElement().props.shouldShowDay).toBe(futureDateOnly)
    })
  })

  describe('past dates only', () => {
    it('should return true for yesterday', () => {
      const yesterday = moment().subtract(1, 'days')
      expect(pastDateOnly(yesterday)).toBe(true)
    })
    it('should return true for today', () => {
      expect(pastDateOnly(moment())).toBe(true)
    })
    it('should return true for tomorrow', () => {
      const tomorrow = moment().add(1, 'days')
      expect(pastDateOnly(tomorrow)).toBe(true)
    })
    it('should return false for the day after tomorrow', () => {
      const dayAfterTomorrow = moment().add(2, 'days')
      expect(pastDateOnly(dayAfterTomorrow)).toBe(false)
    })
  })

  describe('future dates only', () => {
    it('should return false for day before yesterday', () => {
      const yesterday = moment().subtract(2, 'days')
      expect(futureDateOnly(yesterday)).toBe(false)
    })
    it('should return true for today', () => {
      expect(futureDateOnly(moment())).toBe(true)
    })
    it('should return true for tomorrow', () => {
      const tomorrow = moment().add(1, 'days')
      expect(futureDateOnly(tomorrow)).toBe(true)
    })
  })
})
