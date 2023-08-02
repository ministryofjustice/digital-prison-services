import { csraTranslations } from '../../shared/csraHelpers'

export const getBackLinkData = (referer, offenderNo) => {
  const backLink = referer || `/prisoner/${offenderNo}/cell-move/search-for-cell`
  return {
    backLink,
    backLinkText: backLink.includes('search-for-cell')
      ? 'Return to search for a cell'
      : 'Return to select an available cell',
  }
}

export const getConfirmBackLinkData = (referer, offenderNo) => {
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

export const renderLocationOptions = (locations) => [
  { text: 'All residential units', value: 'ALL' },
  ...locations.map((location) => ({ text: location.name, value: location.key })),
]

export const userHasAccess = ({ userRoles, userCaseLoads, offenderCaseload }) => {
  const hasCellMoveRole = userRoles && userRoles.some((role) => role.roleCode === 'CELL_MOVE')
  const offenderInCaseload = userCaseLoads && userCaseLoads.some((caseload) => caseload.caseLoadId === offenderCaseload)
  return hasCellMoveRole && offenderInCaseload
}

export const cellAttributes = [
  { text: 'Single occupancy', value: 'SO' },
  { text: 'Multiple occupancy', value: 'MO' },
]

export const translateCsra = (csraClassificationCode: string): string => {
  if (!csraClassificationCode) return 'not entered'
  return csraTranslations[csraClassificationCode]
}

export default {
  getBackLinkData,
  userHasAccess,
  renderLocationOptions,
  getConfirmBackLinkData,
  cellAttributes,
  translateCsra,
}
