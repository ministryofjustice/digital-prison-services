const moment = require('moment')
const querystring = require('querystring')
const { serviceUnavailableMessage } = require('../../common-messages')
const { formatName } = require('../../utils')
const config = require('../../config')
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
      const hasSearched = Object.keys(req.query).length
      let searchResults = []

      if (hasSearchAccess) {
        const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear, prison } = req.query

        if (hasSearched) {
          const dateOfBirth = moment({
            day: dobDay,
            month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1,
            year: dobYear,
          })
          const dobIsValid =
            dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)
          const dob = dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined

          searchResults = await elite2Api.globalSearch(res.locals, {
            offenderNo: prisonNumber,
            lastName,
            firstName,
            dateOfBirth: dob,
            location: 'IN',
          })
        }

        const results = searchResults
          .filter(result => (prison ? prison === result.latestLocationId : result))
          .map(result => {
            const { offenderNo, latestLocationId, pncNumber } = result
            const name = formatName(result.firstName, result.lastName)

            return {
              name,
              offenderNo,
              dob: result.dateOfBirth ? moment(result.dateOfBirth).format('D MMMM YYYY') : undefined,
              prison: result.latestLocation,
              prisonId: latestLocationId,
              pncNumber: pncNumber || '--',
              addAppointmentHTML: config.app.videoLinkEnabledFor.includes(latestLocationId)
                ? `<a href="/${latestLocationId}/offenders/${offenderNo}/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="visually-hidden"> for ${name}, prison number ${offenderNo}</span></a>`
                : '',
            }
          })

        const hasOtherSearchDetails = prisonNumber || dobDay || dobMonth || dobYear || prison

        return res.render('prisonerSearch.njk', {
          ...pageData,
          agencyOptions,
          results,
          hasSearched,
          homeUrl: '/videolink',
          formValues: hasSearched ? req.query : req.body,
          hasOtherSearchDetails,
        })
      }

      return res.redirect('back')
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    const errors = prisonerSearchValidation(req.body)

    if (errors.length > 0) {
      return renderTemplate(req, res, {
        errors,
      })
    }

    const searchQuery = querystring.stringify(req.body)

    return res.redirect(`/prisoner-search?${searchQuery}`)
  }

  return { index, post }
}

module.exports = {
  prisonerSearchFactory,
}
