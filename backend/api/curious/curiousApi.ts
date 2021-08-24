import type { ClientContext, OauthApiClient } from '../oauthEnabledClient'
import { mapToQueryString } from '../../utils'

export default class CuriousApi {
  static create(client: OauthApiClient): CuriousApi {
    return new CuriousApi(client)
  }

  constructor(private readonly client: OauthApiClient) {}

  getLearnerProfiles(
    context: ClientContext,
    nomisId: string,
    establishmentId?: number
  ): Promise<curious.LearnerProfile[]> {
    return this.client
      .get<curious.LearnerProfile[]>(context, this.applyQuery(`/learnerProfile/${nomisId}`, { establishmentId }))
      .then((response) => response.body)
  }

  getLearnerEducation(
    context: ClientContext,
    nomisId: string,
    sort?: string,
    actualGLH?: number,
    courseCode?: string,
    courseName?: string,
    establishmentId?: number,
    isAccredited?: boolean,
    isCurrent?: boolean,
    learningPlannedEndDate?: string,
    learningStartDate?: string,
    page?: number,
    size?: number
  ): Promise<curious.LearnerEducation> {
    return this.client
      .get<curious.LearnerEducation>(
        context,
        this.applyQuery(`/learnerEducation/${nomisId}`, {
          sort,
          courseCode,
          courseName,
          isAccredited,
          isCurrent,
          establishmentId,
          learningPlannedEndDate,
          page,
          size,
          learningStartDate,
          actualGLH,
        })
      )
      .then((response) => response.body)
  }

  getLearnerLatestAssessments(context: ClientContext, nomisId: string): Promise<curious.LearnerLatestAssessment[]> {
    return this.client
      .get<curious.LearnerProfile[]>(context, `/latestLearnerAssessments/${nomisId}`)
      .then((response) => response.body)
  }

  getLearnerGoals(context: ClientContext, nomisId: string): Promise<curious.LearnerGoals> {
    return this.client.get<curious.LearnerGoals>(context, `/learnerGoals/${nomisId}`).then((response) => response.body)
  }

  private applyQuery = (path, query?: Record<string, unknown>) => {
    const queries = mapToQueryString(query)
    return this.hasNonEmptyValues(query) ? `${path}?${queries}` : path
  }

  private hasNonEmptyValues = (object?: Record<string, unknown>) =>
    object && Object.values(object).filter((value) => !!value).length > 0
}
