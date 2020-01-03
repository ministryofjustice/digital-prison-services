const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../src/dateHelpers')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')

const { serviceUnavailableMessage } = require('../common-messages')
const { toAppointmentDetailsSummary } = require('../controllers/appointmentsService')

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

  return appointmentDetails[0]
}

const packAppointmentDetails = (req, details) => {
  req.flash('appointmentDetails', details)
}

const validate = ({ postAppointment, preAppointment, preAppointmentLocation, postAppointmentLocation }) => {
  const errors = []

  if (preAppointment === 'yes' && !preAppointmentLocation)
    errors.push({ text: 'Select a room', href: '#preAppointmentLocation' })

  if (postAppointment === 'yes' && !postAppointmentLocation)
    errors.push({ text: 'Select a room', href: '#postAppointmentLocation' })

  return errors
}

const getLinks = offenderNo => ({
  postAppointments: `/offenders/${offenderNo}/prepost-appointments`,
  cancel: `/offenders/${offenderNo}/prepost-appointments/cancel`,
})

const prepostAppointmentsFactory = ({ elite2Api, appointmentsService, existingEventsService, logError }) => {
  const cancel = async (req, res) => res.redirect(`${dpsUrl}offenders/${req.params.offenderNo}`)
  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const { locationId, appointmentType, startTime, endTime, comment, recurring, times, repeats } = appointmentDetails

      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )
      const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

      const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

      packAppointmentDetails(req, {
        ...appointmentDetails,
        locationDescription,
        appointmentTypeDescription,
        locationTypes,
        firstName,
        lastName,
        bookingId,
        date,
      })

      res.render('prepostAppointments.njk', {
        links: getLinks(offenderNo),
        locations: locationTypes,
        formValues: {
          postAppointment: 'yes',
          preAppointment: 'yes',
          postAppointmentDuration: 15,
          preAppointmentDuration: 15,
        },
        date,
        details: toAppointmentDetailsSummary({
          firstName,
          lastName,
          offenderNo,
          appointmentType: appointmentTypeDescription,
          location: locationDescription,
          startTime,
          endTime,
          comment,
          recurring,
          times,
          repeats,
        }),
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk')
    }
  }
  const createAppointment = async (context, appointmentDetails) => {
    const {
      startTime,
      endTime,
      comment,
      recurring,
      times,
      repeats,
      bookingId,
      locationId,
      appointmentType,
    } = appointmentDetails

    const mainAppointment = {
      appointmentDefaults: {
        comment,
        locationId: Number(locationId),
        appointmentType,
        startTime,
        endTime,
      },
      appointments: [{ bookingId }],
      repeat:
        recurring === 'yes'
          ? {
              repeatPeriod: repeats,
              count: times,
            }
          : undefined,
    }

    await elite2Api.addAppointments(context, mainAppointment)
  }

  const createPreAppointment = async (
    context,
    { appointmentDetails, startTime, preAppointmentDuration, preAppointmentLocation }
  ) => {
    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(Number(preAppointmentDuration), 'minutes')
    const preEndTime = moment(preStartTime, DATE_TIME_FORMAT_SPEC).add(Number(preAppointmentDuration), 'minutes')
    const preDetails = {
      startTime: preStartTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: preEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(preAppointmentLocation),
      duration: preAppointmentDuration,
    }

    await createAppointment(context, {
      ...appointmentDetails,
      recurring: 'no',
      ...preDetails,
    })

    return preDetails
  }

  const createPostAppointment = async (
    context,
    { appointmentDetails, endTime, postAppointmentDuration, postAppointmentLocation }
  ) => {
    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(Number(postAppointmentDuration), 'minutes')

    const postDetails = {
      startTime: endTime,
      endTime: postEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(postAppointmentLocation),
      duration: postAppointmentDuration,
    }

    await createAppointment(context, {
      ...appointmentDetails,
      recurring: 'no',
      ...postDetails,
    })

    return postDetails
  }

  const getLocationEvents = async (context, { activeCaseLoadId, locationId, date }) => {
    const [locationDetails, locationEvents] = await Promise.all([
      elite2Api.getLocation(context, Number(locationId)),
      existingEventsService.getExistingEventsForLocation(context, activeCaseLoadId, Number(locationId), date),
    ])

    return {
      locationName: locationDetails && locationDetails.userDescription,
      events: locationEvents,
    }
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    const {
      postAppointment,
      preAppointment,
      postAppointmentDuration,
      preAppointmentDuration,
      preAppointmentLocation,
      postAppointmentLocation,
    } = req.body

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        startTime,
        endTime,
        comment,
        recurring,
        times,
        repeats,
        locationDescription,
        appointmentTypeDescription,
        locationTypes,
        firstName,
        lastName,
        date,
      } = appointmentDetails

      const errors = validate({ preAppointment, postAppointment, preAppointmentLocation, postAppointmentLocation })

      if (errors.length) {
        packAppointmentDetails(req, appointmentDetails)

        const locationEvents = {}

        if (preAppointmentLocation) {
          const { locationName, events } = await getLocationEvents(res.locals, {
            activeCaseLoadId,
            locationId: preAppointmentLocation,
            date,
          })
          locationEvents.preAppointment = {
            locationName,
            events,
          }
        }

        if (postAppointmentLocation) {
          const { locationName, events } = await getLocationEvents(res.locals, {
            activeCaseLoadId,
            locationId: postAppointmentLocation,
            date,
          })
          locationEvents.postAppointment = {
            locationName,
            events,
          }
        }

        return res.render('prepostAppointments.njk', {
          locationEvents,
          links: getLinks(offenderNo),
          locations: locationTypes,
          formValues: {
            postAppointment,
            preAppointment,
            postAppointmentDuration,
            preAppointmentDuration,
            preAppointmentLocation: preAppointmentLocation && Number(preAppointmentLocation),
            postAppointmentLocation: postAppointmentLocation && Number(postAppointmentLocation),
          },
          errors,
          date,
          details: toAppointmentDetailsSummary({
            firstName,
            lastName,
            offenderNo,
            appointmentType: appointmentTypeDescription,
            location: locationDescription,
            startTime,
            endTime,
            comment,
            recurring,
            times,
            repeats,
          }),
        })
      }

      await createAppointment(res.locals, appointmentDetails)

      const prepostAppointments = {}

      if (preAppointment === 'yes') {
        prepostAppointments.preAppointment = await createPreAppointment(res.locals, {
          appointmentDetails,
          startTime,
          preAppointmentLocation,
          preAppointmentDuration,
        })
      }

      if (postAppointment === 'yes') {
        prepostAppointments.postAppointment = await createPostAppointment(res.locals, {
          appointmentDetails,
          endTime,
          postAppointmentLocation,
          postAppointmentDuration,
        })
      }

      packAppointmentDetails(req, {
        ...appointmentDetails,
        ...prepostAppointments,
      })

      return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk')
    }
  }

  return {
    index,
    post,
    cancel,
  }
}

module.exports = {
  prepostAppointmentsFactory,
}
