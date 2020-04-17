const { map404ToNull } = require('../utils')

const keyworkerApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())

  const getKeyworkerByCaseloadAndOffenderNo = (context, caseLoadId, offenderNo) =>
    get(context, `/key-worker/${caseLoadId}/offender/${offenderNo}`).catch(map404ToNull)

  return {
    getKeyworkerByCaseloadAndOffenderNo,
  }
}

module.exports = {
  keyworkerApiFactory,
}
