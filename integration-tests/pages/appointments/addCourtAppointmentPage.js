const page = require('../page')

const addCourtAppointmentPage = () =>
  page('Add video link date and time', {
    form: () => ({
      location: () => cy.get('#location'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      preAppointmentRequiredYes: () => cy.get('#pre-appointment-required'),
      preAppointmentRequiredNo: () => cy.get('#pre-appointment-required-2'),
      postAppointmentRequiredYes: () => cy.get('#post-appointment-required'),
      postAppointmentRequiredNo: () => cy.get('#post-appointment-required-2'),
      comments: () => cy.get('#comments'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    datePicker: () => cy.get('#ui-datepicker-div'),
    activeDate: () => cy.get('.ui-state-active'),
    recurringInputs: () => cy.get('[data-qa="recurring-inputs"]'),
    offenderEvents: () => cy.get('[data-qa="offender-events"]'),
    locationEvents: () => cy.get('[data-qa="location-events"]'),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: addCourtAppointmentPage,
  goTo: (caseload, offenderNo) => {
    cy.visit(`/${caseload}/offenders/${offenderNo}/add-court-appointment`)
    return addCourtAppointmentPage()
  },
}
