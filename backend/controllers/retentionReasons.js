const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const { serviceUnavailableMessage } = require('../common-messages')

const retentionReasonsFactory = (elite2Api, logError) => {
  const getOffenderUrl = offenderNo => `${dpsUrl}offenders/${offenderNo}`

  const renderError = (req, res, error) => {
    const { offenderNo } = req.params
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: getOffenderUrl(offenderNo) })
  }

  const renderTemplate = async (req, res) => {
    try {
      const { offenderNo } = req.params
      const offenderDetails = await elite2Api.getDetails(res.locals, offenderNo)
      const agencies = await elite2Api.getAgencies(res.locals)
      const agency = agencies.find(a => a.agencyId === offenderDetails.agencyId).description
      const offenderUrl = getOffenderUrl(offenderNo)

      return res.render('retentionReasons.njk', {
        agency,
        offenderUrl,
        offenderBasics: {
          offenderNo: offenderDetails.offenderNo,
          firstName: offenderDetails.firstName,
          lastName: offenderDetails.lastName,
          dateOfBirth: offenderDetails.dateOfBirth,
        },
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  return { index }
}

module.exports = {
  retentionReasonsFactory,
}
