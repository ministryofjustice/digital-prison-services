const links = {
  notmEndpointUrl: '', // set from env by /api/config call
  getOffenderLink: offenderNo => `${links.notmEndpointUrl}offenders/${offenderNo}/quick-look`,
  getAlertsLink: offenderNo => `${links.notmEndpointUrl}offenders/${offenderNo}/alerts`,
}

module.exports = links
