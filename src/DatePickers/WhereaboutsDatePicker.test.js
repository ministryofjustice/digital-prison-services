import React from 'react'
import moment from 'moment'
import { shallow } from 'enzyme'
import WhereaboutsDatePicker from './WhereaboutsDatePicker'

describe('<WhereaboutsDatePicker />', () => {
  const props = {
    handleDateChange: jest.fn(),
    date: '01/04/2019',
  }

  let wrapper = shallow(<WhereaboutsDatePicker {...props} />)

  beforeAll(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
  })

  afterAll(() => {
    Date.now.mockRestore()
  })

  it('should render <FormDatePicker /> with the correct props', () => {
    const formDatePickerInputProps = wrapper.find('FormDatePicker').props().input

    expect(formDatePickerInputProps.onChange).toEqual(props.handleDateChange)
    expect(formDatePickerInputProps.value).toEqual(props.date)
  })

  describe('daysToShow() future dates', () => {
    it('should only return the following 7 days from today', () => {
      const seventhDay = moment()
        .add(7, 'day')
        .startOf('day')

      const eigthDay = moment(seventhDay)
        .add(1, 'day')
        .startOf('day')

      expect(wrapper.instance().daysToShow(seventhDay)).toEqual(true)
      expect(wrapper.instance().daysToShow(eigthDay)).toEqual(false)
    })

    it('should use the shouldShowDay prop if present', () => {
      const pastAndPresentDay = date =>
        date.isBefore(
          moment()
            .add(1, 'days')
            .startOf('day')
        )

      wrapper = shallow(<WhereaboutsDatePicker {...props} shouldShowDay={pastAndPresentDay} />)

      const tomorrow = moment()
        .add(1, 'day')
        .startOf('day')

      const daysToShowSpy = jest.spyOn(wrapper.instance(), 'daysToShow')
      expect(daysToShowSpy).not.toBeCalled()
      expect(wrapper.props().shouldShowDay(tomorrow)).toEqual(false)
    })
  })
})
