import type { Response } from 'superagent'
import type { ClientContext, OauthApiClient } from './oauthEnabledClient'
import contextProperties from '../contextProperties'

export type OffenderNonAssociationLegacy = {
  offenderNo: string
  firstName: string
  lastName: string
  agencyDescription: string
  assignedLivingUnitDescription: string
  assignedLivingUnitId: number
  nonAssociations: {
    reasonCode: string
    reasonDescription: string
    typeCode: string
    typeDescription: string
    effectiveDate: string
    expiryDate: string | null
    authorisedBy: string
    comments: string
    offenderNonAssociation: {
      offenderNo: string
      firstName: string
      lastName: string
      reasonCode: string
      reasonDescription: string
      agencyDescription: string
      assignedLivingUnitDescription: string
      assignedLivingUnitId: number
    }
  }[]
}

type Role = 'VICTIM' | 'PERPETRATOR' | 'NOT_RELEVANT' | 'UNKNOWN'
type Reason = 'BULLYING' | 'GANG_RELATED' | 'ORGANISED_CRIME' | 'LEGAL_REQUEST' | 'THREAT' | 'VIOLENCE' | 'OTHER'
type RestrictionType = 'CELL' | 'LANDING' | 'WING'
type SortBy = 'WHEN_CREATED' | 'WHEN_UPDATED' | 'LAST_NAME' | 'FIRST_NAME' | 'PRISONER_NUMBER'
type SortDirection = 'ASC' | 'DESC'

export type PrisonerNonAssociations = {
  prisonerNumber: string
  firstName: string
  lastName: string
  prisonId: string
  prisonName: string
  cellLocation: string | null
  openCount: number
  closedCount: number
  nonAssociations: {
    id: number
    role: Role
    roleDescription: string
    reason: Reason
    reasonDescription: string
    restrictionType: RestrictionType
    restrictionTypeDescription: string
    comment: string
    authorisedBy: string
    whenCreated: string
    whenUpdated: string
    updatedBy: string

    isClosed: boolean
    closedBy: string | null
    closedReason: string | null
    closedAt: string | null

    otherPrisonerDetails: {
      prisonerNumber: string
      role: Role
      roleDescription: string
      firstName: string
      lastName: string
      prisonId: string
      prisonName: string
      cellLocation: string | null
    }
  }[]
}

export const nonAssociationsApiFactory = (client: OauthApiClient) => {
  const processResponse =
    <T>(context: ClientContext) =>
    (response: Response): T => {
      contextProperties.setResponsePagination(context, response.headers)
      return response.body
    }

  const get = <T>(context: ClientContext, url: string): Promise<T> =>
    client.get<T>(context, url).then(processResponse(context))

  const getNonAssociationsLegacy = (
    context: ClientContext,
    offenderNo: string
  ): Promise<OffenderNonAssociationLegacy> =>
    get(context, `/legacy/api/offenders/${offenderNo}/non-association-details`)

  /**
   * Get a prisoner non-associations
   *
   * By default only open non-associations in the same prison are returned.
   * This can be overridden by passing the includeOpen/includeClosed/includeOtherPrisons options
   *
   * IMPORTANT: Do NOT use until the non-associations API is online and in sync with NOMIS
   *
   * See swagger docs: https://non-associations-api-dev.hmpps.service.justice.gov.uk/swagger-ui/index.html#/Non-Associations/getPrisonerNonAssociations
   *
   * @param context A request scoped context. Holds OAuth tokens
   * @param prisonerNumber prisoner number of the prisoner you're requesting the non-associations for
   * @param options options to get closed non-associations and/or non-associations in other prisons as well as change the order or the result
   *
   * @returns A Promise which settles to the prisoner non-associations
   */
  const getNonAssociations = (
    context: ClientContext,
    prisonerNumber: string,
    {
      includeOpen = true,
      includeClosed = false,
      includeOtherPrisons = false,
      sortBy = 'WHEN_CREATED',
      sortDirection = 'DESC',
    }: {
      includeOpen?: boolean
      includeClosed?: boolean
      includeOtherPrisons?: boolean
      sortBy?: SortBy
      sortDirection?: SortDirection
    } = {}
  ): Promise<PrisonerNonAssociations> => {
    const params = new URLSearchParams()
    if (includeClosed) {
      params.append('includeClosed', 'true')
    }
    if (includeOpen) {
      params.append('includeOpen', 'true')
    }
    if (includeOtherPrisons) {
      params.append('includeOtherPrisons', 'true')
    }
    if (sortBy) {
      params.append('sortBy', sortBy)
    }
    if (sortDirection) {
      params.append('sortDirection', sortDirection)
    }

    const url = `/prisoner/${prisonerNumber}/non-associations?${params}`
    return get(context, url)
  }

  return {
    getNonAssociationsLegacy,
    getNonAssociations,
  }
}

export default { nonAssociationsApiFactory }
