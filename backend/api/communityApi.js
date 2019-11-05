const communityApiFactory = (client, apiPrefix) => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const pipe = (context, url, res) =>
    client.pipe(
      context,
      url,
      res,
      { retry: 0 }
    )
  const getOffenderConvictions = (context, { offenderNo }) =>
    get(context, `${apiPrefix}/offenders/nomsNumber/${offenderNo}/convictions`)

  const getOffenderDetails = (context, { offenderNo }) =>
    get(context, `${apiPrefix}/offenders/nomsNumber/${offenderNo}`)

  const getOffenderDocuments = (context, { offenderNo }) =>
    get(context, `${apiPrefix}/offenders/nomsNumber/${offenderNo}/documents/grouped`)

  const pipeOffenderDocument = (context, { offenderNo, documentId, res }) =>
    pipe(
      context,
      `${apiPrefix}/offenders/nomsNumber/${offenderNo}/documents/${documentId}`,
      res
    )

  return {
    getOffenderConvictions,
    getOffenderDetails,
    getOffenderDocuments,
    pipeOffenderDocument,
  }
}

module.exports = {
  communityApiFactory,
}
