const links = {
  getOffenderLink: offenderNo => `/prisoner/${offenderNo}`,
  getAlertsLink: offenderNo => `/prisoner/${offenderNo}/alerts`,
}

module.exports = links
