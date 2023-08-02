import type { Response } from 'superagent'
import type { ClientContext, OauthApiClient } from './oauthEnabledClient'
import contextProperties from '../contextProperties'

export type OffenderNonAssociation = {
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

  const getNonAssociations = (context: ClientContext, offenderNo: string): Promise<OffenderNonAssociation> =>
    get(
      context,
      `/legacy/api/offenders/${offenderNo}/non-association-details?currentPrisonOnly=true&excludeInactive=true`
    )

  return {
    getNonAssociations,
  }
}

export default { nonAssociationsApiFactory }
