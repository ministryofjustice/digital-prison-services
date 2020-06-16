const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../../src/dateHelpers')

const {
  app: { notmEndpointUrl: dpsUrl },
  notifications: { confirmBookingPrisonTemplateId, emails },
} = require('../../config')

const { serviceUnavailableMessage } = require('../../common-messages')
const { properCaseName } = require('../../utils')

const unpackAppointmentDetails = req => {
  const appointmentDetails = req.flash('appointmentDetails')
  if (!appointmentDetails || !appointmentDetails.length) throw new Error('Appointment details are missing')

  return appointmentDetails.reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )
}

const packAppointmentDetails = (req, details) => {
  req.flash('appointmentDetails', details)
}

const validate = ({
  postAppointment,
  preAppointment,
  preAppointmentLocation,
  postAppointmentLocation,
  court,
  otherCourtForm,
  otherCourt,
}) => {
  const errors = []

  if (preAppointment === 'yes' && !preAppointmentLocation)
    errors.push({ text: 'Select a room for the pre-court hearing briefing', href: '#preAppointmentLocation' })

  if (postAppointment === 'yes' && !postAppointmentLocation)
    errors.push({ text: 'Select a room for the post-court hearing briefing', href: '#postAppointmentLocation' })

  if (!otherCourtForm && !court) errors.push({ text: 'Select which court the hearing is for', href: '#court' })

  if (otherCourtForm && !otherCourt) errors.push({ text: 'Enter the name of the court', href: '#otherCourt' })

  return errors
}

const getLinks = offenderNo => ({
  postAppointments: `/offenders/${offenderNo}/prepost-appointments`,
  cancel: `/offenders/${offenderNo}/prepost-appointments/cancel`,
})

