const moment = require('moment')

// The link should only appear if there are active non-associations in the same establishment
// Active means the effective date is not in the future and the expiry date is not in the past
const showNonAssociationsLink = (nonAssociations, assignedLivingUnit) => {
  return (
    nonAssociations.nonAssociations &&
    nonAssociations.nonAssociations.some(
      nonAssociation =>
        nonAssociation.offenderNonAssociation &&
        assignedLivingUnit &&
        nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
          assignedLivingUnit.agencyName.toLowerCase() &&
        (!nonAssociation.expiryDate || moment(nonAssociation.expiryDate, 'YYYY-MM-DDTHH:mm:ss') > moment()) &&
        (nonAssociation.effectiveDate && moment(nonAssociation.effectiveDate, 'YYYY-MM-DDTHH:mm:ss') <= moment())
    )
  )
}

const showCsraLink = assessments => {
  return assessments.some(assessment => assessment.assessmentCode.includes('CSR') && assessment.assessmentComment)
}

const getBackLinkData = (referer, offenderNo) => {
  const backLink = referer || `/prisoner/${offenderNo}/cell-move/select-location`
  return {
    backLink,
    backLinkText: backLink.includes('select-location')
      ? 'Return to select a location'
      : 'Return to select an available cell',
  }
}

const userHasAccess = ({ userRoles, userCaseLoads, offenderCaseload }) => {
  const hasCellMoveRole = userRoles && userRoles.some(role => role.roleCode === 'CELL_MOVE')
  const offenderInCaseload = userCaseLoads && userCaseLoads.some(caseload => caseload.caseLoadId === offenderCaseload)
  return hasCellMoveRole && offenderInCaseload
}

module.exports = {
  showNonAssociationsLink,
  showCsraLink,
  getBackLinkData,
  userHasAccess,
}
