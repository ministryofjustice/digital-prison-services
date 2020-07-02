const page = require('../page')

const requestCourtBookingConfirmationPage = () =>
  page('The video link has been requested', {
    prison: () => cy.get('.qa-prison-value'),
    name: () => cy.get('.qa-name-value'),
    date: () => cy.get('.qa-date-value'),
    dateOfBirth: () => cy.get('.qa-dateOfBirth-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    preStartEndTime: () => cy.get('.qa-preCourtHearingBriefing-value'),
    postStartEndTime: () => cy.get('.qa-postCourtHearingBriefing-value'),
    courtLocation: () => cy.get('.qa-courtLocation-value'),
  })

export default {
  verifyOnPage: requestCourtBookingConfirmationPage,
  goTo: () => {
    cy.visit('/request-booking/confirm')
    return requestCourtBookingConfirmationPage()
  },
}
