const contextProperties = require('../contextProperties')

const dataComplianceApiFactory = client => {
  const getResponseBody = response => response.body

  const includeETagInBody = response => ({
    ...response.body,
    etag: response.headers.etag.replace(/--gzip|W\//gi, ''),
  })

  const map404ToNull = error => {
    if (!error.response) throw error
    if (!error.response.status) throw error
    if (error.response.status !== 404) throw error
    return null
  }

  const getOffenderRetentionReasons = context =>
    client.get(context, `/retention/offenders/retention-reasons`).then(getResponseBody)

  const getOffenderRetentionRecord = (context, offenderNo) =>
    client
      .get(context, `/retention/offenders/${offenderNo}`)
      .then(includeETagInBody)
      .catch(map404ToNull)

  const putOffenderRetentionRecord = (context, offenderNo, body, version) => {
    contextProperties.setCustomRequestHeaders(context, version ? { 'if-match': version } : {})
    return client.put(context, `/retention/offenders/${offenderNo}`, body)
  }

  return {
    getOffenderRetentionReasons,
    getOffenderRetentionRecord,
    putOffenderRetentionRecord,
  }
}

module.exports = { dataComplianceApiFactory }
