const keyworkerApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const map404ToNull = error => {
    if (!error.response || !error.response.status || error.response.status !== 404) throw error

    return null
  }

  const getKeyworkerByCaseloadAndOffenderNo = (context, caseLoadId, offenderNo) =>
    get(context, `/key-worker/${caseLoadId}/offender/${offenderNo}`).catch(map404ToNull)

  return {
    getKeyworkerByCaseloadAndOffenderNo,
  }
}

module.exports = {
  keyworkerApiFactory,
}
