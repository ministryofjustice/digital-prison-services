const moment = require('moment')

const { serviceUnavailableMessage } = require('../../common-messages')
const { alertFlagLabels, cellMoveAlertCodes } = require('../../shared/alertFlagValues')
const { putLastNameFirst } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const prisonerDetails = await elite2Api.getDetails(res.locals, offenderNo, true)
    const nonAssociations = await elite2Api.getNonAssociations(res.locals, prisonerDetails.bookingId)

    const prisonersActiveAlertCodes = prisonerDetails.alerts
      .filter(alert => !alert.expired)
      .map(alert => alert.alertCode)
    const alertsToShow = alertFlagLabels.filter(alertFlag =>
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
      prisonerDetails,
      offenderNo,
      dpsUrl,
      nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
