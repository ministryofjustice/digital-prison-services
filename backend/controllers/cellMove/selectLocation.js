const { serviceUnavailableMessage } = require('../../common-messages')
const alertFlagValues = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const cellMoveAlertCodes = [
  'PEEP',
  'XTACT',
  'RTP',
  'RLG',
  'XHT',
  'XGANG',
  'XR',
  'XA',
  'XEL',
  'CSIP',
  'URCU',
  'UPIU',
  'USU',
  'URS',
]

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagValues.filter(alertFlag =>
      alertFlag.alertCodes.some(
        alert => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
      )
    )

    const showNonAssociationsLink =
      nonAssociations &&
      nonAssociations.nonAssociations.some(
        nonAssociation =>
          nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
          prisonerDetails.assignedLivingUnit.agencyName.toLowerCase()
      )

    return res.render('cellMove/cellSearch.njk', {
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      showNonAssociationsLink,
      alerts: alertsToShow,
      prisonerDetails,
      offenderNo,
      dpsUrl,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
