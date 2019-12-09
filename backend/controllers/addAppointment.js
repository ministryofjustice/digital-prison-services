const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const { properCaseName } = require('../utils')
const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../common-messages')
const { repeatTypes } = require('../shared/appointmentConstants')

const addAppointmentFactory = (appointmentsService, elite2Api, logError) => {
  const getAppointmentTypesAndLocations = async (locals, activeCaseLoadId) => {
    const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
      locals,
      activeCaseLoadId
    )

    return {
      appointmentTypes,
      appointmentLocations: locationTypes,
    }
  }

  const getOffenderUrl = offenderNo => `${dpsUrl}offenders/${offenderNo}`

  const renderError = (req, res, error) => {
    const { offenderNo } = req.params
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: getOffenderUrl(offenderNo) })
  }

  const renderTemplate = (req, res, pageData) => {
    res.render('addAppointment.njk', { errors: req.flash('errors'), ...pageData })
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params

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
        dpsUrl,
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
    const { offenderNo } = req.params
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

      return res.redirect(`${getOffenderUrl(offenderNo)}?appointmentAdded=true`)
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return { index, post }
}

module.exports = {
  addAppointmentFactory,
}
