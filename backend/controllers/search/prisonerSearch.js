const moment = require('moment')
const querystring = require('querystring')
const { serviceUnavailableMessage } = require('../../common-messages')
const prisonerSearchValidation = require('./prisonerSearchValidation')

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
    const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear, prison } = req.body
    const dateOfBirth = moment({ day: dobDay, month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1, year: dobYear })
    const dobIsValid =
      dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)
    const errors = prisonerSearchValidation(req.body)

    if (errors.length > 0) {
      const hasOtherSearchDetails = prisonNumber || dobDay || dobMonth || dobYear || prison

      return renderTemplate(req, res, {
        errors,
        formValues: req.body,
        hasOtherSearchDetails,
      })
    }

    const searchQuery = querystring.stringify({
      firstName,
      lastName,
      prisonNumber,
      dob: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
      prison,
    })

    // return res.redirect(`/prisoner-search/results?${searchQuery}`)
    return res.send(JSON.stringify(searchQuery))
  }

  return { index, post }
}

module.exports = {
  prisonerSearchFactory,
}
