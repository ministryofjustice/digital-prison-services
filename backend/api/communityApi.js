const communityApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const pipe = (context, url, res) =>
    client.pipe(
      context,
      url,
      res
    )
  const getOffenderConvictions = (context, { offenderNo }) =>
    get(context, `/api/offenders/nomsNumber/${offenderNo}/convictions`)

  const getOffenderDetails = (context, { offenderNo }) => get(context, `/api/offenders/nomsNumber/${offenderNo}`)

  const getOffenderDocuments = (context, { offenderNo }) =>
    get(context, `/api/offenders/nomsNumber/${offenderNo}/documents/grouped`)

  const pipeOffenderDocument = (context, { offenderNo, documentId, res }) =>
    pipe(
      context,
      `/api/offenders/nomsNumber/${offenderNo}/documents/${documentId}`,
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
