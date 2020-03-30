const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { formatName } = require('../../utils')
const config = require('../../config')

module.exports = ({ oauthApi, elite2Api, logError }) => async (req, res) => {
  try {
    const userRoles = await oauthApi.userRoles(res.locals)
    const hasSearchAccess = userRoles.find(role => role.roleCode === 'VIDEO_LINK_COURT_USER')

    if (hasSearchAccess) {
      const { firstName, lastName, prisonNumber, dobDay, dobMonth, dobYear, prison } = req.query

      const dateOfBirth = moment({
        day: dobDay,
        month: Number.isNaN(dobMonth) ? dobMonth : dobMonth - 1,
        year: dobYear,
      })
      const dobIsValid =
        dateOfBirth.isValid() && !Number.isNaN(dobDay) && !Number.isNaN(dobMonth) && !Number.isNaN(dobYear)
      const dob = dobIsValid ? dateOfBirth.format('YYYY-MM-DD') : undefined

      const searchResults = await elite2Api.globalSearch(res.locals, {
        offenderNo: prisonNumber,
        lastName,
        firstName,
        dateOfBirth: dob,
        location: 'IN',
      })

      return res.render('prisonerSearchResults.njk', {
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
              ? `<a href="/${latestLocationId}/offenders/${offenderNo}/add-court-appointment" class="govuk-link" data-qa="book-vlb-link">Book video link<span class="visually-hidden"> for ${name}, prison number ${offenderNo}</span></a>`
              : '',
          }
        }),
        homeUrl: '/videolink',
      })
    }

    return res.redirect('back')
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('courtServiceError.njk', { url: '/', homeUrl: '/videolink' })
  }
}
