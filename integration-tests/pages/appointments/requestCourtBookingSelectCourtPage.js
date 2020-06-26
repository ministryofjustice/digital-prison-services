const page = require('../page')

const requestCourtBookingSelectCourtPage = () =>
  page('The video link date and time is available', {
    form: () => ({
      hearingLocation: () => cy.get('#hearing-location'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    prison: () => cy.get('.qa-prison-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    preStartEndTime: () => cy.get('.qa-preCourtHearingBriefing-value'),
    postStartEndTime: () => cy.get('.qa-postCourtHearingBriefing-value'),
  })

export default {
  verifyOnPage: requestCourtBookingSelectCourtPage,
  goTo: () => {
    cy.visit('/request-booking/select-court')
    return requestCourtBookingSelectCourtPage()
  },
}
