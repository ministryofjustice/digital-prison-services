const moment = require('moment')
const { buildDateTime, DATE_TIME_FORMAT_SPEC, DAY_MONTH_YEAR, Time } = require('../../../src/dateHelpers')
const { serviceUnavailableMessage } = require('../../common-messages')
const { validateComments, validateDate, validateStartEndTime } = require('../../shared/appointmentConstants')
const {
  notifications: { requestBookingCourtTemplateId },
} = require('../../config')

const requestBookingFactory = ({ logError, notifyClient }) => {
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: req.originalUrl })
  }

  const renderTemplate = async (req, res, pageData) => {
    const { formValues, errors } = pageData || {}
    try {
      return res.render('requestBooking/requestBooking.njk', {
        user: { displayName: req.session.userDetails.name },
        homeUrl: '/videolink',
        errors,
        formValues,
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const {
      firstName,
      lastName,
      dobDay,
      dobMonth,
      dobYear,
      prison,
      hearingLocation,
      caseNumber,
      date,
      startTimeHours,
      startTimeMinutes,
      endTimeHours,
      endTimeMinutes,
      comments,
    } = req.body

    const startTime = buildDateTime({ date, hours: startTimeHours, minutes: startTimeMinutes })
    const endTime = buildDateTime({ date, hours: endTimeHours, minutes: endTimeMinutes })
    const dateOfBirth = moment({ day: dobDay, month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1, year: dobYear })
    const dobIsValid =
      dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)

    const errors = []
    if (!firstName) errors.push({ text: 'Enter a first name', href: '#first-name' })
    if (!lastName) errors.push({ text: 'Enter a last name', href: '#last-name' })
    if (!hearingLocation) errors.push({ text: 'Enter a court (hearing) location', href: '#hearing-location' })
    if (!caseNumber) errors.push({ text: 'Enter a case number', href: '#case-number' })
    if (!prison) errors.push({ text: 'Select a prison', href: '#prison' })
    if (!endTime) errors.push({ text: 'Select an end time', href: '#end-time-hours' })
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

    validateDate(date, errors)
    validateStartEndTime(date, startTime, endTime, errors)
    validateComments(comments, errors)

    if (errors.length > 0) {
      return renderTemplate(req, res, {
        errors,
        formValues: { ...req.body },
      })
    }

    const request = {
      bookingDetails: {
        firstName,
        lastName,
        dateOfBirth: dobIsValid ? dateOfBirth.format('D MMMM YYYY') : undefined,
        prison,
        caseNumber,
        hearingLocation,
        date,
        comment: comments,
        startTime: startTime.format(DATE_TIME_FORMAT_SPEC),
        endTime: endTime && endTime.format(DATE_TIME_FORMAT_SPEC),
      },
    }

    try {
      req.flash('bookingDetails', {
        ...request.bookingDetails,
      })
      return res.redirect(`/request-booking/confirmation`)
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const confirm = async (req, res) => {
    const requestDetails = req.flash('bookingDetails')
    if (!requestDetails || !requestDetails.length) throw new Error('Request details are missing')

    const {
      firstName,
      lastName,
      dateOfBirth,
      prison,
      startTime,
      endTime,
      comment,
      date,
      hearingLocation,
      caseNumber,
    } = requestDetails.reduce(
      (acc, current) => ({
        ...acc,
        ...current,
      }),
      {}
    )
    const details = {
      firstName,
      lastName,
      dateOfBirth,
      date: moment(date, DAY_MONTH_YEAR).format('dddd D MMMM YYYY'),
      startTime: Time(startTime),
      endTime: endTime && Time(endTime),
      prison,
      courtHearingLocation: hearingLocation,
      caseNumber,
      comment,
    }

    notifyClient.sendEmail(requestBookingCourtTemplateId, prison, {
      personalisation: { ...details, hearingLocation },
      reference: null,
    })

    return res.render('requestBooking/requestBookingConfirmation.njk', {
      user: { displayName: req.session.userDetails.name },
      homeUrl: '/videolink',
      title: 'Request submitted',
      details,
    })
  }
  return { index, post, confirm }
}

module.exports = {
  requestBookingFactory,
}
