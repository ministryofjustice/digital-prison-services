const communityApiFactory = client => {
  const processResponse = () => response => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const getOffenderConvictions = (context, { offenderNo }) =>
    get(context, `/api/offenders/nomsNumber/${offenderNo}/convictions`)

  const getOffenderDetails = (context, { offenderNo }) => get(context, `/api/offenders/nomsNumber/${offenderNo}`)

  return {
    getOffenderConvictions,
    getOffenderDetails,
  }
}

module.exports = {
  communityApiFactory,
}
