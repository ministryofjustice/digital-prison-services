import React from 'react'
import moment from 'moment'
import { shallow } from 'enzyme'
import WhereaboutsDatePicker from './WhereaboutsDatePicker'

describe('<WhereaboutsDatePicker />', () => {
  const props = {
    handleDateChange: jest.fn(),
    date: '01/04/2019',
  }
  const wrapper = shallow(<WhereaboutsDatePicker {...props} />)

  it('should render <FormDatePicker /> with the correct props', () => {
    const formDatePickerInputProps = wrapper.find('FormDatePicker').props().input

    expect(formDatePickerInputProps.onChange).toEqual(props.handleDateChange)
    expect(formDatePickerInputProps.value).toEqual(props.date)
  })

  describe('daysToShow() future dates', () => {
    let dateNowSpy

    afterEach(() => dateNowSpy.mockRestore())

    it('should return the following Monday if Friday', () => {
      dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // "Fri Mar 29 2019 12:00:00 GMT+0000"
      const followingMonday = moment()
        .add(3, 'day')
        .startOf('day')

      const dayAfterMonday = moment(followingMonday)
        .add(1, 'day')
        .startOf('day')

      expect(wrapper.instance().daysToShow(followingMonday)).toEqual(true)
      expect(wrapper.instance().daysToShow(dayAfterMonday)).toEqual(false)
    })

    it('should return just Tomorrow if not Friday', () => {
      dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 1553774400000) // "Thu Mar 28 2019 12:00:00 GMT+0000"
      const tomorrow = moment()
        .add(1, 'day')
        .startOf('day')
      const dayAfterTomorrow = moment(tomorrow)
        .add(1, 'days')
        .startOf('day')

      expect(wrapper.instance().daysToShow(tomorrow)).toEqual(true)
      expect(wrapper.instance().daysToShow(dayAfterTomorrow)).toEqual(false)
    })
  })
})
