import querystring from 'qs'
import type { ClientContext, OauthApiClient } from '../oauthEnabledClient'

/**
 * TODO: remove this during the curious api integration
 */
export const dummyLearnerLatestAssessments: curious.LearnerLatestAssessment[] = [
  {
    prn: 'G8346GA',
    qualifications: [
      {
        establishmentId: 2,
        establishmentName: 'HMP Winchester',
        qualification: {
          qualificationType: 'English',
          qualificationGrade: 'Entry Level 2',
          assessmentDate: '2021-05-02',
        },
      },
      {
        establishmentId: 2,
        establishmentName: 'HMP Winchester',
        qualification: {
          qualificationType: 'English',
          qualificationGrade: 'Entry Level 2',
          assessmentDate: '2020-12-02',
        },
      },
      {
        establishmentId: 2,
        establishmentName: 'HMP Winchester',
        qualification: {
          qualificationType: 'Digital Literacy',
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2020-06-01',
        },
      },
      {
        establishmentId: 2,
        establishmentName: 'HMP Winchester',
        qualification: {
          qualificationType: 'Digital Literacy',
          qualificationGrade: 'Entry Level 2',
          assessmentDate: '2021-06-01',
        },
      },
      {
        establishmentId: 2,
        establishmentName: 'HMP Winchester',
        qualification: {
          qualificationType: 'Maths',
          qualificationGrade: 'Entry Level 2',
          assessmentDate: '2021-06-06',
        },
      },
    ],
  },
]

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

  getLearnerEducation(context: ClientContext, nomisId: string): Promise<curious.LearnerEducation[]> {
    return this.client
      .get<curious.LearnerEducation[]>(context, `/learnerEducation/${nomisId}`)
      .then((response) => response.body)
  }

  getLearnerLatestAssessments(nomisId: string): Promise<curious.LearnerLatestAssessment[]> {
    return Promise.resolve(dummyLearnerLatestAssessments)
  }

  private applyQuery = (path, query?: Record<string, unknown>) =>
    this.hasNonEmptyValues(query) ? `${path}?${querystring.stringify(query)}` : path

  private hasNonEmptyValues = (object?: Record<string, unknown>) =>
    object && Object.values(object).filter((value) => !!value).length > 0
}
