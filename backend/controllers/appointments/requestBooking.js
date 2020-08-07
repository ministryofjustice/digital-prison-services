const moment = require('moment')
const { buildDateTime, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../../common-messages')
const { validateComments } = require('../../shared/appointmentConstants')
const {
  notifications: { requestBookingCourtTemplateVLBAdminId, requestBookingCourtTemplateRequesterId, emails: emailConfig },
  app: { videoLinkEnabledFor },
} = require('../../config')
const { raiseAnalyticsEvent } = require('../../raiseAnalyticsEvent')

const isValidNumber = number => Number.isSafeInteger(Number.parseInt(number, 10))

const validateStartEndTime = ({ date, startTimeHours, startTimeMinutes, endTimeHours, endTimeMinutes, errors }) => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
  const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })
  const startTimeDuration = startTime && moment.duration(now.diff(startTime))
  const endTimeDuration = endTime && startTime && moment.duration(startTime.diff(endTime))

  if (!startTime && (isValidNumber(startTimeHours) || isValidNumber(startTimeMinutes))) {
    errors.push({ text: 'Select a full start time of the court hearing video link', href: '#start-time-hours' })
  } else if (!startTime) {
    errors.push({ text: 'Select the start time of the court hearing video link', href: '#start-time-hours' })
  }

  if (!endTime && (isValidNumber(endTimeHours) || isValidNumber(endTimeMinutes))) {
    errors.push({ text: 'Select a full end time of the court hearing video link', href: '#end-time-hours' })
  } else if (!endTime) {
    errors.push({ text: 'Select the end time of the court hearing video link', href: '#end-time-hours' })
  }

  if (isToday && startTimeDuration && startTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

  if (endTime && endTimeDuration && endTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
}

const validateDate = (date, errors) => {
  const now = moment()
  if (!date) errors.push({ text: 'Select the date of the video link', href: '#date' })

  if (date && !moment(date, DAY_MONTH_YEAR).isValid())
    errors.push({
      text:
        'Enter the date of the video link using numbers in the format of day, month and year separated using a forward slash',
      href: '#date',
    })

  if (date && moment(date, DAY_MONTH_YEAR).isBefore(now, 'day'))
    errors.push({ text: 'Select a date that is not in the past', href: '#date' })
}
const extractObjectFromFlash = ({ req, key }) =>
  req.flash(key).reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )

const getBookingDetails = req => extractObjectFromFlash({ req, key: 'requestBooking' })
const packBookingDetails = (req, data) => req.flash('requestBooking', data)

