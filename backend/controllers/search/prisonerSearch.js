const moment = require('moment')
const querystring = require('querystring')
const { serviceUnavailableMessage } = require('../../common-messages')

const prisonerSearchFactory = (oauthApi, elite2Api, logError) => {
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('courtServiceError.njk', { url: '/', homeUrl: '/videolink' })
  }

  const renderTemplate = async (req, res, pageData) => {
    try {
      const [userRoles, agencies] = await Promise.all([
        oauthApi.userRoles(res.locals),
        elite2Api.getAgencies(res.locals),
      ])
      const hasSearchAccess = userRoles.find(role => role.roleCode === 'VIDEO_LINK_COURT_USER')
      const agencyOptions = agencies
        .map(agency => ({ value: agency.agencyId, text: agency.description }))
        .sort((a, b) => a.text.localeCompare(b.text))

      if (hasSearchAccess) {
        return res.render('prisonerSearch.njk', {
          ...pageData,
          agencyOptions,
          homeUrl: '/videolink',
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
      errors.push({ text: 'Enter a name or prison number', href: '#nameOrNumber' })
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

    if (errors.length > 0) {
      return renderTemplate(req, res, {
        errors,
        formValues: req.body,
      })
    }

    const searchQuery = querystring.stringify({
      nameOrNumber,
      dob: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
      prison,
    })

    return res.redirect(`/prisoner-search/results?${searchQuery}`)
  }

  return { index, post }
}

module.exports = {
  prisonerSearchFactory,
}
