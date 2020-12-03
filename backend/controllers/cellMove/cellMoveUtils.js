const moment = require('moment')

const getNonAssocationsInEstablishment = nonAssociations =>
  nonAssociations?.nonAssociations?.filter(
    nonAssociation =>
      nonAssociation.offenderNonAssociation &&
      nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
        nonAssociations.agencyDescription.toLowerCase() &&
      (!nonAssociation.expiryDate || moment(nonAssociation.expiryDate, 'YYYY-MM-DDTHH:mm:ss') > moment()) &&
      (nonAssociation.effectiveDate && moment(nonAssociation.effectiveDate, 'YYYY-MM-DDTHH:mm:ss') <= moment())
  ) || []

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
  getNonAssocationsInEstablishment,
  showCsraLink,
  getBackLinkData,
  userHasAccess,
}
