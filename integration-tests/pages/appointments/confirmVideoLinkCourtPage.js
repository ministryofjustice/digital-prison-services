const page = require('../page')

const confirmVideoLinkCourtPage = () =>
  page('The video link has been booked', {
    backLink: () => cy.get('[data-qa="back-to-prisoner-search"]'),
    finishLink: () => cy.get('a.govuk-button.govuk-button--primary'),
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
  verifyOnPage: confirmVideoLinkCourtPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/confirm-appointment`)
    return confirmVideoLinkCourtPage()
  },
}
