const { app } = require('../config')

/**
 * Education skills and work experience (ESWE)
 */
class EsweService {
  #curiousApi = null

  #prisonApi = null

  static create(curiousApi, prisonApi) {
    return new EsweService(curiousApi, prisonApi)
  }

  /**
   * The curiousApi is currently providing mock data
   * However this provides a stub in preparation
   * for the full api integration
   *
   * @param curiousApi
   * @param prisonApi
   */
  constructor(curiousApi, prisonApi) {
    this.#curiousApi = curiousApi
    this.#prisonApi = prisonApi
  }

  async getLearnerProfiles(nomisId) {
    if (!app.esweEnabled) {
      return {
        enabled: app.esweEnabled,
        content: [],
      }
    }

    const content = await this.#curiousApi.getLearnerProfiles(nomisId)

    return {
      enabled: app.esweEnabled,
      content,
    }
  }
}

module.exports = EsweService
