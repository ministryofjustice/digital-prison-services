const {
  app: { notmEndpointUrl },
} = require('../config')
const { properCaseName } = require('../utils')
const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')

// Put somewhere and share with bulk appointment bulkAppointmentsAddDetails
const repeatTypes = [
  { value: 'WEEKLY', text: 'Weekly' },
  { value: 'DAILY', text: 'Daily' },
  { value: 'WEEKDAYS', text: 'Weekday (Monday to Friday)' },
  { value: 'MONTHLY', text: 'Monthly' },
  { value: 'FORTNIGHTLY', text: 'Fortnightly' },
]

// Put somewhere and share with bulk appointment bulkAppointmentsAddDetails
const toSelectValue = data => ({
  value: data.id,
  text: data.description,
})

const addAppointmentFactory = (appointmentsService, elite2Api, logError) => {
  const getAppointmentTypesAndLocations = async (locals, activeCaseLoadId) => {
    const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
      locals,
      activeCaseLoadId
    )

    return {
      appointmentTypes: appointmentTypes.map(toSelectValue),
      appointmentLocations: locationTypes.map(toSelectValue),
    }
  }

  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/' })
  }

  const renderTemplate = (req, res, pageData) => {
    res.render('addAppointment.njk', { errors: req.flash('errors'), ...pageData })
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params

    if (!offenderNo) {
      return res.redirect('/')
    }

    try {
      const { activeCaseLoadId } = req.session.userDetails
      const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`

      const { appointmentTypes, appointmentLocations } = await getAppointmentTypesAndLocations(
        res.locals,
        activeCaseLoadId
      )

      return renderTemplate(req, res, {
        offenderNo,
        offenderName,
        notmEndpointUrl,
        appointmentTypes,
        appointmentLocations,
        repeatTypes,
        bookingId,
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const post = async (req, res) => {
    const {
      appointmentType,
      appointmentLocation,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      recurring,
      repeats,
      times,
      comments,
      bookingId,
    } = req.body

    // Share appointment form validation
    // const errors = getValidationErrors({ alertStatus, comment })

    // if (errors.length > 0) {
    //   req.flash('errors', errors)

    //   return res.redirect('back')
    // }

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(appointmentLocation),
        appointmentType,
        startTime: buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes }).format(
          DATE_TIME_FORMAT_SPEC
        ),
        endTime: buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes }).format(DATE_TIME_FORMAT_SPEC),
      },
      appointments: [
        {
          bookingId,
        },
      ],
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count: times,
            }
          : undefined,
    }

    try {
      await elite2Api.addAppointments(res.locals, request)

      return res.send('Appointment added')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return { index, post }
}

module.exports = {
  addAppointmentFactory,
}