const prepostAppointmentsFactory = ({
  elite2Api,
  oauthApi,
  whereaboutsApi,
  notifyClient,
  appointmentsService,
  existingEventsService,
  raiseAnalyticsEvent,
  logError,
}) => {
  const cancel = async (req, res) => {
    unpackAppointmentDetails(req)
    res.redirect(`${dpsUrl}offenders/${req.params.offenderNo}`)
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

  const getCourts = async locals => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(locals)
    const formattedLocations = courtLocations.sort().reduce((courtList, court) => {
      const key = court.replace(/\W+/g, '-').toLowerCase()
      return { ...courtList, [key]: court }
    }, {})

    return {
      ...formattedLocations,
      other: 'Other',
    }
  }
  const getCourtDropdownValues = async locals => {
    const courts = await getCourts(locals)
    return Object.keys(courts).map(key => ({ value: key, text: courts[key] }))
  }

  const handleLocationEventsIfRequired = async (
    locals,
    { activeCaseLoadId, preAppointmentLocation, postAppointmentLocation, date }
  ) => {
    const locationEvents = {}
    if (preAppointmentLocation) {
      const { locationName, events } = await getLocationEvents(locals, {
        activeCaseLoadId,
        locationId: preAppointmentLocation,
        date,
      })
      locationEvents.preAppointment = { locationName, events }
    }

    if (postAppointmentLocation) {
      const { locationName, events } = await getLocationEvents(locals, {
        activeCaseLoadId,
        locationId: postAppointmentLocation,
        date,
      })
      locationEvents.postAppointment = { locationName, events }
    }

    return locationEvents
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, authSource } = req.session.userDetails

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const { locationId, appointmentType, startTime, endTime, postAppointment, preAppointment } = appointmentDetails

      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )
      const { text: locationDescription } = locationTypes.find(loc => loc.value === Number(locationId))
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const { firstName, lastName, bookingId } = await elite2Api.getDetails(res.locals, offenderNo)

      const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

      const courts = await getCourtDropdownValues(res.locals)

      const locationEvents = await handleLocationEventsIfRequired(res.locals, {
        activeCaseLoadId,
        preAppointmentLocation: preAppointment && preAppointment.locationId,
        postAppointmentLocation: postAppointment && postAppointment.locationId,
        date,
      })

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
        locationEvents,
        courts,
        formValues: {
          postAppointment: (postAppointment && postAppointment.required) || 'yes',
          preAppointment: (preAppointment && preAppointment.required) || 'yes',
          preAppointmentDuration: (preAppointment && preAppointment.duration) || '20',
          postAppointmentDuration: (postAppointment && postAppointment.duration) || '20',
          preAppointmentLocation: preAppointment && Number(preAppointment.locationId),
          postAppointmentLocation: postAppointment && Number(postAppointment.locationId),
        },
        date,
        details: {
          name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
          location: locationDescription,
          date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
          courtHearingStartTime: Time(startTime),
          courtHearingEndTime: endTime && Time(endTime),
        },
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk', {
        url: authSource === 'nomis' ? `/offenders/${offenderNo}/add-appointment` : '/videolink/prisoner-search',
      })
    }
  }
  const createAppointment = async (context, appointmentDetails) => {
    const { startTime, endTime, comment, bookingId, locationId, court } = appointmentDetails

    await whereaboutsApi.addVideoLinkAppointment(context, {
      bookingId,
      locationId: Number(locationId),
      startTime,
      endTime,
      comment,
      court,
      madeByTheCourt: false,
    })
  }

  const toPreAppointment = ({ startTime, preAppointmentDuration, preAppointmentLocation }) => {
    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(Number(preAppointmentDuration), 'minutes')
    const preEndTime = moment(preStartTime, DATE_TIME_FORMAT_SPEC).add(Number(preAppointmentDuration), 'minutes')
    return {
      startTime: preStartTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: preEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(preAppointmentLocation),
      duration: preAppointmentDuration,
    }
  }

  const toPostAppointment = ({ endTime, postAppointmentDuration, postAppointmentLocation }) => {
    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(Number(postAppointmentDuration), 'minutes')

    return {
      startTime: endTime,
      endTime: postEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(postAppointmentLocation),
      duration: postAppointmentDuration,
    }
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { activeCaseLoadId, username, authSource } = req.session.userDetails

    const {
      postAppointment,
      preAppointment,
      postAppointmentDuration,
      preAppointmentDuration,
      preAppointmentLocation,
      postAppointmentLocation,
      court,
      otherCourt,
      otherCourtForm,
    } = req.body

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        startTime,
        endTime,
        comment,
        locationDescription,
        locationTypes,
        firstName,
        lastName,
        date,
      } = appointmentDetails

      const errors = validate({
        preAppointment,
        postAppointment,
        preAppointmentLocation,
        postAppointmentLocation,
        court,
        otherCourt,
        otherCourtForm,
      })

      const locationEvents = await handleLocationEventsIfRequired(res.locals, {
        activeCaseLoadId,
        preAppointmentLocation,
        postAppointmentLocation,
        date,
      })

      const courts = await getCourts(res.locals)
      const courtValue = otherCourt || courts[court]

      const preDetails = (preAppointment === 'yes' &&
        toPreAppointment({
          startTime,
          preAppointmentLocation,
          preAppointmentDuration,
        })) || { required: 'no' }

      const postDetails = (postAppointment === 'yes' &&
        toPostAppointment({
          endTime,
          postAppointmentLocation,
          postAppointmentDuration,
        })) || { required: 'no' }

      packAppointmentDetails(req, {
        ...appointmentDetails,
        preAppointment: preDetails,
        postAppointment: postDetails,
        court: courtValue,
      })

      if (errors.length) {
        packAppointmentDetails(req, appointmentDetails)

        const courtDropDownValues = await getCourtDropdownValues(res.locals)

        if (otherCourtForm) {
          return res.render('enterCustomCourt.njk', {
            cancel: `/offenders/${offenderNo}/prepost-appointments`,
            formValues: {
              postAppointment,
              preAppointment,
              postAppointmentDuration,
              preAppointmentDuration,
              preAppointmentLocation,
              postAppointmentLocation,
              court,
            },
            errors,
          })
        }

        return res.render('prepostAppointments.njk', {
          locationEvents,
          links: getLinks(offenderNo),
          locations: locationTypes,
          courts: courtDropDownValues,
          formValues: {
            postAppointment,
            preAppointment,
            postAppointmentDuration,
            preAppointmentDuration,
            preAppointmentLocation: preAppointmentLocation && Number(preAppointmentLocation),
            postAppointmentLocation: postAppointmentLocation && Number(postAppointmentLocation),
            court,
          },
          errors,
          date,
          details: {
            name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
            location: locationDescription,
            date: moment(startTime, DATE_TIME_FORMAT_SPEC).format('D MMMM YYYY'),
            courtHearingStartTime: Time(startTime),
            courtHearingEndTime: endTime && Time(endTime),
          },
        })
      }

      if (court === 'other') {
        return res.render('enterCustomCourt.njk', {
          cancel: `/offenders/${offenderNo}/prepost-appointments`,
          formValues: {
            postAppointment,
            preAppointment,
            postAppointmentDuration,
            preAppointmentDuration,
            preAppointmentLocation: preAppointmentLocation && Number(preAppointmentLocation),
            postAppointmentLocation: postAppointmentLocation && Number(postAppointmentLocation),
            court,
          },
          errors,
          date,
        })
      }

      await createAppointment(res.locals, {
        ...appointmentDetails,
        court: courtValue,
      })

      if (preAppointment === 'yes') {
        await createAppointment(res.locals, {
          ...appointmentDetails,
          ...preDetails,
          court: courtValue,
        })
      }

      if (postAppointment === 'yes') {
        await createAppointment(res.locals, {
          ...appointmentDetails,
          ...postDetails,
          court: courtValue,
        })
      }

      const agencyDetails = await elite2Api.getAgencyDetails(res.locals, activeCaseLoadId)
      const userEmailData = await oauthApi.userEmail(res.locals, username)

      raiseAnalyticsEvent('VLB Appointments', 'Video link booked', `${agencyDetails.description} -  ${courtValue}`)

      const preAppointmentInfo =
        preAppointment === 'yes'
          ? `${locationEvents.preAppointment.locationName}, ${Time(
              moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(preAppointmentDuration, 'minutes')
            )} to ${Time(startTime)}`
          : 'None requested'

      const postAppointmentInfo =
        postAppointment === 'yes'
          ? `${locationEvents.postAppointment.locationName}, ${Time(endTime)} to ${Time(
              moment(endTime, DATE_TIME_FORMAT_SPEC).add(postAppointmentDuration, 'minutes')
            )}`
          : 'None requested'

      if (userEmailData && userEmailData.email) {
        const personalisation = {
          startTime: Time(startTime),
          endTime: Time(endTime),
          comments: comment || 'None entered.',
          firstName: properCaseName(firstName),
          lastName: properCaseName(lastName),
          offenderNo,
          prison: agencyDetails.description,
          date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
          location: locationDescription,
          preAppointmentInfo,
          postAppointmentInfo,
        }

        notifyClient.sendEmail(confirmBookingPrisonTemplateId, userEmailData.email, {
          personalisation,
          reference: null,
        })

        if (emails[activeCaseLoadId] && emails[activeCaseLoadId].omu) {
          notifyClient.sendEmail(confirmBookingPrisonTemplateId, emails[activeCaseLoadId].omu, {
            personalisation,
            reference: null,
          })
        }
      }
      return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', {
        url: authSource === 'nomis' ? `/offenders/${offenderNo}/add-appointment` : '/videolink/prisoner-search',
      })
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
