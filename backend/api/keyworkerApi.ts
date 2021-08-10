export const keyworkerApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getKeyworkerByCaseloadAndOffenderNo = (context, caseLoadId, offenderNo) =>
    get(context, `/key-worker/${caseLoadId}/offender/${offenderNo}`)

  const getPrisonMigrationStatus = (context, prisonId) => get(context, `/key-worker/prison/${prisonId}`)

  return {
    getKeyworkerByCaseloadAndOffenderNo,
    getPrisonMigrationStatus,
  }
}

export default {
  keyworkerApiFactory,
}
