const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const { properCaseName } = require('../utils')
const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../common-messages')
const { repeatTypes, getValidationMessages } = require('../shared/appointmentConstants')

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

  const renderTemplate = async (req, res, pageData) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
      const { appointmentTypes, appointmentLocations } = await getAppointmentTypesAndLocations(
        res.locals,
        activeCaseLoadId
      )

      console.log('====> pageData', pageData)

      return res.render('addAppointment.njk', {
        ...pageData,
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

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const {
      appointmentType,
      location,
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

    const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })

    const errors = [
      ...getValidationMessages(
        {
          appointmentType,
          location,
          date,
          startTime,
          endTime,
          comments,
          times,
          repeats,
          recurring,
        },
        true
      ),
    ]

    if (errors.length > 0) {
      return renderTemplate(req, res, { errors, formValues: { ...req.body, location: Number(location) } })
    }

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime.format(DATE_TIME_FORMAT_SPEC),
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
