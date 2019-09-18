const communityApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const getOffenderConvictions = (context, { offenderNo }) =>
    get(context, `/api/offenders/nomsNumber/${offenderNo}/convictions`)

  const getOffenderDetails = (context, { offenderNo }) => get(context, `/api/offenders/nomsNumber/${offenderNo}`)

  const getOffenderDocuments = (context, { offenderNo }) =>
    get(context, `/api/offenders/nomsNumber/${offenderNo}/documents/grouped`)

  return {
    getOffenderConvictions,
    getOffenderDetails,
    getOffenderDocuments,
  }
}

module.exports = {
  communityApiFactory,
}
