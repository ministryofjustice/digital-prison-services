const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const { properCaseName } = require('../utils')
const { buildDateTime, DATE_TIME_FORMAT_SPEC } = require('../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../common-messages')
const { repeatTypes, getValidationMessages, endRecurringEndingDate } = require('../shared/appointmentConstants')

const addAppointmentFactory = (appointmentsService, existingEventsService, elite2Api, logError) => {
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
    const { formValues } = pageData || {}
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const prePopulatedData = {}
      const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)
      const offenderName = `${properCaseName(lastName)}, ${properCaseName(firstName)}`
      const { appointmentTypes, appointmentLocations } = await getAppointmentTypesAndLocations(
        res.locals,
        activeCaseLoadId
      )

      if (formValues && formValues.date) {
        prePopulatedData.offenderEvents = await existingEventsService.getExistingEventsForOffender(
          res.locals,
          activeCaseLoadId,
          formValues.date,
          offenderNo
        )
      }

      if (formValues && formValues.appointmentType === 'VLB' && formValues.location && formValues.date) {
        const [locationDetails, locationEvents] = await Promise.all([
          elite2Api.getLocation(res.locals, formValues.location),
          existingEventsService.getExistingEventsForLocation(
            res.locals,
            activeCaseLoadId,
            formValues.location,
            formValues.date
          ),
        ])

        prePopulatedData.locationName = locationDetails.userDescription
        prePopulatedData.locationEvents = locationEvents
      }

      return res.render('addAppointment/addAppointment.njk', {
        ...pageData,
        ...prePopulatedData,
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
      const { endOfPeriod } = endRecurringEndingDate({ date, startTime, repeats, times })

      return renderTemplate(req, res, {
        errors,
        formValues: { ...req.body, location: Number(location) },
        endOfPeriod: endOfPeriod && endOfPeriod.format('dddd D MMMM YYYY'),
      })
    }

    const request = {
      appointmentDefaults: {
        comment: comments,
        locationId: Number(location),
        appointmentType,
        startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
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
      req.flash('appointmentDetails', {
        recurring,
        times,
        repeats,
        ...request.appointmentDefaults,
        bookingId,
      })

      if (appointmentType === 'VLB') return res.redirect(`/offenders/${offenderNo}/prepost-appointments`)

      await elite2Api.addAppointments(res.locals, request)

      return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return { index, post }
}

module.exports = {
  addAppointmentFactory,
}
