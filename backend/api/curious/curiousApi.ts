import type { ClientContext, OauthApiClient } from '../oauthEnabledClient'
import { mapToQueryString } from '../../utils'
import {
  LearnerGoals,
  LearnerLatestAssessment,
  LearnerProfile,
  LearnerEducation,
  LearnerEmployabilitySkills,
  PageLearnerEducation,
  PageLearnerEmployabilitySkills,
  LearnerNeurodivergence,
} from './types/Types'

export default class CuriousApi {
  static create(client: OauthApiClient): CuriousApi {
    return new CuriousApi(client)
  }

  constructor(private readonly client: OauthApiClient) {}

  getLearnerProfiles(context: ClientContext, nomisId: string, establishmentId?: string): Promise<LearnerProfile[]> {
    return this.client
      .get<LearnerProfile[]>(context, this.applyQuery(`/learnerProfile/${nomisId}`, { establishmentId }))
      .then((response) => response.body)
  }

  getLearnerEducation(
    context: ClientContext,
    nomisId: string,
    sort?: string,
    isCurrent?: boolean,
    establishmentId?: string,
    page?: number,
    size?: number
  ): Promise<PageLearnerEducation> {
    return this.client
      .get<LearnerEducation>(
        context,
        this.applyQuery(`/learnerEducation/${nomisId}`, {
          sort,
          isCurrent,
          establishmentId,
          page,
          size,
        })
      )
      .then((response) => response.body)
  }

  getLearnerLatestAssessments(context: ClientContext, nomisId: string): Promise<LearnerLatestAssessment[]> {
    return this.client
      .get<LearnerProfile[]>(context, `/latestLearnerAssessments/${nomisId}`)
      .then((response) => response.body)
  }

  getLearnerGoals(context: ClientContext, nomisId: string): Promise<LearnerGoals> {
    return this.client.get<LearnerGoals>(context, `/learnerGoals/${nomisId}`).then((response) => response.body)
  }

  getLearnerEmployabilitySkills(context: ClientContext, nomisId: string): Promise<PageLearnerEmployabilitySkills> {
    return this.client
      .get<LearnerEmployabilitySkills>(context, `/learnerEmployabilitySkills/${nomisId}?size=10000`)
      .then((response) => response.body)
  }

  getLearnerNeurodivergence(
    context: ClientContext,
    nomisId: string,
    establishmentId?: string
  ): Promise<LearnerNeurodivergence[]> {
    return this.client
      .get<LearnerNeurodivergence[]>(
        context,
        this.applyQuery(`/learnerNeurodivergence/${nomisId}`, { establishmentId })
      )
      .then((response) => response.body)
  }

  private applyQuery = (path, query?: Record<string, unknown>) => {
    const queries = mapToQueryString(query)
    return this.hasNonEmptyValues(query) ? `${path}?${queries}` : path
  }

  private hasNonEmptyValues = (object?: Record<string, unknown>) =>
    object && Object.values(object).filter((value) => !!value).length > 0
}
