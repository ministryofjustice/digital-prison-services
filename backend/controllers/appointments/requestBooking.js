const moment = require('moment')
const { buildDateTime, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../../common-messages')
const { validateComments } = require('../../shared/appointmentConstants')
const {
  notifications: { requestBookingCourtTemplateId, emails: emailConfig },
  app: { videoLinkEnabledFor },
} = require('../../config')

const validateStartEndTime = (date, startTime, endTime, errors) => {
  const now = moment()
  const isToday = date ? moment(date, DAY_MONTH_YEAR).isSame(now, 'day') : false
  const startTimeDuration = moment.duration(now.diff(startTime))
  const endTimeDuration = endTime && moment.duration(startTime.diff(endTime))

  if (!startTime)
    errors.push({ text: 'Select the start time of the court hearing video link', href: '#start-time-hours' })

  if (!endTime) errors.push({ text: 'Select the end time of the court hearing video link', href: '#end-time-hours' })

  if (isToday && startTimeDuration.asMinutes() > 1)
    errors.push({ text: 'Select a start time that is not in the past', href: '#start-time-hours' })

  if (endTime && endTimeDuration.asMinutes() > 1) {
    errors.push({ text: 'Select an end time that is not in the past', href: '#end-time-hours' })
  }
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

const getBookingDetails = req =>
  req.flash('requestBooking').reduce(
    (acc, current) => ({
      ...acc,
      ...current,
    }),
    {}
  )
const packBookingDetails = (req, data) =>
  req.flash('requestBooking', {
    ...getBookingDetails(req),
    ...data,
  })

const rePackDataIntoFlash = req => packBookingDetails(req, getBookingDetails(req))

const requestBookingFactory = ({ logError, notifyClient, whereaboutsApi, oauthApi, elite2Api }) => {
  const sendEmail = (templateId, email, personalisation) =>
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
      description: vlp.description,
    }))
  }
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: req.originalUrl })
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

    if (!prison) errors.push({ text: 'Select a prison', href: '#prison' })
    if (!endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

    validateDate(date, errors)
    validateStartEndTime(date, startTime, endTime, errors)

    if (errors.length > 0) {
      rePackDataIntoFlash(req)
      const prisonDropdownValues = (await getVideoLinkEnabledPrisons(res.locals)).map(p => ({
        text: p.description,
        value: p.agencyId,
      }))
      return renderTemplate(req, res, {
        errors,
        prisons: prisonDropdownValues,
        formValues: { ...req.body },
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

    return res.redirect('/request-booking/enter-offender-details')
  }

  const enterOffenderDetails = async (req, res) => res.render('requestBooking/offenderDetails.njk')

  const validateOffenderDetails = async (req, res) => {
    const { firstName, lastName, dobDay, dobMonth, dobYear, comments } = req.body

    const dateOfBirth = moment({ day: dobDay, month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1, year: dobYear })
    const dobIsValid =
      dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)

    const errors = []
    if (!firstName) errors.push({ text: 'Enter a first name', href: '#first-name' })
    if (!lastName) errors.push({ text: 'Enter a last name', href: '#last-name' })
    if (!dobYear && !dobDay && !dobMonth) {
      errors.push({ text: 'Enter a date of birth', href: '#dobDay' })
    }

    if (dobDay && dobMonth && dobYear) {
      const dobInThePast = dobIsValid ? dateOfBirth.isBefore(moment(), 'day') : false
      const dobIsTooEarly = dobIsValid ? dateOfBirth.isBefore(moment({ day: 1, month: 0, year: 1900 })) : true

      if (!dobIsValid) {
        errors.push({ text: 'Enter a date of birth which is a real date', href: '#dobDay' }, { href: '#dobError' })
      }

      if (dobIsValid && !dobInThePast) {
        errors.push({ text: 'Enter a date of birth which is in the past', href: '#dobDay' }, { href: '#dobError' })
      }

      if (dobIsValid && dobIsTooEarly) {
        errors.push({ text: 'Date of birth must be after 1900', href: '#dobDay' }, { href: '#dobError' })
      }
    }

    if (!dobDay && (dobMonth || dobYear)) {
      errors.push({ text: 'Date of birth must include a day', href: '#dobDay' })
    }

    if (!dobMonth && (dobDay || dobYear)) {
      errors.push({ text: 'Date of birth must include a month', href: '#dobMonth' })
    }

    if (!dobYear && (dobDay || dobMonth)) {
      errors.push({ text: 'Date of birth must include a year', href: '#dobYear' })
    }

    validateComments(comments, errors)

    if (errors.length > 0) {
      rePackDataIntoFlash(req)
      return renderTemplate(
        req,
        res,
        {
          errors,
          formValues: { ...req.body },
        },
        'requestBooking/offenderDetails.njk'
      )
    }

    packBookingDetails(req, {
      firstName,
      lastName,
      dateOfBirth: dobIsValid ? dateOfBirth.format('D MMMM YYYY') : undefined,
      comments,
    })

    return res.redirect('/request-booking/select-court')
  }

  const selectCourt = async (req, res) => {
    const { courtLocations } = await whereaboutsApi.getCourtLocations(res.locals)
    const details = getBookingDetails(req)
    const { date, startTime, endTime, prison, preAppointmentRequired, postAppointmentRequired } = details

    const getPreHearingStartAndEndTime = () => {
      if (preAppointmentRequired !== 'yes') return 'No pre court hearing added'
      const preCourtHearingStartTime = moment(startTime, DATE_TIME_FORMAT_SPEC).subtract(20, 'minute')
      const preCourtHearingEndTime = moment(startTime, DATE_TIME_FORMAT_SPEC)
      return `${Time(preCourtHearingStartTime)} to ${Time(preCourtHearingEndTime)}`
    }

    const getPostCourtHearingStartAndEndTime = () => {
      if (postAppointmentRequired !== 'yes') return 'No post court hearing added'
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

    return res.render('requestBooking/selectCourt.njk', {
      details: {
        prison: prisons.find(p => p.agencyId === prison).description,
        date: moment(date, DAY_MONTH_YEAR).format('D MMMM YYYY'),
        courtHearingStartTime: Time(startTime),
        courtHearingEndTime: Time(endTime),
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
  const createBookingRequest = async (req, res) => {
    const { hearingLocation } = req.body

    try {
      if (!hearingLocation) {
        rePackDataIntoFlash(req)
        req.flash('errors', [{ text: 'Select which court you are in', href: '#hearingLocation' }])

        return res.redirect('/request-booking/select-court')
      }

      const bookingDetails = getBookingDetails(req)
      const {
        firstName,
        lastName,
        dateOfBirth,
        date,
        startTime,
        endTime,
        comment,
        prison,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      } = bookingDetails

      const prisons = await elite2Api.getAgencies(res.locals)

      const personalisation = {
        firstName,
        lastName,
        dateOfBirth,
        date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
        startTime: Time(startTime),
        endTime: endTime && Time(endTime),
        prison: prisons.find(p => p.agencyId === prison).description,
        hearingLocation,
        comment,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      }

      const { username } = req.session.userDetails
      const { email } = await oauthApi.userEmail(res.locals, username)

      packBookingDetails(req, personalisation)

      const { vlb } = emailConfig[prison]

      sendEmail(requestBookingCourtTemplateId, vlb, personalisation).catch(error => {
        logError(req.originalUrl, error, 'Failed to email the prison about a booking request')
      })

      sendEmail(requestBookingCourtTemplateId, email, personalisation).catch(error => {
        logError(req.originalUrl, error, 'Failed to email the requester a copy of the booking')
      })

      return res.redirect('/request-booking/confirmation')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const confirm = async (req, res) => {
    const requestDetails = getBookingDetails(req)
    if (!requestDetails) throw new Error('Request details are missing')

    const {
      firstName,
      lastName,
      dateOfBirth,
      prison,
      startTime,
      endTime,
      comment,
      date,
      preHearingStartAndEndTime,
      postHearingStartAndEndTime,
      hearingLocation,
    } = requestDetails

    const details = {
      prison,
      name: `${lastName}, ${firstName}`,
      dateOfBirth,
      date,
      courtHearingStartTime: startTime,
      courtHearingEndTime: endTime,
      comment,
      'pre-court hearing briefing': preHearingStartAndEndTime,
      'post-court hearing briefing': postHearingStartAndEndTime,
      courtLocation: hearingLocation,
    }

    return res.render('requestBooking/requestBookingConfirmation.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/videolink',
      title: 'The video link has been requested',
      details,
    })
  }
  return {
    startOfJourney,
    checkAvailability,
    validateOffenderDetails,
    selectCourt,
    createBookingRequest,
    enterOffenderDetails,
    confirm,
  }
}

module.exports = {
  requestBookingFactory,
}
