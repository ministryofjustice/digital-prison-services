const moment = require('moment')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC, buildDateTime } = require('../../../src/dateHelpers')
const { properCaseName } = require('../../utils')
const { serviceUnavailableMessage } = require('../../common-messages')

const addCourtAppointmentsFactory = (appointmentService, elite2Api, logError) => {
  const getValidationMessages = fields => {
    const { location, date, startTime, endTime, comments } = fields
    const errors = []
    const now = moment()
    const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false

    const startTimeDuration = moment.duration(now.diff(startTime))
    const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

    if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

    if (isToday && startTimeDuration.asMinutes() > 1)
      errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

    if (endTime && endTimeDuration.asMinutes() > 1) {
      errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
    }

    if (!location) errors.push({ text: 'Select a location', href: '#location' })

    if (!date) errors.push({ text: 'Select a date', href: '#date' })

    if (date && !moment(date, DAY_MONTH_YEAR).isValid())
      errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

    if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
      errors.push({ text: 'Select a date that is not in the past', href: '#date' })

    if (!endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

    if (comments && comments.length > 3600)
      errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comments' })

    return errors
  }

  const renderTemplate = async (req, res, data) => {
    const { offenderNo, agencyId } = req.params
    const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)
    const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
    const locationTypes = await appointmentService.getLocations(res.locals, agencyId)

    req.session.userDetails = {
      ...req.session.userDetails,
      activeCaseLoadId: agencyId,
    }

    return res.render('addAppointment/addCourtAppointment.njk', {
      formValues: {
        appointmentType: 'VLB',
      },
      ...data,
      offenderNo,
      offenderName,
      dpsUrl,
      appointmentLocations: locationTypes,
      bookingId,
    })
  }
  const index = async (req, res) => {
    const { offenderNo } = req.params

    try {
      return await renderTemplate(req, res)
    } catch (error) {
      if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${dpsUrl}offenders/${offenderNo}` })
    }
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { bookingId, location, date, startTimeHours, startTimeMinutes, endTimeHours, endTimeMinutes, comments } =
      req.body || {}

    const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

    const errors = [
      ...getValidationMessages({
        location,
        date,
        startTime,
        endTime,
        comments,
      }),
    ]

    if (errors.length > 0) {
      return renderTemplate(req, res, {
        errors,
        formValues: { ...req.body, location: Number(location) },
      })
    }

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: location && Number(location),
        appointmentType: 'VLB',
        startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
      },
      appointments: [
        {
          bookingId,
        },
      ],
    }
    req.flash('appointmentDetails', {
      ...request.appointmentDefaults,
      bookingId,
    })

    return res.redirect(`/offenders/${offenderNo}/prepost-appointments`)
  }

  return { index, post }
}

module.exports = {
  addCourtAppointmentsFactory,
}
