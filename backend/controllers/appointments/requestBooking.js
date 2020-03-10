const moment = require('moment')
const { buildDateTime, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../../common-messages')
const { validateComments, validateDate, validateStartEndTime } = require('../../shared/appointmentConstants')
const {
  notifications: { requestBookingCourtTemplateId },
} = require('../../config')

const prisonsContactConfig = [{ text: 'HMP Wandsworth', value: 'dominic.bull@digital.justice.gov.uk' }]

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

const requestBookingFactory = ({ logError, notifyClient, whereaboutsApi, oauthApi }) => {
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

  const startOfJourney = async (req, res) =>
    res.render('requestBooking/requestBooking.njk', {
      user: { displayName: req.session.userDetails.name },
      prisonsContactConfig,
      homeUrl: '/videolink',
    })

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
      errors.push({ text: 'Select if a pre-court hearing briefing is required', href: '#pre-appointment-required' })

    if (!postAppointmentRequired)
      errors.push({ text: 'Select if a post-court hearing briefing is required', href: '#post-appointment-required' })

    if (!prison) errors.push({ text: 'Select a prison', href: '#prison' })
    if (!endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })

    validateDate(date, errors)
    validateStartEndTime(date, startTime, endTime, errors)

    if (errors.length > 0) {
      rePackDataIntoFlash(req)
      return renderTemplate(req, res, {
        errors,
        prisonsContactConfig,
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
        errors.push({ text: 'Enter a real date of birth', href: '#dobDay' }, { href: '#dobError' })
      }

      if (dobIsValid && !dobInThePast) {
        errors.push({ text: 'Date of birth must be in the past', href: '#dobDay' }, { href: '#dobError' })
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

    return res.render('requestBooking/selectCourt.njk', {
      details: {
        prison: prisonsContactConfig.find(p => p.value === prison).text,
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
        req.flash('errors', [{ text: 'Select a court location', href: '#hearingLocation' }])

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

      const personalisation = {
        firstName,
        lastName,
        dateOfBirth,
        date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
        startTime: Time(startTime),
        endTime: endTime && Time(endTime),
        prison,
        hearingLocation,
        comment,
        preHearingStartAndEndTime,
        postHearingStartAndEndTime,
      }

      const { username } = req.session.userDetails
      const { email } = await oauthApi.userEmail(res.locals, username)

      packBookingDetails(req, personalisation)

      notifyClient.sendEmail(requestBookingCourtTemplateId, prison, {
        personalisation,
        reference: null,
      })

      notifyClient.sendEmail(requestBookingCourtTemplateId, email, {
        personalisation,
        reference: null,
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
      prison: prisonsContactConfig.find(p => p.value === prison).text,
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
