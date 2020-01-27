const moment = require('moment')
const { DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR } = require('../../../src/dateHelpers')
const {
  app: { notmEndpointUrl: dpsUrl },
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
  preAppointmentLocation,
  postAppointmentLocation,
  mainAppointmentLocation,
  comment,
}) => {
  const errors = []

  if (preAppointmentRequired === 'yes' && !preAppointmentLocation)
    errors.push({ text: 'Select a room for the pre appointment', href: '#preAppointmentLocation' })

  if (!mainAppointmentLocation)
    errors.push({ text: 'Select a room for the main appointment', href: '#mainAppointmentLocation' })

  if (postAppointmentRequired === 'yes' && !postAppointmentLocation)
    errors.push({ text: 'Select a room for the post appointment', href: '#postAppointmentLocation' })

  if (comment && comment.length > 3600)
    errors.push({ text: 'Maximum length should not exceed 3600 characters', href: '#comment' })

  return errors
}

const selectCourtAppointmentRoomsFactory = ({ elite2Api, appointmentsService, logError }) => {
  const cancel = async (req, res) => {
    unpackAppointmentDetails(req)
    res.redirect(`${dpsUrl}offenders/${req.params.offenderNo}`)
  }

  const index = async (req, res) => {
    const { offenderNo, agencyId } = req.params
    const { activeCaseLoadId } = req.session.userDetails

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        appointmentType,
        startTime,
        endTime,
        times,
        preAppointmentRequired,
        postAppointmentRequired,
      } = appointmentDetails

      const { appointmentTypes, locationTypes } = await appointmentsService.getAppointmentOptions(
        res.locals,
        activeCaseLoadId
      )

      const { text: appointmentTypeDescription } = appointmentTypes.find(app => app.value === appointmentType)

      const [offenderDetails, agencyDetails] = await Promise.all([
        elite2Api.getDetails(res.locals, offenderNo),
        elite2Api.getAgencyDetails(res.locals, agencyId),
      ])
      const { firstName, lastName, bookingId } = offenderDetails

      const agencyDescription = agencyDetails.description

      const date = moment(startTime, DATE_TIME_FORMAT_SPEC).format(DAY_MONTH_YEAR)

      packAppointmentDetails(req, {
        ...appointmentDetails,
        agencyDescription,
        appointmentTypeDescription,
        locationTypes,
        firstName,
        lastName,
        bookingId,
        date,
      })

      res.render('addAppointment/selectCourtAppointmentRooms.njk', {
        cancelLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms/cancel`,
        locations: locationTypes,
        date,
        details: toAppointmentDetailsSummary({
          firstName,
          lastName,
          offenderNo,
          appointmentType,
          appointmentTypeDescription,
          startTime,
          endTime,
          times,
          agencyDescription,
        }),
        preAppointmentRequired: preAppointmentRequired === 'yes',
        postAppointmentRequired: postAppointmentRequired === 'yes',
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      res.render('error.njk')
    }
  }

  const createAppointment = async (context, appointmentDetails) => {
    const { startTime, endTime, bookingId, locationId, appointmentType, comment } = appointmentDetails

    await elite2Api.addSingleAppointment(context, bookingId, {
      appointmentType,
      locationId: Number(locationId),
      startTime,
      endTime,
      comment,
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
    })

    return postDetails
  }

  const post = async (req, res) => {
    const { offenderNo, agencyId } = req.params

    const { preAppointmentLocation, mainAppointmentLocation, postAppointmentLocation, comment } = req.body

    try {
      const appointmentDetails = unpackAppointmentDetails(req)
      const {
        startTime,
        endTime,
        appointmentType,
        appointmentTypeDescription,
        locationTypes,
        firstName,
        lastName,
        date,
        preAppointmentRequired,
        postAppointmentRequired,
        agencyDescription,
      } = appointmentDetails

      const errors = validate({
        preAppointmentRequired,
        postAppointmentRequired,
        preAppointmentLocation,
        postAppointmentLocation,
        mainAppointmentLocation,
        comment,
      })

      if (errors.length) {
        packAppointmentDetails(req, appointmentDetails)

        return res.render('addAppointment/selectCourtAppointmentRooms.njk', {
          cancelLink: `/${agencyId}/offenders/${offenderNo}/add-court-appointment/select-rooms/cancel`,
          locations: locationTypes,
          formValues: {
            preAppointmentLocation: preAppointmentLocation && Number(preAppointmentLocation),
            mainAppointmentLocation: mainAppointmentLocation && Number(mainAppointmentLocation),
            postAppointmentLocation: postAppointmentLocation && Number(postAppointmentLocation),
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

      await createAppointment(res.locals, { ...appointmentDetails, comment, locationId: mainAppointmentLocation })

      const prepostAppointments = {}

      if (preAppointmentRequired === 'yes') {
        prepostAppointments.preAppointment = await createPreAppointment(res.locals, {
          appointmentDetails,
          startTime,
          preAppointmentLocation,
        })
      }

      if (postAppointmentRequired === 'yes') {
        prepostAppointments.postAppointment = await createPostAppointment(res.locals, {
          appointmentDetails,
          endTime,
          postAppointmentLocation,
        })
      }

      packAppointmentDetails(req, {
        ...appointmentDetails,
        ...prepostAppointments,
        locationId: mainAppointmentLocation,
        comment,
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
  selectCourtAppointmentRoomsFactory,
}
