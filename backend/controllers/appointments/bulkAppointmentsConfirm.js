const moment = require('moment')
const { switchDateFormat } = require('../../utils')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC, buildDateTime } = require('../../../src/dateHelpers')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')
const { bulkAppointmentsClashesFactory } = require('./bulkAppointmentsClashes')

const bulkAppointmentsConfirmFactory = (elite2Api, logError) => {
  const renderTemplate = (req, res, pageData) => {
    const {
      appointmentDetails,
      appointmentDetails: { prisonersNotFound, prisonersDuplicated },
      errors,
    } = pageData
    const hasInvalidNumbers = prisonersNotFound.length > 0 || prisonersDuplicated.length > 0

    res.render('bulkAppointmentsConfirm.njk', {
      appointmentDetails: {
        ...appointmentDetails,
        date: moment(appointmentDetails.date, DAY_MONTH_YEAR).format(DATE_TIME_FORMAT_SPEC),
      },
      previousPage: hasInvalidNumbers ? 'invalid-numbers' : 'upload-file',
      errors,
    })
  }

  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const validate = (prisonersWithAppointmentTimes, date) => {
    const errors = []
    const now = moment()
    const isToday = moment(date, DAY_MONTH_YEAR).isSame(now, 'day')

    prisonersWithAppointmentTimes.forEach(({ startTime, endTime, offenderNo, firstName, lastName }) => {
      const name = `${lastName}, ${firstName}`
      const startTimeDuration = moment.duration(now.diff(startTime))
      const endTimeDuration = endTime && moment.duration(moment(startTime).diff(endTime))

      if (!startTime) {
        errors.push({
          text: `Select a start time for ${name}`,
          href: `#${offenderNo}-start-time-hours`,
        })
      }

      if (isToday && startTimeDuration.asMinutes() > 1) {
        errors.push({
          text: `Select a start time for ${name} that is not in the past`,
          href: `#${offenderNo}-start-time-hours`,
        })
      }

      if (endTime && endTimeDuration.asMinutes() > 1) {
        errors.push({
          text: `Select an end time for ${name} which is after the start time`,
          href: `#${offenderNo}-end-time-hours`,
        })
      }
    })

    return errors
  }

  const index = async (req, res) => {
    const { data } = req.session

    if (!req.session.data) {
      return res.redirect('/bulk-appointments/add-appointment-details')
    }

    return renderTemplate(req, res, { appointmentDetails: data })
  }

  const post = async (req, res) => {
    const {
      data: {
        appointmentType,
        appointmentTypeDescription,
        location,
        locationDescription,
        startTime,
        endTime,
        date,
        prisonersListed,
        comments,
        recurring,
        repeats,
        times,
        sameTimeAppointments,
      },
      userDetails: { activeCaseLoadId },
    } = req.session

    const prisonersWithAppointmentTimes = prisonersListed.map(prisoner => {
      if (sameTimeAppointments === 'no') {
        const startTimeHours = req.body[`${prisoner.offenderNo}startTimeHours`]
        const startTimeMinutes = req.body[`${prisoner.offenderNo}startTimeMinutes`]
        const endTimeHours = req.body[`${prisoner.offenderNo}endTimeHours`]
        const endTimeMinutes = req.body[`${prisoner.offenderNo}endTimeMinutes`]

        const startDateTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
        const endDateTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

        return {
          ...prisoner,
          startTimeHours,
          startTimeMinutes,
          endTimeHours,
          endTimeMinutes,
          startTime: startDateTime && startDateTime.format(DATE_TIME_FORMAT_SPEC),
          endTime: endDateTime && endDateTime.format(DATE_TIME_FORMAT_SPEC),
        }
      }

      return prisoner
    })

    if (sameTimeAppointments === 'no') {
      const errors = validate(prisonersWithAppointmentTimes, date)

      req.session.data.prisonersListed = prisonersWithAppointmentTimes

      if (errors.length > 0) {
        return renderTemplate(req, res, {
          appointmentDetails: { ...req.session.data },
          errors,
        })
      }
    }

    const count = Number(times)
    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime: startTime || buildDateTime({ date, hours: 23, minutes: 59 }).format(DATE_TIME_FORMAT_SPEC),
        endTime,
      },
      appointments: prisonersWithAppointmentTimes.map(prisoner => ({
        bookingId: prisoner.bookingId,
        startTime: prisoner.startTime,
        endTime: prisoner.endTime,
      })),
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count,
            }
          : undefined,
    }

    try {
      const { getOtherEvents } = bulkAppointmentsClashesFactory(elite2Api, logError)
      const eventsForAllOffenders = await getOtherEvents(req, res, {
        offenderNumbers: prisonersListed.map(prisoner => prisoner.offenderNo),
        date: switchDateFormat(date),
        agencyId: activeCaseLoadId,
      })

      if (eventsForAllOffenders.length > 0) {
        return res.redirect('/bulk-appointments/appointment-clashes')
      }

      req.session.appointmentSlipsData = {
        appointmentDetails: {
          startTime,
          endTime,
          comments,
          appointmentTypeDescription,
          locationDescription,
        },
        prisonersListed: req.session.data.prisonersListed,
      }

      await elite2Api.addAppointments(res.locals, request)

      raiseAnalyticsEvent(
        'Bulk Appointments',
        `Appointments created at ${activeCaseLoadId}`,
        `Appointment type - ${appointmentTypeDescription}`,
        prisonersWithAppointmentTimes.length * (count || 1)
      )

      return res.redirect('/bulk-appointments/appointments-added')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return { index, post }
}

module.exports = {
  bulkAppointmentsConfirmFactory,
}
