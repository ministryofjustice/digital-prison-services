const moment = require('moment')
const { serviceUnavailableMessage } = require('../common-messages')

const prisonerSearchFactory = (oauthApi, elite2Api, logError) => {
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/' })
  }

  const renderTemplate = async (req, res, pageData) => {
    try {
      const userRoles = await oauthApi.userRoles(res.locals)
      const hasSearchAccess = userRoles.find(role => role.roleCode === 'VIDEO_LINK_COURT_USER')

      if (hasSearchAccess) {
        return res.render('prisonerSearch.njk', {
          ...pageData,
        })
      }

      return res.redirect('back')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const { nameOrNumber, dobDay, dobMonth, dobYear, prison } = req.body
    const dateOfBirth = moment({ day: dobDay, month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1, year: dobYear })
    const dobIsValid =
      dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)
    const errors = []

    if (!nameOrNumber) {
      errors.push({ text: 'Enter prisoner name or number', href: '#nameOrNumber' })
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

    if (errors.length > 0) {
      return renderTemplate(req, res, {
        errors,
        formValues: req.body,
      })
    }

    return res.send({
      nameOrNumber,
      dob: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
      prison,
    })
  }

  return { index, post }
}

module.exports = {
  prisonerSearchFactory,
}
