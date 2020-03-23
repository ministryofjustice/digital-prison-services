const { forenameToInitial, chunkArray } = require('../../utils')
const { serviceUnavailableMessage } = require('../../common-messages')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const renderError = error => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const { appointmentDetails, prisonersListed } = req.session.appointmentSlipsData

  if (!appointmentDetails || !prisonersListed) {
    return renderError()
  }

  try {
    const { userDetails } = req.session

    const createdBy = forenameToInitial(userDetails.name)
    const offenderNumbers = prisonersListed.map(prisoner => prisoner.offenderNo)
    const chunkedOffenderNumbers = chunkArray(offenderNumbers, 100)

    const offenderSummaryApiCalls = chunkedOffenderNumbers.map(offendersChunk => ({
      getOffenderSummaries: elite2Api.getOffenderSummaries,
      offenders: offendersChunk,
    }))

    const offenderSummaries = (await Promise.all(
      offenderSummaryApiCalls.map(apiCall => apiCall.getOffenderSummaries(res.locals, apiCall.offenders))
    )).reduce((flattenedOffenders, offender) => flattenedOffenders.concat(offender), [])

    const prisonersListedWithCellInfo = prisonersListed.map(prisoner => {
      const prisonerDetails = offenderSummaries.find(offender => prisoner.offenderNo === offender.offenderNo)

      return {
        ...prisoner,
        assignedLivingUnitDesc: prisonerDetails && prisonerDetails.assignedLivingUnitDesc,
      }
    })

    return res.render('movementSlipsPage.njk', {
      appointmentDetails: { ...appointmentDetails, createdBy, prisonersListed: prisonersListedWithCellInfo },
    })
  } catch (error) {
    return renderError(error)
  }
}
