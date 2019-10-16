const { forenameToInitial, chunk } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const renderError = error => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const { data } = req.session

  if (!data || !data.prisonersListed.length) {
    return renderError()
  }

  try {
    const {
      data: { prisonersListed },
      userDetails,
    } = req.session

    const createdBy = forenameToInitial(userDetails.name)
    const offenderNumbers = prisonersListed.map(prisoner => prisoner.offenderNo)
    const chunkedOffenderNumbers = chunk(offenderNumbers, 100)

    const offenderSummaryApiCalls = chunkedOffenderNumbers.map(offendersChunk => ({
      getOffenderSummaries: elite2Api.getOffenderSummaries,
      offenders: offendersChunk,
    }))

    const offenderSummaries = await Promise.all(
      offenderSummaryApiCalls.map(apiCall => apiCall.getOffenderSummaries(res.locals, apiCall.offenders))
    ).then(offenders => offenders.reduce((flattenedOffenders, offender) => flattenedOffenders.concat(offender), []))

    const prisonersListedWithCellInfo = prisonersListed.map(prisoner => {
      const prisonerDetails = offenderSummaries.find(offender => prisoner.offenderNo === offender.offenderNo)

      return {
        ...prisoner,
        assignedLivingUnitDesc: prisonerDetails && prisonerDetails.assignedLivingUnitDesc,
      }
    })

    return res.render('movementSlipsPage.njk', {
      appointmentDetails: { ...data, createdBy, prisonersListed: prisonersListedWithCellInfo },
    })
  } catch (error) {
    return renderError(error)
  }
}
