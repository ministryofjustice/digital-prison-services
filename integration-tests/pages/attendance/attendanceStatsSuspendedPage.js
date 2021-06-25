const page = require('../page')

const attendanceStatsSuspendedPage = () =>
  page('Suspended', {
    offenderList: () => cy.get('[data-qa="court-bookings-table"]'),

    timespan: () => cy.get('[data-qa="timespan"]'),
    numberOfSuspensions: () => cy.get('[data-qa="suspension-count"]'),
    offenderCount: () => cy.get('[data-qa="offender-count"]'),
  })

export default {
  verifyOnPage: attendanceStatsSuspendedPage,
}
