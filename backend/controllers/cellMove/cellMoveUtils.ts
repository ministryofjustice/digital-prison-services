// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getNonAsso... Remove this comment to see the full error message
const getNonAssocationsInEstablishment = (nonAssociations) =>
  nonAssociations?.nonAssociations?.filter(
    (nonAssociation) =>
      nonAssociation.offenderNonAssociation &&
      nonAssociation.offenderNonAssociation.agencyDescription.toLowerCase() ===
        nonAssociations.agencyDescription.toLowerCase() &&
      (!nonAssociation.expiryDate || moment(nonAssociation.expiryDate, 'YYYY-MM-DDTHH:mm:ss') > moment()) &&
      nonAssociation.effectiveDate &&
      moment(nonAssociation.effectiveDate, 'YYYY-MM-DDTHH:mm:ss') <= moment()
  ) || []

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getBackLin... Remove this comment to see the full error message
const getBackLinkData = (referer, offenderNo) => {
  const backLink = referer || `/prisoner/${offenderNo}/cell-move/search-for-cell`
  return {
    backLink,
    backLinkText: backLink.includes('search-for-cell')
      ? 'Return to search for a cell'
      : 'Return to select an available cell',
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getConfirm... Remove this comment to see the full error message
const getConfirmBackLinkData = (referer, offenderNo) => {
  const backLink = referer || `/prisoner/${offenderNo}/cell-move/search-for-cell`

  return {
    backLink: ['consider-risks', 'select-cell'].some((part) => backLink.includes(part))
      ? `/prisoner/${offenderNo}/cell-move/select-cell`
      : backLink,
    backLinkText: ['consider-risks', 'select-cell'].some((part) => backLink.includes(part))
      ? 'Select another cell'
      : 'Cancel',
  }
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'renderLoca... Remove this comment to see the full error message
const renderLocationOptions = (locations) => [
  { text: 'All residential units', value: 'ALL' },
  ...locations.map((location) => ({ text: location.name, value: location.key })),
]

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'userHasAcc... Remove this comment to see the full error message
const userHasAccess = ({ userRoles, userCaseLoads, offenderCaseload }) => {
  const hasCellMoveRole = userRoles && userRoles.some((role) => role.roleCode === 'CELL_MOVE')
  const offenderInCaseload = userCaseLoads && userCaseLoads.some((caseload) => caseload.caseLoadId === offenderCaseload)
  return hasCellMoveRole && offenderInCaseload
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'cellAttrib... Remove this comment to see the full error message
const cellAttributes = [
  { text: 'Single occupancy', value: 'SO' },
  { text: 'Multiple occupancy', value: 'MO' },
]

module.exports = {
  getNonAssocationsInEstablishment,
  getBackLinkData,
  userHasAccess,
  renderLocationOptions,
  getConfirmBackLinkData,
  cellAttributes,
}
