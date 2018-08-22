const getOffenderLink = (offenderNo) => {
  return `${links.notmEndpointUrl}offenders/${offenderNo}/quick-look`;
};

const links = {
  notmEndpointUrl: '', // set from env by /api/config call
  getOffenderLink
};

module.exports = links;
