const getOffenderLink = (offenderNo) => {
  return `${links.notmEndpointUrl}offenders/${offenderNo}/quick-look`;
};

const getHomeLink = () => {
  return links.notmEndpointUrl;
};

const links = {
  notmEndpointUrl: '', // set from env by /api/config call
  getOffenderLink,
  getHomeLink
};

module.exports = links;
