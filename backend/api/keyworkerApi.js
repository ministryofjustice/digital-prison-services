const keyworkerApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getKeyworkerByCaseloadAndOffenderNo = (context, caseLoadId, offenderNo) =>
    get(context, `/key-worker/${caseLoadId}/offender/${offenderNo}`)

  return {
    getKeyworkerByCaseloadAndOffenderNo,
  }
}

module.exports = {
  keyworkerApiFactory,
}