const requestBookingFactory = ({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api }) => {
  const sendEmail = ({ templateId, email, personalisation }) =>
    new Promise((resolve, reject) => {
      try {
        notifyClient.sendEmail(templateId, email, {
          personalisation,
          reference: null,
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })

  const getVideoLinkEnabledPrisons = async locals => {
    const prisons = await elite2Api.getAgencies(locals)

    return prisons.filter(prison => videoLinkEnabledFor.includes(prison.agencyId)).map(vlp => ({
      agencyId: vlp.agencyId,
      description: vlp.formattedDescription || vlp.description,
    }))
  }
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('courtServiceError.njk', { url: req.originalUrl })
  }

  const renderTemplate = async (req, res, pageData, template) => {
    try {
      return res.render(template || 'requestBooking/requestBooking.njk', {
        user: { displayName: req.session.userDetails.name },
        homeUrl: '/videolink',
        ...(pageData || {}),
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const startOfJourney = async (req, res) => {
    const prisonDropdownValues = (await getVideoLinkEnabledPrisons(res.locals)).map(prison => ({
      text: prison.description,
      value: prison.agencyId,
    }))
    return res.render('requestBooking/requestBooking.njk', {
      user: { displayName: req.session.userDetails.name },
      prisons: prisonDropdownValues,
      homeUrl: '/videolink',
    })
  }

  const checkAvailability = async (req, res) => {
    const {
      prison,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      preAppointmentRequired,
      postAppointmentRequired,
    } = req.body

    const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })
    const errors = []

    if (!preAppointmentRequired)
      errors.push({
        text: 'Select yes if you want to add a pre-court hearing briefing',
        href: '#pre-appointment-required',
      })

    if (!postAppointmentRequired)
      errors.push({
        text: 'Select yes if you want to add a post-court hearing briefing',
        href: '#post-appointment-required',
      })

    if (!prison) errors.push({ text: 'Select which prison you want a video link with', href: '#prison' })

    validateDate(date, errors)
    validateStartEndTime({ date, startTimeHours, startTimeMinutes, endTimeHours, endTimeMinutes, errors })

    if (errors.length > 0) {
      packBookingDetails(req)
      const prisonDropdownValues = (await getVideoLinkEnabledPrisons(res.locals)).map(p => ({
        text: p.description,
        value: p.agencyId,
      }))
      return renderTemplate(req, res, {
        errors,
        prisons: prisonDropdownValues,
        formValues: req.body,
      })
    }

    packBookingDetails(req, {
      prison,
      date,
      startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
      endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
      preAppointmentRequired,
      postAppointmentRequired,
    })

    return res.redirect('/request-booking/select-court')
  }

  const enterOffenderDetails = async (req, res) =>
    res.render('requestBooking/offenderDetails.njk', {
      errors: req.flash('errors'),
      formValues: extractObjectFromFlash({ req, key: 'formValues' }),
    })

  const selectCourt = async (req, res) => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(res.locals)
    const details = getBookingDetails(req)
    const { date, startTime, endTime, prison, preAppointmentRequired, postAppointmentRequired } = details

    const getPreHearingStartAndEndTime = () => {
      if (preAppointmentRequired !== 'yes') return 'Not required'
      const preCourtHearingStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minute')
      const preCourtHearingEndTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
      return `${Time(preCourtHearingStartTime)} to ${Time(preCourtHearingEndTime)}`
    }

    const getPostCourtHearingStartAndEndTime = () => {
      if (postAppointmentRequired !== 'yes') return 'Not required'
      const postCourtHearingStartTime = moment(endTime, DATE_TIME_FORMAT_SPEC)
      const postCourtHearingEndTime = moment(endTime, DATE_TIME_FORMAT_SPEC).add(20, 'minute')
      return `${Time(postCourtHearingStartTime)} to ${Time(postCourtHearingEndTime)}`
    }

    const preHearingStartAndEndTime = getPreHearingStartAndEndTime()
    const postHearingStartAndEndTime = getPostCourtHearingStartAndEndTime()

    packBookingDetails(req, {
      ...details,
      preHearingStartAndEndTime,
      postHearingStartAndEndTime,
    })

    const prisons = await elite2Api.getAgencies(res.locals)
    const matchingPrison = prisons.find(p => p.agencyId === prison)

    return res.render('requestBooking/selectCourt.njk', {
      prisonDetails: {
        prison: matchingPrison.fromattedDescription || matchingPrison.description,
      },
      hearingDetails: {
        date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
        courtHearingStartTime: Time(startTime),
        courtHearingEndTime: Time(endTime),
      },
      prePostDetails: {
        'pre-court hearing briefing': preHearingStartAndEndTime,
        'post-court hearing briefing': postHearingStartAndEndTime,
      },
      hearingLocations: courtLocations.map(location => ({
        value: location,
        text: location,
      })),
      errors: req.flash('errors'),
    })
  }

  const validateCourt = async (req, res) => {
    const { hearingLocation } = req.body
    const bookingDetails = getBookingDetails(req)
    if (!hearingLocation) {
      packBookingDetails(req, bookingDetails)
      req.flash('errors', [{ text: 'Select which court you are in', href: '#hearingLocation' }])

      return res.redirect('/request-booking/select-court')
    }
    packBookingDetails(req, {
      ...bookingDetails,
      hearingLocation,
    })
    return res.redirect('/request-booking/enter-offender-details')
  }

  const createBookingRequest = async (req, res) => {
    try {
      const { firstName, lastName, dobDay, dobMonth, dobYear, comments } = req.body

      const errors = []

      const dateOfBirth = moment({
        day: dobDay,
        month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1,
        year: dobYear,
      })
      const dobIsValid =
        dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)

      if (!firstName) errors.push({ text: 'Enter a first name', href: '#first-name' })
      if (!lastName) errors.push({ text: 'Enter a last name', href: '#last-name' })
      if (!dobYear && !dobDay && !dobMonth) errors.push({ text: 'Enter a date of birth', href: '#dobDay' })
      if (dobDay && dobMonth && dobYear) {
        const dobInThePast = dobIsValid ? dateOfBirth.isBefore(moment(), 'day') : false
        const dobIsTooEarly = dobIsValid ? dateOfBirth.isBefore(moment({ day: 1, month: 0, year: 1900 })) : true

        if (!dobIsValid)
          errors.push({ text: 'Enter a date of birth which is a real date', href: '#dobDay' }, { href: '#dobError' })

        if (dobIsValid && !dobInThePast)
          errors.push({ text: 'Enter a date of birth which is in the past', href: '#dobDay' }, { href: '#dobError' })

        if (dobIsValid && dobIsTooEarly)
          errors.push({ text: 'Date of birth must be after 1900', href: '#dobDay' }, { href: '#dobError' })
      }

      if (!dobDay && (dobMonth || dobYear)) errors.push({ text: 'Date of birth must include a day', href: '#dobDay' })

      if (!dobMonth && (dobDay || dobYear))
        errors.push({ text: 'Date of birth must include a month', href: '#dobMonth' })

      if (!dobYear && (dobDay || dobMonth)) errors.push({ text: 'Date of birth must include a year', href: '#dobYear' })

      validateComments(comments, errors)

      const bookingDetails = getBookingDetails(req)

      if (errors.length > 0) {
        packBookingDetails(req, bookingDetails)
        req.flash('errors', errors)
        req.flash('formValues', req.body)
        return res.redirect('/request-booking/enter-offender-details')
      }

      const {
        date,
        startTime,
        endTime,
        prison,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
        hearingLocation,
      } = bookingDetails

      const prisons = await elite2Api.getAgencies(res.locals)
      const matchingPrison = prisons.find(p => p.agencyId === prison)

      const personalisation = {
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.format('D MMMM YYYY'),
        date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
        startTime: Time(startTime),
        endTime: endTime && Time(endTime),
        prison: matchingPrison.formattedDescription || matchingPrison.description,
        hearingLocation,
        comment: comments || 'None entered',
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      }

      const { username } = req.session.userDetails
      const { email } = await oauthApi.userEmail(res.locals, username)
      const { name } = await oauthApi.userDetails(res.locals, username)

      packBookingDetails(req, personalisation)

      const { vlb } = emailConfig[prison]

      sendEmail({ templateId: requestBookingCourtTemplateVLBAdminId, email: vlb, personalisation }).catch(error => {
        logError(req.originalUrl, error, 'Failed to email the prison about a booking request')
      })

      sendEmail({
        templateId: requestBookingCourtTemplateRequesterId,
        email,
        personalisation: {
          ...personalisation,
          username: name,
        },
      }).catch(error => {
        logError(req.originalUrl, error, 'Failed to email the requester a copy of the booking')
      })

      return res.redirect('/request-booking/confirmation')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const confirm = async (req, res) => {
    try {
      const requestDetails = getBookingDetails(req)
      if (!Object.keys(requestDetails).length) throw new Error('Request details are missing')

      const {
        firstName,
        lastName,
        dateOfBirth,
        prison,
        startTime,
        endTime,
        comment,
        date,
        preAppointmentRequired,
        postAppointmentRequired,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
        hearingLocation,
      } = requestDetails

      raiseAnalyticsEvent(
        'VLB Appointments',
        `Video link requested for ${hearingLocation}`,
        `Pre: ${preAppointmentRequired === 'yes' ? 'Yes' : 'No'} | Post: ${
          postAppointmentRequired === 'yes' ? 'Yes' : 'No'
        }`
      )

      return res.render('requestBooking/requestBookingConfirmation.njk', {
        user: { displayName: req.session.userDetails.name },
        homeUrl: '/videolink',
        title: 'The video link has been requested',
        details: {
          prison,
          name: `${firstName} ${lastName}`,
          dateOfBirth,
        },
        hearingDetails: {
          date,
          courtHearingStartTime: startTime,
          courtHearingEndTime: endTime,
          comment,
        },
        prePostDetails: {
          'pre-court hearing briefing': preHearingStartAndEndTime,
          'post-court hearing briefing': postHearingStartAndEndTime,
        },
        courtDetails: {
          courtLocation: hearingLocation,
        },
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }
  return {
    startOfJourney,
    checkAvailability,
    selectCourt,
    validateCourt,
    createBookingRequest,
    enterOffenderDetails,
    confirm,
  }
}

module.exports = {
  requestBookingFactory,
}
