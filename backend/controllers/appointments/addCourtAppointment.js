const moment = require('moment')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC, buildDateTime } = require('../../../src/dateHelpers')
const { properCaseName } = require('../../utils')
const { serviceUnavailableMessage } = require('../../common-messages')

const addCourtAppointmentsFactory = (existingEventsService, elite2Api, logError) => {
  const getValidationMessages = fields => {
    const { date, startTime, endTime, preAppointmentRequired, postAppointmentRequired } = fields
    const errors = []
    const now = moment()
    const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false

    const startTimeDuration = moment.duration(now.diff(startTime))
    const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

    if (!date) errors.push({ text: 'Select a date', href: '#date' })

    if (date && !moment(date, DAY_MONTH_YEAR).isValid())
      errors.push({ text: 'Enter a date in DD/MM/YYYY format', href: '#date' })

    if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
      errors.push({ text: 'Select a date that is not in the past', href: '#date' })

    if (!startTime) errors.push({ text: 'Select a start time', href: '#start-time-hours' })

    if (isToday && startTimeDuration.asMinutes() > 1)
      errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

    if (endTime && endTimeDuration.asMinutes() > 1) {
      errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
    }

    if (!endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

    if (!preAppointmentRequired)
      errors.push({ text: 'Select if a pre appointment is required', href: '#pre-appointment-required' })

    if (!postAppointmentRequired)
      errors.push({ text: 'Select if a post appointment is required', href: '#post-appointment-required' })

    return errors
  }

  const renderTemplate = async (req, res, data) => {
    const { offenderNo, agencyId } = req.params
    const [offenderDetails, agencyDetails] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo),
      elite2Api.getAgencyDetails(res.locals, agencyId),
    ])
    const { firstName, lastName, bookingId } = offenderDetails
    const offenderNameWithNumber = `${properCaseName(lastName)}, ${properCaseName(firstName)} (${offenderNo})`
    const agencyDescription = agencyDetails.description

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
      offenderNameWithNumber,
      agencyDescription,
      dpsUrl,
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
    const { offenderNo, agencyId } = req.params
    const {
      bookingId,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      preAppointmentRequired,
      postAppointmentRequired,
    } = req.body || {}

    try {
      const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
      const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

      const errors = [
        ...getValidationMessages({
          date,
          startTime,
          endTime,
          preAppointmentRequired,
          postAppointmentRequired,
        }),
      ]

      if (errors.length > 0) {
        return renderTemplate(req, res, {
          errors,
          formValues: req.body,
        })
      }

      const request = {
        appointmentDefaults: {
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

      const { mainLocations, preLocations, postLocations } = await existingEventsService.getAvailableLocationsForVLB(
        res.locals,
        {
          agencyId,
          startTime,
          endTime,
          date,
          preAppointmentRequired,
          postAppointmentRequired,
        }
      )

      const preAppointmentLocationsValid = preAppointmentRequired === 'yes' ? preLocations.length : true
      const postAppointmentLocationsValid = postAppointmentRequired === 'yes' ? postLocations.length : true

      if (!mainLocations.length || !preAppointmentLocationsValid || !postAppointmentLocationsValid) {
        return res.send('No rooms available')
      }

      req.flash('appointmentDetails', {
        ...request.appointmentDefaults,
        bookingId,
        preAppointmentRequired,
        postAppointmentRequired,
      })

      return res.redirect(`/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-court`)
    } catch (error) {
      if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${dpsUrl}offenders/${offenderNo}` })
    }
  }

  return { index, post }
}

module.exports = {
  addCourtAppointmentsFactory,
}
