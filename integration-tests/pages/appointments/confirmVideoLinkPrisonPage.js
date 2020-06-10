const page = require('../page')

const confirmVideoLinkPrisonPage = () =>
  page('The video link has been booked', {
    printMovementSlip: () => cy.get('a.govuk-link'),
    backLink: () => cy.get('a.govuk-button'),
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    room: () => cy.get('.qa-prisonRoom-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    legalBriefingBefore: () => cy.get('.qa-preCourtHearingBriefing-value'),
    legalBriefingAfter: () => cy.get('.qa-postCourtHearingBriefing-value'),
    courtLocation: () => cy.get('.qa-courtLocation-value'),
  })

export default {
  verifyOnPage: confirmVideoLinkPrisonPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/confirm-appointment`)
    return confirmVideoLinkPrisonPage()
  },
}
