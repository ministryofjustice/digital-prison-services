const moment = require('moment')
const config = require('../config')
const { serviceUnavailableMessage } = require('../common-messages')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../src/dateHelpers')

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

      res.render('addAppointmentDetails.njk', {
        title: 'Add appointment details',
        appointmentTypes,
        locations,
        homeUrl: notmEndpointUrl,
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

      const errors = []
      const now = moment()

      const startTime = startTimeHours && startTimeMinutes && moment(date, DAY_MONTH_YEAR)
      const endTime = endTimeHours && endTimeMinutes && moment(date, DAY_MONTH_YEAR)

      if (startTime) {
        startTime.hour(Number(startTimeHours))
        startTime.minute(Number(startTimeMinutes))
      }

      if (endTime) {
        endTime.hour(Number(endTimeHours))
        endTime.minute(Number(endTimeMinutes))
      }

      if (!appointmentType) errors.push({ text: 'Select an appointment type', href: '#appointment-type' })
      if (!location) errors.push({ text: 'Select a location', href: '#location' })
      if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })
      if (!date) errors.push({ text: 'Select a date', href: '#date' })
      if (!sameTimeAppointments)
        errors.push({ text: 'Select yes if the appointments all have the same time', href: '#same-time-appointments' })

      if (date && !moment(date, DAY_MONTH_YEAR).isValid())
        errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

      if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day')) {
        errors.push({ text: 'Select a date that is not in the past', href: '#date' })
      } else {
        if (startTime && startTime.isBefore(now, 'minutes'))
          errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

        if (endTime && endTime.isBefore(startTime, 'minutes'))
          errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
      }

      if (comments && comments.length > 3600)
        errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })

      const { appointmentTypes, locations } = await getAppointmentTypesAndLocations(res.locals, activeCaseLoadId)

      const appointmentTypeDetails = appointmentType && appointmentTypes.find(type => type.value === appointmentType)
      const locationDetails = location && locations.find(type => type.value === Number(location))

      if (!errors.length) {
        // eslint-disable-next-line no-param-reassign
        req.session.data = {
          appointmentType,
          appointmentTypeDescription: appointmentTypeDetails.text,
          location,
          locationDescription: locationDetails.text,
          date,
          startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
          endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
          sameTimeAppointments,
        }

        res.redirect('/bulk-appointments/upload-file')
        return
      }

      const viewModel = {
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
        homeUrl: notmEndpointUrl,
      }

      res.render('addAppointmentDetails.njk', viewModel)
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
