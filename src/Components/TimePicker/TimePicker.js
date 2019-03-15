import React, { Component } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'

import Select from '@govuk-react/select'
import LabelText from '@govuk-react/label-text'
import Label from '@govuk-react/label'
import ErrorText from '@govuk-react/error-text'

import { Container } from './TimePicker.styles'
import { inputType, metaType } from '../../types'

import { DATE_TIME_FORMAT_SPEC, DATE_ONLY_FORMAT_SPEC } from '../../dateHelpers'

const validMinutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

export const isValidMinutes = minutes => {
  if (minutes === undefined) return false

  const value = Number(minutes) < 10 ? `0${minutes}` : minutes
  return validMinutes.includes(String(value))
}
const formatNumbersUpTo = total =>
  [...Array(total).keys()].map(i => {
    if (i < 10) return `0${i}`
    return i
  })

const constructHours = ({ dateTime, futureTimeOnly, enableFilters }) => {
  const hours = ['--', ...formatNumbersUpTo(24)]
  if (!enableFilters) {
    return hours
  }
  const filter = futureTimeOnly ? unit => unit >= dateTime.hour() : unit => unit <= dateTime.hour()
  return ['--', ...hours.filter(filter)]
}

const constructMinutes = ({ selectedHour, dateTime, futureTimeOnly, enableFilters }) => {
  const minutes = ['--', ...validMinutes]
  if (!enableFilters) {
    return minutes
  }

  if (dateTime.hour() === parseInt(selectedHour, 10)) {
    const filter = futureTimeOnly ? unit => unit >= dateTime.minute() : unit => unit <= dateTime.minute()
    return ['--', ...minutes.filter(filter)]
  }

  return minutes
}

const addLeadingZeroIfRequired = minutes =>
  Number(minutes) < 10 && String(minutes).length === 1 ? `0${minutes}` : String(minutes)

class TimePicker extends Component {
  constructor() {
    super()
    this.onHoursChange = this.onHoursChange.bind(this)
    this.onMinutesChange = this.onMinutesChange.bind(this)
    this.setInputValue = this.setInputValue.bind(this)
    this.shouldEnableFilters = this.shouldEnableFilters.bind(this)
    this.getNearestMinute = this.getNearestMinute.bind(this)

    this.state = {}
  }

  componentDidMount() {
    const { input, initialiseToNow, now } = this.props
    if (input.value) {
      const date = moment(input.value, DATE_TIME_FORMAT_SPEC)
      this.setInputValue({
        hours: date.hours().toString(),
        minutes: date.minutes().toString(),
      })
    }

    if (initialiseToNow) {
      this.setInputValue({
        hours: now.hours().toString(),
        minutes: this.getNearestMinute().toString(),
      })
    }
  }

  componentWillReceiveProps(newProps) {
    const { input } = this.props

    if (!input.value) {
      return
    }

    const selectedDate = moment(input.value, DATE_TIME_FORMAT_SPEC)
    const newDate = moment(newProps.date, DATE_TIME_FORMAT_SPEC)

    if (selectedDate.format(DATE_ONLY_FORMAT_SPEC) !== newDate.format(DATE_ONLY_FORMAT_SPEC)) {
      newDate.hour(selectedDate.hours())
      newDate.minutes(selectedDate.minutes())
      newDate.seconds(0)
      input.onChange(newDate.format(DATE_TIME_FORMAT_SPEC))
    }
  }

  onHoursChange(event) {
    if (event && event.target) {
      this.setInputValue({
        ...this.state,
        hours: event.target.value,
      })
    }
  }

  onMinutesChange(event) {
    if (event && event.target) {
      this.setInputValue({
        ...this.state,
        minutes: event.target.value,
      })
    }
  }

  setInputValue({ hours, minutes }) {
    const { date, input } = this.props
    if (hours && hours !== '--' && minutes !== '--') {
      const selectedDate = (date && moment(date, DATE_ONLY_FORMAT_SPEC)) || moment()

      selectedDate.hours(parseInt(hours, 10))
      selectedDate.minutes(parseInt(minutes || 0, 10))
      selectedDate.seconds(0)
      input.onChange(selectedDate.format(DATE_TIME_FORMAT_SPEC))
    } else {
      input.onChange('')
    }
    this.setState({
      hours,
      minutes,
    })
  }

  getNearestMinute() {
    const { now, futureTimeOnly, pastTimeOnly } = this.props
    const minutes = constructMinutes({
      selectedHour: now.hour(),
      dateTime: now,
      futureTimeOnly,
      pastTimeOnly,
      enableFilters: this.shouldEnableFilters(),
    })

    return minutes[minutes.length - 1]
  }

  shouldEnableFilters() {
    const { date, now, futureTimeOnly, pastTimeOnly } = this.props
    if (!date || !now) {
      return false
    }

    const isToday = now.isSame(date, 'day')
    return isToday && (futureTimeOnly || pastTimeOnly)
  }

  render() {
    const {
      now,
      date,
      futureTimeOnly,
      pastTimeOnly,
      input: { name },
      label,
      meta,
    } = this.props
    const { hours, minutes } = this.state

    const dateTime = moment(now, DATE_TIME_FORMAT_SPEC)
    const dateOnly = moment(date, DATE_ONLY_FORMAT_SPEC)
    const enableFilters = this.shouldEnableFilters()
    const selectedHour = this.state && hours

    const constructedHours = constructHours({ dateTime, dateOnly, futureTimeOnly, pastTimeOnly, enableFilters })
    const constructedMinutes = constructMinutes({
      selectedHour,
      dateTime,
      dateOnly,
      futureTimeOnly,
      pastTimeOnly,
      enableFilters,
    })

    return (
      <div>
        <Label htmlFor="hours" error={meta.touched && meta.error}>
          {label && <LabelText> {label} </LabelText>}
          {meta.touched && meta.error && <ErrorText>{meta.error}</ErrorText>}
          <Container error={Boolean(meta.error)} name={name}>
            <Select
              disabled={!date}
              name="hours"
              id="hours"
              defaultValue="--"
              input={{
                value: addLeadingZeroIfRequired(hours),
                onChange: this.onHoursChange,
              }}
            >
              {constructedHours.map(hour => (
                <option key={hour}>{hour}</option>
              ))}
            </Select>

            <Select
              disabled={!date}
              name="minutes"
              defaultValue="--"
              input={{
                value: addLeadingZeroIfRequired(minutes),
                onChange: this.onMinutesChange,
              }}
            >
              {constructedMinutes.map(minute => (
                <option key={minute}>{minute}</option>
              ))}
            </Select>
          </Container>
        </Label>
      </div>
    )
  }
}

TimePicker.propTypes = {
  date: PropTypes.instanceOf(moment),
  now: PropTypes.instanceOf(moment).isRequired,
  initialiseToNow: PropTypes.bool,
  pastTimeOnly: PropTypes.bool,
  futureTimeOnly: PropTypes.bool,
  input: inputType.isRequired,
  label: PropTypes.string,
  meta: metaType,
}

TimePicker.defaultProps = {
  date: null,
  initialiseToNow: false,
  pastTimeOnly: false,
  futureTimeOnly: false,
  label: '',
  meta: {},
}

export default TimePicker
