import { app } from '../config'
import type CuriousApi from '../api/curious/curiousApi'

type FeatureFlagged<T> = {
  enabled: boolean
  content: T
}

type LearnerProfiles = FeatureFlagged<curious.LearnerProfile[]>

/**
 * Education skills and work experience (ESWE)
 */
export default class EsweService {
  static create(curiousApi: CuriousApi): EsweService {
    return new EsweService(curiousApi)
  }

  constructor(private readonly curiousApi: CuriousApi) {}

  async getLearnerProfiles(nomisId: string): Promise<LearnerProfiles> {
    if (!app.esweEnabled) {
      return {
        enabled: app.esweEnabled,
        content: [],
      }
    }

    return {
      enabled: app.esweEnabled,
      content: await this.curiousApi.getLearnerProfiles(nomisId),
    }
  }
}
