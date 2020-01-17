const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { properCaseName, isOffenderNumber } = require('../../utils')

module.exports = ({ oauthApi, elite2Api, logError }) => async (req, res) => {
  try {
    const userRoles = await oauthApi.userRoles(res.locals)
    const hasSearchAccess = userRoles.find(role => role.roleCode === 'VIDEO_LINK_COURT_USER')

    if (hasSearchAccess) {
      const { nameOrNumber = '', dob, prison } = req.query

      const formattedNameOrNumber = nameOrNumber
        .replace(/,/g, ' ')
        .replace(/\s\s+/g, ' ')
        .trim()

      const [lastName, firstName] = !isOffenderNumber(formattedNameOrNumber)
        ? formattedNameOrNumber.split(' ')
        : [null, null]

      const searchResults = await elite2Api.globalSearch(res.locals, {
        offenderNo: isOffenderNumber(formattedNameOrNumber) ? nameOrNumber : undefined,
        lastName,
        firstName,
        dateOfBirth: dob,
        location: 'IN',
      })

      const prisonDetails = prison ? await elite2Api.getAgencyDetails(res.locals, prison) : undefined

      const formattedSearchParams = {
        nameOrNumber,
        dob: dob ? moment(dob).format('DD/MM/YYYY') : undefined,
        prison: prisonDetails ? prisonDetails.description : undefined,
      }

      return res.render('prisonerSearchResults.njk', {
        searchString: Object.keys(formattedSearchParams)
          .filter(param => formattedSearchParams[param])
          .map(param => formattedSearchParams[param])
          .join(' + '),
        results: searchResults.filter(result => (prison ? prison === result.latestLocationId : result)).map(result => ({
          name: `${properCaseName(result.lastName)}, ${properCaseName(result.firstName)}`,
          offenderNo: result.offenderNo,
          dob: result.dateOfBirth ? moment(result.dateOfBirth).format('DD/MM/YYYY') : undefined,
          prison: result.latestLocation,
          pncNumber: result.pncNumber ? result.pncNumber : '--',
        })),
      })
    }

    return res.redirect('back')
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/' })
  }
}
