const moment = require('moment')
const config = require('../config')
const { serviceUnavailableMessage } = require('../common-messages')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, buildDateTime } = require('../../src/dateHelpers')

const {
  app: { notmEndpointUrl },
} = config

const toSelectValue = data => ({
  value: data.id,
  text: data.description,
})

const setSelected = (value, items) =>
  items.map(
    item =>
      item.value === value
        ? {
            ...item,
            selected: true,
          }
        : item
  )

const extractHoursMinutes = dateTime => {
  if (!dateTime) return { hours: '', minutes: '' }
  const instant = moment(dateTime, DATE_TIME_FORMAT_SPEC)
  return {
    hours: instant.format('HH'),
    minutes: instant.format('mm'),
  }
}

const getValidationMessages = ({
  appointmentType,
  location,
  date,
  startTime,
  endTime,
  sameTimeAppointments,
  comments,
}) => {
  const errors = []
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false

  if (!appointmentType) errors.push({ text: 'Select an appointment type', href: '#appointment-type' })
  if (!location) errors.push({ text: 'Select a location', href: '#location' })
  if (!date) errors.push({ text: 'Select a date', href: '#date' })
  if (!sameTimeAppointments)
    errors.push({ text: 'Select yes if the appointments all have the same time', href: '#same-time-appointments' })

  if (date && !moment(date, DAY_MONTH_YEAR).isValid())
    errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })

  if (sameTimeAppointments === 'yes') {
    const startTimeDuration = moment.duration(now.diff(startTime))
    const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

    if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

    if (isToday && startTimeDuration.asMinutes() > 1)
      errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

    if (endTime && endTimeDuration.asMinutes() > 1) {
      errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
    }
  }

  if (comments && comments.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })

  return errors
}

const addAppointmentDetailsFactory = (bulkAppointmentService, oauthApi, logError) => {
  const getAppointmentTypesAndLocations = async (locals, activeCaseLoadId) => {
    const { appointmentTypes, locationTypes } = await bulkAppointmentService.getBulkAppointmentsViewModel(
      locals,
      activeCaseLoadId
    )

    return {
      appointmentTypes: appointmentTypes.map(toSelectValue),
      locations: locationTypes.map(toSelectValue),
    }
  }

  async function index(req, res) {
    try {
      const { activeCaseLoadId } = req.session.userDetails
      const { appointmentTypes, locations } = await getAppointmentTypesAndLocations(res.locals, activeCaseLoadId)

      const { appointmentType, location, date, startTime, endTime, sameTimeAppointments, comments } =
        req.session.data || {}

      const startTimeHoursMinutes = extractHoursMinutes(startTime)
      const endTimeHoursMinutes = extractHoursMinutes(endTime)

      res.render('addAppointmentDetails.njk', {
        title: 'Add appointment details',
        appointmentTypes,
        locations,
        homeUrl: notmEndpointUrl,
        appointmentType,
        location,
        comments,
        date,
        startTimeHours: startTimeHoursMinutes.hours,
        startTimeMinutes: startTimeHoursMinutes.minutes,
        endTimeHours: endTimeHoursMinutes.hours,
        endTimeMinutes: endTimeHoursMinutes.minutes,
        sameTimeAppointments,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk', {
        url: req.originalUrl,
      })
    }
  }

  async function post(req, res) {
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const {
        appointmentType,
        location,
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        sameTimeAppointments,
        comments,
      } = req.body || {}

      const { appointmentTypes, locations } = await getAppointmentTypesAndLocations(res.locals, activeCaseLoadId)

      const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
      const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

      const appointmentTypeDetails = appointmentType && appointmentTypes.find(type => type.value === appointmentType)
      const locationDetails = location && locations.find(type => type.value === Number(location))

      const errors = getValidationMessages({
        appointmentType,
        location,
        date,
        startTime,
        endTime,
        sameTimeAppointments,
        comments,
      })

      if (!errors.length) {
        const timeInfo = sameTimeAppointments === 'yes' && {
          startTime: startTime && startTime.format(DATE_TIME_FORMAT_SPEC),
          endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
        }
        // eslint-disable-next-line no-param-reassign
        req.session.data = {
          appointmentType,
          appointmentTypeDescription: appointmentTypeDetails && appointmentTypeDetails.text,
          location: Number(location),
          locationDescription: locationDetails && locationDetails.text,
          date,
          sameTimeAppointments,
          comments,
          ...timeInfo,
        }
        res.redirect('/bulk-appointments/upload-file')
        return
      }

      res.render('addAppointmentDetails.njk', {
        date,
        sameTimeAppointments,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        errors,
        comments,
        appointmentTypes: setSelected(appointmentType, appointmentTypes),
        locations: setSelected(Number(location), locations),
        appointmentType,
        location: Number(location),
        homeUrl: notmEndpointUrl,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk', {
        url: req.originalUrl,
      })
    }
  }

  return {
    index,
    post,
  }
}

module.exports = {
  addAppointmentDetailsFactory,
}
