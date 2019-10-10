const { forenameToInitial } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const renderError = error => {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  if (!req.session.data) {
    return renderError()
  }

  try {
    const {
      data,
      data: { prisonersListed },
      userDetails,
    } = req.session

    const createdBy = forenameToInitial(userDetails.name)
    const offenderNumbers = prisonersListed.map(prisoner => prisoner.offenderNo)
    const offenderSummaries = await elite2Api.getOffenderSummaries(res.locals, offenderNumbers)
    const prisonersListedWithCellInfo = prisonersListed.map(prisoner => {
      const prisonerDetails = offenderSummaries.find(offender => prisoner.offenderNo === offender.offenderNo)

      return {
        ...prisoner,
        assignedLivingUnitDesc: prisonerDetails.assignedLivingUnitDesc,
      }
    })

    return res.render('movementSlipsPage.njk', {
      appointmentDetails: { ...data, createdBy, prisonersListed: prisonersListedWithCellInfo },
    })
  } catch (error) {
    return renderError(error)
  }
}
