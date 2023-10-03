import moment from 'moment'
import { csraTranslations } from '../../shared/csraHelpers'
import { OffenderNonAssociationLegacy } from '../../api/nonAssociationsApi'

export const getNonAssociationsInEstablishment = async (
  nonAssociations: OffenderNonAssociationLegacy,
  context,
  prisonApi
) => {
  const validNonAssociations = nonAssociations?.nonAssociations?.filter(
    (nonAssociation) =>
      nonAssociation.offenderNonAssociation &&
      (!nonAssociation.expiryDate || moment(nonAssociation.expiryDate, 'YYYY-MM-DDTHH:mm:ss') > moment()) &&
      nonAssociation.effectiveDate &&
      moment(nonAssociation.effectiveDate, 'YYYY-MM-DDTHH:mm:ss') <= moment()
  )

  if (!validNonAssociations) return []

  const offenderNos = validNonAssociations.map((nonAssociation) => nonAssociation.offenderNonAssociation.offenderNo)
  offenderNos.push(nonAssociations.offenderNo)

  const offenderResults = await Promise.allSettled(
    offenderNos.map(async (offenderNo) => prisonApi.getDetails(context, offenderNo, true))
  )

  const offendersFound = offenderResults.filter(
    (result) => result.status === 'fulfilled'
  ) as PromiseFulfilledResult<any>[]
  const offenders = offendersFound.map((result) => result.value)
  const offenderMap = offenders.reduce((memo, offender) => ({ ...memo, [offender.offenderNo]: offender }), {})

  validNonAssociations.forEach((nonAssociation) => {
    const livingUnit = offenderMap[nonAssociation.offenderNonAssociation.offenderNo]?.assignedLivingUnit

    /* eslint-disable no-param-reassign */
    nonAssociation.offenderNonAssociation.agencyDescription = livingUnit?.agencyName
    nonAssociation.offenderNonAssociation.assignedLivingUnitDescription = livingUnit?.description
    /* eslint-enable no-param-reassign */
  })

  return validNonAssociations.filter(
    (nonAssociation) =>
      offenderMap[nonAssociations.offenderNo].agencyId ===
      offenderMap[nonAssociation.offenderNonAssociation.offenderNo]?.agencyId
  )
}

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
  getNonAssociationsInEstablishment,
  getBackLinkData,
  userHasAccess,
  renderLocationOptions,
  getConfirmBackLinkData,
  cellAttributes,
  translateCsra,
}
