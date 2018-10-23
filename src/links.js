const getOffenderLink = offenderNo => `${links.notmEndpointUrl}offenders/${offenderNo}/quick-look`

const getHomeLink = () => links.notmEndpointUrl

const links = {
  notmEndpointUrl: '', // set from env by /api/config call
  getOffenderLink,
  getHomeLink,
}

module.exports = links
