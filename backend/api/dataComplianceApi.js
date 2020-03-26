const contextProperties = require('../contextProperties')

const dataComplianceApiFactory = client => {
  const processResponse = context => response => {
    contextProperties.setResponsePagination(context, response.headers)
    return response.body
  }

  const get = (context, url) => client.get(context, url).then(processResponse(context))

  const getOffenderRetentionReasons = context => get(context, `/retention/offenders/retention-reasons`)

  const getOffenderRetentionRecord = (context, offenderNo) => get(context, `/retention/offenders/${offenderNo}`)

  return {
    getOffenderRetentionReasons,
    getOffenderRetentionRecord,
  }
}

module.exports = { dataComplianceApiFactory }
