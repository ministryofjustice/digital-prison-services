const moment = require('moment')

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
  'RCON',
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

module.exports = ({ elite2Api, whereaboutsApi, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)
    const cellAttributesData = await elite2Api.getCellAttributes(res.locals)
    const locationsData = await whereaboutsApi.searchGroups(res.locals, prisonerDetails.agencyId)

    const locations = locationsData.map(location => ({ text: location.name, value: location.key }))
    const cellAttributes = cellAttributesData
      .filter(cellAttribute => 'Y'.includes(cellAttribute.activeFlag))
      .map(cellAttribute => ({ text: cellAttribute.description, value: cellAttribute.code }))

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagValues.filter(alertFlag =>
      alertFlag.alertCodes.some(
        alert => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
      )
    )

    const showCsraLink =
      prisonerDetails.assessments &&
      prisonerDetails.assessments.some(
        assessment => assessment.assessmentCode === 'CSR' && assessment.assessmentComment
      )

    // The link should only appear if there are active non-associations in the same establishment
    // Active means the effective date is not in the future and the expiry date is not in the past
    const showNonAssociationsLink =
      nonAssociations &&
      nonAssociations.nonAssociations &&
      nonAssociations.nonAssociations.some(
        nonAssociation =>
          nonAssociation.offenderNonAssociation &&
          prisonerDetails.assignedLivingUnit &&
          nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
            prisonerDetails.assignedLivingUnit.agencyName.toLowerCase() &&
          (!nonAssociation.expiryDate || moment(nonAssociation.expiryDate, 'YYYY-MM-DDTHH:mm:ss') > moment()) &&
          (nonAssociation.effectiveDate && moment(nonAssociation.effectiveDate, 'YYYY-MM-DDTHH:mm:ss') <= moment())
      )

    return res.render('cellMove/selectLocation.njk', {
      breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
      showNonAssociationsLink,
      showCsraLink,
      alerts: alertsToShow,
      locations,
      cellAttributes,
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
      selectLocationRootUrl: `/prisoner/${offenderNo}/cell-move/select-location`,
      formAction: `/prisoner/${offenderNo}/cell-move/select-cell`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
