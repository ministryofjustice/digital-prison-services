import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import { DATE_TIME_FORMAT_SPEC } from '../../dateHelpers'

import TimePicker from './TimePicker'

const setTime = (date, hours, minutes, seconds) => {
  date.hours(hours)
  date.minutes(minutes)
  date.seconds(seconds)

  return date.format(DATE_TIME_FORMAT_SPEC)
}

describe('Time picker', () => {
  it('should disable the component until a date has been passed in', () => {
    const picker = shallow(<TimePicker now={moment()} input={{ name: 'picker' }} />)

    const selectHours = picker.find({ name: 'hours' }).getElement().props
    const selectMinutes = picker.find({ name: 'minutes' }).getElement().props

    expect(selectHours.disabled).toBe(true)
    expect(selectMinutes.disabled).toBe(true)
  })

  it('should not disable the component when a date has been passed in', () => {
    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={moment()} input={{ name: 'picker' }} />)
    const selectHours = picker.find({ name: 'hours' }).getElement().props
    const selectMinutes = picker.find({ name: 'minutes' }).getElement().props

    expect(selectHours.disabled).toBe(false)
    expect(selectMinutes.disabled).toBe(false)
  })

  it('should use the date passed in along with hours and minutes selected to construct a date time', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={moment()} input={input} />)
    const instance = picker.instance()

    instance.onHoursChange({
      target: {
        value: '21',
      },
    })

    instance.onMinutesChange({
      target: {
        value: '21',
      },
    })

    expect(input.onChange).toBeCalledWith('2017-10-10T21:21:00')
  })

  it('should only show hours after now', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment('2017-10-10T20:40:00')
    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={now} input={input} futureTimeOnly />)
    const hours = picker
      .find({ name: 'hours' })
      .getElement()
      .props.children.map(item => item.key)
    const minutes = picker
      .find({ name: 'minutes' })
      .getElement()
      .props.children.map(item => item.key)

    expect(hours.length).toBe(5)
    expect(hours[1]).toBe('20')
    expect(hours[2]).toBe('21')
    expect(hours[3]).toBe('22')
    expect(hours[4]).toBe('23')

    expect(minutes.length).toBe(13)
  })

  it('should only show hours before now', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment('2017-10-10T03:15:00')
    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={now} input={input} pastTimeOnly />)
    const hours = picker
      .find({ name: 'hours' })
      .getElement()
      .props.children.map(item => item.key)
    const minutes = picker
      .find({ name: 'minutes' })
      .getElement()
      .props.children.map(item => item.key)

    expect(hours.length).toBe(5)
    expect(hours[1]).toBe('00')
    expect(hours[2]).toBe('01')
    expect(hours[3]).toBe('02')
    expect(hours[4]).toBe('03')

    expect(minutes.length).toBe(13)
  })

  it('should not constrain hours or minutes when the date is not equal to today', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment('2017-10-10T03:15:00Z')
    const picker = shallow(<TimePicker date={moment('2017-09-10')} now={now} input={input} futureTimeOnly />)
    const hours = picker
      .find({ name: 'hours' })
      .getElement()
      .props.children.map(item => item.key)
    const minutes = picker
      .find({ name: 'minutes' })
      .getElement()
      .props.children.map(item => item.key)

    expect(hours.length).toBe(25)
    expect(minutes.length).toBe(13)
  })

  it('should only show minutes after now when futureTimeOnly is enabled', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment('2017-10-10T20:45:00')
    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={now} input={input} futureTimeOnly />)
    const instance = picker.instance()

    instance.onHoursChange({
      target: {
        value: '20',
      },
    })

    const minutes = picker
      .find({ name: 'minutes' })
      .getElement()
      .props.children.map(item => item.key)

    expect(minutes.length).toBe(4)
    expect(minutes[1]).toBe('45')
    expect(minutes[2]).toBe('50')
    expect(minutes[3]).toBe('55')
  })

  it('should only show minutes before now when pastTimeOnly is enabled', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment('2017-10-10T03:30:00')
    const picker = shallow(<TimePicker date={moment('2017-10-10')} now={now} input={input} pastTimeOnly />)
    const instance = picker.instance()

    instance.onHoursChange({
      target: {
        value: '03',
      },
    })

    const hours = picker
      .find({ name: 'hours' })
      .getElement()
      .props.children.map(item => item.key)
    const minutes = picker
      .find({ name: 'minutes' })
      .getElement()
      .props.children.map(item => item.key)

    expect(hours.length).toBe(5)
    expect(hours[1]).toBe('00')
    expect(hours[2]).toBe('01')
    expect(hours[3]).toBe('02')
    expect(hours[4]).toBe('03')

    expect(minutes.length).toBe(8)
    expect(minutes[1]).toBe('00')
    expect(minutes[2]).toBe('05')
    expect(minutes[3]).toBe('10')
    expect(minutes[4]).toBe('15')
    expect(minutes[5]).toBe('20')
    expect(minutes[6]).toBe('25')
    expect(minutes[7]).toBe('30')
  })

  it('should reset input when the hour value has been cleared', () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const picker = shallow(<TimePicker date={moment('2017-10-10')} input={input} now={moment()} />)
    const instance = picker.instance()

    instance.onHoursChange({
      target: {
        value: '03',
      },
    })

    expect(input.onChange.mock.calls[0][0]).toBe('2017-10-10T03:00:00')

    instance.onHoursChange({
      target: {},
    })

    expect(input.onChange.mock.calls[1][0]).toBe('')
  })

  it("should default to today's date when no date has been past in", () => {
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const picker = shallow(<TimePicker input={input} now={moment()} />)
    const instance = picker.instance()

    instance.onHoursChange({
      target: {
        value: '03',
      },
    })

    instance.onMinutesChange({
      target: {
        value: '04',
      },
    })

    const today = moment()
    today.hour(3)
    today.minute(4)
    today.second(0)

    expect(input.onChange).toHaveBeenCalledWith(today.format(DATE_TIME_FORMAT_SPEC))
  })

  it('should call on change when input.value when present during componentDidMount', () => {
    const yesterday = moment().subtract(1, 'day')
    const now = moment()

    const input = {
      onChange: jest.fn(),
      value: setTime(yesterday, 3, 0, 0),
      name: 'timePicker',
    }

    shallow(<TimePicker input={input} date={yesterday} now={now} />)

    expect(input.onChange.mock.calls[0][0]).toBe(setTime(yesterday, 3, 0, 0))
  })

  it('should reset the date when a new one has been passed in', async () => {
    const yesterday = moment().subtract(1, 'day')
    const now = moment()

    const input = {
      onChange: jest.fn(),
      value: setTime(yesterday, 3, 0, 0),
      name: 'timePicker',
    }

    const picker = shallow(<TimePicker input={input} date={yesterday} now={now} />)

    const today = moment()

    picker.setProps({ input, date: today })

    expect(input.onChange.mock.calls[0][0]).toBe(setTime(yesterday, 3, 0, 0))
    expect(input.onChange.mock.calls[1][0]).toBe(setTime(today, 3, 0, 0))
  })

  it('should default to the current hour and the nearest minute when defaultToNow is set to true', () => {
    const today = moment()
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
    }

    const now = moment()
    now.hours(11)
    now.minutes(11)

    const picker = shallow(<TimePicker input={input} date={today} now={now} initialiseToNow pastTimeOnly />)

    picker.instance().componentDidMount()

    expect(input.onChange).toHaveBeenCalledWith(setTime(now, 11, 10, 0))
    expect(picker.find({ name: 'hours' }).getElement().props.input.value).toBe('11')
    expect(picker.find({ name: 'minutes' }).getElement().props.input.value).toBe('10')
  })

  it('should handle single digit minutes', () => {
    const today = moment('2019-02-22')
    const input = {
      onChange: jest.fn(),
      name: 'timePicker',
      value: '2019-02-22T01:00:00',
    }

    const now = moment()
    const picker = shallow(<TimePicker input={input} date={today} now={now} />)

    expect(input.onChange).toHaveBeenCalledWith(setTime(today, 1, 0, 0))
    expect(picker.find({ name: 'hours' }).getElement().props.input.value).toBe('01')
    expect(picker.find({ name: 'minutes' }).getElement().props.input.value).toBe('00')
  })
})
