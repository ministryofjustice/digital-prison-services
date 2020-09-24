const page = require('../page')

const attendanceStatsPage = () =>
  page('Attendance reason statistics', {
    submitButton: () => cy.get('button[type="submit"]'),
    errorSummary: () => cy.get('.govuk-error-summary'),

    changes: () => cy.get('[data-qa="changes"]'),

    unaccountedfor: () => cy.get('[data-qa="unaccountedfor"]'),
    suspended: () => cy.get('[data-qa="suspended"]'),
    attended: () => cy.get('[data-qa="attended"]'),

    acceptableAbsence: () => cy.get('[data-qa="AcceptableAbsence"]'),
    approvedCourse: () => cy.get('[data-qa="ApprovedCourse"]'),
    notRequired: () => cy.get('[data-qa="NotRequired"]'),

    refused: () => cy.get('[data-qa="Refused"]'),
    refusedWithWarning: () => cy.get('[data-qa="RefusedIncentiveLevelWarning"]'),
    restDay: () => cy.get('[data-qa="RestDay"]'),
    restInCellOrSick: () => cy.get('[data-qa="RestInCellOrSick"]'),

    sessionCancelled: () => cy.get('[data-qa="SessionCancelled"]'),
    unacceptableAbsenceWithWarning: () => cy.get('[data-qa="UnacceptableAbsence"]'),
  })

export default {
  verifyOnPage: attendanceStatsPage,
  goTo: (agencyId, fromDate, period) => {
    cy.visit(
      `/manage-prisoner-whereabouts/attendance-reason-statistics?agencyId=${agencyId}&period=${period}&fromDate=${fromDate}`
    )
    return attendanceStatsPage()
  },
}
