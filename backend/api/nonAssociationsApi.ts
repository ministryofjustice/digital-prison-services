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

  return {
    getNonAssociationsLegacy,
  }
}

export default { nonAssociationsApiFactory }
