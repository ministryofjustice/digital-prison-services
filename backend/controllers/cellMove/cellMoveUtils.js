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

const getBackLinkData = (referer, offenderNo) => {
  const backLink = referer || `/prisoner/${offenderNo}/cell-move/search-for-cell`
  return {
    backLink,
    backLinkText: backLink.includes('search-for-cell')
      ? 'Return to search for a cell'
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
  getBackLinkData,
  userHasAccess,
}
