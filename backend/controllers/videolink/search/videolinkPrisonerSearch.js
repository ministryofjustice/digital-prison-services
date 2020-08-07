const moment = require('moment')
const { serviceUnavailableMessage } = require('../../../common-messages')
const { formatName } = require('../../../utils')
const config = require('../../../config')
const videolinkPrisonerSearchValidation = require('./videolinkPrisonerSearchValidation')
const dobValidation = require('../../../shared/dobValidation')

module.exports = ({ oauthApi, elite2Api, logError }) => async (req, res) => {
  try {
    const userRoles = await oauthApi.userRoles(res.locals)
    const hasSearchAccess = userRoles.find(role => role.roleCode === 'VIDEO_LINK_COURT_USER')

    if (hasSearchAccess) {
      const agencies = await elite2Api.getAgencies(res.locals)
      let searchResults = []
      const hasSearched = Boolean(Object.keys(req.query).length)
      const errors = hasSearched ? videolinkPrisonerSearchValidation(req.query) : []
      const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear, prison } = req.query

      if (hasSearched && !errors.length) {
        const { dobIsValid, dateOfBirth } = dobValidation(dobDay, dobMonth, dobYear)

        searchResults = await elite2Api.globalSearch(
          res.locals,
          {
            offenderNo: prisonNumber,
            lastName,
            firstName,
            dateOfBirth: dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined,
            location: 'IN',
          },
          1000
        )
      }

      return res.render('videolinkPrisonerSearch.njk', {
        agencyOptions: agencies
          .map(agency => ({ value: agency.agencyId, text: agency.formattedDescription || agency.description }))
          .sort((a, b) => a.text.localeCompare(b.text)),
        errors,
        formValues: req.query,
        homeUrl: '/videolink',
        results: searchResults.filter(result => (prison ? prison === result.latestLocationId : result)).map(result => {
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
              ? `<a href="/${latestLocationId}/offenders/${offenderNo}/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="govuk-visually-hidden"> for ${name}, prison number ${offenderNo}</span></a>`
              : '',
          }
        }),
        hasSearched,
        hasOtherSearchDetails: prisonNumber || dobDay || dobMonth || dobYear || prison,
      })
    }

    return res.redirect('back')
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('courtServiceError.njk', { url: '/', homeUrl: '/videolink' })
  }
}
