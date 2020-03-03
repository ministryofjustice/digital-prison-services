const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../../src/dateHelpers')
const {
  notifications: { confirmBookingCourtTemplateId },
} = require('../../config')

const { serviceUnavailableMessage } = require('../../common-messages')
const { toAppointmentDetailsSummary } = require('./appointmentsService')

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
  preAppointmentRequired,
  postAppointmentRequired,
  selectPreAppointmentLocation,
  selectPostAppointmentLocation,
  selectMainAppointmentLocation,
  comment,
}) => {
  const errors = []

  if (!selectMainAppointmentLocation)
    errors.push({ text: 'Select a room for the main appointment', href: '#selectMainAppointmentLocation' })

  if (preAppointmentRequired === 'yes' && !selectPreAppointmentLocation)
    errors.push({ text: 'Select a room for the pre appointment', href: '#selectPreAppointmentLocation' })

  if (postAppointmentRequired === 'yes' && !selectPostAppointmentLocation)
    errors.push({ text: 'Select a room for the post appointment', href: '#selectPostAppointmentLocation' })

  if (
    postAppointmentRequired === 'yes' &&
    selectMainAppointmentLocation &&
    selectPostAppointmentLocation &&
    selectPostAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push({
      text: 'Select a room other than the one used for the main appointment',
      href: '#selectPostAppointmentLocation',
    })
  }

  if (
    preAppointmentRequired === 'yes' &&
    selectPreAppointmentLocation &&
    selectMainAppointmentLocation &&
    selectPreAppointmentLocation === selectMainAppointmentLocation
  ) {
    errors.push({
      text: 'Select a room other than the one used for the main appointment',
      href: '#selectPreAppointmentLocation',
    })
  }

  if (comment && comment.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comment' })

  return errors
}

const selectCourtAppointmentRoomsFactory = ({
  elite2Api,
  whereaboutsApi,
  appointmentsService,
  existingEventsService,
  logError,
  oauthApi,
  notifyClient,
}) => {
  const index = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        appointmentType,
        startTime,
        endTime,
        preAppointmentRequired,
        postAppointmentRequired,
      } = appointmentDetails

      const { appointmentTypes } = await appointmentsService.getAppointmentOptions(res.locals, activeCaseLoadId)
      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const [offenderDetails, agencyDetails] = await Promise.all([
        elite2Api.getDetails(res.locals, offenderNo),
        elite2Api.getAgencyDetails(res.locals, agencyId),
      ])
      const { firstName, lastName, bookingId } = offenderDetails

      const agencyDescription = agencyDetails.description

      const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

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

      packAppointmentDetails(req, {
        ...appointmentDetails,
        mainLocations,
        preLocations,
        postLocations,
        agencyDescription,
        appointmentTypeDescription,
        firstName,
        lastName,
        bookingId,
        date,
      })

      res.render('addAppointment/selectCourtAppointmentRooms.njk', {
        mainLocations,
        preLocations,
        postLocations,
        date,
        details: toAppointmentDetailsSummary({
          firstName,
          lastName,
          offenderNo,
          appointmentType,
          appointmentTypeDescription,
          startTime,
          endTime,
          agencyDescription,
        }),
        preAppointmentRequired: preAppointmentRequired === 'yes',
        postAppointmentRequired: postAppointmentRequired === 'yes',
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk', { url: `/${agencyId}/offenders/${offenderNo}/add-appointment` })
    }
  }

  const createAppointment = async (context, appointmentDetails) => {
    const { startTime, endTime, bookingId, locationId, comment, court, hearingType } = appointmentDetails

    await whereaboutsApi.addVideoLinkAppointment(context, {
      bookingId,
      locationId: Number(locationId),
      startTime,
      endTime,
      comment,
      court,
      hearingType,
    })
  }

  const createPreAppointment = async (context, { appointmentDetails, startTime, preAppointmentLocation }) => {
    const preStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minutes')
    const preDetails = {
      startTime: preStartTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: startTime,
      locationId: Number(preAppointmentLocation),
    }

    await createAppointment(context, {
      ...appointmentDetails,
      ...preDetails,
      hearingType: 'PRE',
    })

    return preDetails
  }

  const createPostAppointment = async (context, { appointmentDetails, endTime, postAppointmentLocation }) => {
    const postEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minutes')

    const postDetails = {
      startTime: endTime,
      endTime: postEndTime.format(DATE_TIME_FORMAT_SPEC),
      locationId: Number(postAppointmentLocation),
    }

    await createAppointment(context, {
      ...appointmentDetails,
      ...postDetails,
      hearingType: 'POST',
    })

    return postDetails
  }

  const validateInput = async (req, res, next) => {
    const { offenderNo, agencyId } = req.params

    const {
      selectPreAppointmentLocation,
      selectMainAppointmentLocation,
      selectPostAppointmentLocation,
      comment,
    } = req.body

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        startTime,
        endTime,
        appointmentType,
        appointmentTypeDescription,
        firstName,
        lastName,
        date,
        preAppointmentRequired,
        postAppointmentRequired,
        agencyDescription,
        mainLocations,
        preLocations,
        postLocations,
      } = appointmentDetails

      const errors = validate({
        preAppointmentRequired,
        postAppointmentRequired,
        selectPreAppointmentLocation,
        selectPostAppointmentLocation,
        selectMainAppointmentLocation,
        comment,
      })

      packAppointmentDetails(req, appointmentDetails)
      if (errors.length) {
        return res.render('addAppointment/selectCourtAppointmentRooms.njk', {
          mainLocations,
          preLocations,
          postLocations,
          formValues: {
            preAppointmentLocation: selectPreAppointmentLocation && Number(selectPreAppointmentLocation),
            mainAppointmentLocation: selectMainAppointmentLocation && Number(selectMainAppointmentLocation),
            postAppointmentLocation: selectPostAppointmentLocation && Number(selectPostAppointmentLocation),
            comment,
          },
          errors,
          date,
          details: toAppointmentDetailsSummary({
            firstName,
            lastName,
            offenderNo,
            appointmentType,
            appointmentTypeDescription,
            startTime,
            endTime,
            agencyDescription,
          }),
          preAppointmentRequired: preAppointmentRequired === 'yes',
          postAppointmentRequired: postAppointmentRequired === 'yes',
        })
      }

      return next()
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/${agencyId}/offenders/${offenderNo}/add-appointment` })
    }
  }

  const createAppointments = async (req, res) => {
    const { offenderNo } = req.params
    const appointmentDetails = unpackAppointmentDetails(req)
    const {
      startTime,
      endTime,
      preAppointmentRequired,
      postAppointmentRequired,
      firstName,
      lastName,
      mainLocations,
      preLocations,
      postLocations,
    } = appointmentDetails
    const { username } = req.session.userDetails
    const {
      selectPreAppointmentLocation,
      selectMainAppointmentLocation,
      selectPostAppointmentLocation,
      comment,
    } = req.body

    await createAppointment(res.locals, {
      ...appointmentDetails,
      comment,
      locationId: selectMainAppointmentLocation,
      hearingType: 'MAIN',
    })

    const prepostAppointments = {}

    if (preAppointmentRequired === 'yes') {
      prepostAppointments.preAppointment = await createPreAppointment(res.locals, {
        appointmentDetails,
        startTime,
        preAppointmentLocation: selectPreAppointmentLocation,
      })
    }

    if (postAppointmentRequired === 'yes') {
      prepostAppointments.postAppointment = await createPostAppointment(res.locals, {
        appointmentDetails,
        endTime,
        postAppointmentLocation: selectPostAppointmentLocation,
      })
    }

    packAppointmentDetails(req, {
      ...appointmentDetails,
      ...prepostAppointments,
      locationId: selectMainAppointmentLocation,
      comment,
    })

    const userEmailData = await oauthApi.userEmail(res.locals, username)

    if (userEmailData && userEmailData.email) {
      const personalisation = {
        startTime,
        endTime,
        comment,
        firstName,
        lastName,
        offenderNo,
        location: mainLocations.find(l => l.value === Number(selectMainAppointmentLocation)).text,
        postAppointmentStartTime:
          postAppointmentRequired === 'yes' ? prepostAppointments.postAppointment.startTime : 'N/A',
        postAppointmentEndTime: postAppointmentRequired === 'yes' ? prepostAppointments.postAppointment.endTime : 'N/A',
        preAppointmentStartTime:
          preAppointmentRequired === 'yes' ? prepostAppointments.preAppointment.startTime : 'N/A',
        preAppointmentEndTime: preAppointmentRequired === 'yes' ? prepostAppointments.preAppointment.endTime : 'N/A',
        preAppointmentLocation:
          preAppointmentRequired === 'yes'
            ? preLocations.find(l => l.value === Number(selectPreAppointmentLocation)).text
            : 'N/A',
        postAppointmentLocation:
          postAppointmentRequired === 'yes'
            ? postLocations.find(l => l.value === Number(selectPostAppointmentLocation)).text
            : 'N/A',
      }

      notifyClient.sendEmail(confirmBookingCourtTemplateId, userEmailData.email, {
        personalisation,
        reference: null,
      })
    }

    return res.redirect(`/offenders/${offenderNo}/confirm-appointment`)
  }

  return {
    index,
    validateInput,
    createAppointments,
  }
}

module.exports = {
  selectCourtAppointmentRoomsFactory,
}
