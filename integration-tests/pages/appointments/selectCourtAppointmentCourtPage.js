const page = require('../page')

const selectCourtAppointmentCourtPage = () =>
  page('The video link date and time is available', {
    form: () => ({
      court: () => cy.get('#court'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    offenderName: () => cy.get('.qa-name-value'),
    prison: () => cy.get('.qa-prison-value'),
    date: () => cy.get('.qa-date-value'),
    startTime: () => cy.get('.qa-courtHearingStartTime-value'),
    endTime: () => cy.get('.qa-courtHearingEndTime-value'),
    preTime: () => cy.get('.qa-preCourtHearingBriefing-value'),
    postTime: () => cy.get('.qa-postCourtHearingBriefing-value'),
  })

export default {
  verifyOnPage: selectCourtAppointmentCourtPage,
  goTo: (caseload, offenderNo) => {
    cy.visit(`/${caseload}/offenders/${offenderNo}/add-court-appointment/select-court`)
    return selectCourtAppointmentCourtPage()
  },
}
